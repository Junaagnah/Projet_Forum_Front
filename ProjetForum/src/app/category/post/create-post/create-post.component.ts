import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PostService } from '../../../services/post.service';
import { CategoryService } from '../../../services/category.service';
import { PostViewModel } from '../../../services/forumApiTypeScriptClient';
import { CategoryModel } from '../../../models/categoryModel';
import { ActivatedRoute, Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {ChangeEvent, CKEditorComponent} from '@ckeditor/ckeditor5-angular';
import {FileValidator} from "ngx-material-file-input";

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss']
})
export class CreatePostComponent implements OnInit {

  readonly maxSize = 2097152;

  @ViewChild( 'editorComponent' ) editorComponent: CKEditorComponent;

  postForm = new FormGroup({
    title: new FormControl(''),
    body: new FormControl(''),
    locked: new FormControl(false),
    category: new FormControl(''),
    image: new FormControl('', [FileValidator.maxContentSize(this.maxSize)]),
    imageValue: new FormControl('')
  });

  editor;
  config = {
    placeholder: 'Corps du message',
    toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedlist', '|', 'undo', 'redo' ]
  }
  loading = false;
  categoryId;
  postId;
  post: PostViewModel;
  categories: Array<CategoryModel> = new Array<CategoryModel>();
  imgUrl;
  selectedCategory = 1; // Catégorie sélectionnée par défaut

  constructor(private postService: PostService,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private router: Router,
              private categoryService: CategoryService,
              private location: Location,
              @Inject('forumApiUrl') private serviceUrl: string) {
    this.categoryId = this.route.snapshot.params.categoryId;
    this.postId = this.route.snapshot.params.postId;

    if (this.categoryId === null || this.categoryId === undefined) this.router.navigateByUrl('');
    // Si on récupère un postId, c'est qu'on veut le modifier

    this.editor = ClassicEditor;
  }

  ngOnInit(): void {
    this.getCategories();

    if(this.postId !== null && this.postId !== undefined) {
      // On passe la fonction getCategories en callback pour s'assurer qu'elle soit bien appelée après que le post ai été récupéré
      this.getPost(this.getCategories);
    }
  }

