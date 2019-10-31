import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormatcodePipe } from 'src/app/pipes/formatcode.pipe';
import { FormatphonePipe } from 'src/app/pipes/formatphone.pipe';
import { FormatdatePipe } from 'src/app/pipes/formatdate.pipe';
import { ServiceService } from 'src/app/services/service.service';
import { MillierPipe } from 'src/app/pipes/millier.pipe';
import { NavController, ModalController } from '@ionic/angular';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { CustomValidatorPhone } from 'src/app/components/customValidator/custom-validator';
import { PinValidationPage } from 'src/app/pages/utilisateur/pin-validation/pin-validation.page';
import { ConfirmationComponent } from 'src/app/components/confirmation/confirmation.component';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';
import { CheckService } from 'src/app/services/check.service';

@Component({
  selector: 'app-woyofal',
  templateUrl: './woyofal.page.html',
  styleUrls: ['./woyofal.page.scss'],
})
export class WoyofalPage implements OnInit {
  public clientForm: FormGroup;
  public showdetails = false;
  private newclient = false;
  public headerTitle = 'woyofal';
  codePin: any;
  recentsContacts: any[];
  image: any = this.glb.IMG_URL + 'woyofal.png';
  constructor(public formatagechaine: FormatcodePipe,
              public phoneformat: FormatphonePipe,
              public dateformat: FormatdatePipe,
              public formBuilder: FormBuilder,
              public serv: ServiceService,
              public monmillier: MillierPipe,
              public navCtrl: NavController,
              private check: CheckService,
              public glb: GlobalVariableService,
              public modal: ModalController) {
    this.clientForm = this.formBuilder.group({
      numcompteur: ['', Validators.required],
      NomClient: ['', Validators.required],
      telClient: ['', [Validators.required, CustomValidatorPhone]],
      IdClient: ['', Validators.required],
      mnttotal: ['', Validators.required],
      adrsClient: ['', Validators.required]
    });
   }

