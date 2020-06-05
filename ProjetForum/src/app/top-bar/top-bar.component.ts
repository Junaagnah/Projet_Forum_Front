import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthenticationService} from '../services/authentication.service';
import {NotificationService} from '../services/notification.service';
import {NotificationModel} from '../models/notificationModel';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TopBarComponent implements OnInit {

  user;
  subUser;
  notifs: Array<NotificationModel> = new Array<NotificationModel>();
  hasNotifColor = "#E91E63";
  noNotifColor = "#FFFFFF";

  readColor = "#9E9E9E";
  notReadColor = "#FFFFFF";

  constructor(private _router: Router,
              private authenticationService: AuthenticationService,
              private snackBar: MatSnackBar,
              private notificationService: NotificationService) {
    this.user = authenticationService.currentUserValue;
    this.subUser = authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });

    if (this.user !== null && this.user !== undefined) this.getNotifs();
  }

  ngOnInit(): void {
  }

  navigate(url) {
    this._router.navigateByUrl(url).then();
  }

  disconnect() {
    this.authenticationService.signout();
  }

  // bind de la fonction pour le setTimeout
  getNotifs = () => {
    this.notificationService.getNotifications().toPromise().then(response => {
      if (response.succeeded) {
        this.notifs = response.result;
      }
      else {
        this.snackBar.open('Impossible de récupérer vos notifications. Réessayez plus tard.', 'Ok', {
          duration: 5000
        });
      }
      // On check les notifications toutes les 5 secondes
      setTimeout(this.getNotifs, 5000);
    });
  };

  readNotifs() {
    this.notificationService.markAsRead().toPromise().then(response => {
      if (!response.succeeded) {
        this.snackBar.open('Impossible de marquer les notifications comme lues.', 'Ok', {
          duration: 5000
        });
      }
    });
  }

  goToElement(notif: NotificationModel) {
    let uri: string;
    switch(notif.context) {
      case 0:
        // Réponse à un post
        uri = `category/${notif.categoryId}/posts/view/${notif.contextId}`;
        this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this._router.navigate([uri]).then();
        });
        break;
      case 1:
        // Réponse dans une conversation
        uri = `messagerie/conversation/${notif.contextId}`;
        this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this._router.navigate([uri]).then();
        })
    }
  }

  deleteNotif(notif: NotificationModel) {
    this.notificationService.deleteNotification(notif.id).toPromise().then(response => {
      if (response.succeeded) {
        this.notifs = this.notifs.filter(n => n.id !== notif.id);
      }
      else {
        this.snackBar.open('Impossible de supprimer la notification.', 'Ok', {
          duration: 5000
        });
      }
    })
  }

}