  getPost(callback: Function) {
    this.postService.getPostByCategory(this.postId, this.categoryId).toPromise().then(result => {
      if (result.succeeded) {
        let post: PostViewModel = result.result;
        this.post = post;
        if (this.post.image !== null && this.post.image !== undefined) this.imgUrl = `${this.serviceUrl}/${post.image}`;

        callback();

        this.postForm.get('title').setValue(post.title);
        this.postForm.get('body').setValue(post.body);
        this.postForm.get('locked').setValue(post.locked);

        // On récupère l'instance de l'éditeur et on set son contenu
        let editor = this.editorComponent.editorInstance;
        editor.setData(post.body);
      }
      else {
        if (result.messages.length > 0) {
          result.messages.forEach(msg => {
            switch(msg) {
              case 'PostNotFound':
                this.snackBar.open('Le post que vous voulez modifier n\'existe pas.', 'Ok', {
                  duration: 5000
                });
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
    });
  }

  getCategories = () => {
    this.categoryService.getCategories().toPromise().then(response => {
      if (response.succeeded) {
        this.categories = response.result;
        this.categories.forEach(cat => {
          if (cat.id == this.categoryId) this.postForm.get('category').setValue(cat.id);
        })
      }
      else {
        this.snackBar.open('Impossible de récupérer les catégories. Veuillez réessayer.', 'Ok', {
          duration: 5000
        });
      }
    })
  }

  // Permet de récupérer la valeur du ckeditor
  editorChange({ editor }: ChangeEvent) {
    let editorData = editor.getData();
    this.postForm.get('body').setValue(editorData);
  }

  // Crée le post
  submit() {
    this.loading = true;
    let pictureData = this.postForm.get('imageValue').value;

    if (this.postId != null) {
      this.post.title = this.postForm.get('title').value;
      this.post.body = this.postForm.get('body').value;
      this.post.locked = this.postForm.get('locked').value;
      this.post.category = this.postForm.get('category').value;
      if (pictureData !== null && pictureData !== undefined) this.post.image = JSON.stringify(pictureData);

      this.postService.updatePost(this.post).toPromise().then(result => {
        if (result.succeeded) {
          if (this.categoryId === this.post.category)
            this.location.back();
          else {
            let uri = `category/${this.post.category}/posts/view/${this.post.id}`;
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate([uri]).then();
            })
          }
        }
        else {
          if (result.messages.length > 0) {
            result.messages.forEach(msg => {
              switch(msg) {
                case 'CategoryNotFound':
                  this.snackBar.open('La catégorie dans laquelle vous essayez de créer le post n\'existe pas.', 'Ok', {
                    duration: 5000
                  });
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
            this.snackBar.open('Une erreur inconnue est survenue.', 'Ok', {
              duration: 5000
            });
          }
        }
        this.loading = false;
      });
    }
    else {
      let post = new PostViewModel();
      post.title = this.postForm.get('title').value;
      post.body = this.postForm.get('body').value;
      post.category = parseInt(this.categoryId);
      post.locked = this.postForm.get('locked').value;
      if (pictureData !== null && pictureData !== undefined) post.image = JSON.stringify(pictureData);

      this.postService.createPost(post).toPromise().then(result => {
        if (result.succeeded) {
          // Si la création a fonctionné, on renvoie l'utilisateur vers ledit post
          this.router.navigateByUrl(`/category/${this.categoryId}/posts/view/${result.result}`);
        }
        else {
          if (result.messages.length > 0) {
            result.messages.forEach(msg => {
              switch(msg) {
                case 'CategoryNotFound':
                  this.snackBar.open('La catégorie dans laquelle vous essayez de créer le post n\'existe pas.', 'Ok', {
                    duration: 5000
                  });
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
            this.snackBar.open('Une erreur inconnue est survenue.', 'Ok', {
              duration: 5000
            });
          }
        }
        this.loading = false;
      });
    }
  }

  showImage() {
    if (this.postForm.get('image').status !== 'INVALID') {
      let profilePicture = this.postForm.get('image').value;
      if (profilePicture._files && profilePicture._files[0]) {
        let file = profilePicture._files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (_event) => {
          this.imgUrl = reader.result;
          let result = reader.result + '';
          this.postForm.get('imageValue').setValue({
            filename: file.name,
            filetype: file.type,
            value: result.split(',')[1]
          });
        }
      }
    }
  }

  deleteImage() {
    if (this.post !== null && this.post !== undefined && this.post.image !== null && this.post.image !== undefined && this.post.image !== "") {
      if (confirm('Êtes-vous sûr(e) de vouloir supprimer l\'image rattachée à ce post ?')) {
        this.postService.deletePostImage(this.post.id).toPromise().then(response => {
          if (response.succeeded) {
            this.snackBar.open('L\'image a bien été supprimée.', 'Ok',{
              duration: 5000
            });
            this.postForm.get('image').setValue('');
            this.postForm.get('imageValue').setValue('');
            this.post.image = null;
            this.imgUrl = null;
          }
          else {
            if (response.messages.length > 0) {
              response.messages.forEach(msg => {
                let msgToShow = "";
                switch (msg) {
                  case 'PostNotFound':
                    msgToShow = 'Le post dont vous essayez de supprimer l\'image n\'a pas été trouvé.';
                    break;
                  case 'UserNotAuthorized':
                    msgToShow = 'Vous n\'avez pas l\'autorisation d\'effectuer cette action.';
                    break;
                  case 'FileNotDeleted':
                  case 'EntryNotDeleted':
                    msgToShow = 'Impossible de supprimer le fichier.';
                    break;
                  default:
                    msgToShow = msg;
                    break;
                }

                this.snackBar.open(msgToShow, 'Ok', {
                  duration: 5000
                });
              });
            }
            else {
              this.snackBar.open('Une erreur inconnue est survenue.', 'Ok', {
                duration: 5000
              });
            }
          }
        });
      }
    }
    else {
      this.postForm.get('image').setValue('');
      this.postForm.get('imageValue').setValue('');
      this.imgUrl = null;
    }
  }

  // Retourne en arrière
  goBack() {
    this.location.back();
  }
}
