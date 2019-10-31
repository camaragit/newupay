import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';

@Component({
  selector: 'app-seddo',
  templateUrl: './seddo.page.html',
  styleUrls: ['./seddo.page.scss'],
})
export class SeddoPage implements OnInit {
  public headerTitle = 'SEDDO';
  public datarecharge: any = {};
  constructor(public glb: GlobalVariableService) { }

  ngOnInit() {
    this.datarecharge.codeOperateur = '0005';
    this.datarecharge.sousoperateur = '0002';
    this.datarecharge.operation = 'Recharge Seddo';
    this.datarecharge.image         = this.glb.IMG_URL + 'logo_Orange.png';
    this.datarecharge.chemin         = '/envoi/seddo';
  }

}
