import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import {CategoryClient, CategoryViewModel} from './forumApiTypeScriptClient';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {

  forumApiUrl: string;

  // Tentatives d'appel avant erreur
  serviceConnectionRetries = 3;

  // On injecte l'url du service
  constructor(private httpClient: HttpClient, @Inject('forumApiUrl') private serviceUrl: string) {
    this.forumApiUrl = serviceUrl;
  }

  /**
   * @description renvoie la liste des catégories
   * @returns ResponseModel
   */
  getCategories() {
    const client: CategoryClient = new CategoryClient(this.httpClient, this.forumApiUrl);
    return client.getCategories().pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    );
  }

  /**
   * @description Permet à l'administrateur de récupérer la liste des catégories
   * @param page
   * @returns ResponseModel
   */
  getCategoriesWithPagination(page: number) {
    const client: CategoryClient = new CategoryClient(this.httpClient, this.forumApiUrl);
    return client.getCategoriesWithPagination(page).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    );
  }

  /**
   * @description Permet à l'administrateur de supprimer une catégorie
   * @param id
   * @returns ResponseModel
   */
  deleteCategory(id: number) {
    const client: CategoryClient = new CategoryClient(this.httpClient, this.forumApiUrl);
    return client.deleteCategory(id).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    );
  }

  /**
   * @description Permet à l'administrateur de créer des catégories
   * @param data
   * @returns ResponseModel
   */
  createCategory(data: CategoryViewModel) {
    const client: CategoryClient = new CategoryClient(this.httpClient, this.forumApiUrl);
    return client.createCategory(data).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    );
  }

  /**
   * @description Permet de récupérer une catégorie via son id
   * @param id
   * @returns ResponseModel
   */
  getCategory(id: number) {
    const client: CategoryClient = new CategoryClient(this.httpClient, this.forumApiUrl);
    return client.getCategory(id).pipe(
      retry(this.serviceConnectionRetries),
      catchError(this.handleError)
    );
  }

  /**
   * @description Permet à l'administrateur de modifier une catégorie
   * @param category
   * @returns ResponseModel
   */
  updateCategory(category: CategoryViewModel) {
    const client: CategoryClient = new CategoryClient(this.httpClient, this.forumApiUrl);
    return client.updateCategory(category).pipe(
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
