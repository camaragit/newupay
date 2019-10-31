import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ServiceService } from 'src/app/services/service.service';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { PinValidationPage } from 'src/app/pages/utilisateur/pin-validation/pin-validation.page';
import { ModalController } from '@ionic/angular';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';
import { CustomValidatorPhone } from '../customValidator/custom-validator';
import { MillierPipe } from 'src/app/pipes/millier.pipe';
import { CheckService } from 'src/app/services/check.service';

@Component({
  selector: 'releve-encaissement',
  templateUrl: './releve-encaissement.component.html',
  styleUrls: ['./releve-encaissement.component.scss'],
})
export class ReleveEncaissementComponent implements OnInit {
  @Input() datareleve;
  public Encdata: FormGroup;
  public infosClient: FormGroup;
  newclient: boolean;
  listefactures: any;
  factures: any;
  hastel = true;
  showInfoClient = false;
  showdetails = true;
  codePin: any;
  recentsContacts: any[];
  constructor(public formBuilder: FormBuilder,
              public serv: ServiceService,
              public glb: GlobalVariableService,
              public modal: ModalController,
              private check: CheckService,
              public monmillier: MillierPipe) {
    this.Encdata = this.formBuilder.group({
      reference: ['', Validators.required],
    });

    this.infosClient = this.formBuilder.group({
      telephone: ['', [Validators.required, CustomValidatorPhone]],
      reference: ['', Validators.required],
      prenom: ['', Validators.required]
    });
  }


  ngOnInit() {
    this.vider();
    this.getrecent();
  }

  vider() {
    this.showdetails = false;
    this.showInfoClient = false;
    this.infosClient.reset();
    this.Encdata.reset();

  }

