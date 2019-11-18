import { Injectable } from '@angular/core';
import { ActionSheetController, NavController, ModalController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { GlobalVariableService } from './global-variable.service';
import { ServiceService } from './service.service';
import { PinValidationPage } from '../pages/utilisateur/pin-validation/pin-validation.page';
import { CheckService } from './check.service';
import { ConfirmationComponent } from '../components/confirmation/confirmation.component';
import { MillierPipe } from '../pipes/millier.pipe';

@Injectable({
  providedIn: 'root'
})
export class QrService {

  constructor(public actionSheet: ActionSheetController,
              public navCtrl: NavController,
              public glb: GlobalVariableService,
              public serv: ServiceService,
              public modal: ModalController,
              private check: CheckService,
              private monmillier: MillierPipe,
              public barcodeScanner: BarcodeScanner ) { }

  async showChoice() {
    const action = await this.actionSheet.create({
      mode: 'ios',
      header: 'Opérations',
      buttons: [{
        text: 'Effectuer un paiement',
        handler: () => {
          this.paiement('effectuer');
        }
      }, {
        text: 'Recevoir un paiement',
        handler: () => {
          this.paiement('paiement');
        }
      }
      ]
    });
    await action.present();
  }
  paiement(flag: string) {
    this.glb.qrcmode = false;
    if (flag === 'paiement') {
      this.navCtrl.navigateForward('paiement/qr');
    } else {
      this.barcodeScanner
        .scan({
          resultDisplayDuration: 0,
          prompt : 'Veuillez scanner le qrcode pour effectuer un paiement'
        })
        .then(barcodeData => {
          this.glb.qrcmode = barcodeData.cancelled;
          // Donc g recuperé un qr
          if (!this.glb.qrcmode) {
            const val: any = this.serv.decrytagesymetrique(barcodeData.text, this.glb.PASSWORD);
            // C'est notre qr
            if (val) {
              const textParse = JSON.parse(val);
              const dateGeneration = new Date(textParse.dateGeneration);
              const actualdate = new Date();
              const diff = this.serv.dateDiff(dateGeneration, actualdate);
              // on verifie la date d'expiration
              if (diff.min >= 2) {
                  this.serv.showError('Ce QrCode est expiré!');
                } else {
                  this.showPin(textParse);
                }

            } else {
              this.serv.showError('QrCode non reconnu');
            }

          }
       })
        .catch(err => {
        });
    }
  }
  async showPin(values: any) {
    const params: any = { type: '', telephone: '', montant: '' };
    const montantPlafond = this.glb.HEADER.montant.replace(/ /g, '') * 1;
    if (montantPlafond < values.montantPaiement) {
      this.check.showMoga();
    } else {
       params.type = 'upay2upay';
       params.telephone = values.telephoneMarchand;
       params.montant = values.montantPaiement;
       params.prenom = values.prenom;
       params.nom = values.nom;
       const modal = await this.modal.create({
        component: PinValidationPage,
        componentProps: {
          data: params
        },
        backdropDismiss: true
      });
       modal.onDidDismiss().then((codepin) => {
        if (codepin !== null && codepin.data) {
          const parametres: any = {};
          parametres.recharge = {};
          parametres.recharge.oper = '0073';
          parametres.recharge.pin = codepin.data;
          parametres.recharge.montant = params.montant.replace(/ /g, '');
          parametres.recharge.telephone = params.telephone.replace(/-/g, '');
          parametres.recharge.telephone = parametres.recharge.telephone.replace(/ /g, '');
          params.telephone =  params.telephone;
          parametres.idTerm = this.glb.IDTERM;
          parametres.session = this.glb.IDSESS;
          this.serv.afficheloading();
          this.serv.posts('recharge/upayW2W.php', parametres, {}).then((data) => {
            this.serv.dismissloadin();
            const reponse = JSON.parse(data.data);
            if (reponse.returnCode) {
              if (reponse.returnCode === '0') {
                this.glb.showContactName = false;
                this.glb.recu = reponse;
                if (typeof (reponse.telRech) === 'object') {
                  this.glb.recu.telRech = parametres.recharge.telephone;
                }
                this.glb.recu.guichet = this.glb.IDTERM.substring(5, 6);
                this.glb.recu.agence = this.glb.HEADER.agence;
                this.glb.showRecu = true;
                this.glb.HEADER.montant = this.monmillier.transform(reponse.mntPlfap);
                this.glb.dateUpdate = this.serv.getCurrentDate();
                const clientData = {
                  codeOper: '0073',
                  sousOper: '',
                  reference: parametres.recharge.telephone,
                  nomclient: this.glb.PRENOM,
                  montant: parametres.recharge.montant
                };
                this.serv.insert(clientData);
                const operateur = {
                  codeOper: '0073',
                  sousOper: '',
                  chemin: '',
                  image: '',
                };
                this.serv.insertFavoris(operateur);
                parametres.recharge.montant = this.monmillier.transform(parametres.recharge.montant);
                parametres.recharge.nameContact = this.glb.NOM;
                parametres.recharge.operation = 'Paiement QR';
                parametres.recharge.label = 'N° Tel';
                if (parametres.recharge.oper === '0073') {
                  parametres.recharge.operation = 'Transfert UPAY';
                  this.serv.notifierben(parametres.recharge);
                }
                parametres.recharge.mode = 'reçu';
                this.serv.notifier(parametres.recharge);
                const mod = this.modal.create({
                  component: ConfirmationComponent,
                  componentProps: {
                    data: parametres.recharge,
                  }
                }).then((e) => {
                  e.present();
                  e.onDidDismiss().then(() => {
                  });
                });
              } else { this.serv.showError('Opération échouée'); }
            } else {
              this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
            }

          }).catch(err => {
      this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
    });
        }
      });
       return await modal.present();
    }
  }
}
