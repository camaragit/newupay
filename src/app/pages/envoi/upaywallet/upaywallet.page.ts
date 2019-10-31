import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';

@Component({
  selector: 'app-upaywallet',
  templateUrl: './upaywallet.page.html',
  styleUrls: ['./upaywallet.page.scss'],
})
export class UpaywalletPage implements OnInit {
  public headerTitle = 'UPAY';
  datarecharge: any = {};
  public datacashin = {image: this.glb.IMG_URL + 'upay_portrait.PNG', chemin: 'envoi/upaywallet',
                      codeOper: '0074', sousOper: '', operation: 'Retrait UPAY' };
  service: string;
  constructor(public glb: GlobalVariableService) { }

  ngOnInit() {
    this.datarecharge.codeOperateur = '0073';
    this.datarecharge.sousoperateur = '';
    this.datarecharge.operation = 'Recharge UPAY';
    this.datarecharge.image         = this.glb.IMG_URL + 'upay_portrait.PNG';
    this.datarecharge.chemin        = 'envoi/upaywallet';
    this.service                    = 'Cashin';
  }

}
