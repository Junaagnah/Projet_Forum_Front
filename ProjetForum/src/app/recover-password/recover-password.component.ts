import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormGroupDirective, NgForm, AbstractControl, ValidatorFn } from '@angular/forms';
import { IndexService } from '../services/index.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent implements OnInit {
  // Expression régulières permettant de vérifier le mot de passe
  regexp: RegexpAndErrorName[] = [
    { regex: new RegExp('^(?=.*[a-z])'), errorName: 'lowercase' },
    { regex: new RegExp('^(?=.*[A-Z])'), errorName: 'uppercase' },
    { regex: new RegExp('^(?=.*[0-9])'), errorName: 'number' },
    { regex: new RegExp('^(?=.*[!@#$%^&*.])'), errorName: 'specialCharacter' },
    { regex: new RegExp('^(?=.{8,})'), errorName: 'length' },
  ];

  matcher = new MyErrorStateMatcher();
  id = null;
  token = null;
  success = false;
  loading = false;
  error = false;

  recoverForm = new FormGroup({
    password: new FormControl('', this.multiRegexValidator(this.regexp)),
    confirmPassword: new FormControl('')
  }, this.checkPasswords);

  constructor(private indexService: IndexService, private route: ActivatedRoute, private snackBar: MatSnackBar) {
  }

  async ngOnInit(): Promise<void> {
    let id = this.route.snapshot.queryParamMap.get('id');
    let token = this.route.snapshot.queryParamMap.get('token');

    if (id === null || id === "" || token === null || token === "") this.error = true;
    else {
      this.id = id;
      this.token = token;
    }
  }

  async submit(): Promise<void> {
    this.loading = true;

    let password = this.recoverForm.get('password').value;

    await this.indexService.recoverPassword(this.id, password, this.token).toPromise().then(result => {
      if (result.succeeded) {
        this.success = true;
      }
      else {
        this.error = true;

        if (result.messages.length > 0) {
          result.messages.forEach(msg => {
            switch(msg) {
              case 'InvalidToken':
                this.snackBar.open('Token invalide.', 'Ok', {
                  duration: 5000
                });
                break;
              default:
                this.snackBar.open('Une erreur inconnue est survenue.', 'Ok', {
                  duration: 5000
                });
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

    this.loading = false;
  }

  /**
   * @description: Vérifie si les mots de passe sont égaux
   */
  checkPasswords(group: FormGroup): any {
    const password = group.get('password').value;
    const confirmPassword = group.get('confirmPassword').value;
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
