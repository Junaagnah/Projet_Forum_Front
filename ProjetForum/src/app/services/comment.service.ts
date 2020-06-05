import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { CommentClient, CommentViewModel } from './forumApiTypeScriptClient';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root'})
export class CommentService {

  forumApiUrl: string;

  // Tentatives d'appel avant erreur
  serviceConnectionRetries = 3;

  // On injecte l'url du service
  constructor(private httpClient: HttpClient, @Inject('forumApiUrl') private serviceUrl: string) {
    this.forumApiUrl = serviceUrl;
  }

  /**
   * @description permet de récupérer un commentaire
   * @param commentId
   * @returns MyResponse
   */
  getComment(commentId: number) {
    const client: CommentClient = new CommentClient(this.httpClient, this.forumApiUrl);
    return client.getComment(commentId).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    )
  }

  /**
   * @description permet de répondre à un post
   * @param comment
   * @returns MyResponse
   */
  createComment(comment: CommentViewModel) {
    const client: CommentClient = new CommentClient(this.httpClient, this.forumApiUrl);
    return client.addComment(comment).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    );
  }

  /**
   * @description permet de supprimer un commentaire
   * @param commentId
   * @returns MyResponse
   */
  deleteComment(commentId: number) {
    const client: CommentClient = new CommentClient(this.httpClient, this.forumApiUrl);
    return client.deleteComment(commentId).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    )
  }

  /**
   * @description Permet de modifier un commentaire
   * @param comment
   * @returns MyResponse
   */
  editComment(comment: CommentViewModel) {
    const client: CommentClient = new CommentClient(this.httpClient, this.forumApiUrl);
    return client.editComment(comment).pipe(
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
