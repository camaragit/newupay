import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'operatorImage'
})
export class OperatorImagePipe implements PipeTransform {
   src = 'assets/images/';

  transform(OperatorsImages: any, codeOper: string, codeSousop: string): any {
    let i = 0;
// tslint:disable-next-line: max-line-length
    while (i < OperatorsImages.length && OperatorsImages[i].codeoper !== codeOper ) {
      i++;
    }
    if (i < OperatorsImages.length) {
      if (codeOper === '0005' && codeSousop === '5') {
      return this.src + 'omoney.png';
      }
      if (codeOper === '0057' && codeSousop === '2') {
      return this.src + 'logo_rapido.png';
      }
      return OperatorsImages[i].image;

      } else { return this.src + 'upay_portrait.PNG'; }
    }

}

