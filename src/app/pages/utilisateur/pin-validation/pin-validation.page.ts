import { Component, OnInit, HostListener } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ServiceService } from 'src/app/services/service.service';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { Subscription, fromEvent } from 'rxjs';

@Component({
  selector: 'app-pin-validation',
  templateUrl: './pin-validation.page.html',
  styleUrls: ['./pin-validation.page.scss'],
})
export class PinValidationPage implements OnInit {
  public headerTitle = 'Confirmation';
  numbersTabs: number[];
  lastnumber: any;
  pin = '';
 commingData: any;
 private backbuttonSubscription: Subscription;
  constructor(public modalController: ModalController,
              public serv: ServiceService,
              public glb: GlobalVariableService,
              public navParms: NavParams) { }
/* @HostListener('document:ionBackButton', ['$event'])
              private async overrideHardwareBackAction($event: any) {
                  await this.modalController.dismiss();
              } */
  ngOnInit() {
    this.numbersTabs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffleNumbers = this.shuffle(this.numbersTabs);
    this.lastnumber = shuffleNumbers[9];
    shuffleNumbers.pop();
    this.numbersTabs = shuffleNumbers;
    this.commingData = this.navParms.get('data');
    const event = fromEvent(document, 'backbutton');
    this.backbuttonSubscription = event.subscribe(async () => {
        const modal = await this.modalController.getTop();
        if (modal) {
            modal.dismiss();
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
  async closeModal() {
    await this.modalController.dismiss(this.pin);
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
      this.verificationCodePin();
      return;
    }

  }
  verificationCodePin() {
    setTimeout(() => {
     // this.closeModal();

      // Autre que Connexion

      // Si code Pin saisi vaut code pin local
       this.pin = this.serv.encryptmessage(this.pin);
       if (this.pin === this.glb.PIN) {
        this.closeModal();
      } else {
        this.serv.showToast('Code pin incorrect !');
        this.pin = '';
      }


   }, 500);
  }


  // tslint:disable-next-line: use-life-cycle-interface
  ngOnDestroy() {
    this.backbuttonSubscription.unsubscribe();
}
}
