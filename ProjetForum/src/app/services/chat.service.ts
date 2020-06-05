import {EventEmitter, Inject, Injectable} from "@angular/core";
import { HubConnection, HubConnectionBuilder } from "@aspnet/signalr";
import { Message } from "../models/message";
import * as signalR from '@aspnet/signalr';
import { AuthenticationService } from "./authentication.service";

@Injectable({ providedIn: 'root' })
export class ChatService {
  messageReceived = new EventEmitter<Message>();
  deleteMessage = new EventEmitter<Message>();
  receiveMessages = new EventEmitter<Array<Message>>();
  connectionEstablished = new EventEmitter<boolean>();

  user;
  subuser;

  public connectionIsEstablished = false;
  private _hubConnection: HubConnection;

  constructor(
    private authenticationService: AuthenticationService,
    @Inject('forumApiUrl') private serviceUrl: string) {

    this.user = this.authenticationService.currentUserValue;
    this.subuser = this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });

    this.createConnection();
    this.registerOnServerEvents();
    this.startConnection();
  }

  sendMessage(message: Message) {
    this._hubConnection.invoke('SendMessage', message).then();
  }

  deleteMessageInvoke(msg: Message) {
    this._hubConnection.invoke('DeleteMessage', msg).then();
  }

  getMessagesInvoke() {
    this._hubConnection.invoke('GetMessages').then();
  }

  private createConnection() {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(this.serviceUrl + "/chatHub", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => this.user.token
      })
      .build();
  }

  private startConnection(): void {
    this._hubConnection
      .start()
      .then(() => {
        this.connectionIsEstablished = true;
        this.connectionEstablished.emit(true);
      })
      .catch(err => {
        console.log("Error while establishing connection, retrying...");
        console.log(err);
        setTimeout(() => { this.startConnection() }, 5000);
      });
  }

  private registerOnServerEvents() : void {
    this._hubConnection.on('MessageReceived', (data: any) => {
      this.messageReceived.emit(data);
    });
    this._hubConnection.on('DeleteMessage', (data: any) => {
      this.deleteMessage.emit(data);
    });
    this._hubConnection.on('ReceiveMessages', (data: any) => {
      this.receiveMessages.emit(data);
    })
  }

}
