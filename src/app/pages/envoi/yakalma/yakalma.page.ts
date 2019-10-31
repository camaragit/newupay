import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';

@Component({
  selector: 'app-yakalma',
  templateUrl: './yakalma.page.html',
  styleUrls: ['./yakalma.page.scss'],
})
export class YakalmaPage implements OnInit {
  public headerTitle = 'yakalma';
  public datarecharge: any = {};
  constructor(public glb: GlobalVariableService) { }

  ngOnInit() {
    this.datarecharge.codeOperateur = '0034';
    this.datarecharge.sousoperateur = '0002';
    this.datarecharge.operation = 'Recharge Yakalma';
    this.datarecharge.image         = this.glb.IMG_URL + 'logo_Expresso.png';
    this.datarecharge.chemin        = 'envoi/yakalma';

  }

}
