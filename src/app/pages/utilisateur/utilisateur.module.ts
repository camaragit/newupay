import { NgModule } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';


import { UtilisateurPage } from './utilisateur.page';
import { SouscriptionSuitePage } from './souscription-suite/souscription-suite.page';
import { AcceuilPage } from './acceuil/acceuil.page';
import { BienvenuePage } from './bienvenue/bienvenue.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { SouscriptionPage } from './souscription/souscription.page';
import { LoginPage } from './login/login.page';
import { ResetPinPage } from './reset-pin/reset-pin.page';
import { CheckComptePage } from './check-compte/check-compte.page';
import { AccessGuard } from 'src/app/services/access.guard';

const routes: Routes = [
  {
    path: '',
    component: UtilisateurPage,
  },
  {
    path: 'souscription',
    component: SouscriptionPage,
  },
  {
    path: 'suitesouscription',
    component: SouscriptionSuitePage
  },
  {
    path: 'acceuil',
    component: AcceuilPage,
    canActivate: [AccessGuard]
  },
  {
    path: 'bienvenue',
    component: BienvenuePage
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'resetpin',
    component: ResetPinPage
  }
,
{
  path: 'checkcompte',
  component: CheckComptePage
}

];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [UtilisateurPage, BienvenuePage, AcceuilPage,
                SouscriptionSuitePage, SouscriptionPage,
                LoginPage, ResetPinPage, CheckComptePage]
})
export class UtilisateurPageModule {}
