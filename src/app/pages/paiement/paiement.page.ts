import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';

@Component({
  selector: 'app-paiement',
  templateUrl: './paiement.page.html',
  styleUrls: ['./paiement.page.scss'],
})
export class PaiementPage implements OnInit {

  constructor(public glbVariable: GlobalVariableService) { }
  public paiementServices;
  public headerTitle = 'Paiement';
  ngOnInit() {
  this.paiementServices  = [{image: this.glbVariable.IMG_URL + 'facture.png', libelle: 'Facture', chemin: 'paiement/facturier'},
                           {image: this.glbVariable.IMG_URL + 'marchand.png', libelle: 'Marchand', chemin: 'paiement/marchand' },
                           {image: this.glbVariable.IMG_URL + 'assurance.png', libelle: 'assurance', chemin: 'paiement/assurance' },
                           {image: this.glbVariable.IMG_URL + 'credit.png', libelle: 'credit', chemin: 'paiement/credit'},
                           {image: this.glbVariable.IMG_URL + 'abonne.png', libelle: 'abonnement', chemin: 'paiement/abonnement'}];
  }

}
