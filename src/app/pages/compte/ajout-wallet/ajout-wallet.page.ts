import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidatorPhone } from 'src/app/components/customValidator/custom-validator';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-ajout-wallet',
  templateUrl: './ajout-wallet.page.html',
  styleUrls: ['./ajout-wallet.page.scss'],
})
export class AjoutWalletPage implements OnInit {
  public headerTitle = 'Ajout Wallet';
  public selectedImage = '';

  slideOpts = {
    slidesPerView: 4,
    speed: 400,
    pagination: '.custom-swiper-pagination',
  };
  listeWallets: any;
  public Rechargedata: FormGroup;
  walletSelected: any;
  constructor(public glbVariable: GlobalVariableService,
              public formBuilder: FormBuilder,
              public serv: ServiceService) {
                this.Rechargedata = this.formBuilder.group({
                  telephone: ['', [Validators.required, CustomValidatorPhone]],
                  codepin: ['']});

  }

  ngOnInit() {
    this.listeWallets  = [
    {image: this.glbVariable.IMG_URL + 'omoney.png', libelle: 'Orange Money', codeoperateur: '0005',  chemin: 'envoi/orangemoney'},
    {image: this.glbVariable.IMG_URL + 'wizall.png', libelle: 'Wizall', codeoperateur: '0057', chemin: 'envoi/wizall' },
    {image: this.glbVariable.IMG_URL + 'logo_Tigo Cash.png', libelle: 'TigoCash', codeoperateur: '0022', chemin: 'envoi/tigocash' },
    {image: this.glbVariable.IMG_URL + 'postecash.png', libelle: 'PosteCash', codeoperateur: '0053', chemin: 'envoi/postecash'},
    {image: this.glbVariable.IMG_URL + 'emoney.png', libelle: 'E-Money', codeoperateur: '0054', chemin: 'envoi/emoney'},
  ];
    this.walletSelected = this.listeWallets[0];
  }


  selectImage(wallet: any) {
    this.walletSelected = wallet;
  }
  insertWallet() {
    this.walletSelected.telephone = this.Rechargedata.controls.telephone.value;
    this.serv.insertWallet(this.walletSelected);
/*     if (this.serv.encryptmessage(this.Rechargedata.controls.codepin.value) !== this.glbVariable.PIN) {
      this.serv.showError('Code Pin incorrect !');
    } else {
      this.walletSelected.telephone = this.Rechargedata.controls.telephone.value;
      this.serv.insertWallet(this.walletSelected);
    } */
  }
}
