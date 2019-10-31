import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';

@Component({
  selector: 'app-izi',
  templateUrl: './izi.page.html',
  styleUrls: ['./izi.page.scss'],
})
export class IziPage implements OnInit {

  public headerTitle = 'FREE';
  public datarecharge: any = {};
  constructor(public glb: GlobalVariableService) { }

  ngOnInit() {
    this.datarecharge.codeOperateur = '0020';
    this.datarecharge.sousoperateur = '0001';
    this.datarecharge.operation = 'Recharge Free';
    this.datarecharge.image         = this.glb.IMG_URL + 'logo_Tigo.png';
    this.datarecharge.chemin         = '/envoi/izi';
  }

}
