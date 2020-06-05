import {Inject, Injectable} from '@angular/core';
import { NotificationClient } from './forumApiTypeScriptClient';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, retry} from "rxjs/operators";
import {throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  forumApiUrl: string;

  // Tentatives d'appel avant erreur
  serviceConnectionRetries = 3;

  constructor(private httpClient: HttpClient, @Inject('forumApiUrl') private serviceUrl: string) {
    this.forumApiUrl = serviceUrl;
  }

  /**
   * @description Permet de récupérer les notifications de l'utilisateur courant
   * @returns ResponseModel
   */
  getNotifications() {
    const client: NotificationClient = new NotificationClient(this.httpClient, this.forumApiUrl);
    return client.getNotifications().pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    )
  }

  /**
   * @description Permet de marquer les notifications de l'utilisateur courant comme lues
   * @returns ResponseModel
   */
  markAsRead() {
    const client: NotificationClient = new NotificationClient(this.httpClient, this.forumApiUrl);
    return client.markAsRead().pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    )
  }

  /**
   * @description Permet de supprimer une notification via son id
   * @param notificationId
   * @returns ResponseModel
   */
  deleteNotification(notificationId: number) {
    const client: NotificationClient = new NotificationClient(this.httpClient, this.forumApiUrl);
    return client.deleteNotification(notificationId).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    )
  }

  // Gestion des erreurs
  handleError(errorResponse: HttpErrorResponse) {
    console.log(errorResponse);
    return throwError(errorResponse);
  }
}
