import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from "@angular/material/snack-bar";
import { MessagerieService } from "../services/messagerie.service";
import {ConversationModel} from "../models/conversationModel";

@Component({
  selector: 'app-messagerie',
  templateUrl: './messagerie.component.html',
  styleUrls: ['./messagerie.component.scss']
})
export class MessagerieComponent implements OnInit {

  conversations: Array<ConversationModel> = new Array<ConversationModel>();

  constructor(private messagerieService: MessagerieService,
              private snackBar: MatSnackBar,
              private router: Router) { }

  ngOnInit(): void {
    this.getConversations();
  }

  getConversations() {
    this.messagerieService.getConversations().toPromise().then(response => {
      if (response.succeeded) {
        this.conversations = response.result;
      }
      else {
        this.snackBar.open('Une erreur inconnue est survenue', 'Ok', {
          duration: 5000
        })
      }
    });
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }
}
