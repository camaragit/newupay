import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CustomValidatorPhone } from '../customValidator/custom-validator';
import { ServiceService } from 'src/app/services/service.service';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { MillierPipe } from 'src/app/pipes/millier.pipe';
import { ContactFindOptions, Contacts } from '@ionic-native/contacts/ngx';
import { PinValidationPage } from 'src/app/pages/utilisateur/pin-validation/pin-validation.page';
import { ModalController, PopoverController } from '@ionic/angular';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { PopoverContactComponent } from '../popover-contact/popover-contact.component';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Storage } from '@ionic/storage';
import { CheckService } from 'src/app/services/check.service';

@Component({
  selector: 'cashin-releve',
  templateUrl: './cashin-releve.component.html',
  styleUrls: ['./cashin-releve.component.scss'],
})
export class CashinReleveComponent implements OnInit {
  @Input() cashindata;
  public rechargeForm: FormGroup;
  montantrelve: any;
  contactName = '';
  codepin: any;
  showName: boolean;
  displayName: string;
  phones: any[];
  israpido = false;
  recentsContacts: any[];
  label: string;
  constructor(public formbuilder: FormBuilder,
              public serv: ServiceService,
              public glb: GlobalVariableService,
              public millier: MillierPipe,
              public contact: Contacts,
              public modal: ModalController,
              public popover: PopoverController,
              public storage: Storage,
              private check: CheckService,
              public monmillier: MillierPipe) {
    this.rechargeForm = this.formbuilder.group({
      telephone: ['', [Validators.required, CustomValidatorPhone]],
      montantrlv: ['', Validators.required],
      montant: ['', Validators.required],
      oper: [''],
      frais: [''],
      sousop: ['']

    });
  }

  ngOnInit() {
    if (this.cashindata.codeOper === '0057' && this.cashindata.sousOper === '0002') {
      this.rechargeForm.removeControl('telephone');
      this.rechargeForm.addControl('telephone', new FormControl('', Validators.required));
      this.israpido = true;
      this.label = ' N° Badge';
    } else {
      this.israpido = false;
      this.label = ' N° Tel';
    }
    this.getrecent();

  }
  releveFrais() {
    this.montantrelve = 0;
    const data: any = {};
    data.recharge = {};
    data.recharge.montant = this.rechargeForm.controls.montantrlv.value;
    data.recharge.sousop = this.cashindata.sousOper;
    data.recharge.oper = this.cashindata.codeOper;
    data.idTerm = this.glb.IDTERM;
    data.session = this.glb.IDSESS;
    this.serv.afficheloading();
    const file = data.recharge.oper === '0074' ? 'initcashoutUpay.php' : 'relevecashinwizall.php';

    this.serv.posts('recharge/' + file, data, {}).then(reponse => {
      this.serv.dismissloadin();
      const rep: any = JSON.parse(reponse.data);
      if (rep.returnCode) {
              if (rep.returnCode === '0') {
        this.montantrelve = data.recharge.montant;
        const mntttc: any = rep.mntTarif * 1 + data.recharge.montant * 1;
        this.rechargeForm.controls.montant.setValue(this.millier.transform(mntttc));
        this.rechargeForm.controls.frais.setValue(this.millier.transform(rep.mntTarif));
        if (this.cashindata.codeOper === '0074') {
          this.rechargeForm.removeControl('telephone');
          this.rechargeForm.addControl('telephone', new FormControl('', Validators.required));
          this.storage.get('login').then((val) => {
            if (val != null) {
              this.rechargeForm.controls.telephone.setValue(val);
            } else {
              this.serv.showError('Impossible de recuperer votre numéro telephone');
            }

          });

        }

      } else { this.serv.showError('Opération échouée'); }
      } else {
        this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');

      }

    }).catch(err => {
        this.serv.dismissloadin();
        this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
      }
    );
  }

