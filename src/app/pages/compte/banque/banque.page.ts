import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-banque',
  templateUrl: './banque.page.html',
  styleUrls: ['./banque.page.scss'],
})
export class BanquePage implements OnInit {
  public headerTitle = 'Banques';
  constructor() { }

  ngOnInit() {
  }

}
