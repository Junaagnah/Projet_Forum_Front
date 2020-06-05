import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginGuard } from './helpers/loginGuard';
import { LogoutGuard } from './helpers/logoutGuard';
import { IndexComponent } from './index/index.component';
import { RegisterComponent } from './register/register.component';
import { SigninComponent } from './signin/signin.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { ContactComponent } from './contact/contact.component';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './profile/edit-profile/edit-profile.component';
import { PostComponent } from './category/post/post.component';
import { CreatePostComponent } from './category/post/create-post/create-post.component';
import {MessagerieComponent} from "./messagerie/messagerie.component";
import {ConversationComponent} from "./messagerie/conversation/conversation.component";
import {NewMessageComponent} from "./messagerie/new-message/new-message.component";
import {CategoryComponent} from "./category/category.component";
import {AdminGuard} from "./helpers/adminGuard";
import {AdminComponent} from "./admin/admin.component";
import {AdminEditUserComponent} from "./admin/admin-edit-user/admin-edit-user.component";
import {AdminCreateCategoryComponent} from "./admin/admin-create-category/admin-create-category.component";


const routes: Routes = [
  // Accessible partout
  {
    path: '',
    children: [
      { path: '', component: IndexComponent },
      { path: 'profile/view/:username', component: ProfileComponent },
      { path: 'category/:categoryId/posts/view/:postId', component: PostComponent },
      { path: 'category/:categoryId', component: CategoryComponent },
    ]
  },
  // Accessible déconnecté
  {
    path: '',
    canActivate: [LogoutGuard],
    children: [
      { path: 'signin', component: SigninComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'confirmEmail', component: ConfirmEmailComponent },
      { path: 'recoverPassord', component: RecoverPasswordComponent },
      { path: 'contact', component: ContactComponent },
    ]
  },
  // Accessible connecté
  {
    path: '',
    canActivate: [LoginGuard],
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/edit', component: EditProfileComponent },
      { path: 'category/:categoryId/posts/create', component: CreatePostComponent },
      { path: 'category/:categoryId/post/edit/:postId', component: CreatePostComponent },
      { path: 'messagerie', component: MessagerieComponent },
      { path: 'messagerie/conversation/:conversationId', component: ConversationComponent },
      { path: 'messagerie/new', component: NewMessageComponent },
    ]
  },
  // Accessible uniquement à l'admin
  {
    path: '',
    canActivate: [AdminGuard],
    children: [
      { path: 'administration', component: AdminComponent },
      { path: 'administration/editUser/:username', component: AdminEditUserComponent },
      { path: 'administration/createCategory', component: AdminCreateCategoryComponent },
      { path: 'administration/editCategory/:categoryId', component: AdminCreateCategoryComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