  releve() {
    this.showdetails = false;
    this.showInfoClient = false;
    this.infosClient.removeControl('adresse');
    this.infosClient.removeControl('nom');
    this.infosClient.reset();
    const parametre: any = {};
    parametre.numpolice = this.Encdata.controls.reference.value;
    this.infosClient.controls.reference.setValue(parametre.numpolice);
    parametre.idTerm = this.glb.IDTERM;
    parametre.session = this.glb.IDSESS;
    parametre.oper = this.datareleve.codeoper;
    if (this.datareleve.codeoper === '0016') {
      this.relevesde(parametre);
    }
    if (this.datareleve.codeoper === '0027') {
      this.relevesenelec(parametre);
    }

}
async showPin(facture) {
  const params: any = {};
  params.reference = this.infosClient.controls.reference.value;
  params.nameContact = this.infosClient.controls.prenom.value + ' ' + this.infosClient.controls.nom.value ;
  params.label = this.datareleve.codeoper === '0016' ? 'Reference' : 'Police';
  params.montant = this.datareleve.codeoper === '0016' ? facture.mntFact * 1 + 500 : facture.mntTotal;
  params.operateur = this.datareleve.codeoper === '0016' ? 'SDE' : 'SENELEC';
  params.numfact = facture.numFact;
  params.type = 'facture';
  const montantPlafond = this.glb.HEADER.montant.replace(/ /g, '') * 1;
  const montantArecharger = params.montant * 1;
  if (montantPlafond < montantArecharger) {
      this.check.showMoga();
    } else {
        const modal = await this.modal.create({
    component: PinValidationPage,
    componentProps: {
      data: params
    },
    backdropDismiss: true
  });

        modal.onDidDismiss().then((codepin) => {
    if (codepin !== null && codepin.data) {
      this.codePin = codepin.data;
      this.encaisser(facture, params);

    }
  });

        return await modal.present();
    }

}
encaisser(facture, params) {
  const fact = [];
  fact[0] = facture;
  const parametre: any = {};
  parametre.infoclient = {};
  parametre.infoclient.nom = this.factures.NomClient;
  parametre.infoclient.idclient = params.telephone = this.infosClient.controls.reference.value;
  parametre.infoclient.telclient = this.infosClient.controls.telephone.value;
  if (this.datareleve.codeoper === '0027') {
     parametre.infoclient.nomClient    = this.infosClient.controls.nom.value;
     parametre.infoclient.numfacture   = facture.numFact;
     parametre.infoclient.prenomClient = this.infosClient.controls.prenom.value;
     parametre.infoclient.telephone    = this.infosClient.controls.telephone.value;
     parametre.infoclient.adresse      = this.infosClient.controls.adresse.value;
  }
  parametre.image = this.datareleve.image;
  parametre.oper = this.datareleve.codeoper;
  parametre.recharge = {};
  parametre.operation = this.datareleve.operation;
  parametre.recharge.montant = facture.mntFact;
  parametre.recharge.frais = '500';
  parametre.factures = fact;
  parametre.nbrfact = 1;
  parametre.mnttotal = facture.mntFact;
  parametre.infoclient.pin = this.codePin;
  parametre.idTerm = this.glb.IDTERM;
  parametre.session = this.glb.IDSESS;
  this.serv.afficheloading();
  this.serv.posts(this.datareleve.encaissementfile, parametre, {}).then(data => {
  this.serv.dismissloadin();
  const reponse: any = JSON.parse(data.data);
  if (reponse.returnCode) {
  if (reponse.returnCode === '0') {
    this.glb.HEADER.montant = this.monmillier.transform(reponse.mntPlfap);
    this.glb.dateUpdate = this.serv.getCurrentDate();
    const clientData = {codeOper: this.datareleve.codeoper,
      sousOper: '',
      reference: this.infosClient.controls.reference.value,
      nomclient: this.infosClient.controls.prenom.value + ' ' + this.infosClient.controls.nom.value ,
      montant: params.montant};
    this.serv.insert(clientData);
    const operateur = {codeOper: this.datareleve.codeoper,
      sousOper: '',
      chemin: this.datareleve.chemin,
      image: this.datareleve.image,
      };
    this.serv.insertFavoris(operateur);
    params.numFact = facture.numFact;
    params.operation = this.datareleve.operation;
    this.serv.notifier(params);
    const mod = this.modal.create({
            component: ConfirmationComponent,
            componentProps: {
              data: params,
            }

          }).then((e) => {
            e.present();
            e.onDidDismiss().then(() => {
              this.vider();
              this.getrecent();
            });

          });
  } else {
    this.serv.showError('Opération échouée');
  }
  } else {
    this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');

  }


}).catch(err => {
  this.serv.dismissloadin();
  this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard ' );

});
}
  relevesde(parametre) {
    this.hastel = true;
    this.serv.afficheloading();
    this.serv.posts('encaissement/releve.php', parametre, {}).then(data => {
      const reponse = JSON.parse(data.data);
      this.serv.dismissloadin();
      if (reponse !== false) {
        if (reponse.returnCode) {
          if (reponse.returnCode === '0') {
            this.showdetails = true;
            this.showInfoClient = true;
            this.infosClient.addControl('nom', new FormControl(''));
            if (typeof (reponse.NomClient) === 'object') {
            this.infosClient.controls.prenom.setValue(this.glb.PRENOM + ' ' + this.glb.NOM);
            } else {
            this.infosClient.controls.prenom.setValue(reponse.NomClient);
            }

            this.infosClient.controls.nom.setValue('');
            if (reponse.Factures.Facture.length) {
              this.factures.nomClient = reponse.NomClient;
              this.factures.numfacture = reponse.IdClient;
              // tslint:disable-next-line: prefer-for-of
              for (let i = 0; i < this.factures.Factures.Facture.length; i++) {
                if (typeof (this.factures.Factures.Facture[i].dateEch) === 'object') {
                  this.factures.Factures.Facture[i].dateEch = '';
                }
              }
            } else {
             // this.infosClient.controls.prenom.setValue(this.glb.PRENOM);
              // this.infosClient.controls.nom.setValue(this.glb.NOM);
              this.factures = {};
              this.Encdata.controls.reference.setValue(reponse.IdClient);
              this.factures.IdClient = reponse.IdClient;
              this.factures.NomOper = reponse.NomOper;
              this.factures.errorCode = reponse.errorCode;
              this.factures.errorLabel = 'Opération échouée';
              this.factures.nbrFact = reponse.nbrFact;
              this.factures.returnCode = reponse.returnCode;
              this.factures.Factures = {};
              // c'est le tableau qui va contenir ma facture
              this.factures.Factures.Facture = [];
              this.factures.Factures.Facture.push(reponse.Factures.Facture);
            }
            this.listefactures = this.factures.Factures.Facture;
            // Pour le cas de sde on recupere le numero de telephone
            //  alert(JSON.stringify(this.listefactures))

            if (typeof (this.listefactures[0].telclient) !== 'object') {
              this.infosClient.controls.telephone.setValue(this.listefactures[0].telclient);
              // this.telephone = this.listefactures[0].telclient;
              this.hastel = true;

            } else {
              this.hastel = false;
              // this.infosClient.controls.telephone.setValue(this.glb.PHONE);
            }

          } else { this.serv.showError('Opération échouée'); }
        } else {
          this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
        }

      } else { this.serv.showError('Pas de facture correspondant'); }


    }).catch(err => {
      this.serv.dismissloadin();
      this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard ' );

    });
  }

