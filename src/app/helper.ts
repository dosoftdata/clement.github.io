import { Injectable } from '@angular/core';
import {AlertController, ToastController} from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import * as _ from 'lodash';
declare var google: any;

@Injectable({
    providedIn: 'root'
})
export class Helper {

    constructor(
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private geolocation: Geolocation,
        private locationAccuracy: LocationAccuracy,
        private androidPermissions: AndroidPermissions
        ) { }
    private static _formatLanLng(lat: number, lng: number) {
         if ( lat && lng ) {
            return  new google.maps.LatLng(lat, lng);
         }
    }
    calculateDistance(origin: any, destination: any, callback) {
        // tslint:disable-next-line:new-parens
        const service = new google.maps.DirectionsService;
        service.route({
            origin: Helper._formatLanLng(origin.lat, origin.lng),
            destination: Helper._formatLanLng(destination.lat, destination.lng),
            travelMode: google.maps.TravelMode.DRIVING,
            drivingOptions: {
                departureTime: new Date(Date.now() + 1000),  // for the time N milliseconds from now.
                trafficModel: 'optimistic'
            }
        }, callback);
    }
    static getAddressFromLatLon(lat:number,lng:number) : Promise<any>{

        let  geoCoder = new google.maps.Geocoder,
             latLng:object = { lat, lng };

        return new Promise((resolve,reject) => {
            geoCoder.geocode(
                {location: latLng},
                (address, status)=>{

                if (status === 'OK') {
                    resolve(_.first(address)['formatted_address']);

                }else{
                    resolve('');
                }
            });
        });

    }

    _setObject(key, value) {
        window.localStorage[key] = JSON.stringify(value);
        return true;
    }
    _getObject(key) {
        return JSON.parse(window.localStorage[key] || '{}');
    }

    _flush() {
        return [
            window.localStorage.clear()
        ];
    }
    _checkKey(key) {

        if (key in window.localStorage) {
            return true;
        }
        return false;
    }
    _removeKeyValue(key: any) {
        return window.localStorage.removeItem(key);
    }
    appToast(message: string, type: string= 'error') {
        this.toastCtrl.create({
            message,
            duration: 15000,
            animated: true,
            showCloseButton: true,
            closeButtonText: 'OK',
            cssClass: 'app-toast ' + type,
            position: 'middle'
        }).then((obj) => {
            obj.present().then(res => res);
        });
    }
    appAlert(message: string, title: string= 'Error message') {
        this.alertCtrl.create({
            header: title,
            message,
            buttons: ['Okay'],
            cssClass: 'app-alert'
        }).then((obj) => {
            obj.present().then( res => res);
        });
    }
    /**
     *  Get and Watch current user location
     */
    async setCurrentPosition() {
        // mobileWeb platform: dev only
        if ('geolocation' in navigator) {
            await this.webUserLocationForceMobileFailBack();
        }
        // Check and set user geographic location if available
        this.checkGPSPermission();
    }
    private webUserLocationForceMobileFailBack(){
       return navigator.geolocation.getCurrentPosition((position) => {
           this.saveUserLocationData(position).then(res=>res);
        });
    }
    private askToTurnOnGPS() {
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
            () => {
                // When GPS Turned ON call method to get Accurate location coordinates
                this.getLocationCoordinates();
            }
        );
    }
    private getLocationCoordinates() {

        this.geolocation.getCurrentPosition({
            maximumAge: 0,
            timeout: 15000,
            enableHighAccuracy: true
        }).then( async (position) => {
            this.saveUserLocationData(position).then(res=>res);
        });

        const subscription = this.geolocation.watchPosition()
            .subscribe(async(position) => {
                this.saveUserLocationData(position).then(res=>res);
            });
        subscription.unsubscribe();
    }
    private requestGPSPermission() {
        this.locationAccuracy.canRequest().then((canRequest: boolean) => {
            if (canRequest) {
                return canRequest;
            } else {
                // Show 'GPS Permission Request' dialogue
                this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
                    .then(
                        () => {
                            // call method to turn on GPS
                            this.askToTurnOnGPS();
                        }
                    );
            }
        });
    }
    // Check if application having GPS access permission
    private checkGPSPermission() {
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
            result => {
                if (result.hasPermission) {
                    // If having permission show 'Turn On GPS' dialogue
                    this.askToTurnOnGPS();
                } else {
                    // If not having permission ask for permission
                    this.requestGPSPermission();
                }
            }
        );
    }

    private async saveUserLocationData(position){

        let data = {
            lat:position.coords.latitude,
            lng:position.coords.longitude,
            address:''
        };
        await Helper.getAddressFromLatLon(data.lat, data.lng).then(address=>{

            if ( address ) {

                data.address = address;
            }
        });
        this._setObject('userLocation',data);
    }
}
