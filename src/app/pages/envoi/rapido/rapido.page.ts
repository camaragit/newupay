import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';

@Component({
  selector: 'app-rapido',
  templateUrl: './rapido.page.html',
  styleUrls: ['./rapido.page.scss'],
})
export class RapidoPage implements OnInit {
  public headerTitle = 'rapido';
  public datacashin = {image: this.glb.IMG_URL + 'logo_rapido.png', chemin: 'envoi/rapido', codeOper: '0057', sousOper: '0002', operation: ' Recharge Rapido' };
  constructor(public glb: GlobalVariableService) { }

  ngOnInit() {
  }

}
