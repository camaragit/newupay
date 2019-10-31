import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ComptePage } from './compte.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { ListeWalletPage } from './liste-wallet/liste-wallet.page';
import { AjoutWalletPage } from './ajout-wallet/ajout-wallet.page';
import { CartePage } from './carte/carte.page';
import { BanquePage } from './banque/banque.page';

const routes: Routes = [
  {
    path: '',
    component: ComptePage
  },
  {
    path: 'listewallet',
    component: ListeWalletPage
  },
  {
    path: 'ajoutwallet',
    component: AjoutWalletPage
  },
  {
    path: 'carte',
    component: CartePage
  },
  {
    path: 'banque',
    component: BanquePage
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ComptePage, ListeWalletPage, AjoutWalletPage, BanquePage, CartePage]
})
export class ComptePageModule {}
