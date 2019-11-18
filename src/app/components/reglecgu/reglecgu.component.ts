import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GlobalVariableService } from 'src/app/services/global-variable.service';

@Component({
  selector: 'app-reglecgu',
  templateUrl: './reglecgu.component.html',
  styleUrls: ['./reglecgu.component.scss'],
})
export class ReglecguComponent implements OnInit {

  constructor(private modalcrtl: ModalController, private glb: GlobalVariableService) { }

  ngOnInit() {}
  dismiss() {
    this.glb.acceptedcgu = true;
    this.modalcrtl.dismiss();
  }
}
