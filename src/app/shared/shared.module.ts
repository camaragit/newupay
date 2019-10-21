import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FooterComponent } from '../components/footer/footer.component';
import { HeaderComponent } from '../components/header/header.component';
import { ContentmenuComponent } from '../components/contentmenu/contentmenu.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { MillierPipe } from '../pipes/millier.pipe';
import { FormatphonePipe } from '../pipes/formatphone.pipe';
import { FormatdatePipe } from '../pipes/formatdate.pipe';
import { CoupurechainePipe } from '../pipes/coupurechaine.pipe';
import { FormatcodePipe } from '../pipes/formatcode.pipe';
import { OperatorImagePipe } from '../pipes/operator-image.pipe';
import { PinValidationPage } from '../pages/utilisateur/pin-validation/pin-validation.page';
import { ConfirmationComponent } from '../components/confirmation/confirmation.component';
import { PopoverContactComponent } from '../components/popover-contact/popover-contact.component';
import { MessageComponent } from '../components/message/message.component';
import { PubliciteComponent } from '../components/publicite/publicite.component';
import { TransfertUniteValeurPage } from '../pages/envoi/transfert-unite-valeur/transfert-unite-valeur.page';
//import { TransfertUniteValeurPage } from '../pages/envoi/transfert-unite-valeur/transfert-unite-valeur.page';
//export c options: Partial<IConfig> | (() => Partial<IConfig>);

@NgModule({
  declarations: [FooterComponent, HeaderComponent, FormatcodePipe, OperatorImagePipe,
                 ContentmenuComponent, MillierPipe, FormatphonePipe,  FormatdatePipe,
                 CoupurechainePipe, PinValidationPage, ConfirmationComponent, PopoverContactComponent,
                 MessageComponent, PubliciteComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
  ],
  entryComponents: [PinValidationPage, ConfirmationComponent,
                    PopoverContactComponent, MessageComponent, PubliciteComponent, TransfertUniteValeurPage],
  exports: [FooterComponent,
            HeaderComponent,
            ContentmenuComponent,
            PinValidationPage,
            ConfirmationComponent,
            PopoverContactComponent,
            MillierPipe,
            OperatorImagePipe,
            CommonModule,
            FormsModule,
            IonicModule,
            FormatcodePipe,
            NgxMaskModule,
            ReactiveFormsModule,
            MessageComponent,
            PubliciteComponent]
})
export class SharedModule { }
