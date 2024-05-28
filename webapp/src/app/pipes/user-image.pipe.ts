import { Pipe, PipeTransform } from '@angular/core';
import { userImage } from '../lib/assets';

@Pipe({
  name: 'userImage',
  standalone: true,
})
export class UserImagePipe implements PipeTransform {
  transform(value?: string): unknown {
    return userImage(value);
  }
}
