import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { FormBuilder } from '@angular/forms';
import { ServiceService } from 'src/app/services/service.service';
import { NavController, Platform, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MillierPipe } from 'src/app/pipes/millier.pipe';
import { Sim } from '@ionic-native/sim/ngx';
import { FormatphonePipe } from 'src/app/pipes/formatphone.pipe';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Storage } from '@ionic/storage';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { PubliciteComponent } from 'src/app/components/publicite/publicite.component';
import { MessageComponent } from 'src/app/components/message/message.component';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.page.html',
  styleUrls: ['./utilisateur.page.scss'],
})
export class UtilisateurPage implements OnInit {
  numbersTabs: number[];
  lastnumber: any;
  pin = '';
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
      this.connecter();
      return;
    }

  }
  ngOnInit() {
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
      this.oneSignal.startInit(this.glb.onesignalAppIdProd, this.glb.firebaseID);

      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

      this.oneSignal.handleNotificationReceived().subscribe(() => {

      });

      this.oneSignal.handleNotificationOpened().subscribe((data) => {
        this.presentModal(data);
      });

      this.oneSignal.endInit();
    });
  }
  async presentModal(data: any) {
    const modal = await this.modalCrtl.create({
      component: data.notification.payload.bigPicture ? PubliciteComponent : MessageComponent,
      componentProps: {val: data},
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
            params.codepin = this.pin;
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
                    this.oneSignal.sendTags({compte: this.glb.HEADER.agence, telephone: this.glb.PHONE,
                                             numeropiece: reponse.numpiece, prenom: reponse.prenom, nom: reponse.nom});
                    if (typeof(reponse.mntPlf) !== 'object') {
                      this.glb.HEADER.montant = this.monmillier.transform(reponse.mntPlf);
                  } else { this.glb.HEADER.montant = '0'; }
                    this.glb.dateUpdate = this.serv.getCurrentDate();
                    this.glb.HEADER.numcompte = reponse.numcompte;
                    this.glb.HEADER.consomme = this.monmillier.transform(reponse.consome);
                    this.navCtrl.navigateRoot('utilisateur/bienvenue');
                  } else {
                if ( reponse.errorLabel === 'Code Pin incorrect !') {
              //   this.toclear = true;
                }
                this.serv.showError('Opération échouée');
              }
              } else {
                this.serv.showError('Reponse inattendue' );
              }

            }).catch(error => {
              this.serv.dismissloadin();

              this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard ');


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
