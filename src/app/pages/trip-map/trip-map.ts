import { Component, OnInit } from '@angular/core';
import { styleMap } from '../../constants';
import {Helper} from '../../helper';
declare var google;

@Component({
  selector: 'app-trip-map',
  templateUrl: 'trip-map.html',
  styleUrls: ['trip-map.scss'],
})

// tslint:disable-next-line:component-class-suffix
export class TripMap implements OnInit {

  title: string;
  userLat: number;
  userLng: number;

  origin: object;
  destination: object;
  mapStyles: Array<object> = styleMap;
    // tslint:disable-next-line:ban-types
  tripDistanceTime: object = {
      distance: '',
      duration: ''
  };
  curUserMapIcon: object;
  private curUserDefaultIcon = 'assets/icon/favicon.png';

    directionRenderOptions: object = {
        suppressMarkers: true,
    };
    directionMarkerOptions: object = {
        origin: {
            label: 'O'
        },
        destination: {
            label: 'D'
        }
    };

      constructor( private data: Helper) {
        this.title = 'Trip direction';
      }

      ngOnInit() {
         this.getData();
      }

      private getData() {
            const userLocation = this.data._getObject('userLocation');
            this.userLat = userLocation.lat;
            this.userLng = userLocation.lng;

            this.origin = this.data._getObject('origin');
            this.destination = this.data._getObject('destination');
            this.tripDistanceTime = this.data._getObject('tripDT');

            return [
                this.curUserMapIcon = {
                    url: this.curUserDefaultIcon,
                    scaledSize: new google.maps.Size(20, 20)
                }
            ];
      }

}


