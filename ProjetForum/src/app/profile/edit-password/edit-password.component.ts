import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormGroupDirective, NgForm, AbstractControl, ValidatorFn } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-password',
  templateUrl: './edit-password.component.html',
  styleUrls: ['./edit-password.component.scss']
})
export class EditPasswordComponent implements OnInit {

  // Expression régulières permettant de vérifier le mot de passe
  regexp: RegexpAndErrorName[] = [
    { regex: new RegExp('^(?=.*[a-z])'), errorName: 'lowercase' },
    { regex: new RegExp('^(?=.*[A-Z])'), errorName: 'uppercase' },
    { regex: new RegExp('^(?=.*[0-9])'), errorName: 'number' },
    { regex: new RegExp('^(?=.*[!@#$%^&*.])'), errorName: 'specialCharacter' },
    { regex: new RegExp('^(?=.{8,})'), errorName: 'length' },
  ];

  editPasswordForm = new FormGroup({
    oldPassword: new FormControl(''),
    newPassword: new FormControl('', this.multiRegexValidator(this.regexp)),
    newPasswordConfirm: new FormControl('')
  }, this.checkPasswords)

  loading = false;
  matcher = new MyErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<EditPasswordComponent>, private snackBar: MatSnackBar, private profileService: ProfileService) { }

  ngOnInit(): void {
  }

  submit(): void {
    this.loading = true;
    let oldPassword = this.editPasswordForm.get('oldPassword').value;
    let newPassword = this.editPasswordForm.get('newPassword').value;

    this.profileService.updateSelfPassword(oldPassword, newPassword).toPromise().then(result => {
      if (result.succeeded) {
        this.snackBar.open('Votre mot de passe a bien été modifié.', 'Ok', {
          duration: 5000
        });
        this.dialogRef.close();
      }
      else {
        if (result.messages.length > 0) {
          result.messages.forEach(msg => {
            switch(msg) {
              case 'PasswordMismatch':
                this.snackBar.open('Mot de passe invalide.', 'Ok', {
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

      this.loading = false;
    });
  }

  close() {
    this.dialogRef.close();
  }


   /**
   * @description: Vérifie si les mots de passe sont égaux
   */
  checkPasswords(group: FormGroup): any {
    const password = group.get('newPassword').value;
    const confirmPassword = group.get('newPasswordConfirm').value;
    return password === confirmPassword ? null : { notSame: true };
  }

  /**
   * @description: Effectue les vérifications d'expressions régulières sur les mots de passe
   */
  multiRegexValidator(regexpAndErrorNameArray: RegexpAndErrorName[]): ValidatorFn {
    return (control: AbstractControl): { [key: string ]: any } => {
      if (!control.value) {
        return null;
      }
      let valid = true;
      let errorName;
      regexpAndErrorNameArray.forEach(regexpAndErrorName => {
        if (valid) {
          valid = regexpAndErrorName.regex.test(control.value);
          errorName = regexpAndErrorName.errorName;
        }
      });
      return valid ? null : { [errorName]: true }
    };
  }
}

/**
 * @description: renvoie true s'il y a des erreurs dans le formulaire
 */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty && control.touched);
    const invalidParent = !!(control && control.parent && control.parent.hasError('notSame') && control.parent.dirty && control.touched);

    return (invalidCtrl || invalidParent);
  }
}

export class RegexpAndErrorName {
  regex: RegExp;
  errorName: string;
}
