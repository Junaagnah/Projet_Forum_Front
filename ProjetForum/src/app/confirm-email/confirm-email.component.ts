import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IndexService } from '../services/index.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent implements OnInit {

  loading = true;
  confirmed = false;

  constructor(private indexService: IndexService, private route: ActivatedRoute, private snackBar: MatSnackBar ) {
  }

  async ngOnInit(): Promise<void> {
    // Récupération de l'userId et du token de validation via l'url
    let id = this.route.snapshot.queryParamMap.get("id");
    let token = this.route.snapshot.queryParamMap.get("token");

    await this.validateEmail(id, token);
  }

  async validateEmail(id: string, token: string): Promise<void> {
    if (id !== null && token !== null) {
      await this.indexService.confirmEmail(id, token).toPromise().then(result => {
        this.loading = false;
        if (result.succeeded) {
          this.confirmed = true;
        }
        else {
          // Si échec et qu'il y a des messages d'erreur, on les affiche (sinon message par défaut)
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
            this.snackBar.open("Une erreur inconnue est survenue.", "Ok", {
              duration: 5000
            });
          }
        }
      });
    }
    else {
      this.loading = false;
      this.snackBar.open("Paramètres de validation incorrects", "Ok", {
        duration: 5000
      });
    }
  }
}
