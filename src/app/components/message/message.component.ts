import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit  {
  message: any;

  constructor(public navParams: NavParams, private modalCrtl: ModalController) {
    this.message = this.navParams.data.val;
  }
  ngOnInit() {}

  quitter() {
    this.modalCrtl.dismiss();
  }

}
