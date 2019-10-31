import { Component, OnInit } from '@angular/core';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { ServiceService } from 'src/app/services/service.service';
import { MillierPipe } from 'src/app/pipes/millier.pipe';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ModalController, PopoverController } from '@ionic/angular';
import { PinValidationPage } from '../../utilisateur/pin-validation/pin-validation.page';
import { ConfirmationComponent } from 'src/app/components/confirmation/confirmation.component';
import { FormatcodePipe } from 'src/app/pipes/formatcode.pipe';
import { Contacts, ContactFindOptions } from '@ionic-native/contacts/ngx';
import { PopoverContactComponent } from 'src/app/components/popover-contact/popover-contact.component';


@Component({
  selector: 'app-code-transfert',
  templateUrl: './code-transfert.page.html',
  styleUrls: ['./code-transfert.page.scss'],
})
export class CodeTransfertPage implements OnInit {
  public showdetails = false;
  public cashoutForm: FormGroup;
  private refid: any;
  private ordernum: any;
  private codepin = '';
  public headerTitle = 'Réception de Transfert';
  paiementServices: { image: string; libelle: string; chemin: string; }[];
  contactName: any;
  showName: boolean;
  displayName: string;
  phones: any[];

  constructor(private serv: ServiceService,
    public glb: GlobalVariableService,
    private millier: MillierPipe,
    private modal: ModalController,
    public contact: Contacts,
    public popover: PopoverController,
    private formatcode: FormatcodePipe,
    private formbuilder: FormBuilder) {
    this.cashoutForm = formbuilder.group({
      codTrans: ['', Validators.required],
      prenomExp: ['', Validators.required],
      nomExp: ['', Validators.required],
      telExp: ['', Validators.required],
      adrsExp: ['', Validators.required],
      prenomBen: [''],
      nomBen: [''],
      numBen: [''],
      numExp: [''],
      telBen: [''],
      adrsBen: [''],
      typIdBen: ['1', Validators.required],
      idBen: ['', Validators.required],
      mntPaie: ['', Validators.required],
      service: ['0052'],
      destination: ['0000']

    });
  }

