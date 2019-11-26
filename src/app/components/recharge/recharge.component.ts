import { Component, OnInit, Input, ViewChildren, ViewChild, ContentChild, ElementRef, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidatorPhone } from '../customValidator/custom-validator';
import { MillierPipe } from 'src/app/pipes/millier.pipe';
import { ModalController, PopoverController, IonContent } from '@ionic/angular';
import { PinValidationPage } from 'src/app/pages/utilisateur/pin-validation/pin-validation.page';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { ServiceService } from 'src/app/services/service.service';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { PopoverContactComponent } from '../popover-contact/popover-contact.component';
import { Contacts, ContactFindOptions } from '@ionic-native/contacts/ngx';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';
import { CheckService } from 'src/app/services/check.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';

@Component({
  selector: 'app-recharge',
  templateUrl: './recharge.component.html',
  styleUrls: ['./recharge.component.scss'],
})
export class RechargeComponent implements OnInit {
  public Rechargedata: FormGroup;
  public phones;
  public contactName = '';
  @Input() datarecharge: any = {};
  showName: boolean;
  displayName: string;
  recentsContacts: any;
  constructor(public formBuilder: FormBuilder,
              public millier: MillierPipe,
              public modal: ModalController,
              public serv: ServiceService,
              public glb: GlobalVariableService,
              private check: CheckService,
              private clipboard: Clipboard,
    // tslint:disable-next-line: deprecation
              public contact: Contacts,
              public monmillier: MillierPipe,
              public popover: PopoverController) {
    this.Rechargedata = this.formBuilder.group({
      telephone: ['', [Validators.required, CustomValidatorPhone]],
      montant: ['', Validators.required],
      pin: [''],
    });
  }

  ngOnInit() {
    this.glb.showContactName = false;
    this.getrecent();
  }

