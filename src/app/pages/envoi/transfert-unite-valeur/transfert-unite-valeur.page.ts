import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Platform, ModalController, NavParams } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ServiceService } from 'src/app/services/service.service';
import { MillierPipe } from 'src/app/pipes/millier.pipe';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidatorPhone } from 'src/app/components/customValidator/custom-validator';
import { PinValidationPage } from 'src/app/pages/utilisateur/pin-validation/pin-validation.page';
import { ConfirmationComponent } from 'src/app/components/confirmation/confirmation.component';
declare var SMSReceive: any;
@Component({
  selector: 'app-transfert-unite-valeur',
  templateUrl: './transfert-unite-valeur.page.html',
  styleUrls: ['./transfert-unite-valeur.page.scss']
})
export class TransfertUniteValeurPage implements OnInit {
  public headerTitle = 'Créditer';
  token: string;
  numtrx: any;
  sousop: any;
  idtrxEmoney: any;
  codepin = '';
  sauvegardemontant: any = '';
  montantreleve: any;
  public rechargeForm: FormGroup;
  ismodal;
  // private listeServiceDisponible = ['0005',  '0057', '0053'];
  private listeServiceDisponible = ['0022', '0054', '0005'];
  constructor(public androidPermissions: AndroidPermissions,
              public platform: Platform,
              public callNumber: CallNumber,
              public millier: MillierPipe,
              public glb: GlobalVariableService,
              public serv: ServiceService,
              public modal: ModalController,
              private formbuilder: FormBuilder) {
    this.rechargeForm = this.formbuilder.group({
      telephone: ['', [Validators.required, CustomValidatorPhone]],
      montantrlv: ['', Validators.required],
      montant: ['', Validators.required],
      service: ['0005', Validators.required],
      oper: [''],
      frais: [''],
      sousop: ['']
    });
    this.glb.isUSSDTriggered = false;
  }
  ionViewWillEnter() {
    this.glb.enecoute = false;
    this.smsreceiver();
}
  ngOnInit() {
    this.glb.isUSSDTriggered = false;
    if (this.ismodal && this.ismodal === true) {
      // tslint:disable-next-line: max-line-length
      this.serv.showError('Le solde de votre compte est insuffisant pour effectuer cette opération. Merci de le créditer à partir d\' un wallet');
    }

  }
  smsreceiver() {
    this.platform.ready().then(() => {
      if (SMSReceive) {
        this.startWatching();
        document.addEventListener('onSMSArrive', (e: any) => {
          const IncomingSMS = e.data;
          this.processSMS(IncomingSMS);
        });
      } else {
        this.serv.showError('Impossible de lire un sms entrant');
       // alert('nok');
      }
    });
  }

