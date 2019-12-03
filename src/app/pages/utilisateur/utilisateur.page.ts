import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { FormBuilder } from '@angular/forms';
import { ServiceService } from 'src/app/services/service.service';
import { NavController, Platform, ModalController, MenuController } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { MillierPipe } from 'src/app/pipes/millier.pipe';
import { Sim } from '@ionic-native/sim/ngx';
import { FormatphonePipe } from 'src/app/pipes/formatphone.pipe';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Storage } from '@ionic/storage';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { PubliciteComponent } from 'src/app/components/publicite/publicite.component';
import { MessageComponent } from 'src/app/components/message/message.component';
import { ConfirmationComponent } from 'src/app/components/confirmation/confirmation.component';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.page.html',
  styleUrls: ['./utilisateur.page.scss'],
})
export class UtilisateurPage implements OnInit {
  numbersTabs: number[];
  lastnumber: any;
  pin = '';
  pinencrypted = '';
  IsNewUser = false;
  constructor(public storage: Storage, public glb: GlobalVariableService,
              public serv: ServiceService, public formBuilder: FormBuilder,
              public navCtrl: NavController,
              public router: Router,
              public platform: Platform,
              public monmillier: MillierPipe,
              public sim: Sim,
              public oneSignal: OneSignal,
              public formatphone: FormatphonePipe,
              public modalCrtl: ModalController,
              private menu: MenuController,
              public androidPermissions: AndroidPermissions) {

  }