  getContactName() {
    this.contactName = '';
    if (this.cashindata.codeOper === '0057' && this.cashindata.sousOper ===  '0002') {
    this.showPin();
    } else {
      const options = new ContactFindOptions();
      options.desiredFields = ['displayName'];
      options.hasPhoneNumber = true;
      options.filter = this.rechargeForm.controls.telephone.value;

      this.contact.find(['phoneNumbers'], options).then(
          (data) => {
            if (data.length > 0) {
              this.contactName = data[0].displayName;
            }
            this.showPin();
          }
      );
    }

  }
  resetMontant() {
    this.montantrelve = 0;
    this.rechargeForm.controls.montant.setValue(0);
  }
  async showPin() {
    const params = this.rechargeForm.getRawValue();
    params.nameContact = this.contactName;
    params.type        =  this.cashindata.codeOper !== '0074' ? 'recharge' : 'retrait';
    const montantPlafond = this.glb.HEADER.montant.replace(/ /g, '') * 1;
    const montantArecharger = params.montant.replace(/ /g, '') * 1;
    if (montantPlafond < montantArecharger) {
      this.check.showMoga();
    } else {
      const modal = await this.modal.create({
      component: PinValidationPage,
      componentProps: {
        data: params
      },
      backdropDismiss: true
    });
      modal.onDidDismiss().then((codepin) => {
      if (codepin !== null && codepin.data) {
        this.codepin = codepin.data;
        this.recharger();
      }
    });

      return await modal.present();
    }
  }
  recharger() {
    this.rechargeForm.controls.sousop.setValue(this.cashindata.sousOper);
    const parametres: any = {};
    parametres.recharge = this.rechargeForm.getRawValue();
    parametres.recharge.oper = this.cashindata.codeOper;
    parametres.recharge.montant = this.montantrelve;
    parametres.recharge.pin = this.codepin;
    if (parametres.recharge.frais) {
      parametres.recharge.frais = parametres.recharge.frais.replace(/ /g, '');
    }
    parametres.idTerm = this.glb.IDTERM;
    parametres.session = this.glb.IDSESS;
    this.serv.afficheloading();
    let file;
    if (parametres.recharge.oper === '0073') {
      file = 'upayW2W';
    } else {
      if (parametres.recharge.oper === '0074') {
        file = 'cashoutUpay';
      } else { file = 'recharge'; }
    }
    if (parametres.recharge.oper === '0073') {
      parametres.recharge.telephone = '221' + parametres.recharge.telephone;
    }
   // alert(JSON.stringify(parametres));
    this.serv.posts('recharge/' + file + '.php', parametres, {}).then(data => {
      this.serv.dismissloadin();
      const reponse = JSON.parse(data.data);
      if (reponse.returnCode) {
        if (reponse.returnCode === '0') {
          const mnt =  this.montantrelve;
          this.montantrelve = 0;
          this.showName = false;
          this.glb.HEADER.montant = this.monmillier.transform(reponse.mntPlfap);
          this.glb.dateUpdate = this.serv.getCurrentDate();

          const clientData = {codeOper: this.cashindata.codeOper,
                            sousOper: this.cashindata.sousOper,
                            reference: parametres.recharge.telephone,
                            nomclient: this.contactName,
                            montant: mnt};
          if (parametres.recharge.oper !== '0074') {
          this.serv.insert(clientData);
          }
          const operateur = {codeOper: this.cashindata.codeOper,
                            sousOper: this.cashindata.sousOper,
                            chemin: this.cashindata.chemin,
                            image: this.cashindata.image,
                            };
          if (parametres.recharge.oper !== '0074') {
          this.serv.insertFavoris(operateur);
          }
          if (parametres.recharge.oper === '0074') {
            parametres.recharge.codeTransfert = reponse.codeTransfert;
            }
          parametres.recharge.montant     =  this.rechargeForm.getRawValue().montant;
          parametres.recharge.montant     = this.monmillier.transform(parametres.recharge.montant);
          parametres.recharge.nameContact = this.contactName;
          parametres.recharge.operation = this.cashindata.operation;
          if (this.cashindata.codeOper === '0057' && this.cashindata.sousOper ===  '0002') {
            parametres.recharge.label = 'N° Badge';
          } else {
            parametres.recharge.label = 'N° Tel';
          }
          this.serv.notifier(parametres.recharge);
          const mod = this.modal.create({
            component: ConfirmationComponent,
            componentProps: {
              data: parametres.recharge,
            }
          }).then((e) => {
            e.present();
            e.onDidDismiss().then(() => {
              this.getrecent();
            });

          });

          this.rechargeForm.reset();
        } else { this.serv.showError('Opération échouée'); }
      } else {
        this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');

      }

    }).catch(err => {
      this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard ' + JSON.stringify(err));
    });

  }
  selectRecent(recent) {
    this.rechargeForm.controls.montantrlv.setValue(recent.montant);
    this.releveFrais();
  }
  getrecent() {
    this.recentsContacts = [];
    this.serv.getDataBase()
    .then((db: SQLiteObject) => {
      const sql = 'select * from recents where codeoperateur=? and sousoperateur =? and numcompte=? order by datemisajour desc limit 5';
      const values = [this.cashindata.codeOper, this.cashindata.sousOper, this.glb.NUMCOMPTE];
      db.executeSql(sql, values)
        .then((data) => {
          for (let i = 0; i < data.rows.length; i++) {
            this.recentsContacts.push((data.rows.item(i)));
          }
          })
        .catch(e => {});
    })
    .catch(e => {});

  }


