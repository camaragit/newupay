import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { FormBuilder } from '@angular/forms';
import { ServiceService } from 'src/app/services/service.service';
import { NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { MillierPipe } from 'src/app/pipes/millier.pipe';
import { Sim } from '@ionic-native/sim/ngx';
import { FormatphonePipe } from 'src/app/pipes/formatphone.pipe';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
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
              // public oneSignal: OneSignal,
              public formatphone: FormatphonePipe,
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
              } else { params.idSim1 = info.simSerialNumber; }
            }
         /*    this.oneSignal.sendTags({imei: this.Userdata.controls.imei.value,
              numsim1: this.Userdata.controls.idSim1.value,
              numsim2: this.Userdata.controls.idSim2.value,
            }); */
            params.login = this.glb.NUMCOMPTE;
            params.login = params.login.substring(0, 3) !== '221' ? '221' + params.login : params.login;
            params.login = params.login.replace(/-/g, '');
            params.login = params.login.replace(/ /g, '');
            params.codepin = this.pin;
           // alert('cnxion' + JSON.stringify(params));
            this.serv.afficheloading();
            this.serv.posts('connexion/connexion.php', params, {}).then(data => {
              this.serv.dismissloadin();
              const reponse = JSON.parse(data.data);
             // alert('Connexion rep' + JSON.stringify(reponse));
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
                    this.glb.NUMPIECE = reponse.numpiece;
                 //   this.oneSignal.sendTags({codeespace: this.glb.HEADER.agence});
                    if (typeof(reponse.mntPlf) !== 'object') {
                      this.glb.HEADER.montant = this.monmillier.transform(reponse.mntPlf);
                  } else { this.glb.HEADER.montant = 0; }
                    this.glb.dateUpdate = this.serv.getCurrentDate();
                    this.glb.HEADER.numcompte = reponse.numcompte;
                    this.glb.HEADER.consomme = this.monmillier.transform(reponse.consome);
                    this.navCtrl.navigateRoot('utilisateur/bienvenue');
                  } else {
                if (reponse.errorLabel === 'Code Pin incorrect !') {
              //   this.toclear = true;
                }
                this.serv.showError('Opération échouée');
              }
              } else {
                this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard' );
              }

            }).catch(error => {
              this.serv.dismissloadin();
              this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');

            });


          },
          (err) => this.serv.showError('Impossible de récuperer les infos du téléphone')
        );
      },
      () => this.serv.showError('Vous devez activer les autorisations')
    );


   } else {
     this.serv.showToast('Compte inexistant !');
   }

  }
  verssouscription() {
    this.navCtrl.navigateForward('utilisateur/souscription');


  }
}
