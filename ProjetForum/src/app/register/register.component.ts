import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm, ValidatorFn, AbstractControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IndexService } from '../services/index.service';
import { RegisterViewModelBuilder } from '../viewModelBuilders/registerViewModelBuilder';
import { RegisterViewModel } from '../services/forumApiTypeScriptClient';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  // Expression régulières permettant de vérifier le mot de passe
  regexp: RegexpAndErrorName[] = [
    { regex: new RegExp('^(?=.*[a-z])'), errorName: 'lowercase' },
    { regex: new RegExp('^(?=.*[A-Z])'), errorName: 'uppercase' },
    { regex: new RegExp('^(?=.*[0-9])'), errorName: 'number' },
    { regex: new RegExp('^(?=.*[!@#$%^&*.])'), errorName: 'specialCharacter' },
    { regex: new RegExp('^(?=.{8,})'), errorName: 'length' },
  ];

  // Formulaire d'enregistrement
  registerForm = new FormGroup({
    username: new FormControl(''),
    email: new FormControl('', [Validators.email]),
    password: new FormControl('', this.multiRegexValidator(this.regexp)),
    confirmPassword: new FormControl('')
  }, this.checkPasswords);

  matcher = new MyErrorStateMatcher();
  loading = false;
  invalidRecaptcha = true;
  recaptchaKey: string;

  successfullyCreatedAccount = false;

  constructor(private indexService: IndexService, private snackBar: MatSnackBar, @Inject('recaptchaKey') private captchaKey: string) {
    this.recaptchaKey = captchaKey;
  }

  ngOnInit(): void {
  }

  resolved(captchaResponse: string) {
    this.invalidRecaptcha = false;
  }

  /**
   * @description: Fonction permettant d'enregistrer un utilisateur en base de données
   */
  async submit(): Promise<void> {
    this.loading = true;

    const newUser: RegisterViewModel = new RegisterViewModelBuilder(
      this.registerForm.get('username').value,
      this.registerForm.get('email').value,
      this.registerForm.get('password').value
    ) as RegisterViewModel;

    await this.indexService.register(newUser).toPromise().then(result => {
      if (result.succeeded) {
        this.successfullyCreatedAccount = true;
      }
      else {
        if (result.messages.length > 0) {
          result.messages.forEach(msg => {
            switch(msg) {
              case 'DuplicateUserName':
                this.registerForm.get('username').setErrors({
                  usernameNotUnique: true
                });
                break;
  
              case 'DuplicateEmail':
                this.registerForm.get('email').setErrors({
                  emailNotUnique: true
                });
                break;
  
              case 'EmailNotSent':
                this.snackBar.open('L\'email de confirmation n\'a pas pu être envoyé. Veuillez réessayer.', 'Ok', {
                  duration: 5000
                });
              break;
  
              default:
                // Si aucun des messages d'erreur ci-dessus, on l'affiche dans une snackbar
                this.snackBar.open(msg, "Ok", {
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