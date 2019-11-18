import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ServiceService } from 'src/app/services/service.service';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { MillierPipe } from 'src/app/pipes/millier.pipe';

@Component({
  selector: 'app-paiementqr',
  templateUrl: './paiementqr.page.html',
  styleUrls: ['./paiementqr.page.scss'],
})
export class PaiementqrPage implements OnInit {

  numbersTabs: number[];
  lastnumber: any;
  montant = '0';
  encodeData: any = 'testQr';
  okGeneration = false;

  constructor(
    public navCtrl: NavController,
    public millier: MillierPipe,
    public serv: ServiceService,
    public glb: GlobalVariableService) { }

  ngOnInit() {
    this.numbersTabs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffleNumbers = this.shuffle(this.numbersTabs);
    this.lastnumber = shuffleNumbers[9];
    shuffleNumbers.pop();
    this.numbersTabs = shuffleNumbers;
  }

  versAccueil() {
    this.navCtrl.navigateForward('utilisateur/acceuil');
  }

  presse(key: any) {
    if (key === 'clear') {
      this.okGeneration = false;
      this.montant = this.montant.slice(0, this.montant.length - 1);
      if (this.montant.length === 0) {
        this.montant = '0';
      }
      return;
    }
    if (key !== 'generer') {
      this.okGeneration = false;
      if ( this.montant.length === 1  && this.montant === '0') {
        this.montant = key;
      } else {
        this.montant += key;
      }
    } else {
      if (this.montant === '0') {
        this.serv.showError('Veuillez renseigner le montant');
      } else {
        this.okGeneration = true;
        const dateGeneration = new Date();
        const objetMarchand = {
          montantPaiement: this.montant,
          telephoneMarchand: this.glb.PHONE,
          prenom: this.glb.PRENOM,
          nom: this.glb.NOM,
          dateGeneration
        };
        this.encodeData = this.serv.crytagesymetrique(JSON.stringify(objetMarchand), this.glb.PASSWORD).toString();
      }
    }
  }

  shuffle(arra1) {
    let ctr = arra1.length, temp, index;
    while (ctr > 0) {
      index = Math.floor(Math.random() * ctr);
      ctr--;
      temp = arra1[ctr];
      arra1[ctr] = arra1[index];
      arra1[index] = temp;
    }
    return arra1;
  }

}
