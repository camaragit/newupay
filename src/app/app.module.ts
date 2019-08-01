import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GlobalVariableService } from './services/global-variable.service';
import { Camera } from '@ionic-native/camera/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { ServiceService } from './services/service.service';
import { Sim } from '@ionic-native/sim/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Toast } from '@ionic-native/toast/ngx';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { MillierPipe } from './pipes/millier.pipe';
import { FormatphonePipe } from './pipes/formatphone.pipe';
import { FormatdatePipe } from './pipes/formatdate.pipe';
import { CoupurechainePipe } from './pipes/coupurechaine.pipe';
import { Contacts } from '@ionic-native/contacts/ngx';
import {FilePath} from '@ionic-native/file-path/ngx';
import { OperatorImagePipe } from './pipes/operator-image.pipe';
import { FormatcodePipe } from './pipes/formatcode.pipe';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { SharedModule } from './shared/shared.module';
//import { Keyboard } from '@ionic-native/keyboard/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), SharedModule, AppRoutingModule, IonicStorageModule.forRoot()],
  providers: [
    StatusBar, SQLite, Toast,  Sim, Network, OperatorImagePipe, LocalNotifications,
    SplashScreen, GlobalVariableService, Camera, Base64, ServiceService, HTTP, Contacts, FilePath, FormatcodePipe,
    MillierPipe, FormatphonePipe, AndroidPermissions,  FormatdatePipe, CoupurechainePipe, BarcodeScanner,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
