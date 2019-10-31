import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-compte',
  templateUrl: './compte.page.html',
  styleUrls: ['./compte.page.scss'],
})
export class ComptePage implements OnInit {
  public headerTitle = 'Mes Comptes';
  constructor(public navCrtl: NavController) { }

  ngOnInit() {
  }
  meswallets(url: any) {
    this.navCrtl.navigateForward(url);
  }
}
