import { Component, OnInit, Inject } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EditPasswordComponent } from './edit-password/edit-password.component';
import { DeleteAccountComponent } from './delete-account/delete-account.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from "../services/authentication.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  username = "";
  userProfile = {
    username: "",
    role: 0,
    roleName: "",
    description: "",
    isBanned: false,
  };

  profilePictureUrl = "";

  roleColors = {
    1: "#2196F3",
    2: "#2E7D32",
    3: "#F44336"
  };

  user = null;
  subUser;

  constructor(private profileService: ProfileService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    @Inject('forumApiUrl') private serviceUrl: string) { }

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    let urlUsername = this.route.snapshot.params.username;

    // Si on récupère un nom d'utilisateur dans l'url on affiche son profil, sinon on affiche le profil de l'utilisateur courant
    if (urlUsername !== undefined) this.getUserProfile(urlUsername);
    else if (this.username !== "") this.getSelfProfile();

    this.user = this.authenticationService.currentUserValue;
    this.subUser = this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
  }

  getSelfProfile() {
    this.profileService.getSelfProfile().toPromise().then(response => {
      if (response.succeeded) {
        this.userProfile = response.result;
        this.profilePictureUrl = `${this.serviceUrl}/${response.result.profilePicture}`;
      }
      else {
        this.snackBar.open('Une erreur inconnue est survenue.', 'Ok', {
          duration: 5000
        });
      }
    })
  }

  getUserProfile(username) {
    this.profileService.getUserProfile(username).toPromise().then(response => {
      if (response.succeeded) {
        this.userProfile = response.result;
        this.profilePictureUrl = `${this.serviceUrl}/${response.result.profilePicture}`;
      }
      else {
        // Si une erreur survient, on suppose que le profil utilisateur n'existe pas et on renvoie sur la page d'accueil
        this.router.navigateByUrl('/');
      }
    })
  }

  goToEditProfile() {
    this.router.navigateByUrl('/profile/edit').then();
  }

  updatePassword() {
    this.dialog.open(EditPasswordComponent, {
      disableClose: true
    });
  }

  deleteAccount() {
    this.dialog.open(DeleteAccountComponent, {
      disableClose: true
    });
  }

  updateUserBan() {
    if (confirm("Êtes-vous sûr(e) de vouloir modifier le statut 'Banni' de cet utilisateur ?")) {
      let username = this.userProfile.username;
      let isBanned = this.userProfile.isBanned;

      this.profileService.updateUserBan(username, !isBanned).toPromise().then(response => {
        if (response.succeeded) {
          this.getUserProfile(username);
          this.snackBar.open('Le statut de l\'utilisateur a bien été mis à jour.', 'Ok', {
            duration: 5000
          });
        }
        else {
          if (response.messages.length > 0) {
            response.messages.forEach(msg => {
              let msgToShow = "";
              switch (msg) {
                case 'UserNotAuthorized':
                  msgToShow = "Vous n'êtes pas autorisé à effectuer cette action.";
                  break;
                case 'UserNotFound':
                  msgToShow = "L'utilisateur que vous essayez de mettre à jour n'existe pas.";
                  break;
                default:
                  msgToShow = msg;
                  break;
              }

              this.snackBar.open(msgToShow, 'Ok', {
                duration: 5000
              });
            });
          }
          else {
            this.snackBar.open('Une erreur inconnue est survenue.', 'Ok', {
              duration: 5000
            });
          }
        }
      });
    }
  }

}
