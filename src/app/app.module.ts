import {ErrorHandler, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { TripPlanningAppComponent  } from './app.component';
import { PreloadAllModules, RouterModule, RouteReuseStrategy } from '@angular/router';
import { routes } from './routers';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgmCoreModule } from '@agm/core';
import { Network } from '@ionic-native/network/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { TripMap } from './pages/trip-map/trip-map';
import { HeaderComponent } from './components/header/header.component';
import { Home } from './pages/home/home';
import { AgmDirectionModule } from 'agm-direction';
import { CustomErrorHandler } from './error-handler';
import { GOOGLE_MAPS_WEB_KEY } from './constants';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
@NgModule({
    declarations: [
        TripPlanningAppComponent,
        HeaderComponent,
        TripMap,
        Home
    ],
    entryComponents:[ Home ],
    imports: [
        BrowserModule,
        IonicModule.forRoot({
            animated: true,
            loadingSpinner: 'dots',
            spinner: 'dots',
            hardwareBackButton: true
        }),
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules}),
        BrowserAnimationsModule,
        AgmCoreModule.forRoot(GOOGLE_MAPS_WEB_KEY),
        AgmDirectionModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: ErrorHandler, useClass: CustomErrorHandler },
        Network, Facebook, Geolocation, LocationAccuracy, AndroidPermissions
    ],
    bootstrap: [ TripPlanningAppComponent ],
    exports: [RouterModule]
})
export class TripPlanningModule {}
