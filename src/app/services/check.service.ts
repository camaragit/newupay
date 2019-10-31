import { Injectable } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { TransfertUniteValeurPage } from '../pages/envoi/transfert-unite-valeur/transfert-unite-valeur.page';
import { Toast } from '@ionic-native/toast/ngx';

@Injectable({
  providedIn: 'root'
})
export class CheckService {

  constructor(private modal: ModalController,
              private alertCtrl: AlertController,
              private toast: Toast) { }
    async showMoga() {
      const modal = await this.modal.create({
      component: TransfertUniteValeurPage,
      componentProps: {ismodal : true},
    });
      return await modal.present();
  }

}
