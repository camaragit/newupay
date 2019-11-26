import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceString'
})
export class ReplaceStringPipe implements PipeTransform {

  transform(value: any, toreplace: string, newValue: string): any {
    const reg = new RegExp(toreplace, "g");
    return value.replace(reg, newValue)
  }

}
