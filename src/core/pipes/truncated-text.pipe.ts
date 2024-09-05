import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncatedText',
  standalone: true
})
export class TruncatedTextPipe implements PipeTransform {

  private showValue = false;

  transform(value: string, key: string): string {
    if (this.showValue) {
      return value;
    } else {
      return key;
    }
  }

  toggleValue() {
    this.showValue = !this.showValue;
  }
}