  ionViewDidLeave() {
    this.stopwatching();
  }
  checkPermission() {
    this.platform.ready().then(() => {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.RECEIVE_SMS).then(
        result => {
         // alert('Has permission? ' + result.hasPermission);
          this.watchingSMS();
        },
        err => {

          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.RECEIVE_SMS).then(r => {
            this.watchingSMS();
          }).catch((err) => {

          });
        }
      );
      this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.RECEIVE_SMS]);

    });

  }
  watchingSMS() {
    if ((/(ipad|iphone|ipod|android)/i.test(navigator.userAgent))) {
      this.startWatching();
      document.addEventListener('onSMSArrive', (e: any) => {
        const sms: any = e.data;
        this.processSMS(sms);
      });
    }
  }
  stopwatching() {
        SMSReceive.stopWatch(
          () => {
            this.glb.enecoute = false;
          },
          () => {
          }
        );
  }

  startWatching() {
    if (this.glb.enecoute === false) {
      SMSReceive.startWatch(
        () => {
          this.glb.enecoute = true ;
         },
        (err) => {  }
      );
    }

  }

  restartWatching() {
    SMSReceive.stopWatch(
      () => {
        this.glb.enecoute = false;
        this.startWatching();
      },
      () => { }
    );
  }
  processSMS(sms: any) {
    const expediteur = sms.address.toUpperCase();
    const message = sms.body;
    if (this.glb.isUSSDTriggered === true) {
      if (expediteur === 'ORANGEMONEY') {
        this.processOrangeMoney(message);
      }
      if (expediteur === 'WIZALLMONEY') {
        this.processWizall(message);
      }
      if (expediteur === 'E-MONEY') {
        this.processEmoney(message);
      }
      if (expediteur === 'POSTECASH') {
        this.processpostecash(message);
      }
      if (expediteur === 'FREE-MONEY') {
        this.processTigoCash(message);
      }
    }
    setTimeout(() => {
    // this.restartWatching();
    }, 200);
  }
  processEmoney(message: string) {
    const parta = 'Vous avez effectue un paiement de ';
    const partb = 'chez ' + this.glb.ATPS_EM_IDMERCHAND;
    if (message.includes(parta) && message.includes(partb)) {
      const sub  = parta;
      const rest = ' FCFA le';
      const mntsms: any = message.substring(message.indexOf(sub) + sub.length, message.indexOf(rest));
      const mntrlv = this.sauvegardemontant;
      if (mntrlv * 1 !== mntsms * 1) {
        //this.serv.showError('Le montant initié est different du montant que vous tentez de recharger');
      } else {
        this.cashinUPay();
      }
    }
  }
  processTigoCash(message: string) {
    const msg = 'Paiement pour MERCHAND (' + this.glb.ATPS_TIGO_IDMERCHAND + ')';
    const z = 'Montant: ';
    let mnt: any = message.substring(message.indexOf(z) + z.length, message.indexOf('F.'));
    mnt *= 1;
    if (message.includes(msg)) {
      if ((mnt === this.sauvegardemontant * 1)) {
      this.cashinUPay();
      } else {
       // this.serv.showError('Le montant initié est different du montant que vous tentez de recharger');
      }
    }
  }

  processOrangeMoney(message: string) {
    if (this.glb.isUSSDTriggered === true) {
      const parta = 'Votre operation de ';
      const partb = 'a ete reglee par Orange Money.';
      let mnt: any = message.substring(message.indexOf(parta) + parta.length, message.indexOf('FCFA'));
      mnt *= 1;
      if (message.includes(parta) && message.includes(partb) ) {
        if ((mnt === this.sauvegardemontant * 1)) {
          this.cashinUPay();
          } else {
            //this.serv.showError('Le montant initié est different du montant que vous tentez de recharger');
          }
      }
    }

  }
  processWizall(message: string) {

    if (message.substr(0, 24) === 'Bonjour, votre code de s') {
      const otp = message.substring(message.length - 6);
      const url = 'https://testwpay.wizall.com/api/merchant/cashout/confirm/';
      // const url = 'https://testwpay.wizall.com/api/merchant/cashout/confirm';
      const header = { Authorization: 'Bearer ' + this.token };
      const params = { otp, msisdn: '765697413', merchant_msisdn: '773914791', merchant_pin: '1001' };
      this.serv.post(url, params, header).then((data: { data: string; }) => {
        this.serv.dismissloadin();
        // this.serv.dismissloadin();
        const reponse = JSON.parse(data.data);
        // alert('reponse confirm ' + JSON.stringify(reponse));
        if (reponse.Operation) {
          if (reponse.Operation === 'MerchantGetMoneyConfirm') {
            this.numtrx = this.glb.PHONE;
            this.cashinUPay();
          } else {
            alert(JSON.stringify(reponse));
          }
        } else {
          alert(JSON.stringify(reponse));

        }
      })
        .catch((err: { status: number; }) => {
          this.serv.dismissloadin();
          this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard ');
        });

    }
  }
  /*   processEmoney(message: string) {
      if (message.indexOf('OTP') !== -1) {
        setTimeout(() => {
          const otp = message.substring(message.indexOf('OTP:') + 5, message.indexOf('. Ref:'));
          const parametres: any = {};
          parametres.recharge = {};
          parametres.recharge.numtrx = this.idtrxEmoney;
          parametres.recharge.codevalidation    = otp;
          parametres.recharge.montant   = this.rechargeForm.controls.montantrlv.value.replace(/ /g, '');
          this.serv.posts('recharge/validationemoney.php', parametres, {}).then((data: { data: string; }) => {
            const reponse = JSON.parse(data.data);
            if (reponse.returnCode) {

              if (reponse.returnCode === '0') {
                this.cashinUPay();
              } else { this.serv.dismissloadin(); this.serv.showError('Opération échouée'); }
            } else {
              this.serv.dismissloadin();
              this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
            }
          }).catch((err: { status: number; }) => {
            this.serv.dismissloadin();

              this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard ' + JSON.stringify(err));

          });

        }, 3000);


      }
    } */
  processpostecash(message) {
    if (message.substr(0, 42) === 'Vous avez effectue une demande de debit de') {
      const v = message.substr(message.indexOf(':') + 2, message.indexOf('.'));
      const otp = v.substr(0, v.indexOf('.'));
      const parametre: any = {};
      parametre.recharge = {};
      parametre.recharge.telephone = this.glb.PHONE;
      parametre.recharge.codevalidation = otp;
      parametre.recharge.montant = this.rechargeForm.controls.montantrlv.value.replace(/ /g, '');
      parametre.recharge.pin = this.codepin;
      parametre.idTerm = this.glb.IDTERM;
      parametre.session = this.glb.IDSESS;
      this.serv.posts('recharge/retraitpostcash.php', parametre, {}).then((data: { data: string; }) => {
        this.serv.dismissloadin();
        const reponse = JSON.parse(data.data);
        if (reponse.returnCode === '0') {
          this.numtrx = this.glb.PHONE;
          this.glb.HEADER.montant = this.millier.transform(reponse.mntPlfap);
          this.cashinUPay();
        } else {
          this.serv.showError('Opération échouée');
        }
      }).catch((err: any) => {
        this.serv.dismissloadin();
        this.serv.showError('Impossible d\'atteindre le serveur');
      });
    }
  }
  cashinUPay() {
    this.glb.isUSSDTriggered = false;
    const parametres: any = {};
    parametres.recharge = {};
    parametres.recharge.nomClient = this.glb.PRENOM + ' ' + this.glb.NOM;
    parametres.recharge.sousoper = this.sousop ? this.sousop : '';
    parametres.recharge.numtrx = this.numtrx ? this.numtrx : this.glb.PHONE;
    parametres.recharge.oper = this.rechargeForm.controls.service.value;
    parametres.recharge.codeEs = '221' + this.glb.PHONE;
    parametres.recharge.montant = this.montantreleve + ''; // this.rechargeForm.controls.montantrlv.value; // .replace(/ /g, '');
    parametres.recharge.telephone = this.glb.PHONE; // datarecharge.recharge.telephone.replace(/-/g, '');
    parametres.recharge.operation = 'Recharge UPay (MOGA)'; // datarecharge.recharge.telephone.replace(/-/g, '');
    parametres.idTerm = this.glb.IDTERM;
    parametres.session = this.glb.IDSESS;
/*     alert('recharges cashing up ' + JSON.stringify(this.rechargeForm.getRawValue()));
    alert('sauvegarde mnt' + this.sauvegardemontant);
    alert('parametres avant' + JSON.stringify(parametres)); */
  /*  alert('this.glb.isUSSDTriggered ' + this.glb.isUSSDTriggered); */
    if (parametres.recharge.montant === '') {
      parametres.recharge.montant = this.sauvegardemontant + '';
  }
    alert('parametres apres' + JSON.stringify(parametres));

    this.serv.posts('recharge/cashinMoga.php', parametres, {}).then((data: { data: string; }) => {
      this.serv.dismissloadin();
      const reponse = JSON.parse(data.data);
      if (reponse.returnCode) {
        if (reponse.returnCode === '0') {
          this.reinit();
          this.glb.HEADER.montant = this.millier.transform(reponse.mntPlfap);
          this.glb.dateUpdate = this.serv.getCurrentDate();
          parametres.recharge.montant = this.millier.transform(parametres.recharge.montant);
          parametres.recharge.nameContact = this.glb.PRENOM + ' ' + this.glb.NOM;
          parametres.recharge.label = 'N° Tel';
          if (this.ismodal === true) {
            // tslint:disable-next-line: max-line-length
            const msg = 'Votre compte a été réapprovisionné avec succès d\'un montant de ' + parametres.recharge.montant + ' \n Votre nouveau solde est : ' + this.glb.HEADER.montant;
            this.serv.showToast(msg);
            this.modal.dismiss();
          } else {
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
          }
        } else {
          this.serv.showError('Opération échouée');
        }
      } else {
        this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard  ');
      }

    }
    ).catch((err) => {
      this.serv.dismissloadin();
      this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
    });
    return;
  }
  async showPin() {
    this.montantreleve = this.sauvegardemontant = this.rechargeForm.controls.montantrlv.value;
    const montant = this.rechargeForm.controls.montantrlv.value * 1;

    if ((montant < this.glb.minMontantMoga) || (this.montantreleve * 1 < this.glb.minMontantMoga)) {
      this.serv.showError('Le montant minimum est de ' + this.glb.minMontantMoga + 'F' );
    } else {
          const service = this.rechargeForm.controls.service.value;
          if (!this.listeServiceDisponible.includes(service)) {
      this.serv.showAlert('Service en cours developpement');
    } else {
      if (this.ismodal !== true) {
        const modal = await this.modal.create({
          component: PinValidationPage,
          backdropDismiss: true
        });
        modal.onDidDismiss().then((codepin) => {
          if (codepin !== null && codepin.data) {
            this.codepin = codepin.data;
            this.initier();
          } else {
            this.glb.ShowSolde = false;
          }
        });
        return await modal.present();

      } else {
        this.initier();
      }


    }
    }

  }
  reinit() {
    this.rechargeForm.controls.montantrlv.setValue('');
    this.glb.isUSSDTriggered = false;
    this.montantreleve = '';
    this.rechargeForm.controls.service.setValue('0005');
    this.restartWatching();
  }
  initier() {
    const service = this.rechargeForm.controls.service.value;

    switch (service) {

      case '0053': {
        this.initOperation(service);
        break;
      }
      case '0057': {
        const params = {
          username: 'test',
          password: 'jdkwq01276329021',
          client_id: 'jdsjkw9021843092-02198322332n',
          // tslint:disable-next-line: max-line-length
          client_secret: 'WTwiygwawd3d3d32erfnBk2dHiwVrP4nW6Ip2EBXyuZLHAJ14tDx7a490LKQvdkMiBIiAtY3RRXmMMU11zSKEPzu88ewwwefrfewmauPEvJdo4VeVhGTkwahJeXhZ7EKZXCd3tU',
          client_type: 'public',
          grant_type: 'password'
        };
        this.serv.afficheloadingWithExit();
        let url = 'https://testwpay.wizall.com/o/token/';
        this.serv.post(url, params).then((data: { data: string; }) => {
          // this.serv.dismissloadin();
          const reponse = JSON.parse(data.data);
          // alert('reponse Token ' + JSON.stringify(reponse));
          if (reponse.access_token) {
            url = 'https://testwpay.wizall.com/api/merchant/cashout/';
            // tslint:disable-next-line: no-shadowed-variable
            const params = {
              msisdn: '765697413',
              merchant_msisdn: '773914791',
              merchant_pin: '1001',
              amount: '1'
            };
            this.token = reponse.access_token;
            const header = { Authorization: 'Bearer ' + reponse.access_token };
            this.serv.post(url, params, header).then((data: { data: string; }) => {
              // this.serv.dismissloadin();
              const reponse = JSON.parse(data.data);
              //  alert('reponse init ' + JSON.stringify(reponse));
            })

              .catch((err: { status: number; }) => {
                this.serv.dismissloadin();

                this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard ' + JSON.stringify(err));

              });
          }
        })
          .catch((err: { status: number; }) => {
            this.serv.dismissloadin();
            if (err.status === 500) {
              this.serv.showError('Une erreur interne s\'est produit  ' + JSON.stringify(err));
            } else {
              this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard' + JSON.stringify(err));
            }
          });
        break;
      }
      case '0022': {
        this.lancementussd(service);
        break;
      }
      case '0005': {

        this.lancementussd(service);
        break;
      }
      case '0054': {
        this.lancementussd(service);
        break;
      }
      default: {
        this.serv.showAlert('Service en cours developpement');
        break;
      }
    }

  }
  lancementussd(service: string) {
    this.serv.afficheloadingWithExit();
    setTimeout(() => {
      const reference = this.serv.generateUniqueId();
      // tslint:disable-next-line: max-line-length
      const mnt = this.rechargeForm.controls.montantrlv.value;
      const commandetigo = '#150*4*6*' + this.glb.ATPS_TIGO_IDMERCHAND + '*' + reference + '*' + mnt + '#';
      const commandeOrange = '#144#5*' + this.glb.ATPS_OM_IDMERCHAND + '*' + mnt + '#';
      const commandeEmoney = '#444*3*1*' + this.glb.ATPS_EM_IDMERCHAND + '*' + mnt + '#';
      /* const commandetigo   = '#150*4*6*' + this.glb.ATPS_TIGO_IDMERCHAND + '*' + reference + '*1#';
         const commandeOrange = '#144#5*' + this.glb.ATPS_OM_IDMERCHAND + '*10#';
         const commandeEmoney = '#444*3*1*' + this.glb.ATPS_EM_IDMERCHAND + '*100#';*/
      let commande = '';
      if (service === '0022') {
        commande = commandetigo;
      }
      if (service === '0005') {
        commande = commandeOrange;
      }
      if (service === '0054') {
        commande = commandeEmoney;
      }
      // alert(commande);
      this.callNumber.callNumber(commande, true)
        .then(res => {
          this.glb.isUSSDTriggered = true;
        })
        .catch(err => {
          this.serv.dismissloadin();
        });
    }, 200);
  }
  initOperation(service: string) {
    const transfert = { montant: this.rechargeForm.controls.montantrlv.value, telSource: this.glb.PHONE, opersource: service };
    const params = {
      transfert,
      idTerm: this.glb.IDTERM,
      session: this.glb.IDSESS
    };
    const data: any = {};
    data.idTerm = this.glb.IDTERM;
    data.session = this.glb.IDSESS;
    this.serv.afficheloadingWithExit();
    this.serv.posts('recharge/initcashoutoper.php', params, {}).then((data) => {
      const reponse = JSON.parse(data.data);
      if (reponse.returnCode) {
        if (reponse.returnCode === '0') {
         // alert(JSON.stringify(reponse));
          if (service === '0054') {
            this.idtrxEmoney = reponse.numtrx;
          }

        } else {
          this.serv.dismissloadin();
          this.serv.showError('Opération échouée');
        }

      } else {
        this.serv.dismissloadin();
        this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard ');
      }
    }
    ).catch((err: { status: number; }) => {
      this.serv.dismissloadin();
      if (err.status === 500) {
        this.serv.showError('Une erreur interne s\'est produit ');
      } else {
        this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
      }
    });
  }

}
