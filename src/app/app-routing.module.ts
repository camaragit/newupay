import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AccessGuard } from './services/access.guard';

const routes: Routes = [
  { path: '', redirectTo: 'utilisateur', pathMatch: 'full' },
  { path: 'paiement', loadChildren: './pages/paiement/paiement.module#PaiementPageModule',  canActivate: [AccessGuard]  },
  { path: 'reception', loadChildren: './pages/reception/reception.module#ReceptionPageModule',  canActivate: [AccessGuard] },
  { path: 'envoi', loadChildren: './pages/envoi/envoi.module#EnvoiPageModule',  /* canActivate: [AccessGuard] */  },
  { path: 'favoris', loadChildren: './pages/favoris/favoris.module#FavorisPageModule', canActivate: [AccessGuard] },
  { path: 'utilisateur', loadChildren: './pages/utilisateur/utilisateur.module#UtilisateurPageModule'},
  { path: 'historique', loadChildren: './pages/historique/historique.module#HistoriquePageModule', canActivate: [AccessGuard] },
  { path: 'compte', loadChildren: './pages/compte/compte.module#ComptePageModule', /* canActivate: [AccessGuard] */ },
  ] ;

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
