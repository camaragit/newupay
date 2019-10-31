import { Injectable } from '@angular/core';
import { Toast } from '@ionic-native/toast/ngx';
import { LoadingController, AlertController, NavController, Platform, ModalController } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';
import { MillierPipe } from '../pipes/millier.pipe';
import { GlobalVariableService } from './global-variable.service';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { ConfirmationComponent } from '../components/confirmation/confirmation.component';
import { FormControl, AbstractControl } from '@angular/forms';
import { TransfertUniteValeurPage } from '../pages/envoi/transfert-unite-valeur/transfert-unite-valeur.page';
import * as CryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  loading = false;
  database: SQLiteObject;
  constructor(private alertCtrl: AlertController, private http: HTTP, public monmillier: MillierPipe,
              private toast: Toast, public loadingCtrl: LoadingController, private glb: GlobalVariableService,

              private sqlite: SQLite,
              private localNotifications: LocalNotifications,
              private platform: Platform,
              public modal: ModalController,
              public millier: MillierPipe,
              public navCtrl: NavController) {
    this.platform.ready().then(() => {
      this.localNotifications.on('click').subscribe(res => {
        const mod = this.modal.create({
          component: ConfirmationComponent,
          componentProps: {
            data: res.data.recu,
          }
        }).then((e) => {
          e.present();
          e.onDidDismiss().then(() => {
            // this.getrecent();
          });

        });
      });

    });
  }
  encryptmessage(message: any) {
    return CryptoJS.SHA512(message) + '';
  }
  showToast(message) {
    this.toast.showLongCenter(message).subscribe(value => {
      console.log(value);
    });
  }
  createDataBase() {
    this.getDataBase()
      .then((db: SQLiteObject) => {
        this.glb.database = db;
        let sql = 'create table if not exists recents(numcompte TEXT,codeoperateur TEXT, sousoperateur TEXT,';
        sql += 'reference TEXT , nomclient TEXT, datemisajour TEXT, montant TEXT)';
        // sql = 'drop table recents';
        db.executeSql(sql, [])
          .then(() => {
            // sql = 'drop table favoris';
            sql = ' create table if not exists favoris(numcompte TEXT,codeoperateur TEXT, sousoperateur TEXT';
            sql += ',chemin TEXT,image TEXT, nombretrx INTEGER,datemisajour TEXT) ';
            db.executeSql(sql, []).then(() => {
              sql = 'create table if not exists wallet (numcompte TEXT,codeoperateur TEXT,';
              sql += ' image TEXT, chemin TEXT, telephone TEXT, libelle TEXT)';
              db.executeSql(sql, []).then(() => {});
            });
          })
          .catch(e => console.log(e));

      })
      .catch(e => console.log(e));
  }
  insert(clientData: any) {
    this.getDataBase()
      .then((db: SQLiteObject) => {
        let sql = ' select * from recents where codeoperateur=? and sousoperateur =? and reference=? and numcompte=?';
        // const sql = 'INSERT INTO recents VALUES(?,?,?,?)';
        let values = [clientData.codeOper, clientData.sousOper, clientData.reference, this.glb.NUMCOMPTE];
        db.executeSql(sql, values)
          .then((data) => {
            let dateupdate: any = new Date();
            dateupdate = dateupdate.getTime();
            // User existant update datemisajour
            if (data.rows.length > 0) {
              sql = 'update recents set datemisajour =?, nomclient=?, montant=?';
              sql += ' where codeoperateur=? and sousoperateur =? and reference=? and numcompte=?';
              values = [dateupdate, clientData.nomclient,
                clientData.montant, clientData.codeOper,
                clientData.sousOper, clientData.reference,
                this.glb.NUMCOMPTE
              ];

            } else {
              sql = 'INSERT INTO recents VALUES(?,?,?,?,?,?,?)';
              values = [this.glb.NUMCOMPTE, clientData.codeOper, clientData.sousOper,
              clientData.reference, clientData.nomclient,
                dateupdate, clientData.montant];
            }
            db.executeSql(sql, values)
              .then((res) => { })
              .catch(e => console.log(e));
          })
          .catch(e => {
            { }
          });
      })
      .catch(e => console.log(e));
  }

  insertWallet(wallet: any) {
    this.getDataBase()
      .then((db: SQLiteObject) => {
        let sql = ' select * from wallet where codeoperateur=? and numcompte=?';
        let values = [wallet.codeoperateur, this.glb.NUMCOMPTE];
        db.executeSql(sql, values)
          .then((data) => {
            let dateupdate: any = new Date();
            dateupdate = dateupdate.getTime();
            // User existant update datemisajour
            if (data.rows.length > 0) {
              const oper: any = data.rows.item(0);
              const nbtrx = oper.nombretrx * 1 + 1;
              sql = 'update wallet set image =?, telephone =?, chemin=?, libelle=?';
              sql += ' where codeoperateur=? and numcompte=?';
              values = [wallet.image, wallet.telephone, wallet.chemin, wallet.libelle, wallet.codeoperateur, this.glb.NUMCOMPTE];

            } else {
              sql = 'INSERT INTO wallet VALUES(?,?,?,?,?,?)';
              values = [this.glb.NUMCOMPTE, wallet.codeoperateur, wallet.image, wallet.chemin, wallet.telephone, wallet.libelle];
            }
            db.executeSql(sql, values)
              .then((res) => {
                this.showToast('Wallet Ajouté avec succès! ');
                this.navCtrl.navigateBack('compte/listewallet');
              })
              .catch(e => { });
          })
          .catch(e => {
            { }
          });
      })
      .catch(e => console.log(e));

  }
  insertFavoris(operateur: any) {
    this.getDataBase()
      .then((db: SQLiteObject) => {
        let sql = ' select * from favoris where codeoperateur=? and sousoperateur =? and numcompte=?';
        let values = [operateur.codeOper, operateur.sousOper, this.glb.NUMCOMPTE];
        db.executeSql(sql, values)
          .then((data) => {
            let dateupdate: any = new Date();
            dateupdate = dateupdate.getTime();
            // User existant update datemisajour
            if (data.rows.length > 0) {
              const oper: any = data.rows.item(0);
              const nbtrx = oper.nombretrx * 1 + 1;
              sql = 'update favoris set datemisajour =?, nombretrx =?, chemin=?, image=?';
              sql += ' where codeoperateur=? and sousoperateur =? and numcompte=?';
              values = [dateupdate, nbtrx, operateur.chemin, operateur.image, operateur.codeOper, operateur.sousOper, this.glb.NUMCOMPTE];

            } else {
              sql = 'INSERT INTO favoris VALUES(?,?,?,?,?,?,?)';
              values = [this.glb.NUMCOMPTE, operateur.codeOper, operateur.sousOper, operateur.chemin, operateur.image, 1, dateupdate];
            }
            db.executeSql(sql, values)
              .then((res) => { })
              .catch(e => { });
          })
          .catch(e => {
            { }
          });
      })
      .catch(e => console.log(e));

  }
  getrecent() {
    const recents: any = [];
    this.getDataBase()
      .then((db: SQLiteObject) => {
        const sql = 'select * from recents where codeoperateur=? and sousoperateur =? and numcompte=?';
        const values = ['0005', '0005', '221775067661'];
        db.executeSql(sql, values)
          .then((data) => {
            for (let i = 0; i < data.rows.length; i++) {
              recents.push((data.rows.item(i)));
            }
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));

    return recents;
  }
  getdata() {
    this.getDataBase()
      .then((db: SQLiteObject) => {
        const sql = 'select * from recents';
        const values = [];
        db.executeSql(sql, values)
          .then((data) => {
            for (let i = 0; i < data.rows.length; i++) {
             // alert('data ' + JSON.stringify(data.rows.item(i)));
            }
          })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));

  }
  deletealldata() {
    this.getDataBase()
      .then((db: SQLiteObject) => {
        // const sql = 'delete from recents where reference =\'108000008611\' ';
        // const sql = 'update recents set sousoperateur=\'0002\' ';
        const sql = 'drop table wallet ';
        const values = [];
        db.executeSql(sql, values)
          .then(() => { })
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
  }
  getDataBase() {
    return this.sqlite.create({
      name: 'recents.db',
      location: 'default'
    });
  }
  CheckIfSequence(valeur: any) {
    if (valeur !== null) {
      valeur = valeur.toString();
      const tabNombres = valeur.split('');
      const conditionA: boolean = (tabNombres[0] === tabNombres[1] && tabNombres[1] === tabNombres[2] && tabNombres[2] === tabNombres[3]);
      // tslint:disable-next-line: max-line-length
      const conditionB: boolean = (tabNombres[0] * 1 + 1 === tabNombres[1] * 1 && tabNombres[1] * 1 + 1 === tabNombres[2] * 1 && tabNombres[2] * 1 + 1 === tabNombres[3] * 1);
      if (conditionA || conditionB) {
        return true;
      }
      return false;
    }


  }
  async afficheloading() {
    if (this.glb.ISCONNECTED === true) {
      this.loading = true;
      return await this.loadingCtrl.create({
        message: 'Veuillez patienter ...',
        spinner: 'lines-small',
        cssClass: 'custom-loader-class'
      }).then(a => {
        a.present().then(() => {
          this.glb.isLoadingShowing = true;
          console.log('presented');
          if (!this.loading) {
            a.dismiss().then(() => {
              console.log('abort presenting');
              this.glb.isLoadingShowing = false;
            });
          }
        });
      });
    }
  }
  async afficheloadingWithExit() {
    if (this.glb.ISCONNECTED === true) {
      this.loading = true;
      return await this.loadingCtrl.create({
        message: 'Veuillez patienter ...',
        spinner: 'lines-small',
        cssClass: 'custom-loader-class',
        backdropDismiss: true
      }).then(a => {
        a.present().then(() => {
          this.glb.isLoadingShowing = true;
          console.log('presented');
          if (!this.loading) {
            a.dismiss().then(() => {
              this.glb.isUSSDTriggered = false;
              console.log('abort presenting');
              this.glb.isLoadingShowing = false;
            });
          }
        });
      });
    }

  }
  async dismissloadin() {
    this.loading = false;
    return await this.loadingCtrl.dismiss().then(() => {
      this.glb.isLoadingShowing = false;
      console.log('dismissed');
    });
  }
  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Hellooo',
      duration: 2000,
      cssClass: 'custom-loader-class'
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();

    console.log('Loading dismissed!');
  }
  afficheloading_old() {
    this.loading = true;
    this.loadingCtrl.create({
      message: 'Veuillez patienter ...',
      duration: 5000,
      spinner: 'lines-small',
      cssClass: 'custom-loader-class'
    }).then((res) => {
      res.present();
      if (!this.loading) {
        res.dismiss().then(() => console.log('abort presenting'));
      }
      res.onDidDismiss().then((dis) => {
        console.log('Loading dismissed!');
      });
    });

  }
  dismissloadin_old() {
    this.loading = true;
    this.loadingCtrl.dismiss();
    /*     if (this.loading) {
          this.loading.dismiss();
          this.loading = null;
        } */
  }
  posts(service: string, body: any = {}, headers: any = {}): any {
    body.numerocompte = this.glb.HEADER.agence * 1;
    if (this.glb.ISCONNECTED === false) {
      this.showToast('Veuillez revoir votre connexion internet !');
      return;
    } else {
      const url = this.glb.BASEURL + service;
      this.http.setDataSerializer('json');
      this.http.setSSLCertMode('nocheck');
      this.http.setRequestTimeout(90);
      // alert('Body ' + JSON.stringify(body));
      return this.http.post(url, body, headers);
    }

  }
  showError(text: string = 'Erreur Non reconnue.Veuillez contacter le SUPPORT') {
    this.alertCtrl.create({
      header: 'UPay Africa',
      message: text,
    //  cssClass: 'alertSucces',
      cssClass: 'alertSucces',

      buttons: ['OK']
    }).then(res => {
      console.log('alert show');
      if (this.glb.isLoadingShowing) {
        this.dismissloadin();
      }
      res.present();
      if (text === 'Session expirée. Veuillez vous reconnecter!') {
        this.glb.IDSESS = this.glb.IDTERM = '';
        this.navCtrl.navigateRoot('utilisateur');
      }
    });
  }
  getLabelOperator(codeOper: string, codeSousop: string) {
    let label = 'Téléphone';
    if (codeOper === '0016' || codeOper === '0027') {
      label = 'N° FACT';
    }
    if (codeOper === '0029') {
      label = 'Compteur';
    }
    if (codeOper === '0057' && codeSousop === '2') {
      label = 'N° Badge';
    }
    if (codeOper === '0075') {
      label = 'Code marchant';
    }
    return label;

  }
  showAlert(text: string) {
    this.alertCtrl.create({
      header: 'UPay Africa',
      message: text,
      cssClass: 'alertSucces',
      buttons: ['OK']
    }).then(res => {
      res.present();
      if (text === 'Merci de vous connecter pour acceder à ce service') {
        this.glb.IDSESS = this.glb.IDTERM = '';
        this.navCtrl.navigateRoot('utilisateur');
      }
    });
  }
  getCurrentDate() {
    const date = new Date();
    const jour = date.getDate() >= 10 ? date.getDate() : '0' + date.getDate();
    const mois = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
    const annee = date.getFullYear();
    const heure = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours();
    const minute = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes();
    return jour + '/' + mois + '/' + annee + ' à ' + heure + 'h:' + minute;
  }
  getplafond() {
    const parametre = { idPartn: this.glb.IDPART, idTerm: this.glb.IDTERM, session: this.glb.IDSESS };
    return this.posts('plafond/solde.php', parametre, {});
  }

  recharger(datarecharge) {
    const parametres: any = {};
    parametres.recharge = datarecharge.recharge;
    parametres.recharge.montant = datarecharge.recharge.montant.replace(/ /g, '');
    parametres.recharge.telephone = datarecharge.recharge.telephone.replace(/-/g, '');
    parametres.recharge.telephone = parametres.recharge.telephone.replace(/ /g, '');
    if (parametres.recharge.frais) {
      parametres.recharge.frais = parametres.recharge.frais.replace(/ /g, '');
    }
    parametres.idTerm = this.glb.IDTERM;
    parametres.session = this.glb.IDSESS;
    this.afficheloading();
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
    this.posts('recharge/' + file + '.php', parametres, {}).then(data => {
      this.dismissloadin();
      const reponse = JSON.parse(data.data);
      if (reponse.returnCode) {
        if (reponse.returnCode === '0') {
          this.glb.recu = reponse;
          if (typeof (reponse.telRech) === 'object') {
            this.glb.recu.telRech = datarecharge.recharge.telephone;
          }
          this.glb.recu.guichet = this.glb.IDTERM.substring(5, 6);
          this.glb.recu.agence = this.glb.HEADER.agence;
          if (parametres.recharge.oper === '0074') {
            this.glb.recu.telRech = reponse.codeTransfert;
          }
          this.glb.showRecu = true;
          this.glb.HEADER.montant = this.monmillier.transform(reponse.mntPlfap);
          this.glb.dateUpdate = this.getCurrentDate();
          this.glb.recu.service = datarecharge.operation;
          this.glb.recu.Oper = datarecharge.operateur;

        } else { this.showError('Opération échouée'); }
      } else {
        this.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');

      }

    }).catch(err => {

        this.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');


    });

  }
  verificationnumero(telephone: any) {
    telephone = telephone.replace(/-/g, '');
    telephone = telephone.replace(/ /g, '');
    console.log('telephone ' + telephone);
    const numeroautorisé = ['77', '78', '70', '76'];
    const retour = numeroautorisé.indexOf(telephone.substring(0, 2));
    return retour === -1;
  }
  notifier(trx) {
    this.localNotifications.schedule({
      id: 1,
      text: 'Transaction effecutée avec succés, cliquer pour voir les details',
      sound: 'file://sound.mp3',
      data: { recu: trx }
    });
  }

  getPlafond() {
    this.afficheloading();
    this.getplafond().then(data => {
      this.dismissloadin();
      const plafond = JSON.parse(data.data);
      if (plafond.returnCode) {
        if (plafond.returnCode === '0') {
          this.glb.ShowSolde = true;
          this.glb.dateUpdate = this.getCurrentDate();
          this.glb.HEADER.montant = this.millier.transform(plafond.mntPlf);

          this.glb.HEADER.numcompte = plafond.numcompte;
          this.glb.HEADER.consomme = this.millier.transform(plafond.consome);
        } else { this.showError('Opération échouée'); }
      } else {
        this.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');

      }


    }).catch(error => {
      this.dismissloadin();
      this.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');
    });
  }
  getphone(selectedPhone) {
    let tel = selectedPhone.replace(/ /g, '');
    if (isNaN(tel * 1)) {
      console.log('Not a number');
      return '';
    }
    tel = tel * 1 + '';
    if (tel.substring(0, 3) === '221') {
      tel = tel.substring(3, tel.length);
    }
    const numeroautorisé = ['77', '78', '70', '76'];
    const retour = numeroautorisé.indexOf(tel.substring(0, 2));
    if (retour === -1) {
      console.log('Not a in array');

      return '';
    }
    tel = tel.replace(/ /g, '');
    tel = tel.replace(/-/g, '');
    let phone = tel.length >= 2 ? tel.substring(0, 2) + '-' : '';
    phone += tel.length > 5 ? tel.substring(2, 5) + '-' : '';
    phone += tel.length > 7 ? tel.substring(5, 7) + '-' : '';
    phone += tel.length >= 8 ? tel.substring(7, 9) : '';
    if (phone.length !== 12) {
      console.log('Not a 12');

      return '';
    }
    return phone;
  }
  setTelephoneFromselection(value, control: AbstractControl) {
    this.glb.showContactName = false;
    if (value === '') {
      this.showToast('Numéro de téléphone incorrect!');
    } else {
      this.glb.showContactName = true;
      control.setValue(value);
    }
  }
  post(service: string, body: any = {}, headers: any = {}): any {
    if (this.glb.ISCONNECTED === false) {
      this.showToast('Veuillez revoir votre connexion internet !');
      return;
    } else {
      const url = service;
      // console.log(headers);
      // console.log(url);
      // console.log(body);
      body.numerocompte = this.glb.HEADER.agence;
      this.http.setDataSerializer('json');
      this.http.setSSLCertMode('nocheck');
      this.http.setRequestTimeout(90);
      return this.http.post(url, body, headers);
    }
  }

  generateUniqueId() {
    const length = 8;
    const timestamp = + new Date;
    const ts = timestamp.toString();
    const parts = ts.split('').reverse();
    let id = '';
    for (let i = 0; i < length; ++i) {
      const min = 0;
      const max = parts.length - 1;
      const index = Math.floor(Math.random() * (max - min + 1)) + min;
      id += parts[index];
    }
    return id;
  }
  dateDiff(date1, date2) {
    const diff: any = {};                           // Initialisation du retour
    let tmp = date2 - date1;

    tmp = Math.floor(tmp / 1000);             // Nombre de secondes entre les 2 dates
    diff.sec = tmp % 60;                    // Extraction du nombre de secondes

    tmp = Math.floor((tmp - diff.sec) / 60);    // Nombre de minutes (partie entière)
    diff.min = tmp % 60;                    // Extraction du nombre de minutes

    tmp = Math.floor((tmp - diff.min) / 60);    // Nombre d'heures (entières)
    diff.hour = tmp % 24;                   // Extraction du nombre d'heures

    tmp = Math.floor((tmp - diff.hour) / 24);   // Nombre de jours restants
    diff.day = tmp;

    return diff;
  }


}
