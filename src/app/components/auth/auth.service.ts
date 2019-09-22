import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {Helper} from '../../helper';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authState$: BehaviorSubject<boolean> = new BehaviorSubject(null);

  constructor(
    private platform: Platform,
    private data: Helper

  ) {
    this.platform.ready().then(_ => {
      this.checkToken();
    });
  }
  private checkToken() {
    return this.data._checkKey('logged') ?  this.authState$.next(true) : false;
  }
  isAuthenticated() {
    return this.authState$.value;
  }
}