  getContactName() {
    this.contactName = '';
    const options = new ContactFindOptions();

    options.desiredFields = ['displayName'];
    options.hasPhoneNumber = true;
    options.filter = this.Rechargedata.controls.telephone.value;
    // options.multiple = true;

    this.contact.find(['phoneNumbers'], options).then(
      (data) => {

        if (data.length > 0) {
          this.contactName = data[0].displayName;
        }
        this.showPin();
      }
    );
  }
  selectRecent(recent: any) {
    this.Rechargedata.controls.telephone.setValue(recent.reference);
    const mnt = this.millier.transform(recent.montant);
    this.Rechargedata.controls.montant.setValue(mnt);
  }
  eraseAmount() {
    this.Rechargedata.controls.montant.setValue('');
  }
  getrecent() {
    this.recentsContacts = [];
    const sql = 'select * from recents where codeoperateur=? and sousoperateur =? and numcompte=? order by datemisajour desc limit 5';
    const values = [this.datarecharge.codeOperateur, this.datarecharge.sousoperateur, this.glb.NUMCOMPTE];
    this.glb.LITEDB.executeSql(sql, values)
          .then((data) => {
            for (let i = 0; i < data.rows.length; i++) {
              this.recentsContacts.push((data.rows.item(i)));
            }
          })
          .catch(e => { });
  }
  changemontant() {

    if (this.Rechargedata.controls.montant.value) {
      this.Rechargedata.controls.montant.setValue(this.Rechargedata.controls.montant.value.replace(/ /g, ''));
      this.Rechargedata.controls.montant.setValue(this.Rechargedata.controls.montant.value.replace(/-/g, ''));
      this.Rechargedata.controls.montant.setValue(this.millier.transform(this.Rechargedata.controls.montant.value));

    }
  }
  focusmontant() {
    if (this.Rechargedata.controls.montant.value) {
      this.Rechargedata.controls.montant.setValue(this.Rechargedata.controls.montant.value.replace(/ /g, ''));

    }
  }
  /* recharger() {
   const mod = this.modal.create({
      component: PinValidationPage,
      // enterAnimation: myEnterAnimation,
      // leaveAnimation: myLeaveAnimation
    }).then((modal) => {
      modal.present();
    });

  } */
  pasteText(){
    this.clipboard.paste().then(
      (resolve: string) => {
         this.Rechargedata.controls.telephone.setValue(resolve);
         console.log(resolve);
       },
       (reject: string) => {
         console.error('Error: ' + reject);
       }
     );
  }
  async showPin() {
    const params = this.Rechargedata.getRawValue();
    const montantPlafond = this.glb.HEADER.montant.replace(/ /g, '') * 1;
    const montantArecharger = params.montant.replace(/ /g, '') * 1;
    if (montantPlafond < montantArecharger) {
      this.check.showMoga();
    } else {
      params.nameContact = this.contactName;
      params.type = 'recharge';
      // alert(JSON.stringify(params))

      const modal = await this.modal.create({
        component: PinValidationPage,
        componentProps: {
          data: params
        },
        backdropDismiss: true
      });

      modal.onDidDismiss().then((codepin) => {

        if (codepin !== null && codepin.data) {
          this.Rechargedata.controls.pin.setValue(codepin.data);
          this.rechargerServ();
        }
      });

      return await modal.present();
    }

  }
  async rechargerServ() {
    const parametres: any = {};
    parametres.recharge = this.Rechargedata.getRawValue();
    parametres.recharge.oper = this.datarecharge.codeOperateur;
    parametres.recharge.montant = parametres.recharge.montant.replace(/ /g, '');
    parametres.recharge.telephone = parametres.recharge.telephone.replace(/-/g, '');
    parametres.recharge.telephone = parametres.recharge.telephone.replace(/ /g, '');
    if (parametres.recharge.frais) {
      parametres.recharge.frais = parametres.recharge.frais.replace(/ /g, '');
    }
    parametres.idTerm = this.glb.IDTERM;
    parametres.session = this.glb.IDSESS;



    this.serv.afficheloading();

    const phone = parametres.recharge.telephone;
    let file: string;
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
    console.log(JSON.stringify(parametres));
    this.serv.posts('recharge/' + file + '.php', parametres, {}).then(data => {
      this.serv.dismissloadin();
      const reponse = JSON.parse(data.data);
      // alert(JSON.stringify(reponse));
      if (reponse.returnCode) {
        if (reponse.returnCode === '0') {
          // this.getContactName(parametres.recharge.telephone);
          this.Rechargedata.reset();
          // this.showName = false;
          this.glb.showContactName = false;
          this.glb.recu = reponse;
          if (typeof (reponse.telRech) === 'object') {
            this.glb.recu.telRech = parametres.recharge.telephone;
          }
          this.glb.recu.guichet = this.glb.IDTERM.substring(5, 6);
          this.glb.recu.agence = this.glb.HEADER.agence;
          if (parametres.recharge.oper === '0074') {
            this.glb.recu.telRech = reponse.codeTransfert;
          }

          this.glb.showRecu = true;
          this.glb.HEADER.montant = this.monmillier.transform(reponse.mntPlfap);
          this.glb.dateUpdate = this.serv.getCurrentDate();
          const clientData = {
            codeOper: this.datarecharge.codeOperateur,
            sousOper: this.datarecharge.sousoperateur,
            reference: phone,
            nomclient: this.contactName,
            montant: parametres.recharge.montant
          };
          this.serv.insert(clientData);
          const operateur = {
            codeOper: this.datarecharge.codeOperateur,
            sousOper: this.datarecharge.sousoperateur,
            chemin: this.datarecharge.chemin,
            image: this.datarecharge.image,
          };
          this.serv.insertFavoris(operateur);
          parametres.recharge.montant = this.monmillier.transform(parametres.recharge.montant);
          parametres.recharge.nameContact = this.contactName;
          parametres.recharge.operation = this.datarecharge.operation;
          parametres.recharge.label = 'N° Tel';
          if (parametres.recharge.oper === '0073') {
            parametres.recharge.operation = 'Transfert UPAY';
            this.serv.notifierben(parametres.recharge);
          }
          if (parametres.recharge.oper === '0074') {
            parametres.recharge.operation = 'Retrait UPAY';
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
          this.getrecent();
        } else { this.serv.showError('Opération échouée'); }
      } else {
        this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
      }
    }).catch(err => {
      this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
    });
  }

  listecontacts() {
    // this.showName = false;
    this.glb.showContactName = false;
    this.Rechargedata.controls.telephone.setValue('');
    // this.contact.find()
    this.contact.pickContact().then(numbers => {
      this.displayName = numbers.displayName;
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
        const value = this.serv.getphone(numbers.phoneNumbers[0].value);
        this.serv.setTelephoneFromselection(value, this.Rechargedata.controls.telephone);
      }
    }).catch(err => {
    });
  }
  async  showContacsNumbers() {
    const popover = await this.popover.create({
      component: PopoverContactComponent,
      componentProps: { phones: this.phones },
      translucent: true
    });
    popover.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        const value = this.serv.getphone(dataReturned.data);
        this.serv.setTelephoneFromselection(value, this.Rechargedata.controls.telephone);
      }
    });
    return await popover.present();
  }
}
