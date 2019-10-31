import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';

@Component({
  selector: 'app-senelec',
  templateUrl: './senelec.page.html',
  styleUrls: ['./senelec.page.scss'],
})
export class SenelecPage implements OnInit {
  public headerTitle = 'Senelec';
  public datareleve = {codeoper: '0027', image: this.glbVariable.IMG_URL + 'senelec.png', label: 'Police / Contrat',
                       chemin: 'paiement/facturier/senelec',
                       encaissementfile: 'encaissement/encaissementsenelec.php', operation: 'Paiement facture SENELEC'};
  constructor(public glbVariable: GlobalVariableService) { }

  ngOnInit() {
  }

}
