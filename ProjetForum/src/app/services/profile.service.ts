import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { UserClient, UpdateProfileViewModel } from './forumApiTypeScriptClient';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
    forumApiUrl: string;

    // Tentatives d'appel avant erreur
    serviceConnectionRetries = 3;

    // On injecte l'url du service
    constructor(private httpClient: HttpClient, @Inject('forumApiUrl') private serviceUrl: string) {
        this.forumApiUrl = serviceUrl;
    }

    /**
     * @description Récupère le profil de l'utilisateur courant
     */
    getSelfProfile() {
        const client: UserClient = new UserClient(this.httpClient, this.forumApiUrl);
        return client.getSelfProfile().pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        );
    }

    /**
     * @description Permet à un utilisateur de récupérer le profil d'un autre utilisateur via son username
     * @param username
     */
    getUserProfile(username: string) {
        const client:UserClient = new UserClient(this.httpClient, this.forumApiUrl);
        return client.getUserProfile(username).pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        )
    }

    /**
     * @description Permet à un utilisateur de modifier son mot de passe
     * @param oldPassword
     * @param newPassword
     */
    updateSelfPassword(oldPassword: string, newPassword: string) {
        const client: UserClient = new UserClient(this.httpClient, this.forumApiUrl);
        return client.updateSelfPassword(oldPassword, newPassword).pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        );
    }

    /**
     * @description Permet à un utilisateur de modifier son profil
     * @param data
     */
    updateSelfProfile(data: UpdateProfileViewModel) {
        const client: UserClient = new UserClient(this.httpClient, this.forumApiUrl);
        return client.updateSelfProfile(data).pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        );
    }

    /**
     * @description Permet à l'utilisateur de supprimer son compte
     * @param password
     */
    deleteSelfAccount(password: string) {
        const client: UserClient = new UserClient(this.httpClient, this.forumApiUrl);
        return client.deleteSelfProfile(password).pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        )
    }

  /**
   * @description Permet de mettre à jour le statut banni d'un utilisateur
   * @param username
   * @param isBanned
   * @returns ResponseModel
   */
  updateUserBan(username: string, isBanned: boolean) {
      const client: UserClient = new UserClient(this.httpClient, this.forumApiUrl);
      return client.updateUserBan(username, isBanned).pipe(
        retry(this.serviceConnectionRetries),
        catchError(this.handleError)
      );
  }

  /**
   * @description Permet de rechercher un utilisateur via son nom d'utilisateur
   * @param username
   * @returns ResponseModel
   */
  searchUser(username: string) {
      const client: UserClient = new UserClient(this.httpClient, this.forumApiUrl);
      return client.searchUser(username).pipe(
        retry(this.serviceConnectionRetries),
        catchError(this.handleError)
      )
    }

    handleError(errorResponse: HttpErrorResponse) {
        console.log(errorResponse);
        return throwError(errorResponse);
    }
}
