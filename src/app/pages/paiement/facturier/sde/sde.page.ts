import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';

@Component({
  selector: 'app-sde',
  templateUrl: './sde.page.html',
  styleUrls: ['./sde.page.scss'],
})
export class SdePage implements OnInit {
  public headerTitle = 'SDE';
  public datareleve = {codeoper: '0016', image: this.glbVariable.IMG_URL + 'sde2.png', label: 'Reference',
                       chemin: 'paiement/facturier/sde', encaissementfile: 'encaissement/encaissementsde.php',
                       operation: 'Paiement facture SDE'};

  constructor(public glbVariable: GlobalVariableService) { }

  ngOnInit() {
  }

}