  listecontacts() {
    this.showName = false;
    this.rechargeForm.controls.telephone.setValue('');
    // this.contact.find()
    this.contact.pickContact().then(numbers => {
      this.displayName  = numbers.displayName;
     // alert(JSON.stringify(numbers));
      const nombre = numbers.phoneNumbers.length;
      // le contact a plusieurs numero
      if (nombre > 1) {

        this.phones = [];
        for (const telephone of numbers.phoneNumbers) {
          this.phones.push(telephone.value);
        }
        this.showContacsNumbers();
      } else {
        const value = this.getphone(numbers.phoneNumbers[0].value);
        this.setTelephoneFromselection(value);
      }
    }).catch(err => {
    });
  }
  async  showContacsNumbers() {
    const popover = await this.popover.create({
      component: PopoverContactComponent,
      componentProps: {phones: this.phones},
      translucent: true
    });
    popover.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        const value = this.getphone(dataReturned.data);
        this.setTelephoneFromselection(value);
      }
    });
    return await popover.present();
  }

  setTelephoneFromselection(value) {
    this.showName = false;
    if (value === '') {
      this.serv.showToast('Numéro de téléphone incorrect!');
    } else {
      this.showName = true;
      this.rechargeForm.controls.telephone.setValue(value);
    }
  }
  getphone(selectedPhone) {
    let tel = selectedPhone.replace(/ /g, '');
    if (isNaN(tel * 1)) {
      return '';
    }
    tel = tel * 1 + '';
    if (tel.substring(0, 3) === '221') {
      tel = tel.substring(3, tel.length);
    }
    const  numeroautorisé = ['77', '78', '70', '76'];
    const retour = numeroautorisé.indexOf(tel.substring(0, 2));
    if (retour === -1) {
      return '';
    }
    tel =  tel.replace(/ /g, '');
    tel = tel.replace(/-/g, '');
    let  phone = tel.length >= 2 ? tel.substring(0, 2) + '-' : '';
    phone += tel.length > 5 ? tel.substring(2, 5) + '-' : '';
    phone += tel.length > 7 ? tel.substring(5, 7) + '-' : '';
    phone += tel.length >= 8 ? tel.substring(7, 9) : '';
    if (phone.length !== 12) {
      return '';
    }
    return phone;
  }
}
