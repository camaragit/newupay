import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ServiceService } from '../../../services/service.service';
import { Router } from '@angular/router';
import { GlobalVariableService } from '../../../services/global-variable.service';

@Component({
  selector: 'app-ajout-banque',
  templateUrl: './ajout-banque.page.html',
  styleUrls: ['./ajout-banque.page.scss'],
})
export class AjoutBanquePage implements OnInit {
  public headerTitle = 'Ajout banque';
  public databank: FormGroup;
  banque: any;
  btnText = 'Ajouter';
  mode = 'ajout';
  public pays;
  public codepays;
  public flag: any = '';
  public banques: any = [];
  recentsbenef: any[];
  affiche: boolean;

  constructor(public formBuilder: FormBuilder, private serv: ServiceService,
              private router: Router, private glb: GlobalVariableService
    ) {
      this.databank = this.formBuilder.group({
        numerocompte: ['', Validators.required],
        nombeneficiaire: ['', Validators.required],
        prenombeneficiaire: ['', Validators.required],
        nombanque: ['', Validators.required],
        pays: ['', Validators.required],
      });
      if (this.router.getCurrentNavigation().extras.state && this.router.getCurrentNavigation().extras.state.banque) {
      this.banque = this.router.getCurrentNavigation().extras.state.banque;
      this.databank.controls.nombeneficiaire.setValue(this.banque.nombeneficiaire);
      this.databank.controls.prenombeneficiaire.setValue(this.banque.prenombeneficiaire);
      this.databank.controls.numerocompte.setValue(this.banque.numerocompte);
      console.log('banque ', this.banque);
      this.mode = 'update';
      this.btnText = 'Modifier';
    } else {
      this.btnText = 'Ajouter';
      this.mode = 'ajout';
    }
  }
  ionViewDidEnter() {
    this.serv.get(this.glb.URLBANQUE + 'brm/getlist').then((data) => {
      const reponse: any = JSON.parse(data.data);
      console.log(reponse);
      if (reponse.codeRetour === '0') {
        this.pays = reponse.banques.reduce((r, a) => {
          r[a.designation_pays] = r[a.designation_pays] || [];
          r[a.designation_pays].push(a);
          return r;
        }, Object.create(null));
        this.codepays = Object.keys(this.pays);
        if (this.mode === 'ajout') {
          this.databank.controls.pays.setValue(this.codepays[0]);
        } else {
          this.databank.controls.pays.setValue(this.banque.pays);
          this.databank.controls.nombanque.setValue(this.banque.nombanque);
        }
        this.onselectpays();

      }
    });
  }

  onselectpays() {
    const country = this.databank.controls.pays.value;
    console.log(this.pays[country]);
    this.flag = this.pays[country][0].pays;
    this.banques = this.pays[country];
  }
  ngOnInit() {

  }
  inserCompte() {
    const params = this.databank.getRawValue();
    if (this.mode === 'update') {
      params.rowid = this.banque.rowid;
      this.serv.updateCompte(params, this.mode);
    } else {
      console.log(this.databank.getRawValue());
      this.serv.insertBanque(this.databank.getRawValue());
    }
  }
  onSelectedBank() {
    if(this.mode === 'ajout'){
      const bank = this.databank.controls.nombanque.value;
      const codeBank = this.banques.find(b => b.abreviation === bank).code;
      this.databank.controls.numerocompte.setValue(codeBank + '-');
      console.log(codeBank)
    }
  }

}
