import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommentModel } from "../../../models/commentModel";
import { CommentService } from "../../../services/comment.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { Router } from '@angular/router';
import {EditCommentComponent} from "./edit-comment/edit-comment.component";
import { AuthenticationService } from "../../../services/authentication.service";

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input() comment: CommentModel;

  actualUser = null;

  roleColors = {
    1: "#2196F3",
    2: "#2E7D32",
    3: "#F44336"
  };

  user = null;
  subUser;


  constructor(
    private commentService: CommentService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    @Inject('forumApiUrl') private serviceUrl: string) { }

  ngOnInit(): void {
    this.actualUser = localStorage.getItem('username');

    this.comment.authorProfile.profilePictureUrl = `${this.serviceUrl}/${this.comment.authorProfile.profilePicture}`;

    // Récupération de l'utilisateur pour gérer les rôles
    this.user = this.authenticationService.currentUserValue;
    this.subUser = this.authenticationService.currentUser.subscribe(value => {
      this.user = value;
    });
  }

  goToProfile() {
    this.router.navigateByUrl(`profile/view/${this.comment.authorProfile.username}`).then();
  }

  editComment() {
    this.dialog.open(EditCommentComponent, {
      disableClose: true,
      data: {
        "id": this.comment.id
      }
    });
  }

  deleteComment() {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      this.commentService.deleteComment(this.comment.id).toPromise().then(result => {
        if (result.succeeded) {
          window.location.reload();
        }
        else {
          this.snackBar.open('Une erreur inconnue est survenue.', 'Ok', {
            duration: 5000
          })
        }
      });
    }
  }

}
