import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import { CommentService } from '../../../../services/comment.service';
import { CommentViewModel } from '../../../../services/forumApiTypeScriptClient';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {ChangeEvent, CKEditorComponent} from "@ckeditor/ckeditor5-angular";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-edit-comment',
  templateUrl: './edit-comment.component.html',
  styleUrls: ['./edit-comment.component.scss']
})
export class EditCommentComponent implements OnInit {

  @ViewChild( 'editorComponent' ) editorComponent: CKEditorComponent;

  loading = false;
  comment: CommentViewModel = new CommentViewModel();
  commentId: number;
  editor;
  oldComment: string;

  commentForm = new FormGroup({
    comment: new FormControl('')
  });

  constructor(private dialogRef: MatDialogRef<EditCommentComponent>,
              private snackBar: MatSnackBar,
              private commentService: CommentService,
              @Inject(MAT_DIALOG_DATA) private data: any) {
    this.editor = ClassicEditor;
  }

  ngOnInit(): void {
    this.commentId = this.data.id;
    if (this.commentId !== null && this.commentId !== undefined)
      this.getComment();
    else
      this.dialogRef.close();
  }

  submit() {
    this.loading = true;
    let comment = new CommentViewModel();
    comment.id = this.comment.id;
    comment.author = this.comment.author;
    comment.post = this.comment.post;
    comment.body = this.commentForm.get('comment').value;

    this.commentService.editComment(comment).toPromise().then(result => {
      console.log(result);
      if (result.succeeded) {
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

  getComment() {
    this.commentService.getComment(this.commentId).toPromise().then(result => {
      if (result.succeeded) {
        this.comment = result.result;
        this.commentForm.get('comment').setValue(this.comment.body);
        this.oldComment = this.comment.body;

        // On récupère l'instance de l'éditeur et on set son contenu
        let editor = this.editorComponent.editorInstance;
        editor.setData(this.comment.body);
      }
      else {
        if (result.messages.length > 0) {
          result.messages.forEach(msg => {
            this.snackBar.open(msg, 'Ok', {
              duration: 5000
            });
          });
        } else {
          this.snackBar.open('Une erreur inconnue est survenue.', 'Ok', {
            duration: 5000
          });
        }
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  // Permet de récupérer la valeur du ckeditor
  editorChange({ editor }: ChangeEvent) {
    let editorData = editor.getData();
    this.commentForm.get('comment').setValue(editorData);
  }

}
