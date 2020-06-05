import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IndexService } from '../services/index.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  user = null;
  subUser;
  data = null;

  constructor(private indexService: IndexService, private snackBar: MatSnackBar, private authenticationService: AuthenticationService) {
    this.user = authenticationService.currentUserValue;
    this.subUser = authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getCategories();
  }

  async getCategories() {
    this.indexService.index().toPromise().then(result => {
      if (result.succeeded) {
        this.data = result.result;
      }
      else {
        this.snackBar.open('Impossible de récupérer les catégories depuis le serveur', 'Ok', {
          duration: 5000
        });
      }
    });
  }

}
