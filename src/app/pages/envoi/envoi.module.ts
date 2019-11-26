import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnvoiPage } from './envoi.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { WizallPage } from './wizall/wizall.page';
import { PostecashPage } from './postecash/postecash.page';
import { YakalmaPage } from './yakalma/yakalma.page';
import { EmoneyPage } from './emoney/emoney.page';
import { SeddoPage } from './seddo/seddo.page';
import { IziPage } from './izi/izi.page';
import { RapidoPage } from './rapido/rapido.page';
import { OrangeMoneyPage } from './orange-money/orange-money.page';
import { TigoCashPage } from './tigo-cash/tigo-cash.page';
import { RechargeComponent } from 'src/app/components/recharge/recharge.component';
import { CashinReleveComponent } from 'src/app/components/cashin-releve/cashin-releve.component';
import { UpaywalletPage } from './upaywallet/upaywallet.page';
import { TransfertUniteValeurPage } from './transfert-unite-valeur/transfert-unite-valeur.page';
import { BrmPage } from './brm/brm.page';
const routes: Routes = [
  {
    path: '',
    component: EnvoiPage
  },
  {
    path: 'wizall',
    component: WizallPage
  },
  {
    path: 'postecash',
    component: PostecashPage
  },
  {
    path: 'emoney',
    component: EmoneyPage
  },
  {
    path: 'yakalma',
    component: YakalmaPage
  },
  {
    path: 'seddo',
    component: SeddoPage
  },
  {
    path: 'izi',
    component: IziPage
  },
  {
    path: 'rapido',
    component: RapidoPage
  },
  {
    path: 'orangemoney',
    component: OrangeMoneyPage
  },
  {
    path: 'tigocash',
    component: TigoCashPage
  },
  {
    path: 'upaywallet',
    component: UpaywalletPage
  },
  {
    path: 'transfertuv',
    component: TransfertUniteValeurPage
  },
  {
    path: 'brm',
    component: BrmPage
  }

];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EnvoiPage, WizallPage, PostecashPage,
                 TigoCashPage, OrangeMoneyPage, RapidoPage,
                 IziPage, SeddoPage, EmoneyPage, YakalmaPage,
                 RechargeComponent, CashinReleveComponent,
                 UpaywalletPage, BrmPage
                ]
})
export class EnvoiPageModule {}
