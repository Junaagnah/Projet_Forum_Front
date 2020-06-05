import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { PostClient, PostViewModel } from './forumApiTypeScriptClient';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostService {
    forumApiUrl: string;

    // Tentatives d'appel avant erreur
    serviceConnectionRetries = 3;

    // On injecte l'url du service
    constructor(private httpClient: HttpClient, @Inject('forumApiUrl') private serviceUrl: string) {
        this.forumApiUrl = serviceUrl;
    }

    /**
     * @description Permet à l'utilisateur de créer un post
     */
    createPost(post: PostViewModel) {
        const client: PostClient = new PostClient(this.httpClient, this.forumApiUrl);
        return client.createPost(post).pipe(
            retry(this.serviceConnectionRetries),
            catchError(this.handleError)
        );
    }

  /**
   * @description Permet de récupérer un post via sa catégorie
   * @param postId
   * @param catId
   * @returns ResponseModel
   */
    getPostByCategory(postId: number, catId: number) {
        const client: PostClient = new PostClient(this.httpClient, this.forumApiUrl);
        return client.getPostByCategory(postId, catId).pipe(
          retry(this.serviceConnectionRetries),
          catchError(this.handleError)
        );
    }

  /**
   * @description Permet de supprimer un post
   * @param postId
   * @returns ResponseModel
   */
  deletePost(postId: number) {
      const client: PostClient = new PostClient(this.httpClient, this.forumApiUrl);
      return client.deletePost(postId).pipe(
        retry(this.serviceConnectionRetries),
        catchError(this.handleError)
      );
    }

  /**
   * @description Permet de mettre à jour un post
   * @param post
   * @returns ResponseModel
   */
  updatePost(post: PostViewModel) {
      const client: PostClient = new PostClient(this.httpClient, this.forumApiUrl);
      return client.updatePost(post).pipe(
        retry(this.serviceConnectionRetries),
        catchError(this.handleError)
      );
  }

  /**
   * @description Permet de supprimer l'image rattachée à un post
   * @param postId
   * @returns ResponseModel
   */
  deletePostImage(postId: number) {
    const client: PostClient = new PostClient(this.httpClient, this.forumApiUrl);
    return client.deletePostImage(postId).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    );
  }

  /**
   * @description Permet de récupérer les posts d'une catégorie avec pagination
   * @param catId
   * @param page
   * @returns ResponseModel
   */
  getPostsByCategoryWithPagination(catId: number, page: number) {
    const client: PostClient = new PostClient(this.httpClient, this.forumApiUrl);
    return client.getPostsByCategory(catId, page).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    )
  }

  handleError(errorResponse: HttpErrorResponse) {
      console.log(errorResponse);
      return throwError(errorResponse);
  }
}
