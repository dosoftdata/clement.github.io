import { Pro } from '@ionic/pro';
import { ErrorHandler, Injectable } from '@angular/core';

Pro.init('c6618359', {
  appVersion: '1.0.0'
});

@Injectable({
  providedIn: 'root'
})
export class CustomErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Pro.monitoring.handleNewError(err);
  }
}
