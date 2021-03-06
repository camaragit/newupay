import { Injectable } from '@angular/core';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';
import { InstallMode } from '@ionic-native/code-push/ngx';

@Injectable({
  providedIn: 'root'
})
export class GlobalVariableService {
  public showPin = false;
  public IMG_URL = 'assets/images/';
 // public BASEURL = 'http://196.207.207.63:8080/upayMobile/';
  public  URLPROD = 'https://mobile.upay.africa:8080/upayMobile/';
  public URLTEST =  'http://196.207.245.99:8282/upayMobile/';
  // public URLTEST =  'http://172.30.4.216/getiwebservice/atpswebservice/upayMobile/';
  public URLBANQUE = 'http://192.168.4.63/api/banque/';
  public BASEURL =  '';
  public IDPART = '';
  public IDSESS = '';
  public IDTERM = '';
  public PIN = '';
  public ISCONNECTED = true;
  public HEADER: any = { agence: '', montant: '0', numcompte: '', consomme: '' };
  public HEADERTITELE = { title: '', src: '' };
  public recu: any;
  public notfound = false;
  public message = '';
  public dateUpdate = '';
  public minenlevement: any = 200000;
  public listeImprimantes: any;
  public statusImpriamte = false;
  public showRecu = false;
  public ShowPin = true;
  public ShowSolde = false;
  public modeTransactionnel = false;
  public liaisonreussie = false;
  public DATEPAUSE;
  public DATEREPRISE;
  public READCODEOTP = '';
  public PRENOM = 'Dame';
  public NOM = 'Camara';
  PASSWORD = 'B2CUP@y@frica#5!2030';
  LITEDB: SQLiteObject;
  public NUMPIECE = '123456789';
  public active1 = false;
  public active2 = false;
  public active3 = false;
  public active4 = false;
  public ATPS_TIGO_IDMERCHAND = 1213;
  public ATPS_OM_IDMERCHAND = 348747;
  public ATPS_EM_IDMERCHAND = 100044;
  PHONE: any = '775067661';
  USERID: any = '';
  nombreNotif = 0;
  SYNCOPTIONS: any = {updateDialog:
                                          // tslint:disable-next-line: max-line-length
                                          {mandatoryUpdateMessage: ' Une mise à jour est disponible. l\'installation requiert de redemarrer l\'application',
                                          // tslint:disable-next-line: max-line-length
                                          optionalUpdateMessage: ' Une mise à jour est disponible. l\'installation requiert de redemarrer l\'application',
                                          updateTitle: 'UPAY AFRICA',
                                          optionalInstallButtonLabel: 'Installer',
                                          mandatoryContinueButtonLabel: 'Installer',
                                          appendReleaseDescription: false,
                                          optionalIgnoreButtonLabel: 'Ignorer',
                                          descriptionPrefix: '\nNouveautés:\n',
                                          },
                              installMode: InstallMode.IMMEDIATE};
  ONESIGNALHEADER: any = { Authorization: 'Basic ZTc5M2U1MzUtNGVlZC00NjdjLTgwNjUtZjE1ZjkyYWJmZjY4'};
  onesignalAppIdProd = '04ec581b-a5f2-4e40-ac76-8c7c02fda21c';
  onesignalAppIdTest = '04ec581b-a5f2-4e40-ac76-8c7c02fda21c';
  firebaseID = '350026042244';
  NUMCOMPTE: any = '';
  isUSSDTriggered = false;
  showContactName = false;
  RESTURL = 'https://api.upay.africa:8080/api/';
  // URLUPLOAD = 'https://api.upay.africa:8080/api/admin/upload';
  // URLUPLOAD = 'http://192.168.4.63/api/admin/upload';
  notifications: any;
  URLONESIGNALAPI = 'https://onesignal.com/api/v1/notifications';
  isLoadingShowing = false;
  isErrorShowing = false;
  showheader = true;
  minMontantMoga: number;
  database: SQLiteObject;
  enecoute = false;
  qrcmode = false;
  acceptedcgu = false;
  prodpackageName = 'atps.africa.upaymobile';
  // tslint:disable-next-line: max-line-length
  public OperatorsImages = [{ codeoper: '0054', image: this.IMG_URL + 'emoney.png', sousop: '' }, { codeoper: '0025', image: this.IMG_URL + 'omoney.png', sousop: '' },
  // tslint:disable-next-line: max-line-length
  { codeoper: '0053', image: this.IMG_URL + 'postecash.png', sousop: '0001' }, { codeoper: '0022', image: this.IMG_URL + 'logo_Tigo Cash.png', sousop: '' },
  // tslint:disable-next-line: max-line-length
  { codeoper: '0057', image: this.IMG_URL + 'wizall.png', sousop: '' }, { codeoper: '0016', image: this.IMG_URL + 'sde2.png', sousop: '' }, { codeoper: '0034', image: this.IMG_URL + 'logo_Expresso.png', sousop: '' },
  // tslint:disable-next-line: max-line-length
  { codeoper: '0027', image: this.IMG_URL + 'senelec.png', sousop: '' }, { codeoper: '0029', image: this.IMG_URL + 'woyofal.png', sousop: '' }, { codeoper: '0020', image: this.IMG_URL + 'logo_Tigo.png', sousop: '' },
  // tslint:disable-next-line: max-line-length
  { codeoper: '0005', image: this.IMG_URL + 'logo_Orange.png', sousop: '' }, { codeoper: '0057', image: this.IMG_URL + 'logo_rapido.png', sousop: '0002' }, { codeoper: '0052', image: this.IMG_URL + 'proxicash.png', sousop: '' },
  ];
  public MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
    'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  constructor() { }
}