  relevesenelec(parametre) {
    this.newclient = false;
    this.serv.afficheloading();
    this.serv.posts('encaissement/releve.php', parametre, {}).then(data => {
      const reponse = JSON.parse(data.data);
      // alert("ReleveFacture "+JSON.stringify(reponse));
      // this.serv.dismissloadin();
      if (reponse !== false) {
        if (reponse.returnCode) {
          if (reponse.returnCode === '0') {
            this.infosClient.addControl('adresse', new FormControl('', Validators.required));
            this.infosClient.addControl('nom', new FormControl('', Validators.required));
            this.showdetails = true;
            this.serv.posts('encaissement/releveClient.php', parametre, {}).then(dataclient => {
              this.serv.dismissloadin();
              const reponseclient = JSON.parse(dataclient.data);
              if (reponseclient.returnCode === '0') {
                this.showInfoClient = true;
                if (typeof (reponseclient.prenom) === 'object') {
                  this.newclient = true;
                  this.infosClient.controls.prenom.setValue('');
                  } else {
                  this.infosClient.controls.prenom.setValue(reponseclient.prenom);
                  }
                if (typeof (reponseclient.nom) === 'object') {
                  this.newclient = true;
                  this.infosClient.controls.nom.setValue('');
                    } else {
                    this.infosClient.controls.nom.setValue(reponseclient.nom);
                    }
                if (typeof (reponseclient.telephone) === 'object') {
                      this.newclient = true;
                      this.infosClient.controls.telephone.setValue('');
                      } else {
                      this.infosClient.controls.telephone.setValue(reponseclient.telephone);
                      }
                if (typeof (reponseclient.adresse) === 'object') {
                        this.newclient = true;
                        this.infosClient.controls.adresse.setValue('');
                        } else {
                        this.infosClient.controls.adresse.setValue(reponseclient.adresse);
                        }

            /*     this.infosClient.controls.prenom.setValue(reponseclient.prenom);
                this.infosClient.controls.nom.setValue(reponseclient.nom);
                this.infosClient.controls.telephone.setValue(reponseclient.telephone);
                this.infosClient.controls.adresse.setValue(reponseclient.adresse);
             */
              // if(this.newclient === tru;
              } else {
                this.showInfoClient = false;
                this.newclient = true;
                this.infosClient.controls.prenom.setValue(this.glb.PRENOM);
                this.infosClient.controls.nom.setValue(this.glb.NOM);
                this.infosClient.controls.telephone.setValue(this.glb.PHONE);
              }

            });

            if (reponse.Factures.Facture.length) {
              this.factures = reponse;
              // this.factures.nomClient=reponse.NomClient;
              this.factures.numfacture = reponse.IdClient;

              /*La aussi j'ai remarqué lorqu'il n'ya pas de date d'echeance et que j valide l'operation le serveur se plante c'est pour cela
               que je mets un champs text vide dans ce cas
               * */
              for (let i = 0; i < this.factures.Factures.Facture.length; i++) {
                this.factures.Factures.Facture[i].checked = false;
                // si la date d'echeance n'est pas definie
                if (typeof (this.factures.Factures.Facture[i].dateEch) === 'object') {
                  this.factures.Factures.Facture[i].dateEch = '';
                }
                this.factures.Factures.Facture[i].id = i;

              }
            } else {
              this.factures = {};
              this.factures.NomClient = reponse.NomClient;
              this.factures.IdClient = reponse.IdClient;
              this.factures.NomOper = reponse.NomOper;
              this.factures.errorCode = reponse.errorCode;
              this.factures.errorLabel = 'Opération échouée';
              this.factures.nbrFact = reponse.nbrFact;
              this.factures.returnCode = reponse.returnCode;
              this.factures.Factures = {};
              // c'est le tableau qui va contenir ma facture
              this.factures.Factures.Facture = [];
              this.factures.Factures.Facture.push(reponse.Factures.Facture);
              this.factures.Factures.Facture[0].checked = false;
              this.factures.Factures.Facture[0].id = 0;
            }
            this.listefactures = this.factures.Factures.Facture;

          } else {
            this.serv.showError('Opération échouée');
          }
        } else { this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard'); }

      } else {
        this.serv.showError('Pas de facture correspondant');
      }
    }).catch(err => {
      this.serv.dismissloadin();
      this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
    });
  }
  selectRecent(recent) {
    this.Encdata.controls.reference.setValue(recent.reference);
    this.releve();

  }
  getrecent() {
    this.recentsContacts = [];
    this.serv.getDataBase()
    .then((db: SQLiteObject) => {
      const sql = 'select * from recents where codeoperateur=? and sousoperateur =? and numcompte=? order by datemisajour desc limit 5';
      const values = [this.datareleve.codeoper, '', this.glb.NUMCOMPTE];
      db.executeSql(sql, values)
        .then((data) => {
          for (let i = 0; i < data.rows.length; i++) {
            this.recentsContacts.push((data.rows.item(i)));
          }
          })
        .catch(e => {});
    })
    .catch(e => {});

  }
}
