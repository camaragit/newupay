import { Component, OnInit } from '@angular/core';
import { ServiceService } from 'src/app/services/service.service';
import { GlobalVariableService } from 'src/app/services/global-variable.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CustomValidatorPhone } from 'src/app/components/customValidator/custom-validator';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-reset-pin',
  templateUrl: './reset-pin.page.html',
  styleUrls: ['./reset-pin.page.scss'],
})
export class ResetPinPage implements OnInit {
  public Userdata: FormGroup;

  constructor(public serv: ServiceService,
              public glb: GlobalVariableService,
              public router: Router,
              public formBuilder: FormBuilder) {
    this.Userdata = this.formBuilder.group({
      login: ['', [Validators.required, CustomValidatorPhone]],
      numpiece: ['', Validators.required],
      typepiece: [''],
      prenom: [''],
      email: [''],
      nom: [''],
      mode: ['R']
    });
  }
  ngOnInit() {
  }
  generateOTPCode() {
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
        this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard ');
      }


    }).catch((err) => {
      this.serv.dismissloadin();

      this.serv.showError('Le service est momentanément indisponible.Veuillez réessayer plutard ');
    });


  }

}
