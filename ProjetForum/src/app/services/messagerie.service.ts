import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { ConversationClient, MessageViewModel } from './forumApiTypeScriptClient';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessagerieService {

  forumApiUrl: string;

  // Tentatives d'appel avant erreur
  serviceConnectionRetries = 3;

  // On injecte l'url du service
  constructor(private httpClient: HttpClient, @Inject('forumApiUrl') private serviceUrl: string) {
    this.forumApiUrl = serviceUrl;
  }

  /**
   * @description Permet de récupérer les conversations d'un utilisateur
   * @returns ResponseModel
   */
  getConversations() {
    const client: ConversationClient = new ConversationClient(this.httpClient, this.forumApiUrl);
    return client.getConversations().pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    );
  }

  /**
   * @description Permet d'envoyer un message
   * @param msg
   * @returns ResponseModel
   */
  sendMessage(msg: MessageViewModel) {
    const client: ConversationClient = new ConversationClient(this.httpClient, this.forumApiUrl);
    return client.createMessage(msg).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    );
  }

  /**
   * @description Permet à un utilisateur de supprimer un message via son id
   * @param msgId
   * @returns ResponseModel
   */
  deleteMessage(msgId: number) {
    const client: ConversationClient = new ConversationClient(this.httpClient, this.forumApiUrl);
    return client.deleteMessage(msgId).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    );
  }

  getMessages(convId: number) {
    const client: ConversationClient = new ConversationClient(this.httpClient, this.forumApiUrl);
    return client.getMessages(convId).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    );
  }

  // Gestion des erreurs
  handleError(errorResponse: HttpErrorResponse) {
    console.log(errorResponse);
    return throwError(errorResponse);
  }
}