  ngOnInit() {
    this.getrecent();
  }
  vider() {
    this.showdetails = false;
  }
  selectRecent(recent: any) {
    this.clientForm.controls.numcompteur.setValue(recent.reference);
    this.relever();
  }
  getrecent() {
    this.recentsContacts = [];
    this.serv.getDataBase()
    .then((db: SQLiteObject) => {
      const sql = 'select * from recents where codeoperateur=? and sousoperateur =? and numcompte=? order by datemisajour desc limit 5';
      const values = ['0029', '', this.glb.NUMCOMPTE];
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
  relever() {
    this.showdetails = this.newclient = false;
    const parametre: any = {};
    parametre.idTerm = this.glb.IDTERM;
    parametre.session = this.glb.IDSESS;
    parametre.oper = '0029';
    parametre.numpolice = this.clientForm.controls.numcompteur.value;
    this.clientForm.reset();
    this.clientForm.controls.numcompteur.setValue(parametre.numpolice);
    this.serv.afficheloading();
    this.serv.posts('encaissement/releve.php', parametre, {}).then(data => {
      this.serv.dismissloadin();
      const reponse: any = JSON.parse(data.data);
      // alert(JSON.stringify(reponse));
      if (reponse.returnCode) {
        if (reponse.returnCode === '0') {
          this.showdetails = true;
          // this.client = reponse;

          if (typeof (reponse.NomClient) === 'object') {
              this.newclient = true;
              this.clientForm.controls.NomClient.setValue('');
            } else {
            this.clientForm.controls.NomClient.setValue(reponse.NomClient);
            }
          if (typeof (reponse.telClient) === 'object') {
              this.newclient = true;
              this.clientForm.controls.telClient.setValue('');
              } else {
              this.clientForm.controls.telClient.setValue(reponse.telClient);
              }
          if (typeof (reponse.adrsClient) === 'object') {
              this.newclient = true;
              this.clientForm.controls.adrsClient.setValue('');
                } else {
                this.clientForm.controls.adrsClient.setValue(reponse.adrsClient);
                }

         // this.clientForm.controls.NomClient.setValue(reponse.NomClient);
          // this.clientForm.controls.telClient.setValue(reponse.telClient);
          this.clientForm.controls.IdClient.setValue(reponse.IdClient);
          // this.clientForm.controls.numcompteur.setValue(reponse.IdClient);
          // this.clientForm.controls.adrsClient.setValue(reponse.adrsClient);
         // this.client.telClient = this.phoneformat.transform(reponse.telClient);
         // this.newclient = false;

        } else {
          if (reponse.errorLabel === 'Nom Client inconnu') {
            this.clientForm.controls.IdClient.setValue(parametre.numpolice);
            this.clientForm.controls.NomClient.setValue(this.glb.PRENOM + ' ' + this.glb.NOM);
            this.clientForm.controls.telClient.setValue(this.glb.PHONE);
            this.showdetails = this.newclient = true;

          } else { this.serv.showError('Opération échouée'); }
        }
      } else {
        this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
      }
    }).catch(err => {
      this.serv.dismissloadin();

      this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
         });
  }
async showPin() {
  const params: any = {};
  params.reference = this.clientForm.controls.IdClient.value;
  params.nameContact = this.clientForm.controls.NomClient.value;
  params.label = 'Num Compteur';
  params.montant = this.clientForm.controls.mnttotal.value;
  params.operateur = 'WOYOFAL';
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
      this.encaisser();
    }
  });

        return await modal.present();
    }

}
  encaisser() {
    const parametre: any = {};
    parametre.factures = this.clientForm.getRawValue();
  //  parametre.image = this.glb.IMAGE_BASE_URL + 'Icon-23.png';
    parametre.recharge = {};
    parametre.recharge.telephone = parametre.factures.telClient;
    parametre.recharge.montant = parametre.factures.mnttotal;
    parametre.recharge.oper = '0029';
    parametre.operation = 'Recharge WOYOFAL';
    parametre.newclient = this.newclient ? 'nouveau' : '';

    parametre.factures.pin = this.codePin;
    parametre.idTerm = this.glb.IDTERM;
    parametre.session = this.glb.IDSESS;
    // alert(JSON.stringify(parametre));
    this.serv.afficheloading();
    this.serv.posts('encaissement/encaissementwoyofal.php', parametre, {}).then(data => {
    this.serv.dismissloadin();
    const reponse = JSON.parse(data.data);
    // alert(JSON.stringify(reponse))
    if (reponse.returnCode) {
      if (reponse.returnCode === '0') {
        this.vider();
        this.glb.dateUpdate = this.serv.getCurrentDate();
        const clientData = {codeOper: parametre.recharge.oper,
          sousOper: '',
          reference: this.clientForm.controls.IdClient.value,
          nomclient: this.clientForm.controls.NomClient.value ,
          montant: this.clientForm.controls.mnttotal.value};
        this.serv.insert(clientData);
        const operateur = {codeOper: parametre.recharge.oper,
          sousOper: '',
          chemin: '/paiement/facturier/woyofal',
          image: this.image,
          };
        this.serv.insertFavoris(operateur);
        // this.glb.recu.mntFrais = this.monmillier.transform(reponse.mntFrais);
        // this.glb.recu.mntFact = this.monmillier.transform(reponse.mntFact);
        // this.glb.recu.mntTotal = this.monmillier.transform(reponse.mntTotal);
        const params = {montant: this.monmillier.transform(reponse.mntFact),
                        frais:   this.monmillier.transform(reponse.mntFrais),
                        montantTotal: this.monmillier.transform(reponse.mntTotal),
                        label:    'Num Compteur',
                        telephone:  parametre.factures.IdClient,
                        codewoyofal: this.formatagechaine.transform(reponse.Token1, 5, '-'),
                        operation: 'Recharge Compteur Woyofal',
                        energy: reponse.Energy};
      //  params.numFact = facture.numFact;
        this.serv.notifier(params);
        const mod = this.modal.create({
                component: ConfirmationComponent,
                componentProps: {
                  data: params
                }
              }).then((e) => {
                e.present();
                e.onDidDismiss().then(() => {
                  this.vider();
                  this.getrecent();
                });

              });
        this.glb.HEADER.montant = this.monmillier.transform(reponse.mntPlfap);
/*         this.glb.recu = reponse;
        this.glb.recu.guichet = this.glb.IDTERM.substring(5, 6);
        this.glb.recu.agence = this.glb.HEADER.agence;
        this.glb.HEADER.montant = this.monmillier.transform(reponse.mntPlfap);
        this.glb.dateUpdate = this.serv.getCurrentDate();
        this.glb.recu.dtTrx = this.dateformat.transform(reponse.dtTrx);
        this.glb.recu.numTrx = reponse.numTrx;
        this.glb.recu.Token2 = typeof (reponse.Token3) !== 'object' ? this.formatagechaine.transform(reponse.Token2, 5, '-') : '';
        this.glb.recu.Token3 = typeof (reponse.Token3) !== 'object' ? this.formatagechaine.transform(reponse.Token3, 5, '-') : '';
        this.glb.recu.Token1 = this.formatagechaine.transform(reponse.Token1, 5, '-');
        this.glb.recu.mntFrais = this.monmillier.transform(reponse.mntFrais);
        this.glb.recu.mntFact = this.monmillier.transform(reponse.mntFact);
        this.glb.recu.mntTotal = this.monmillier.transform(reponse.mntTotal); */
        this.clientForm.reset();
        // this.glb.showRecu = true;
      } else {
        this.serv.showError('Opération échouée');
      }
    } else {
      this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');

    }

  }).catch(err => {
    this.serv.dismissloadin();
    this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
  });
  }

}
