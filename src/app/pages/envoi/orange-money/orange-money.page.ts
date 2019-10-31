import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';

@Component({
  selector: 'app-orange-money',
  templateUrl: './orange-money.page.html',
  styleUrls: ['./orange-money.page.scss'],
})
export class OrangeMoneyPage implements OnInit {

  public headerTitle = 'Orange Money';
  public datarecharge: any = {};
  constructor(public glb: GlobalVariableService) { }

  ngOnInit() {
    this.datarecharge.codeOperateur = '0025';
    this.datarecharge.sousoperateur = '0005';
    this.datarecharge.operation = 'Cashin Orange-Money';
    this.datarecharge.image         = this.glb.IMG_URL + 'omoney.png';
    this.datarecharge.chemin        = 'envoi/orangemoney';
  }

}
