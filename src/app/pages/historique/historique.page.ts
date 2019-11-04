import { Component, OnInit } from '@angular/core';
import {NavController, ModalController} from '@ionic/angular';
import { ServiceService } from 'src/app/services/service.service';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { OperatorImagePipe } from 'src/app/pipes/operator-image.pipe';
import { FormatdatePipe } from 'src/app/pipes/formatdate.pipe';
import { PinValidationPage } from '../utilisateur/pin-validation/pin-validation.page';

@Component({
  selector: 'app-historique',
  templateUrl: './historique.page.html',
  styleUrls: ['./historique.page.scss'],
})
export class HistoriquePage implements OnInit {

  m1: boolean;
  m2: boolean;
  m3: boolean;
  m4: boolean;
  showdetails = false;
  transactions: any;
  mnttotal: number;
  all: boolean;
  existewoyofal: boolean;

  constructor(public navCtrl: NavController,
              public serv: ServiceService,
              public glb: GlobalVariableService,
              public operatorImage: OperatorImagePipe,
              public formatdate: FormatdatePipe,
              public modal: ModalController
              ) { }

  ngOnInit() {
    this.glb.ShowSolde = false;
    this.listerhisto();
  }

  async showSolde() {
    if (!this.glb.ShowSolde) {
        const modal = await this.modal.create({
          component: PinValidationPage,
          backdropDismiss: true
        });

        modal.onDidDismiss().then((codepin) => {
          if (codepin !== null && codepin.data) {
            this.serv.getPlafond();
          } else {
            this.glb.ShowSolde = false;
          }
        });
        return await modal.present();
    } else {
      this.glb.ShowSolde = false;
    }

  }

  selection(tab) {

    this.m1 = false;
    this.m2 = false;
    this.m3 = false;
    this.m4 = false;

    if (tab === 1) {
      this.m1 = true;
    }
    if (tab === 2) {
      this.m2 = true;
    }
    if (tab === 3) {
      this.m3 = true;
    }
    if (tab === 4) {
      this.m4 = true;
    }
  }

  paiement() {
    this.navCtrl.navigateRoot('intantanee');
  }
  listerhisto(mode = 'last') {
    this.showdetails = false;
    const parametre: any = {}; // this.criterForm.getRawValue();
    // const date1 = parametre.date1.substring(0, parametre.date1.indexOf('T'));
    // const date2 = parametre.date2.substring(0, parametre.date2.indexOf('T'));
    // parametre.date1 = date1 + ' 00:00:00';
    // parametre.date2 = date2 + ' 23:59:59';
    parametre.idTerm = this.glb.IDTERM;
    parametre.session = this.glb.IDSESS;
    const url = mode === 'all' ? 'transaction/histotrx.php' : 'transaction/getlasttrx.php';
    this.all = mode === 'all' ? true : false;
    this.serv.afficheloading();
    this.serv.posts(url, parametre, {}).then(data => {
      this.serv.dismissloadin();
      const reponse: any = JSON.parse(data.data);
      //alert(JSON.stringify(reponse));
      if (reponse.returnCode === '0') {
        this.showdetails = true;
        if (mode === 'all') {
          if (reponse.Transactions.Transaction.length) {
            this.transactions = reponse.Transactions.Transaction;
          } else {
            this.transactions = [];
            this.transactions[0] = reponse.Transactions.Transaction;
          }
          this.mnttotal = 0;
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.transactions.length; i++) {
            const sousop = this.transactions[i].codesousop;
            const codeoper = this.transactions[i].codeOper;
            this.transactions[i].image = this.operatorImage.transform(this.glb.OperatorsImages, codeoper, sousop);

           // this.mnttotal = this.mnttotal * 1 + this.transactions[i].Montant * 1;

          }
        } else {

          if (reponse.Trxs.Trx.length) {
            this.transactions = reponse.Trxs.Trx;

          } else {
            this.transactions = [];
            this.transactions[0] = reponse.Trxs.Trx;
          }
          this.existewoyofal = false;

// tslint:disable-next-line: prefer-for-of
          for (let j = 0; j < this.transactions.length; j++) {
            this.transactions[j].Dtrx = this.formatdate.transform(this.transactions[j].Dtrx);
           // this.transactions[j].Oper = this.serv.getSoup(this.transactions[j].Oper, this.transactions[j].Soper);
            if (this.transactions[j].Oper === 'Woyofal') {
              this.existewoyofal = true;
            }
            if (typeof (this.transactions[j].codesousop) === 'object') {
              this.transactions[j].codesousop = '';
            }
            const sousop = this.transactions[j].codesousop;
            const codeoper = this.transactions[j].codeOper;
            if (codeoper === '0029') {
            this.transactions[j].Numc = this.transactions[j].IdDes;
            }
            if (typeof (this.transactions[j].Numc) === 'object') {
              this.transactions[j].Numc = this.glb.PHONE;
            }
            this.transactions[j].label = this.serv.getLabelOperator(codeoper, sousop);
            this.transactions[j].datetrx = this.formatdate.transform(this.transactions[j].Dtrx);
            this.transactions[j].image = this.operatorImage.transform(this.glb.OperatorsImages, codeoper, sousop);
          }
        }
      } else { this.serv.showError('Opération échouée'); }

    }).catch(err => {
      this.serv.dismissloadin();
      this.serv.showError('Impossible d\'atteindre le serveur ');
    });
  }

}
