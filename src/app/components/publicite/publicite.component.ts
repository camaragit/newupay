import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-publicite',
  templateUrl: './publicite.component.html',
  styleUrls: ['./publicite.component.scss'],
})
export class PubliciteComponent implements OnInit {

  message: any;

  constructor(public navParams: NavParams, private modalCrtl: ModalController) {
    this.message = this.navParams.data.val;
  }
  ngOnInit() {}

  quitter() {
    this.modalCrtl.dismiss();
  }

}
