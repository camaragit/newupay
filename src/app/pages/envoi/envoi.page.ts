import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';

@Component({
  selector: 'app-envoi',
  templateUrl: './envoi.page.html',
  styleUrls: ['./envoi.page.scss'],
})
export class EnvoiPage implements OnInit {
  public envoiServices;
  public headerTitle = 'envoi';
  constructor(public glbVariable: GlobalVariableService) { }

  ngOnInit() {

/*     this.envoiServices  = [{image: this.glbVariable.IMG_URL + 'omoney.png', libelle: 'Orange Money', chemin: 'envoi/orangemoney'},
    {image: this.glbVariable.IMG_URL + 'wizall.png', libelle: 'Wizall', chemin: 'envoi/wizall' },
    {image: this.glbVariable.IMG_URL + 'logo_Tigo Cash.png', libelle: 'TigoCash', chemin: 'envoi/tigocash' },
    {image: this.glbVariable.IMG_URL + 'postecash.png', libelle: 'PosteCash', chemin: 'envoi/postecash'},
    {image: this.glbVariable.IMG_URL + 'emoney.png', libelle: 'E-Money', chemin: 'envoi/emoney'},
    {image: this.glbVariable.IMG_URL + 'logo_Orange.png', libelle: 'Seddo', chemin: 'envoi/seddo'},
    {image: this.glbVariable.IMG_URL + 'logo_Tigo.png', libelle: 'IZI', chemin: 'envoi/izi'},
    {image: this.glbVariable.IMG_URL + 'logo_Expresso.png', libelle: 'Yakalma', chemin: 'envoi/yakalma'},
    {image: this.glbVariable.IMG_URL + 'logo_rapido.png', libelle: 'Rapido', chemin: 'envoi/rapido'},
    {image: this.glbVariable.IMG_URL + 'upay_portrait.PNG', libelle: 'UPAY', chemin: 'envoi/upaywallet'},
  ]; */
  this.envoiServices  = [{image: this.glbVariable.IMG_URL + 'omoney.png', libelle: '', chemin: 'envoi/orangemoney'},
  {image: this.glbVariable.IMG_URL + 'wizall.png', libelle: '', chemin: 'envoi/wizall' },
  {image: this.glbVariable.IMG_URL + 'logo_Tigo Cash.png', libelle: '', chemin: 'envoi/tigocash' },
  {image: this.glbVariable.IMG_URL + 'postecash.png', libelle: '', chemin: 'envoi/postecash'},
  {image: this.glbVariable.IMG_URL + 'emoney.png', libelle: '', chemin: 'envoi/emoney'},
 // {image: this.glbVariable.IMG_URL + 'logo_Orange.png', libelle: '', chemin: 'envoi/seddo'},
  //{image: this.glbVariable.IMG_URL + 'logo_Tigo.png', libelle: '', chemin: 'envoi/izi'},
  //{image: this.glbVariable.IMG_URL + 'logo_Expresso.png', libelle: '', chemin: 'envoi/yakalma'},
  //{image: this.glbVariable.IMG_URL + 'logo_rapido.png', libelle: '', chemin: 'envoi/rapido'},
  {image: this.glbVariable.IMG_URL + 'upayv2.png', libelle: '', chemin: 'envoi/upaywallet'},
  {image: this.glbVariable.IMG_URL + 'brm.png', libelle: '', chemin: 'envoi/brm'}
  //{image: this.glbVariable.IMG_URL + 'homereception.png', libelle: 'MOGA', chemin: 'envoi/transfertuv'},
];
  }

}
