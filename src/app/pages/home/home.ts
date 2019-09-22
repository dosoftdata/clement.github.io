
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { Connectivity } from '../../connectivity';
import {NavController, LoadingController, Platform} from '@ionic/angular';
import { locationSearchType } from '../../constants';
import {Helper} from '../../helper';
import * as _ from 'lodash';
declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.html',
  styleUrls: ['home.scss']
})

// tslint:disable-next-line:component-class-suffix
export class Home  implements OnInit {

  private isPlanned = [];
    // tslint:disable-next-line:variable-name
  private _tripDestination: object;
    // tslint:disable-next-line:variable-name
  private _tripOrigin: object;

  @ViewChild('tripFrom', { static: false }) tripFromElementRef: ElementRef;
  @ViewChild('tripTo', { static: false }) tripToElementRef: ElementRef;

  public fromMyLocation ='My location';


  constructor(
      private mapsAPILoader: MapsAPILoader,
      private ngZone: NgZone,
      private isConnect: Connectivity,
      public navCtrl: NavController,
      public loadingController: LoadingController,
      public platform: Platform,
      private data: Helper
  ) {}
    ionViewWillEnter() {
     // reset user selected trip plan and calculated distance and duration
      this.data._removeKeyValue('destination');
      this.data._removeKeyValue('origin');
      this.data._removeKeyValue('tripDT');

      this.resetUserInputs();

    }
    ngAfterViewInit() {
        this.tripFromElementRef.nativeElement.value = "update input value";
    }

  ngOnInit() {

    if (this.isConnect.isOnline()) {
      // load Places to trip from
      this.isConnect.watchOnline();
      this.mapsAPILoader.load().then(() => {
        const addressFrom = new google.maps.places.Autocomplete(this.tripFromElementRef.nativeElement, {
          types: locationSearchType
        });
        addressFrom.addListener('place_changed', () => {
          this.ngZone.run(() => {
            // get the place result
            // @ts-ignore
            const placeFrom: google.maps.places.PlaceResult = addressFrom.getPlace();
            // verify result
            if (placeFrom.geometry === undefined || placeFrom.geometry === null) {
              this.isPlanned.pop();
              return;
            }
            // set latitude, longitude
            this._tripOrigin = {
              lat: placeFrom.geometry.location.lat(),
              lng: placeFrom.geometry.location.lng()
            };
            this.isPlanned.push(true);
              // tmp data
            this.data._setObject('origin', this._tripOrigin );
          });
        });
      });

      // load Places to trip to
      this.mapsAPILoader.load().then(() => {
        const addressTo = new google.maps.places.Autocomplete(this.tripToElementRef.nativeElement, {
          types: locationSearchType
        });
        addressTo.addListener('place_changed', () => {
          this.ngZone.run(() => {
            // get the place result
            // @ts-ignore
              const placeTo: google.maps.places.PlaceResult = addressTo.getPlace();
            // verify result
              if (placeTo.geometry === undefined || placeTo.geometry === null) {
              this.isPlanned.pop();
              return;
            }
            // set latitude, longitude
              this._tripDestination = {
              lat: placeTo.geometry.location.lat(),
              lng: placeTo.geometry.location.lng()
            };
              this.isPlanned.push(true);
              this.data._setObject('destination', this._tripDestination  );
          });
        });
      });
    } else {
      this.isConnect.watchOffline();
      this.data.appAlert('Internet connectivity not available.');
      return false;
    }

  }

  async startTrip($event) {

        const loading = await this.loadingController.create({ message: 'Please wait...'});
        await  this.data.setCurrentPosition();
        const userLocation =  await this.data._getObject('userLocation');
        // Code Coverage
        if ( _.isEmpty(this.tripToElementRef.nativeElement.value) ||
            _.isEmpty(this.tripFromElementRef.nativeElement.value) ) {
            this.data.appAlert('Please, plan your trip...');
            return this.resetUserInputs();
        }
        if ( userLocation.lat  &&
            this.tripToElementRef.nativeElement.value &&
            this.tripFromElementRef.nativeElement.value &&
            _.isEqual(this.isPlanned.length, 2)  ) {
               // Code coverage
               if ( _.isEqual(this.tripToElementRef.nativeElement.value, this.tripFromElementRef.nativeElement.value)  ) {
                   this.data.appAlert('Bad destination or arrival plan.');
                   return this.resetUserInputs();
               }
               await loading.present().then(res => res);

               if (  _.isEqual(this.tripFromElementRef.nativeElement.value, this.fromMyLocation) ) {
                   this._tripOrigin = userLocation;
               }
               // get user trip planned distance and duration
               this.data.calculateDistance(
              this.data._getObject('origin') || this._tripOrigin,
              this.data._getObject('destination') || this._tripDestination,
              (async res => {
                const routes = _.first(res.routes) ? _.first(res.routes) : [];
                if (_.has(routes, 'legs')) {
                  const legs =  _.first(_.first(res.routes).legs);
                  this.data._setObject('tripDT', {
                    distance: legs.distance.text,
                    duration: legs.duration.text
                  });
                  setTimeout(async () => {
                      // tslint:disable-next-line:no-shadowed-variable
                  await loading.dismiss().then( async res => {
                       await this.resetUserInputs();
                       return await this.navCtrl.navigateForward(['/trip/map']); });
                  }, 1000);
                } else {
                  this.data.appAlert('Your trip destination is out of the range.');
                  this.resetUserInputs();
                  return await loading.dismiss();
                }
              })
          );
               return true;
        } else {
           let message = 'Please, fill out your trip plan...';
           if ( !userLocation.lat ) {
              message = 'Please, enable your location first.';
           }
           this.data.appAlert(message);
           return  this.resetUserInputs();
        }

  }

    /**
     *
     */
  private resetUserInputs() {
     return [
      this.tripToElementRef.nativeElement.value = '',
      this.tripFromElementRef.nativeElement.value = '',
      this.isPlanned = []
     ];
  }


}


