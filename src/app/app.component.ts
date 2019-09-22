import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {Helper} from './helper';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class TripPlanningAppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private data:Helper
  ) {
    this.initializeApp();
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString('#de2371');
      this.data.setCurrentPosition().then(res=> res);
      this.splashScreen.hide();
    });
  }
}
