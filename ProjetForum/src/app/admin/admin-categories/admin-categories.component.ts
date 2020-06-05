import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CategoryService } from "../../services/category.service";
import {CategoryModel} from "../../models/categoryModel";
import {PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss']
})
export class AdminCategoriesComponent implements OnInit {

  page: number = 0;
  count: number = 0;
  categories: Array<CategoryModel> = new Array<CategoryModel>();
  roles = {
    0: 'Tout le monde',
    1: 'Utilisateurs simples',
    2: 'Modérateurs',
    3: 'Administrateurs'
  }

  displayedColumns: string[] = [ 'name', 'description', 'role', 'editButton', 'delete' ]

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories() {
    this.categoryService.getCategoriesWithPagination(this.page).toPromise().then(response => {
      if (response.succeeded) {
        this.count = response.result.count;
        this.categories = response.result.categories;
      }
      else {
        this.router.navigateByUrl('/').then();
      }
    })
  }

  changePage(event?:PageEvent) {
    this.page = event.pageIndex;
    this.getCategories();
  }

  createCategory() {
    this.router.navigateByUrl('administration/createCategory').then();
  }

  editCategory(id: number) {
    this.router.navigateByUrl(`administration/editCategory/${id}`).then();
  }

  deleteCategory(id: number) {
    if (confirm('Êtes-vous sûr(e) de vouloir supprimer cette catégorie ?')) {
      this.categoryService.deleteCategory(id).toPromise().then(response => {
        if (response.succeeded) {
          this.snackBar.open('Catégorie supprimée avec succès', 'Ok', {
            duration: 5000
          });
          this.getCategories();
        }
        else {
          if (response.messages.length > 0) {
            response.messages.forEach(msg => {
              switch(msg) {
                case 'UserNotAuthorized':
                  this.router.navigateByUrl('/').then();
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
            this.snackBar.open('Une erreur inconnue est survenue', 'Ok', {
              duration: 5000
            });
          }
        }
      });
    }
  }
}
