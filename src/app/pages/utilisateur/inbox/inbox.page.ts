import { Component, OnInit } from '@angular/core';
import { ServiceService } from 'src/app/services/service.service';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { ModalController } from '@ionic/angular';
import { ConfirmationComponent } from 'src/app/components/confirmation/confirmation.component';
import { PubliciteComponent } from 'src/app/components/publicite/publicite.component';
import { MessageComponent } from 'src/app/components/message/message.component';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
})
export class InboxPage implements OnInit {
public value: any;
public headerTitle = 'Mes notifications';
jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre' ];
filterdate: any;
  constructor(private serv: ServiceService, public glb: GlobalVariableService, private modalctrl: ModalController) { }
  ionViewWillEnter() {
    this.glb.nombreNotif = 0;
    this.serv.getAllnotification('');
}
  ngOnInit() {
  }
  details(trx: any) {
   // alert(JSON.stringify(trx));
    trx.data = trx.data == null ? '' : trx.data;
    if (trx.data !== '' ) {
      const recu = JSON.parse(trx.data);
      recu.mode = 'reçu';
      const mod = this.modalctrl.create({
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
      const data: any = {};
      data.notification = {};
      data.notification.payload = {};
      data.notification.payload.title = trx.titre;
      data.notification.payload.body = trx.message;
      data.notification.payload.bigPicture = trx.image;
      const modal = this.modalctrl.create({
        component: trx.image !== '' ? PubliciteComponent : MessageComponent,
        componentProps: {val: data.notification.payload},
        cssClass: 'test'
      }).then((e) => {
        e.present();
      });
    }
  }
  filtrer() {
    let date: any = new Date(this.filterdate);
    const jour = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
    const mois = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
    date = date.getFullYear() + '' + mois + '' + jour;
    this.serv.getAllnotification(date);
  }
  toggleSection(index) {
    this.glb.notifications[index].open = !this.glb.notifications[index].open;
    this.glb.notifications.filter((item) => (item.open && item !== this.glb.notifications[index]) ).map(item => item.open = false);

    }
    ionViewDidLeave() {
     this.glb.notifications = [];
    }
}
