import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceService } from 'src/app/services/service.service';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { CheckService } from 'src/app/services/check.service';
import { ModalController, IonContent, NavController } from '@ionic/angular';
import { PinValidationPage } from '../../utilisateur/pin-validation/pin-validation.page';
import { MillierPipe } from 'src/app/pipes/millier.pipe';
import { ConfirmationComponent } from 'src/app/components/confirmation/confirmation.component';
import { ReplaceStringPipe } from 'src/app/pipes/replace-string.pipe';

@Component({
  selector: 'app-brm',
  templateUrl: './brm.page.html',
  styleUrls: ['./brm.page.scss'],
})
export class BrmPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  public headerTitle = 'Dépôt Bancaire';
  public databrm: FormGroup;
  public pays;
  public codepays;
  public flag: any = '';
  public banques: any = [];
  recentsbenef: any =[];
  affiche: boolean;
  comptes: any[];

  constructor(public formBuilder: FormBuilder, private serv: ServiceService,
              public glb: GlobalVariableService, private check: CheckService,
              private navCtrl: NavController,
              public modal: ModalController, private millier: MillierPipe, public replace: ReplaceStringPipe) {
    this.databrm = this.formBuilder.group({
      numcompte: ['', Validators.required],
      nomexpediteur: ['', Validators.required],
      prenomexpediteur: ['', Validators.required],
      nombeneficiaire: ['', Validators.required],
      prenombeneficiaire: ['', Validators.required],
      nombanque: ['', Validators.required],
      montant: ['', Validators.required],
      pays: ['', Validators.required],
      pin: [''],
      frais: ['', Validators.required],
    });
  }

  ngOnInit() {
  }
  logScrollStart() {
  }
  async logScrolling($event) { }
  selectRecent(recent) {
    this.databrm.controls.numcompte.setValue(recent.reference);
    const client = recent.nomclient.split(';');
    this.databrm.controls.prenombeneficiaire.setValue(client[0]);
    this.databrm.controls.nombeneficiaire.setValue(client[1]);
  }
  releveFrais() {
    this.affiche = false;
    this.serv.afficheloading();
    const params: any = {};
    params.montant = this.databrm.controls.montant.value;
    params.idSession = this.glb.IDSESS;
    params.idTerminal = this.glb.IDTERM;
    console.log('params tarif ' + JSON.stringify(params));
    this.serv.post(this.glb.URLBANQUE + 'brm/tarif', params).then((data) => {
      this.serv.dismissloadin();
      const reponse = JSON.parse(data.data);
      if (reponse.codeRetour === '0') {
        this.affiche = true;
        this.databrm.controls.frais.setValue(reponse.montantTarif);
        this.content.scrollToBottom(1500);
      } else {
        this.serv.showError(reponse.messageRetour);
      }
      console.log('reponse ' + JSON.stringify(data));
    }).catch(err => {
      this.serv.dismissloadin();
      console.log('erreur ' + JSON.stringify(err));
      const erreur = JSON.parse(err.error);
      this.serv.showError(erreur.messageRetour);

    });

  }
  logScrollEnd() { }
  resetMontant() {
    this.affiche = false;
  }
  ionViewDidEnter() {
    this.getfavoris();
    this.getrecent();
  }
  onCompteSelect() {
    if (this.databrm.controls.numcompte.value !== '') {
      console.log(this.comptes);
      const rowid = this.databrm.controls.numcompte.value * 1;
      console.log(this.databrm.controls.numcompte.value);
      const compte = this.comptes.filter((cpt) => cpt.rowid === rowid)[0];
      this.databrm.controls.pays.setValue(compte.pays);
      this.databrm.controls.prenombeneficiaire.setValue(compte.prenombeneficiaire);
      this.databrm.controls.nombeneficiaire.setValue(compte.nombeneficiaire);
      this.databrm.controls.nombanque.setValue(compte.nombanque);
      this.databrm.controls.numcompte.setValue(compte[0].numerocompte);
    }

  }
  versAjoutBanque() {
    this.navCtrl.navigateForward('compte/ajoutbanque');
  }

  async showPin() {
    const params = this.databrm.getRawValue();
    const montantPlafond = this.glb.HEADER.montant.replace(/ /g, '') * 1;
    const montantArecharger = params.montant * 1;
    if (montantPlafond < montantArecharger) {
      this.check.showMoga();
    } else {
      params.type = 'depot';
      params.nom = this.databrm.controls.nombeneficiaire.value;
      params.prenom = this.databrm.controls.prenombeneficiaire.value;
      params.telephone = this.databrm.controls.numcompte.value;
      const modal = await this.modal.create({
        component: PinValidationPage,
        componentProps: {
          data: params
        },
        backdropDismiss: true
      });

      modal.onDidDismiss().then((codepin) => {
        if (codepin !== null && codepin.data) {
          this.databrm.controls.pin.setValue(codepin.data);
          this.deposerSurCompte();
        }
      });

      return await modal.present();
    }

  }
  deposerSurCompte() {
    this.serv.afficheloading();
    const values = this.databrm.getRawValue();
    const params: any = {};
    params.expediteur = params.beneficiaire = {};
    params.expediteur.prenom = values.prenomexpediteur;
    params.expediteur.nom = values.nomexpediteur;
    params.beneficiaire.nom = values.nombeneficiaire;
    params.beneficiaire.prenom = values.prenombeneficiaire;
    params.beneficiaire.pays = 'SN';
    params.montantEnvoi = values.montant;
    params.deviseEnvoi = 'XOF';
    params.deviseReception = 'XOF',
      params.nomBanque = values.nombanque;
    params.compteBanque = values.numcompte;
    params.idSession = this.glb.IDSESS;
    params.idTerminal = this.glb.IDTERM;
    console.log(params);

    this.serv.post(this.glb.URLBANQUE + 'brm/cash2account', params).then((data => {
      this.serv.dismissloadin();
      const reponse = JSON.parse(data.data);
      console.log('reponse ' + JSON.stringify(reponse));
      if (reponse.codeRetour) {
        if (reponse.codeRetour === '0') {
          this.glb.HEADER.montant = this.millier.transform(reponse.montantPlafondApres);
          this.glb.dateUpdate = this.serv.getCurrentDate();
          this.databrm.reset();
          const clientData = {
            codeOper: '0060',
            sousOper: '',
            reference: params.compteBanque,
            nomclient: params.beneficiaire.prenom + ';' + params.beneficiaire.nom,
            montant: reponse.montantEnvoi
          };
          this.serv.insert(clientData);
          const operateur = {
            codeOper: '0060',
            sousOper: '',
            chemin: 'envoi/brm',
            image: 'assets/images/brm.png',
          };
          this.serv.insertFavoris(operateur);
          this.serv.notifier(params);
          params.operation = 'Dépôt bancaire';
          params.label = 'N° Compte';
          params.telephone = params.compteBanque;
          params.montant = reponse.montantEnvoi;
          params.frais = this.databrm.controls.frais.value;
          const mod = this.modal.create({
            component: ConfirmationComponent,
            componentProps: {
              data: params,
            }
          }).then((e) => {
            e.present();
            e.onDidDismiss().then(() => {
              this.getrecent();
            });
          });
          this.getrecent();
        } else {
          this.serv.showError('Opération échouée');
        }
      } else {
        this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
      }

    })).catch(err => {
      this.serv.dismissloadin();
      const erreur = JSON.parse(err.error);
      this.serv.showError(erreur.messageRetour);
    });

  }
  getrecent() {
    this.recentsbenef = [];
    const sql = 'select * from recents where codeoperateur=? and sousoperateur =? and numcompte=? order by datemisajour desc limit 5';
    const values = ['0060', '', this.glb.NUMCOMPTE];
    this.glb.LITEDB.executeSql(sql, values)
      .then((data) => {
        for (let i = 0; i < data.rows.length; i++) {
          this.recentsbenef.push((data.rows.item(i)));
        }
      })
      .catch(e => { });
  }
  onSelectedBank() {
    const bank = this.databrm.controls.nombanque.value;
    const codeBank = this.banques.find(b => b.abreviation === bank).code;
    this.databrm.controls.numcompte.setValue(codeBank + '-');
    console.log(codeBank);
  }
  getfavoris() {
    this.comptes = [];
    const sql = 'select rowid,pays,numerocompte,nombanque,nombeneficiaire,prenombeneficiaire from comptebancaires ';
    const values = [];
    this.glb.LITEDB.executeSql(sql, values)
        .then((data) => {
          if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
              this.comptes.push((data.rows.item(i)));
            }
          } else {
            // this.navCtrl.navigateForward('compte/ajoutbanque');
          }

          })
        .catch(e => {});

  }

}
