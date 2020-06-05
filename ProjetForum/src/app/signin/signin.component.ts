import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IndexService } from '../services/index.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  // Formulaire de connexion
  signinForm = new FormGroup({
    email: new FormControl('', [Validators.email]),
    password: new FormControl('')
  });

  loading = false;
  recover = false;
  invalidCaptcha = true;
  recaptchaKey: string;

  constructor(private authenticationService: AuthenticationService,
    private router: Router,
    private snackBar: MatSnackBar,
    @Inject('recaptchaKey') private captchaKey: string,
    private indexService: IndexService) {
      this.recaptchaKey = captchaKey;
  }

  ngOnInit(): void {
  }

  setRecover() {
    this.recover = true;
  }

  resolved(captchaResponse: string) {
    this.invalidCaptcha = false;
  }

  /**
   * @description: Envoie l'appel API pour connecter un utilisateur
   */
  async submit(): Promise<void> {
    this.loading = true;

    let email = this.signinForm.get('email').value;

    if (!this.recover) {
      let password = this.signinForm.get('password').value;

      await this.authenticationService.signin(email, password).toPromise().then(result => {
        if (result) {
          if (result.succeeded) {
            // Retour à la page d'accueil
            this.router.navigateByUrl('/');
          }
          else {
            if (result.messages.length > 0) {
              result.messages.forEach(msg => {
                let msgToShow = "";
                switch(msg) {
                  case 'UserBanned':
                    msgToShow = 'Votre compte a été banni. Vous ne pouvez plus vous connecter. ¯\\_(ツ)_/¯';
                    break;

                  case 'AccountLocked':
                    msgToShow = 'Votre compte a été verrouillé.';
                    break;

                  case 'AccountNotAllowed':
                    msgToShow = 'Vous n\'êtes pas autorisé à vous connecter.';
                    break;

                  case 'WrongEmailOrPassword':
                    msgToShow = 'Adresse e-mail ou mot de passe incorrects.';
                    break;

                  case 'ConfirmationEmailResent':
                    msgToShow = 'Vous devez valider votre adresse e-mail pour continuer. Un mail de confirmation vous a été renvoyé.';
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
        }
      });
    }
    else {
      await this.indexService.askPasswordRecovery(email).toPromise().then(result => {
        // On valide quoiqu'il arrive par sécurité
          this.snackBar.open('Un e-mail de récupération a été envoyé à votre adresse e-mail.', 'Ok', {
            duration: 5000
          });
      })
    }

    this.loading = false;
  }
}
