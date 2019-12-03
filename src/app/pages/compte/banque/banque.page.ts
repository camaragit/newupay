import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { GlobalVariableService } from '../../../services/global-variable.service';
import { ServiceService } from '../../../services/service.service';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-banque',
  templateUrl: './banque.page.html',
  styleUrls: ['./banque.page.scss'],
})
export class BanquePage implements OnInit {
  public headerTitle = 'Banques';
  banque;
  btnText = 'Valider';
  comptes: any = [];
  constructor(public navCtrl: NavController, private glb: GlobalVariableService,
              public serv: ServiceService, private alertController: AlertController,
              ) {}

  ngOnInit() {

  }
  gotoupdate(banque: any) {
    console.log('Banquesup ', banque);
    const navigationExtras: NavigationExtras = {
      state: {
        banque
      }
    };
    this.navCtrl.navigateForward(['compte/ajoutbanque'], navigationExtras);
  }
  ajoutBanque() {
    this.navCtrl.navigateForward('compte/ajoutbanque');

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
            this.navCtrl.navigateForward('compte/ajoutbanque');
          }

          })
        .catch(e => {});
/*     })
    .catch(e => {}); */

  }
  updateBanque(mode: any, bank: any) {
    this.serv.updateCompte(bank, mode);
    setTimeout(() => {
      this.getfavoris();
    }, 1000);
  }
  ionViewDidEnter() {

    this.getfavoris();
  }
  async presentAlert(mode: any, bank: any) {
    const msg = mode === 'update' ? 'modifier' : 'supprimer';
    const alert = await this.alertController.create({
      header: 'UPay',
      // subHeader: 'Subtitle',
      message: 'Voulez-vous vraiment ' + msg + ' ce numero de compte?',
      cssClass: 'alertSucces',
      buttons: [{
        text: 'Non',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
        }
      }, {
        text: 'oui',
        handler: () => {
          this.updateBanque(mode, bank);
        }
      }]
    });

    await alert.present();
  }

}
