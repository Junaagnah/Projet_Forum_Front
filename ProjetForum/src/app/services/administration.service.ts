import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { AdministrationClient, UpdateProfileViewModel } from './forumApiTypeScriptClient';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root'})
export class AdministrationService {

  forumApiUrl: string;

  // Tentatives d'appel avant erreur
  serviceConnectionRetries = 3;

  // On injecte l'url du service
  constructor(private httpClient: HttpClient, @Inject('forumApiUrl') private serviceUrl: string) {
    this.forumApiUrl = serviceUrl;
  }

  /**
   * @description Permet à l'administrateur de récupérer les utilisateurs inscrits sur le forum
   * @param page
   * @param search
   * @param filter
   * @returns ResponseModel
   */
  getUsers(page: number, search: string = "", filter: number = 0) {
    const client: AdministrationClient = new AdministrationClient(this.httpClient, this.forumApiUrl);
    return client.getUsers(page, search, filter).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    )
  }

  /**
   * @description Permet à l'administrateur de modifier un profil utilisateur
   * @param username
   * @param data
   * @returns ResponseModel
   */
  editUser(username: string, data: UpdateProfileViewModel) {
    const client: AdministrationClient = new AdministrationClient(this.httpClient, this.forumApiUrl);
    return client.updateUser(username, data).pipe(
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
