import {Component, NgZone, OnInit} from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Message } from '../../models/message';
import { ChatService } from '../../services/chat.service';
import {FormControl, FormGroup} from "@angular/forms";
import { AuthenticationService } from "../../services/authentication.service";
import { ProfileService } from "../../services/profile.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  username: string;
  messages = new Array<Message>();
  message = new Message();

  subMessageReceived;
  subDeleteMessage;
  subReceiveMessages;
  subConnectionEstablished;

  user = null;
  subUser;

  messageForm = new FormGroup({
    message: new FormControl('')
  });

  roleColors = {
    1: "#2196F3",
    2: "#2E7D32",
    3: "#F44336"
  };

  constructor(
    private chatService: ChatService,
    private ngZone: NgZone,
    private authenticationService: AuthenticationService,
    private profileService: ProfileService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.username = localStorage.getItem('username');
  }

  ngOnInit(): void {
    this.subscribeToEvents();
    if(this.chatService.connectionIsEstablished) this.chatService.getMessagesInvoke();
    this.user = this.authenticationService.currentUserValue;
    this.subUser = this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
  }

  ngOnDestroy() {
    this.unsubscribeToEvents();
  }

  sendMessage(): void {
    if (this.messageForm.get('message').value !== "") {
      this.message = new Message();
      this.message.message = this.messageForm.get('message').value;
      this.message.date = new Date();
      this.chatService.sendMessage(this.message);
      this.messageForm.get('message').setValue('');
    }
  }

  banUser(username: string) {
    if (confirm("Êtes-vous sûr(e) de vouloir bannir cet utilisateur ?")) {
      this.profileService.updateUserBan(username, true).toPromise().then(response => {
        if (response.succeeded) {
          this.snackBar.open('L\'utilisateur a bien été banni.', 'Ok', {
            duration: 5000
          });
        } else {
          if (response.messages.length > 0) {
            response.messages.forEach(msg => {
              let msgToShow = "";
              switch (msg) {
                case 'UserNotAuthorized':
                  msgToShow = "Vous n'êtes pas autorisé à effectuer cette action.";
                  break;
                case 'UserNotFound':
                  msgToShow = "L'utilisateur que vous essayez de mettre à jour n'existe pas.";
                  break;
                default:
                  msgToShow = msg;
                  break;
              }

              this.snackBar.open(msgToShow, 'Ok', {
                duration: 5000
              });
            });
          } else {
            this.snackBar.open('Une erreur inconnue est survenue.', 'Ok', {
              duration: 5000
            });
          }
        }
      });
    }
  }

  deleteMessage(msg: Message): void {
    if (confirm("Êtes-vous sûr(e) de vouloir supprimer ce message ?")) {
      if (msg !== null && msg !== undefined) {
        this.chatService.deleteMessageInvoke(msg);
      }
    }
  }

  updateScroll () {
    let element = document.getElementById('history');
    element.scrollTop = element.scrollHeight;
  }

  private subscribeToEvents(): void {
    this.subMessageReceived = this.chatService.messageReceived.subscribe((message: Message) => {
      this.ngZone.run(() => {
        this.messages.push(message);
        // On set un timeout pour appeler la fonction uniquement quand le message a bien été ajouté
        setTimeout(() => this.updateScroll(), 1);
      });
    });
    this.subDeleteMessage = this.chatService.deleteMessage.subscribe((message: Message) => {
      this.ngZone.run(() => {
        this.messages.forEach(msg => {
          if (msg.username === message.username && msg.message === message.message && msg.date === message.date) {
            msg.message = "Ce message a été supprimé.";
          }
        });
      });
    });
    this.subReceiveMessages = this.chatService.receiveMessages.subscribe((messages: Array<Message>) => {
      this.ngZone.run(() => {
        this.messages = messages;
        setTimeout(() => this.updateScroll(), 1);
      });
    });
    this.subConnectionEstablished = this.chatService.connectionEstablished.subscribe((isEstablished: boolean) => {
      this.ngZone.run(() => {
        if (isEstablished) this.chatService.getMessagesInvoke();
      });
    });
  }

  unsubscribeToEvents() {
    this.subMessageReceived.unsubscribe();
    this.subDeleteMessage.unsubscribe();
    this.subReceiveMessages.unsubscribe();
    this.subConnectionEstablished.unsubscribe();
  }

  navigateToProfile(username: string) {
    this.router.navigateByUrl(`profile/view/${username}`);
  }

}
