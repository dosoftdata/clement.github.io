import { Component, OnInit, Input } from '@angular/core';
import { Facebook } from '@ionic-native/facebook/ngx';
import { Helper } from '../../helper';
import { Events } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

  @Input() title: string;
  isLoggedUser = false;
  constructor( private facebook: Facebook,
               private data: Helper,
               public events: Events ) {
      events.subscribe('user:logged', (user, time) => {
         this.isLoggedUser = !!user;
      });

  }
  ngOnInit() {
      this.data.setCurrentPosition().then(res => res );
      this.isLoggedUser = !!this.data._checkKey('logged');
  }
  async facebookLogin($event) {
        this.facebook.login(['public_profile', 'email'])
            .then(res => {
                if ( res.status === 'connected') {
                    this.getUserDetails(res.authResponse.userID);
                } else {
                    this.data.appToast('Error logging into Facebook, please try later.');
                }
            })
            .catch( (e) => {
                this.data.appToast('Error logging into Facebook, please try later.');
            });
    }
    async facebookLogOut($event) {
        this.facebook.logout().then((res) => {
            this.data.appToast(' Bye bye, you logged out.', 'success');
            this.data._removeKeyValue('logged');
            this.events.publish('user:logged', false, Date.now());
        }).catch( (e) => {
                this.data.appToast('Error logging out from Facebook, please try later.');
            });
    }
  private getUserDetails(userId) {
    this.facebook.api('/' + userId + '/?fields=email,name', ['public_profile'])
        .then(user => {
            user.picture = 'https://graph.facebook.com/' + userId + '/picture';
            this.data._setObject('logged', user);
            this.events.publish('user:logged', user, Date.now());
        })
        .catch(e => {
            this.data.appToast('Error logging into Facebook, please try later ');
        });
   }


}
