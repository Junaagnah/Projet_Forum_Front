import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router} from "@angular/router";
import { Location } from "@angular/common";
import { CategoryViewModel } from "../../services/forumApiTypeScriptClient";
import { CategoryService } from "../../services/category.service";
import {FormControl, FormGroup} from "@angular/forms";
import {CategoryModel} from "../../models/categoryModel";

@Component({
  selector: 'app-admin-create-category',
  templateUrl: './admin-create-category.component.html',
  styleUrls: ['./admin-create-category.component.scss']
})
export class AdminCreateCategoryComponent implements OnInit {

  categoryForm = new FormGroup({
    name: new FormControl(''),
    description: new FormControl(''),
    role: new FormControl(0)
  });

  categoryId: number = 0;
  loading = false;
  roles = [
    {
      id: 0,
      name: 'Tout le monde'
    },
    {
      id: 1,
      name: 'Utilisateurs simples'
    },
    {
      id: 2,
      name: 'Modérateurs'
    },
    {
      id: 3,
      name: 'Administrateurs'
    }
  ];

  constructor(
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    let catId = this.route.snapshot.params.categoryId;

    if (catId !== null && catId !== undefined && catId !== '' && !isNaN(parseInt(catId))) {
      this.categoryId = parseInt(catId);
      this.getCategory();
    }
  }

  goBack() {
    this.location.back();
  }

  getCategory() {
    this.categoryService.getCategory(this.categoryId).toPromise().then(response => {
      if (response.succeeded) {
        let cat = response.result as CategoryModel;
        this.categoryForm.setValue({
          name: cat.name,
          description: cat.description,
          role: cat.role
        });
      }
      else {
        // Retour en arrière si on ne trouve pas la catégorie
        this.location.back();
      }
    })
  }

  submit() {
    this.loading = true;

    let category = new CategoryViewModel({
      name: this.categoryForm.get('name').value,
      description: this.categoryForm.get('description').value,
      role: this.categoryForm.get('role').value,
      id: this.categoryId
    });

    // Si id à 0, on crée une nouvelle catégorie
    if (category.id === 0) {
      this.categoryService.createCategory(category).toPromise().then(response => {
        if (response.succeeded) {
          this.snackBar.open('La catégorie a bien été créée', 'Ok', {
            duration: 5000
          });
          this.location.back();
        }
        else {
          if (response.messages.length > 0) {
            response.messages.forEach(msg => {
              switch(msg) {
                case 'UserNotAuthorized':
                  this.router.navigateByUrl('').then();
                  break;
                default:
                  this.snackBar.open(msg, 'Ok', {
                    duration: 5000
                  });
              }
            });
          }
          else {
            this.snackBar.open('Une erreur inconnue est survenue', 'Ok', {
              duration: 5000
            });
          }
        }

        this.loading = false;
      });
    }
    else {
      // Mise à jour de la catégorie
      this.categoryService.updateCategory(category).toPromise().then(response => {
        if (response.succeeded) {
          this.snackBar.open('La catégorie a bien été mise à jour', 'Ok', {
            duration: 5000
          });
          this.location.back();
        }
        else {
          if (response.messages.length > 0) {
            response.messages.forEach(msg => {
              switch(msg) {
                case 'UserNotAuthorized':
                  this.router.navigateByUrl('').then();
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
        this.loading = false;
      });
    }
  }

}
