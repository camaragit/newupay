import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, NavController, Platform, ModalController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { Base64 } from '@ionic-native/base64/ngx';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { Sim } from '@ionic-native/sim/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Storage } from '@ionic/storage';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { ServiceService } from 'src/app/services/service.service';
import { MillierPipe } from 'src/app/pipes/millier.pipe';
import { FormatphonePipe } from 'src/app/pipes/formatphone.pipe';
import { CustomValidatorPhone } from 'src/app/components/customValidator/custom-validator';
import { HTTP } from '@ionic-native/http/ngx';
import {FilePath} from '@ionic-native/file-path/ngx';
import { MessageComponent } from 'src/app/components/message/message.component';
import { PubliciteComponent } from 'src/app/components/publicite/publicite.component';

@Component({
  selector: 'app-souscription',
  templateUrl: './souscription.page.html',
  styleUrls: ['./souscription.page.scss'],
})
export class SouscriptionPage implements OnInit {
  coche = false;
  isVerso = false;
  isrecto = false;
  pictureRecto: any = '';
  default: any = this.glb.IMG_URL + 'scan.png';
  pictureVerso: any = '';
  urlRecto: any = '';
  urlVerso: any = '';
  commingData: any;
  public titre: any = 'Nouvelle souscription';
  public Userdata: FormGroup;
  public desactiv = false;
  @ViewChild(IonContent) content: IonContent;
  constructor(private camera: Camera, public glb: GlobalVariableService,
              private sanitizer: DomSanitizer,
              private base64: Base64,
              public navCtrl: NavController,
              public storage: Storage,
              public serv: ServiceService,
              public formBuilder: FormBuilder,
              public router: Router,
              public platform: Platform,
              public monmillier: MillierPipe,
              public sim: Sim,
              public filePath: FilePath,
              public http: HTTP,
              public splashScreen: SplashScreen,
              private modalCrtl: ModalController,
              public formatphone: FormatphonePipe,
              public androidPermissions: AndroidPermissions) {

                this.Userdata = this.formBuilder.group({
                  login: ['', [Validators.required, CustomValidatorPhone]],
                //  codepin: ['', Validators.required],
                 // confpin: ['', Validators.required],
                  prenom: ['', Validators.required],
                  nom: ['', Validators.required],
                  numpiece: ['', Validators.required],
                  // tslint:disable-next-line: max-line-length
                  email: ['', [Validators.required, Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')]],
                  imei: [''],
                  ok: [false, Validators.requiredTrue ],
                  idSim1: [''],
                  idSim2: [''],
                  mode: ['S']
                });
                if (this.router.getCurrentNavigation().extras.state) {
                  this.commingData = this.router.getCurrentNavigation().extras.state.user;
                  this.Userdata.controls.prenom.setValue(this.commingData.prenom);
                  this.Userdata.controls.nom.setValue(this.commingData.nom);
                  this.Userdata.controls.login.setValue(this.glb.PHONE);
                  this.titre = 'Complément profil';
                  this.desactiv = true;
                  this.serv.showError('Merci de compléter votre profil');
                } else {
                  this.desactiv = false;
                }
              }

  verspagesuivant() {
    const userdata = this.Userdata.getRawValue();
    userdata.login = '221' + this.Userdata.controls.login.value;
    userdata.login = userdata.login.replace(/-/g, '');
    const navigationExtras: NavigationExtras = {
      state: {
        user: userdata
      }
    };
    this.router.navigate(['/utilisateur/suitesouscription'], navigationExtras);
    // this.navCtrl.navigateForward('souscriptionsuite');
  }
  ngOnInit() {
  }
  takeRecto() {
    this.urlRecto = '';
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      allowEdit : true,
      mediaType: this.camera.MediaType.PICTURE
    };
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
/*       this.pictureRecto = 'data:image/jpeg;base64,' + imageData;
      this.pictureRecto =  imageData; */
      this.base64.encodeFile(imageData).then((base64File: string) => {

        //  let img= "data:image/png;base64,"+base64File.replace("data:image/*;charset=utf-8;base64,","");
          const img = 'data:image/jpeg;base64,' + base64File.replace('data:image/*;charset=utf-8;base64,', '');
         // this.isphoto = true;
          this.pictureRecto = this.sanitizer.bypassSecurityTrustUrl(img);
          this.isrecto = true;
          this.filePath.resolveNativePath(imageData)
          .then((path) => {
            this.http.setDataSerializer('json');
            this.http.setSSLCertMode('nocheck');
            this.http.post(this.glb.URLUPLOAD + 'auth/signin', {username: 'appmobile', password: 'passer'}, {}).then((data) => {
              const reponse = JSON.parse(data.data);
              const header = {Authorization : reponse.tokenType + ' ' + reponse.accessToken};
              this.http.uploadFile(this.glb.URLUPLOAD + 'uploadFile', {}, header, path, 'file').then((repon) => {
                const rep = JSON.parse(repon.data);
                this.urlRecto = rep.fileDownloadUri;
              //  alert('uploadFile data ' + JSON.stringify(rep.fileDownloadUri));
          }).catch((err) => {
           // alert('erreur uploadFile ' + JSON.stringify(err));
          });

            }).catch((err) => {
              // alert('erreur ws ' + JSON.stringify(err));
            });
          })
          .catch((err) => {
            console.error(err);
          });
        }).catch((err) => {
        });
     }).catch((err) => {
    });
  }
  takeVerso() {
    this.urlVerso = '';
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      allowEdit : true,
    };
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.base64.encodeFile(imageData).then((base64File: string) => {

        //  let img= "data:image/png;base64,"+base64File.replace("data:image/*;charset=utf-8;base64,","");
          const img = 'data:image/jpeg;base64,' + base64File.replace('data:image/*;charset=utf-8;base64,', '');
         // this.isphoto = true;
          this.pictureVerso = this.sanitizer.bypassSecurityTrustUrl(img);
          this.isVerso = true;
        }, (err) => {
        });
      this.filePath.resolveNativePath(imageData)
        .then((path) => {
          this.http.setDataSerializer('json');
          this.http.setSSLCertMode('nocheck');
          this.http.post(this.glb.URLUPLOAD + 'auth/signin', {username: 'appmobile', password: 'passer'}, {}).then((data) => {
            const reponse = JSON.parse(data.data);
            const header = {Authorization : reponse.tokenType + ' ' + reponse.accessToken};
            this.http.uploadFile(this.glb.URLUPLOAD + 'uploadFile', {}, header, path, 'file').then((repon) => {
              const rep = JSON.parse(repon.data);
              this.urlVerso = rep.fileDownloadUri;
              // alert('uploadFile data ' + JSON.stringify(rep.fileDownloadUri));
        }).catch((err) => {
         // alert('erreur uploadFile ' + JSON.stringify(err));
        });

          }).catch((err) => {
          //  alert('erreur ws ' + JSON.stringify(err));
          });
        })
        .catch((err) => {
          console.error(err);
        });
     }, (err) => {
      // Handle error
     });
    }
  cocher() {

    if (this.coche === false) {
      this.coche = true;
      this.content.scrollToPoint(3000, 2000, 1500);
     // this.content.scrollToBottom(1500);
    } else {
      this.coche = false;
      this.content.scrollToTop(1500);

    }


  }
  logScrollStart() {
  }

  logScrolling() {
  }

  logScrollEnd() {
  }

  ScrollToBottom() {
    this.content.scrollToBottom(1500);
  }

  ScrollToTop() {
    this.content.scrollToTop(1500);
  }

  ScrollToPoint(X, Y) {
    this.content.scrollToPoint(X, Y, 1500);
  }
 goback() {
   this.navCtrl.navigateBack('utilisateur');
}
  generateOTPCode() {
    // this.Userdata.controls.login.setValue('221' + this.Userdata.controls.login.value);
     const userdata = this.Userdata.getRawValue();
     userdata.login = '221' + this.Userdata.controls.login.value;
     userdata.login = userdata.login.replace(/-/g, '');
     this.serv.afficheloading();
     this.serv.posts('connexion/generateOTP.php', userdata, {}).then(data => {
       this.serv.dismissloadin();
       const reponse = JSON.parse(data.data);
       if (reponse.returnCode) {
             if (reponse.returnCode === '0') {
         const navigationExtras: NavigationExtras = {
           state: {
             user: userdata
           }
         };
         this.router.navigate(['/utilisateur/suitesouscription'], navigationExtras);
       } else { this.serv.showError('Opération échouée'); }
       } else {
         this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard  ');
       }


     }).catch(err => {
       this.serv.dismissloadin();

       this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard');

     });


   }
}
