import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserModel } from "../../models/userModel";
import { ProfileService } from "../../services/profile.service";
import { MessageViewModel } from "../../services/forumApiTypeScriptClient";
import { MessagerieService } from "../../services/messagerie.service";
import {Profiler} from "inspector";

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss']
})
export class NewMessageComponent implements OnInit {

  newMessageForm = new FormGroup({
    user: new FormControl(''),
    userSearch: new FormControl(''),
    content: new FormControl('')
  });

  loading = false;
  users: Array<UserModel> = new Array<UserModel>();
  selectedUserId: string;

  constructor(private router: Router,
              private location: Location,
              private profileService: ProfileService,
              private snackBar: MatSnackBar,
              private messagerieService: MessagerieService) { }

  ngOnInit(): void {
  }

  goBack() {
    this.location.back();
  }

  submit() {
    this.loading = true;
    let msgUser = this.newMessageForm.get('user').value;
    let msgContent = this.newMessageForm.get('content').value;

    let msg: MessageViewModel = new MessageViewModel();
    msg.receiverId = msgUser;
    msg.content = msgContent;
    msg.conversation = 0;

    this.messagerieService.sendMessage(msg).toPromise().then(response => {
      if (response.succeeded) {
        this.router.navigateByUrl(`messagerie/conversation/${response.result}`);
      }
      else {
        if (response.messages.length > 0) {
          response.messages.forEach(msg => {
            let msgToShow = "";
            switch(msg) {
              case 'ConversationNotCreated':
                msgToShow = 'Impossible de créer la conversation.';
                break;
              case 'MessageNotCreated':
                msgToShow = 'Impossible d\'envoyer le message.';
                break;
            }

            this.snackBar.open(msgToShow, 'Ok', {
              duration: 5000
            });
          })
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

  searchUser() {
    let username = this.newMessageForm.get('userSearch').value;

    if (username !== "") {
      this.profileService.searchUser(username).toPromise().then(response => {
        if (response.succeeded) {
          this.users = response.result;
        }
        else {
          this.snackBar.open('Impossible de récupérer la liste des utilisateurs pour l\'instant.', 'Ok', {
            duration: 5000
          });
        }
      })
    }
    else {
      this.users = new Array<UserModel>();
    }
  }

}
