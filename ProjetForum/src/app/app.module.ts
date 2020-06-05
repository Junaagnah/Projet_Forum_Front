// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Other
import { RecaptchaModule } from 'ng-recaptcha';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule, MatSlideToggle } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatTableModule } from "@angular/material/table";

// Local
import { TopBarComponent } from './top-bar/top-bar.component';
import { IndexComponent } from './index/index.component';
import { RegisterComponent } from './register/register.component';
import { SigninComponent } from './signin/signin.component';
import { environment } from 'src/environments/environment';
import { ValidationErrorsComponent } from './tools/validation-errors/validation-errors.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { IndexCategoryComponent } from './index/index-category/index-category.component';
import { IndexPostComponent } from './index/index-post/index-post.component';
import { ContactComponent } from './contact/contact.component';
import { JwtInterceptor } from './helpers/jwtInterceptor';
import { ErrorInterceptor } from './helpers/errorInterceptor';
import { AppInitService } from './helpers/appInitService';
import { ProfileComponent } from './profile/profile.component';
import { EditPasswordComponent } from './profile/edit-password/edit-password.component';
import { EditProfileComponent } from './profile/edit-profile/edit-profile.component';
import { DeleteAccountComponent } from './profile/delete-account/delete-account.component';
import { CategoryComponent } from './category/category.component';
import { PostComponent } from './category/post/post.component';
import { CreatePostComponent } from './category/post/create-post/create-post.component';
import { CommentComponent } from './category/post/comment/comment.component';
import { EditCommentComponent } from './category/post/comment/edit-comment/edit-comment.component';
import { ChatComponent } from './index/chat/chat.component';
import { MessagerieComponent } from './messagerie/messagerie.component';
import { ConversationComponent } from './messagerie/conversation/conversation.component';
import { NewMessageComponent } from './messagerie/new-message/new-message.component';
import {MatPaginatorModule} from "@angular/material/paginator";
import { AdminComponent } from './admin/admin.component';
import { AdminUsersComponent } from './admin/admin-users/admin-users.component';
import { AdminCategoriesComponent } from './admin/admin-categories/admin-categories.component';
import { AdminEditUserComponent } from './admin/admin-edit-user/admin-edit-user.component';
import { AdminCreateCategoryComponent } from './admin/admin-create-category/admin-create-category.component';

export function initializeApp(appInitService: AppInitService) {
  return (): Promise<any> => {
    return appInitService.Init();
  };
}

@NgModule({
    declarations: [
        AppComponent,
        TopBarComponent,
        IndexComponent,
        RegisterComponent,
        SigninComponent,
        ValidationErrorsComponent,
        ConfirmEmailComponent,
        RecoverPasswordComponent,
        IndexCategoryComponent,
        IndexPostComponent,
        ContactComponent,
        ProfileComponent,
        EditPasswordComponent,
        EditProfileComponent,
        DeleteAccountComponent,
        CategoryComponent,
        PostComponent,
        CreatePostComponent,
        CommentComponent,
        EditCommentComponent,
        ChatComponent,
        MessagerieComponent,
        ConversationComponent,
        NewMessageComponent,
        AdminComponent,
        AdminUsersComponent,
        AdminCategoriesComponent,
        AdminEditUserComponent,
        AdminCreateCategoryComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        HttpClientModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        RecaptchaModule,
        MatDialogModule,
        MatSlideToggleModule,
        CKEditorModule,
        MaterialFileInputModule,
        MatMenuModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        MatPaginatorModule,
        MatSidenavModule,
        MatTableModule,
    ],
  providers: [
    { provide: 'forumApiUrl', useValue: environment.forumApiUrl },
    { provide: 'recaptchaKey', useValue: environment.reCaptchaKey },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AppInitService,
    { provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppInitService], multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
