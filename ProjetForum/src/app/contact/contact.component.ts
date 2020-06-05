import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IndexService } from '../services/index.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  // Formulaire de contact
  contactForm = new FormGroup({
    email: new FormControl('', [Validators.email]),
    message: new FormControl('')
  });

  loading = false;
  invalidCaptcha = true;
  recaptchaKey: string;

  constructor(private indexService: IndexService, private snackBar: MatSnackBar, @Inject('recaptchaKey') private captchaKey: string) {
    this.recaptchaKey = captchaKey;
   }

  ngOnInit(): void {
  }

  resolved(captchaResponse: string) {
    this.invalidCaptcha = false;
  }

  async submit(): Promise<void> {
    this.loading = true;

    let email = this.contactForm.get('email').value;
    let message = this.contactForm.get('message').value;

    await this.indexService.contact(email, message).toPromise().then(response => {
      if (response.succeeded) {
        // On vide les champs
        this.contactForm.setValue({
          email: "",
          message: ""
        });

        this.snackBar.open('Votre message a bien été envoyé.', 'Ok', {
          duration: 5000
        });
      }
      else {
        if (response.messages.length > 0) {
          response.messages.forEach(msg => {
            switch (msg) {
              case 'InvalidEmailFormat':
                this.snackBar.open('Le format de l\'adresse e-mail est invalide.', 'Ok', {
                  duration: 5000
                });
                break;

              case 'EmailNotSent':
                this.snackBar.open('Le message n\'a pas pu être envoyé. Veuillez réessayer.', 'Ok', {
                  duration: 5000
                });
                break;

              default:
                this.snackBar.open(msg, 'Ok', {
                  duration: 5000
                });
            }
          });
        }
        else {
          this.snackBar.open('Une erreur inconnue est survenue', 'Ok', {
            duration: 5000
          });
        }
      }
    })
    this.loading = false;
  }
}
