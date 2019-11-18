import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { QrService } from 'src/app/services/qr.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  m1: boolean;
  m2: boolean;
  m3: boolean;
  m4: boolean;
  barcodeScannerOptions: BarcodeScannerOptions;
  constructor(public navCtrl: NavController,
              public glb: GlobalVariableService,
              private qrserv: QrService,
              public barcodeScanner: BarcodeScanner) {
                this.barcodeScannerOptions = {
                  showTorchButton: true,
                  showFlipCameraButton: true
                };

  }

  ngOnInit() {}

  selection(tab) {

    this.glb.active1 = false;
    this.glb.active2 = false;
    this.glb.active3 = false;
    this.glb.active4 = false;


    if (tab === 1) {
        this.navCtrl.navigateForward('paiement');
        this.glb.active1 = true;
    }
    if (tab === 2) {
      this.navCtrl.navigateForward('reception');
      this.glb.active2 = true;
    }
    if (tab === 3) {
      this.navCtrl.navigateForward('envoi');
      this.glb.active3 = true;
    }
    if (tab === 4) {
      this.navCtrl.navigateForward('favoris');
      this.glb.active4 = true;
    }
  }

  paiement() {
    this.qrserv.showChoice();
  }

}
