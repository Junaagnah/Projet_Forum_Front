import {Component, Inject, OnInit} from '@angular/core';
import { MessageViewModel } from "../../services/forumApiTypeScriptClient";
import { MessagerieService } from "../../services/messagerie.service";
import { MessageModel } from "../../models/messageModel";
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatSnackBar } from "@angular/material/snack-bar";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class ConversationComponent implements OnInit {

  messages: Array<MessageModel> = new Array<MessageModel>();
  currentUsername: string;
  currentConvId: number;
  forumApiUrl: string;
  loading = false;
  contactId: string;

  answerForm = new FormGroup({
    message: new FormControl('')
  });

  constructor(private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private router: Router,
              private messagerieService: MessagerieService,
              private location: Location,
              @Inject('forumApiUrl') private serviceUrl: string) { }

  ngOnInit(): void {
    this.forumApiUrl = this.serviceUrl;
    this.currentUsername = localStorage.getItem('username');
    this.currentConvId = parseInt(this.route.snapshot.params.conversationId);

    this.getMessages();
  }

  getMessages() {
    this.messagerieService.getMessages(this.currentConvId).toPromise().then(response => {
      if (response.succeeded) {
        this.messages = response.result;

        this.messages.forEach(msg => {
          msg.dateString = new Date(msg.date).toLocaleDateString() + " " + new Date(msg.date).toLocaleTimeString();
          this.setContactId((msg.senderProfile.username === this.currentUsername ? msg.receiver : msg.sender));
        });

        setTimeout(this.scrollToBottom, 1);
      }
      else {
        if (response.messages.length > 0) {
          response.messages.forEach(msg => {
            switch(msg) {
              case 'ConversationNotFound':
              case 'UserNotAuthorized':
                // Si la conversation n'est pas trouvée, c'est que l'utilisateur n'y participe pas ou qu'elle n'existe pas donc on renvoie sur l'accueil
                this.router.navigateByUrl('/');
                break;
              case 'NoMessageFound':
                this.snackBar.open("Il n'y a aucun message dans cette conversation.", 'Ok', {
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

  scrollToBottom = () => {
    let container = document.getElementById("conv-container");
    container.scrollTop = container.scrollHeight;
  };

  goToProfile(username: string) {
    this.router.navigateByUrl(`/profile/view/${username}`).then();
  }

  answer() {
    this.loading = true;
    let messageContent = this.answerForm.get('message').value;
    let msg = new MessageViewModel();

    msg.conversation = this.currentConvId;
    msg.receiverId = this.contactId;
    msg.content = messageContent;

    this.messagerieService.sendMessage(msg).toPromise().then(response => {
      if (response.succeeded) {
        window.location.reload();
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

  deleteMessage(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      this.messagerieService.deleteMessage(id).toPromise().then(response => {
        if (response.succeeded) {
          window.location.reload();
        }
        else {
          if (response.messages.length > 0) {
            response.messages.forEach(msg => {
              let msgToShow = "";
              switch (msg) {
                case 'MessageNotFound':
                  msgToShow = 'Le message que vous essayez de supprimer n\'existe pas.';
                  break;
                case 'UserNotAuthorized':
                  msgToShow = 'Vous n\'avez pas le droit de supprimer ce message.';
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
      });
    }
  }

  goBack() {
    this.location.back();
  }

  getFlexDirection(username: string) {
    return username === this.currentUsername ? "row-reverse" : "row";
  }

  setContactId(id: string) {
    this.contactId = id;
  }
}
