import {Component, Inject, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Location } from "@angular/common";
import { PostService } from '../../services/post.service';
import {PostModel} from "../../models/postModel";
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular';
import {FormControl, FormGroup} from "@angular/forms";
import { CommentViewModel } from "../../services/forumApiTypeScriptClient";
import {CommentService} from "../../services/comment.service";
import {ProfileModel} from "../../models/profileModel";
import {CommentModel} from "../../models/commentModel";
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  post: PostModel = new PostModel();

  actualUser = null;
  editor;
  roleColors = {
    1: '#2196F3',
    2: "#2E7D32",
    3: "#F44336"
  };

  config = {
    placeholder: 'Répondre au message',
    toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedlist', '|', 'undo', 'redo' ]
  }

  loading = false;
  imgUrl;
  user = null;
  subUser;

  commentForm = new FormGroup({
    comment: new FormControl('')
  });

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private location: Location,
    private commentService: CommentService,
    private authenticationService: AuthenticationService,
    @Inject('forumApiUrl') private serviceUrl: string) {

    // Evite les erreurs undefined
    this.post.authorProfile = new ProfileModel();
    this.post.comments = new Array<CommentModel>();
  }

  async ngOnInit(): Promise<void> {
    this.getPost();
    this.actualUser = localStorage.getItem('username');

    this.editor = ClassicEditor;

    // Récupération de l'utilisateur pour gérer les rôles
    this.user = this.authenticationService.currentUserValue;
    this.subUser = this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
  }

  getPost() {
    let postId = this.route.snapshot.params.postId;
    let categoryId = this.route.snapshot.params.categoryId;
    if (postId === null || postId === undefined || categoryId === null || categoryId === undefined) this.router.navigateByUrl('').then();

    this.postService.getPostByCategory(postId, categoryId).toPromise().then(result => {
      if (result.succeeded) {
        this.post = result.result;
        if (this.post.image !== null && this.post.image !== undefined) this.imgUrl = `${this.serviceUrl}/${this.post.image}`;
        // On set correctement l'url vers la photo de profil
        this.post.authorProfile.profilePictureUrl = `${this.serviceUrl}/${result.result.authorProfile.profilePicture}`;
      }
      else {
        // On n'a pas trouvé le post, on retourne à la racine
        this.router.navigateByUrl('/');
      }
    });
  }

  submit() {
    this.loading = true;
    let comment: CommentViewModel = new CommentViewModel();
    comment.body = this.commentForm.get('comment').value;
    comment.post = this.post.id;

    this.commentService.createComment(comment).toPromise().then(result => {
      if (result.succeeded) {
        // Si on a pu ajouter le commentaire, on recharge la page
        window.location.reload();
      }
      else {
        if (result.messages.length > 0) {
          result.messages.forEach(msg => {
            switch(msg) {
              case 'PostNotFound':
                this.snackBar.open('Le post auquel vous essayez de répondre n\'existe pas.', 'Ok', {
                  duration: 5000
                });
                break;
              case 'PostLocked':
                this.snackBar.open('Le post auquel vous essayez de répondre a été verrouillé.', 'Ok', {
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
          this.snackBar.open('Une erreur inconnue est survenue.', 'Ok', {
            duration: 5000
          });
        }
      }
      this.loading = false;
    });
  }

  goToProfile() {
    this.router.navigateByUrl(`profile/view/${this.post.authorProfile.username}`).then();
  }

  goBack() {
    this.location.back();
  }

  deletePost() {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      this.postService.deletePost(this.post.id).toPromise().then(result => {
        if (result.succeeded) {
          this.location.back();
        }
        else {
          this.snackBar.open('Impossible de supprimer le post.', 'Ok', {
            duration: 5000
          })
        }
      })
    }
  }

  editPost() {
    this.router.navigateByUrl(`category/${this.route.snapshot.params.categoryId}/post/edit/${this.post.id}`);
  }

  // Permet de récupérer la valeur du ckeditor
  editorChange({ editor }: ChangeEvent) {
    let editorData = editor.getData();
    this.commentForm.get('comment').setValue(editorData);
  }
}
