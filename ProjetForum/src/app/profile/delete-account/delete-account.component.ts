import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService } from '../../services/profile.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.scss']
})
export class DeleteAccountComponent implements OnInit {

  deleteForm = new FormGroup({
    password: new FormControl('')
  })

  loading = false;

  constructor(private dialogRef: MatDialogRef<DeleteAccountComponent>, private profileService: ProfileService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  submit() {
    let password = this.deleteForm.get('password').value;

    this.profileService.deleteSelfAccount(password).toPromise().then(result => {
      if (result.succeeded) {
        // La suppression a fonctionné, on vide le localStorage et on recharge la page
        // L'utilisateur sera automatiquement redirigé vers la page d'accueil
        localStorage.clear();
        window.location.reload();
      }
      else {
        if (result.messages.length > 0) {
          result.messages.forEach(msg => {
            switch(msg) {
              case 'IncorrectPassword':
                this.snackBar.open('Le mot de passe renseigné est incorrect.', 'Ok', {
                  duration: 5000
                });
                break;

              default:
                this.snackBar.open(msg, 'Ok', {
                  duration: 5000
                });
                break;
            }
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

  close() {
    this.dialogRef.close();
  }
}
