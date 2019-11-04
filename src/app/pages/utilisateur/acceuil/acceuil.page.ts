import { Component, OnInit } from '@angular/core';
import {NavController, ModalController, MenuController} from '@ionic/angular';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { PinValidationPage } from '../pin-validation/pin-validation.page';
import { ServiceService } from 'src/app/services/service.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acceuil',
  templateUrl: './acceuil.page.html',
  styleUrls: ['./acceuil.page.scss'],
})
export class AcceuilPage implements OnInit {
  public ligneUne;
  public ligneDeux;
  constructor(public navCtrl: NavController,
              public glbVariable: GlobalVariableService,
              public serv: ServiceService,
              public barcodeScanner: BarcodeScanner,
              public modal: ModalController ) {
              }
  ngOnInit() {
    this.glbVariable.ShowSolde = false;
    this.ligneUne  = [{image: this.glbVariable.IMG_URL + 'homepaiement.png', libelle: 'Paiement', chemin: 'paiement'},
    {image: this.glbVariable.IMG_URL + 'homereception.png', libelle: 'Reception', chemin: 'reception' } ];

    this.ligneDeux = [{image: this.glbVariable.IMG_URL + 'envoihome.png', libelle: 'Envoi', chemin: 'envoi' },
    {image: this.glbVariable.IMG_URL + 'favorishome.png', libelle: 'Favoris', chemin: 'favoris' }
  ];
  }
  async showSolde() {
    if (!this.glbVariable.ShowSolde) {
        const params: any = {};
        const modal = await this.modal.create({
          component: PinValidationPage,
          backdropDismiss: true
        });

        modal.onDidDismiss().then((codepin) => {
          if (codepin !== null && codepin.data) {
            this.serv.getPlafond();
          } else {

            this.glbVariable.ShowSolde = false;
          }
        });
        return await modal.present();
    } else {
      this.glbVariable.ShowSolde = false;
    }

  }

  home(chemin: string) {
    this.navCtrl.navigateForward(chemin);
  }



  mescartes() {
    this.navCtrl.navigateForward('compte');
  }
  historique() {
    this.navCtrl.navigateForward('historique');
  }
  paiement() {
    this.glbVariable.qrcmode = false;
    this.barcodeScanner
        .scan()
        .then(barcodeData => {
          // const infos  = barcodeData.text.split(';');
          // alert('infos recuperees ' + JSON.stringify(barcodeData));
          this.glbVariable.qrcmode = barcodeData.cancelled ? true : false;
        })
        .catch(err => {
        });
  }

}