  ngOnInit() {
    this.init();
  }
  changementdestination() {
    if (this.cashoutForm.controls.destination.value === '0025') {
      this.cashoutForm.controls.telBen.setValue(this.glb.PHONE);
    }

  }
  listecontacts() {
    // this.showName = false;
    this.glb.showContactName = false;

    this.cashoutForm.controls.telBen.setValue('');
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
        this.serv.setTelephoneFromselection(value, this.cashoutForm.controls.telBen);
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
        this.serv.setTelephoneFromselection(value, this.cashoutForm.controls.telBen);
      }
    });
    return await popover.present();
  }
  init() {
    this.cashoutForm.controls.nomBen.setValue(this.glb.NOM);
    this.cashoutForm.controls.prenomBen.setValue(this.glb.PRENOM);
    this.cashoutForm.controls.telBen.setValue(this.glb.PHONE);
    this.cashoutForm.controls.idBen.setValue(this.glb.NUMPIECE);
    this.cashoutForm.controls.typIdBen.setValue('1');
    this.cashoutForm.controls.adrsBen.setValue('Dakar');
  }
  relever() {

    this.showdetails = false;
    const parametre: any = {};
    parametre.oper = this.cashoutForm.controls.service.value;
    parametre.codetransfert = this.cashoutForm.controls.codTrans.value;
    parametre.idTerm = this.glb.IDTERM;
    parametre.session = this.glb.IDSESS;
    this.serv.afficheloading();
    this.serv.posts('transfert/releveRecepCash.php', parametre, {}).then(data => {
      this.serv.dismissloadin();

      const reponse = JSON.parse(data.data);
      if (reponse.returnCode === '0') {
        this.showdetails = true;
        this.cashoutForm.controls.prenomExp.setValue(reponse.prenomExp);
        this.cashoutForm.controls.nomExp.setValue(reponse.nomExp);
        this.cashoutForm.controls.telExp.setValue(reponse.telExp);
        this.cashoutForm.controls.adrsExp.setValue(reponse.adrsExp);
        this.init();
        if (typeof (reponse.adrsBen) !== 'object') {
          this.cashoutForm.controls.adrsBen.setValue(reponse.adrsBen);
        }
        if (this.cashoutForm.controls.service.value === '0052') {
          this.cashoutForm.controls.numExp.setValue(reponse.numExp);
          this.cashoutForm.controls.numBen.setValue(reponse.numBen);
        }

        this.cashoutForm.controls.mntPaie.setValue(this.millier.transform(reponse.mntPaie));
        if (typeof (reponse.codTrans) === 'object') {
          this.cashoutForm.controls.codTrans.setValue(parametre.codetransfert);

        }

        if (this.cashoutForm.controls.service.value === '0044') {
          this.refid = reponse.RefId;
          this.ordernum = reponse.OrderNum;
        }
      } else { this.serv.showError('Opération échouée'); }
    }).catch(err => {
      this.serv.dismissloadin();
      this.serv.showError('Impossible d\'atteindre le serveur ');
    }
    );

    // this.reset();
    // this.showdetails = !this.showdetails

  }
  async showPin() {
    this.codepin = '';
    const params = this.cashoutForm.getRawValue();
    // params.nameContact = this.contactName;
    params.type = 'reception';
    params.operateur = this.getOperateurName(this.cashoutForm.controls.service.value);
    params.nomexp = this.cashoutForm.controls.prenomExp.value + ' ' + this.cashoutForm.controls.nomExp.value;
    params.telephone = this.cashoutForm.controls.telExp.value;
    params.montant = this.cashoutForm.controls.mntPaie.value;
    params.destination = this.getOperateurName(this.cashoutForm.controls.destination.value);
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
        this.validerReception();

      }
    });

    return await modal.present();
  }
  getOperateurName(codeoper: any) {
    switch (codeoper) {
      case '0052':
        return 'Proxicash';
      case '0044':
        return 'RIA';
      case '0000':
        return 'UPay';
      case '0025':
        return 'Orange Money';
      case '0022':
        return 'Tigo Cash';
      case '0054':
        return 'E-Money';
    }
  }
  validerReception() {
    const parametre: any = {};
    parametre.datarecep = this.cashoutForm.getRawValue();
    parametre.operation = 'Reception';
    parametre.operateur = this.cashoutForm.controls.service.value;
    parametre.recharge = {};
    parametre.recharge.montant = parametre.datarecep.mntPaie.replace(/ /g, '');
    parametre.session = this.glb.IDSESS;
    parametre.idTerm = this.glb.IDTERM;
    parametre.datarecep.pin = this.codepin;
    parametre.oper = this.cashoutForm.controls.service.value;
    if (this.cashoutForm.controls.service.value === '0044') {
      parametre.datarecep.RefId = this.refid;
      parametre.datarecep.OrderNum = this.ordernum;
    }
    this.serv.afficheloading();
    this.serv.posts('transfert/ReceptionCash.php', parametre, {}).then(data => {

      const reponse = JSON.parse(data.data);
      if (reponse.returnCode === '0') {
        if (this.cashoutForm.controls.destination.value === '0000') {
          this.serv.dismissloadin();
          this.glb.HEADER.montant = this.millier.transform(reponse.mntPlfap);
          this.glb.dateUpdate = this.serv.getCurrentDate();
          parametre.recharge.codeTransfert = this.formatcode.transform(reponse.codTrans, 3, ' ');
          parametre.recharge.operation = 'Reception code de transfert';
          this.serv.notifier(parametre.recharge);
          const mod = this.modal.create({
            component: ConfirmationComponent,
            componentProps: {
              data: parametre.recharge,
            }
          }).then((e) => {
            e.present();
            e.onDidDismiss().then(() => {
            });
          });
          this.cashoutForm.reset();
          this.cashoutForm.controls.service.setValue('0052');
          this.showdetails = false;
        } else {
          this.cashinWallet(this.cashoutForm.controls.destination.value);
        }



      } else { this.serv.showError('Opération échouée'); }

    }).catch(err => {
      this.serv.dismissloadin();
      this.serv.showError('Impossible d\'atteindre le serveur');
    });
  }
  cashinWallet(codeOper) {
    const parametres: any = {};
    parametres.recharge = this.cashoutForm.getRawValue();
    parametres.session = this.glb.IDSESS;
    parametres.idTerm = this.glb.IDTERM;
    parametres.recharge.oper = codeOper;
    parametres.recharge.pin = this.codepin;
    parametres.recharge.montant = parametres.recharge.mntPaie.replace(/ /g, '');
    parametres.recharge.telephone = parametres.recharge.telBen.replace(/-/g, '');
    parametres.recharge.telephone = parametres.recharge.telBen.replace(/ /g, '');
    this.serv.posts('recharge/recharge.php', parametres, {}).then(data => {
      this.serv.dismissloadin();
      const reponse = JSON.parse(data.data);
      if (reponse.returnCode) {
        if (reponse.returnCode === '0') {

          this.glb.showRecu = true;
          this.glb.HEADER.montant = this.millier.transform(reponse.mntPlfap);
          this.glb.dateUpdate = this.serv.getCurrentDate();
          parametres.recharge.montant = this.millier.transform(parametres.recharge.montant);
          parametres.recharge.nameContact = this.contactName;
          parametres.recharge.label = 'N° Tel';
          this.contactName = '';
          if (this.glb.PHONE === parametres.recharge.telephone) {
            this.contactName = this.glb.PRENOM + ' ' + this.glb.NOM;
            this.showmodal(parametres.recharge);
          } else {
            const options = new ContactFindOptions();

            options.desiredFields = ['displayName'];
            options.hasPhoneNumber = true;
            options.filter = parametres.recharge.telephone;

            this.contact.find(['phoneNumbers'], options).then(
              // tslint:disable-next-line: no-shadowed-variable
              (data) => {

                if (data.length > 0) {
                  this.contactName = data[0].displayName;
                }
                this.showmodal(parametres.recharge);
              }
            );
          }

          this.serv.notifier(parametres.recharge);
          this.cashoutForm.reset();
          this.cashoutForm.controls.service.setValue('0052');
          this.showdetails = false;
        } else { this.serv.showError('Opération échouée'); }
      } else {
        this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');

      }

    }).catch(err => {
        this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
    });
  }
  showmodal(parametres: any) {
    const mod = this.modal.create({
      component: ConfirmationComponent,
      componentProps: {
        data: parametres,
      }
    }).then((e) => {
      e.present();
      e.onDidDismiss().then(() => {
      });
    });
  }

}
