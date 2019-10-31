import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';

@Component({
  selector: 'app-emoney',
  templateUrl: './emoney.page.html',
  styleUrls: ['./emoney.page.scss'],
})
export class EmoneyPage implements OnInit {
// Entete
  public headerTitle = 'EMoney';
  public datarecharge: any = {};
  constructor(public glb: GlobalVariableService) { }

  ngOnInit() {
    this.datarecharge.codeOperateur = '0054';
    this.datarecharge.sousoperateur = '0005';
    this.datarecharge.operation = 'Cashin E-MONEY';
    this.datarecharge.image         = this.glb.IMG_URL + 'emoney.png';
    this.datarecharge.chemin        = 'envoi/emoney';
  }

}
