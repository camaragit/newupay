import { Component, ViewChild } from '@angular/core';

// tslint:disable-next-line: max-line-length
import { Platform, IonRouterOutlet, NavController, AlertController, ToastController, ModalController, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ServiceService } from './services/service.service';
import { GlobalVariableService } from './services/global-variable.service';
import { Router, NavigationExtras } from '@angular/router';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { CodePush } from '@ionic-native/code-push/ngx';
import { Network } from '@ionic-native/network/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { ReglecguComponent } from './components/reglecgu/reglecgu.component';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'List',
      url: '/list',
      icon: 'list'
    }
  ];
  @ViewChild(IonRouterOutlet) routerOutlet: IonRouterOutlet;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private serv: ServiceService,
    public glb: GlobalVariableService,
    public navCtrl: NavController,
    public router: Router,
    private alertController: AlertController,
    private appVersion: AppVersion,
    private codepush: CodePush,
    private network: Network,
    private modal: ModalController,
    private menu: MenuController,
    private sqlitePorter: SQLitePorter,
    private toastController: ToastController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(0, () => {
      console.log('mode qr ' + this.glb.qrcmode);
      if (!this.glb.qrcmode) {
        if (this.routerOutlet && this.routerOutlet.canGoBack() && !this.glb.isLoadingShowing)  {
          this.routerOutlet.pop();
       } else {
        const routes = ['/utilisateur', '/utilisateur/acceuil'];
        if (routes.includes(this.router.url)) {
          this.presentAlert();
        }
       }
      } else {
        this.glb.qrcmode = false;
      }

      });
      this.appVersion.getPackageName().then((val) => {
        if (val === this.glb.prodpackageName) {
        this.codepush.sync().subscribe(() => {});
        }
      });

      this.platform.pause.subscribe(() => {
        this.glb.DATEPAUSE = new Date();
      });
      this.platform.resume.subscribe(() => {
        this.appVersion.getPackageName().then((val) => {
          if (val === this.glb.prodpackageName) {
          this.codepush.sync().subscribe(() => {});
          }
        });
        this.glb.DATEREPRISE = new Date();
        const diff = this.serv.dateDiff(this.glb.DATEPAUSE, this.glb.DATEREPRISE);
        const route = ['/utilisateur', '/utilisateur/souscription', '/utilisateur/suitesouscription',
                       '/utilisateur/resetpin', '/utilisateur/checkcompte' ];
        if (!route.includes(this.router.url)) {
        if (diff.min >= 5) {
          this.closeModal();
          this.serv.showError('Session expirée. Veuillez vous reconnecter!');
        }
        }
      });
      this.checkNetwork();
      this.appVersion.getPackageName().then((val) => {
        this.glb.BASEURL = val === this.glb.prodpackageName ? this.glb.URLPROD : this.glb.URLTEST;
        this.glb.minMontantMoga = val === this.glb.prodpackageName ? 500 : 10;
      });
      this.statusBar.backgroundColorByHexString('#2c5aa3');
      this.splashScreen.hide();
      this.serv.getDataBase();
      window.addEventListener('keyboardDidHide', () => {
        this.glb.showheader = true;
      });
      window.addEventListener('keyboardDidShow', () => {
        this.glb.showheader = false;
      });
/*       document.addEventListener('backbutton', () => {
        alert(this.router.url)
        if(this.router.url === '/favoris'){
          this.router.navigateByUrl('/favoris');
        }
        const routes = ['/utilisateur', '/utilisateur/acceuil'];
        if (routes.includes(this.router.url)) {
          this.presentAlert();
        }
      }); */
    });

  }
    async closeModal() {
  const modal = await this.modal.getTop();
  if (modal) {
      modal.dismiss();
  }
  }
  vershome() {
    this.navCtrl.navigateRoot('utilisateur/acceuil');
  }
  deconnexion() {
    this.navCtrl.navigateRoot('utilisateur');
  }
  vershistorique() {
    this.navCtrl.navigateForward('historique');

  }
  versfavoris() {
    this.navCtrl.navigateForward('favoris');
  }
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'UPay',
      // subHeader: 'Subtitle',
      message: 'Voulez-vous vraiment quitter l\'application?',
      cssClass: 'alertSucces',
      buttons: [{
        text: 'Non',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
        }
      }, {
        text: 'oui',
        handler: () => {
          // tslint:disable-next-line: no-string-literal
          navigator['app'].exitApp();
        }
      }]
    });

    await alert.present();
  }
   checkNetwork() {
    this.network.onDisconnect().subscribe(() => {
      this.serv.showToast('Vous n\'avez plus d\'accès internet');
      this.glb.ISCONNECTED = false;

    });
    this.network.onConnect().subscribe(() => {
      if (!this.glb.ISCONNECTED) {
        this.affichemessageToast('Connexion retrouvée');
      }
      this.glb.ISCONNECTED = true;

    });
  }
  async affichemessageToast(message: string) {
    const toast = await this.toastController.create({
      message,
      color: 'success',
      position: 'bottom',
      duration: 5000
    });
    toast.present();
  }
  verspage(url: any) {
    this.navCtrl.navigateForward(url);
    this.menu.toggle();
  }
  verssite() {
    this.menu.toggle();
    // this.tab.create('http://www.upay.africa','_system');
  }
  verscgu() {
    const mod = this.modal.create({
      component: ReglecguComponent,
    }).then((e) => {
      this.menu.toggle();
      e.present();
    });
  }
  deplafonnement() {
    const params: any = {};
    params.nom = this.glb.NOM;
    params.prenom = this.glb.PRENOM;
    params.cocche = true;
    const navigationExtras: NavigationExtras = {
      state: {
        user: params
      }
    };
    this.menu.toggle();
    this.navCtrl.navigateRoot('utilisateur/souscription', navigationExtras);
  }
}