  presse(key: any) {
    if (key === 'clear') {
      this.pin = this.pin.slice(0, this.pin.length - 1);
      return;
    }
    if (key !== 'ok') {
      this.pin += key;
    }
    if (this.pin.length > 4) {
      this.pin = this.pin.substring(0, 4);
    }
    if (this.pin.length === 4) {
      this.pinencrypted = this.serv.encryptmessage(this.pin);
      this.connecter();
      return;
    }

  }
  ngOnInit() {
    this.glb.USERID = '';
    this.numbersTabs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffleNumbers = this.shuffle(this.numbersTabs);
    this.lastnumber = shuffleNumbers[9];
    shuffleNumbers.pop();
    this.numbersTabs = shuffleNumbers;
    this.storage.get('login').then((val) => {
      if (val === null) {
        this.IsNewUser = true;
      } else {
        this.glb.NUMCOMPTE  = val;
        this.IsNewUser = false;
      }
    });
    this.platform.ready().then(() => {
      setTimeout(() => {
        console.log('base ',this.glb.LITEDB)
        this.serv.createDataBase();
      }, 2000);
      this.oneSignal.startInit(this.glb.onesignalAppIdProd, this.glb.firebaseID);

      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

      this.oneSignal.handleNotificationReceived().subscribe((data) => {
        console.log(data);
        const notificationData = data.payload;
        const notification: any = {};
        notification.titre = notificationData.title;
        notification.message = notificationData.body;
        notification.image = notificationData.bigPicture ? notificationData.bigPicture : '';
        notification.data = notificationData.additionalData ? JSON.stringify(notificationData.additionalData.trx) : '';
        console.log(JSON.stringify(notification));
        this.glb.nombreNotif += 1;
        this.serv.insertnotification(notification);
        if(notificationData.additionalData && notificationData.additionalData.type && notificationData.additionalData.type === 'credit'){
          const type = 'received';
          this.presentModal(data, type);
        }
      });

      this.oneSignal.handleNotificationOpened().subscribe((data) => {
        console.log(data);
        if (data.notification.payload.additionalData.trx) {
          const recu = data.notification.payload.additionalData.trx;
          const mod = this.modalCrtl.create({
            component: ConfirmationComponent,
            componentProps: {
              data: recu,
            }
          }).then((e) => {
            e.present();
            e.onDidDismiss().then(() => {

            });
          });
        } else {
          this.presentModal(data);
        }
      });
      this.oneSignal.getIds().then((data) => {
        this.glb.USERID = data.userId;
       });
      this.oneSignal.endInit();
    });
    this.menu.isOpen().then(data => {
      if (data === true) {
      this.menu.toggle();
      }
    });
  }
  async presentModal(data: any, type: any ='') {
    const params = type === 'received' ? data.payload : data.notification.payload;
    const modal = await this.modalCrtl.create({
      component: params.bigPicture ? PubliciteComponent : MessageComponent,
      componentProps: {val: params},
      cssClass: 'test'
    });
    return await modal.present();
  }
  ionViewDidEnter() {
    this.pin = '';
    this.storage.get('login').then((val) => {
      if (val === null) {
        this.IsNewUser = true;
      } else {
        this.glb.NUMCOMPTE  = val;
        this.IsNewUser = false;
      }
    });
  }
  shuffle(arra1) {
    let ctr = arra1.length, temp, index;
    while (ctr > 0) {
      index = Math.floor(Math.random() * ctr);
      ctr--;
      temp = arra1[ctr];
      arra1[ctr] = arra1[index];
      arra1[index] = temp;
    }
    return arra1;
  }
  connecter() {
   // SI pas un nouveau
   if (!this.IsNewUser) {
    const params: any = {};
    this.sim.requestReadPermission().then(
      () => {
        this.sim.getSimInfo().then(
          (info) => {
            params.imei = info.deviceId;
            if (!info.simSerialNumber) {
              this.serv.showError('Veuillez inserer une carte SIM');
            } else {
              const card = info.cards;
              if (card) {
                params.idSim1 = card[0].simSerialNumber;
                if (card.length > 1) {
                  params.idSim2 = card[1].simSerialNumber;
                }
              } else { params.idSim1 = info.simSerialNumber; params.idSim2 = ''; }
            }
            this.oneSignal.sendTags({imei: params.imei,
              numsim1: params.idSim1,
              numsim2: params.idSim2,
            });
            params.login = this.glb.NUMCOMPTE;
            params.login = params.login.substring(0, 3) !== '221' ? '221' + params.login : params.login;
            params.login = params.login.replace(/-/g, '');
            params.login = params.login.replace(/ /g, '');
            params.codepin = this.pinencrypted;
            this.serv.afficheloading();
            this.serv.posts('connexion/connexion.php', params, {}).then(data => {
              this.serv.dismissloadin();
              const reponse = JSON.parse(data.data);
              if (reponse.returnCode) {
                  if (reponse.returnCode === '0') {
                    this.glb.HEADER.agence = reponse.agence;
                    this.glb.IDPART = reponse.idPartn;
                    this.glb.IDSESS = reponse.idSession;
                    this.glb.IDTERM = reponse.idTerm;
                    this.glb.PRENOM = reponse.prenom;
                    this.glb.PHONE = params.login;
                    this.glb.PHONE =  this.glb.PHONE.substring(3);
                    this.glb.NOM = reponse.nom;
                    this.glb.PIN = reponse.pin;
                    if (!reponse.numpiece || typeof(reponse.numpiece) === 'object' || reponse.numpiece === '') {
                      const navigationExtras: NavigationExtras = {
                        state: {
                          user: reponse
                        }
                      };
                      this.navCtrl.navigateRoot('utilisateur/souscription', navigationExtras);

                    } else {
                      this.oneSignal.sendTags({compte: this.glb.HEADER.agence, telephone: this.glb.PHONE,
                        numeropiece: reponse.numpiece, prenom: reponse.prenom, nom: reponse.nom});
                      if (typeof(reponse.mntPlf) !== 'object') {
                        let  plf: any = reponse.mntPlf * 1 - reponse.consome * 1;
                        plf += '';
                        this.glb.HEADER.montant = this.monmillier.transform(plf);
                      } else { this.glb.HEADER.montant = '0'; }
                      this.glb.dateUpdate = this.serv.getCurrentDate();
                      this.glb.HEADER.numcompte = reponse.numcompte;
                      this.glb.HEADER.consomme = this.monmillier.transform(reponse.consome);
                      this.navCtrl.navigateRoot('utilisateur/acceuil');
                    }
                  } else {
                if ( reponse.errorLabel === 'Code Pin incorrect !') {
                  this.serv.showError('Code Pin incorrect !');
                } else {
                  console.log(reponse.errorLabel);
                  this.serv.showError('Opération échouée');
                }
              }
              } else {
                this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
              }

            }).catch(error => {
              this.serv.dismissloadin();

              this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
              console.log(JSON.stringify(error));

            });


          },
          (err) => this.serv.showError('Impossible de récuperer les infos du téléphone')
        );
      },
      () => this.serv.showError('Vous devez acitver les autorisations dans les parametres de votre telephone')
    );


   } else {
     // this.serv.showToast('Compte inexistant !');
     this.navCtrl.navigateForward('utilisateur/checkcompte');
   }
  }
  verssouscription() {
    this.navCtrl.navigateForward('utilisateur/souscription');
  }
  reinit() {
    this.navCtrl.navigateForward('utilisateur/resetpin');

  }

}
