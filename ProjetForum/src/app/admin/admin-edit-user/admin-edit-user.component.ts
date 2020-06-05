import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Location } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { AdministrationService } from "../../services/administration.service";
import { ProfileService } from "../../services/profile.service";
import {ProfileModel} from "../../models/profileModel";
import {UpdateProfileViewModel} from "../../services/forumApiTypeScriptClient";

@Component({
  selector: 'app-admin-edit-user',
  templateUrl: './admin-edit-user.component.html',
  styleUrls: ['./admin-edit-user.component.scss']
})
export class AdminEditUserComponent implements OnInit {

  editProfileForm = new FormGroup({
    profilePicture: new FormControl(''),
    avatar: new FormControl(''),
    description: new FormControl(''),
    username: new FormControl(''),
    isBanned: new FormControl(false),
    email: new FormControl(''),
    role: new FormControl(0)
  });

  maxSize = 2097152;
  imgUrl;
  loading = false;
  description = "";
  oldUsername = "";

  roles = [
    {
      id: 1,
      name: 'Utilisateur simple'
    },
    {
      id: 2,
      name: 'Modérateur'
    },
    {
      id: 3,
      name: 'Administrateur'
    }
  ];

  constructor(
    private location: Location,
    private adminService: AdministrationService,
    private profileService: ProfileService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    @Inject('forumApiUrl') private forumApiUrl: string
  ) { }

  ngOnInit(): void {
    let username = this.route.snapshot.params.username;
    if (username !== null && username !== undefined && username !== "")
      this.getUserProfile(username);
    else
      this.location.back();
  }

  getUserProfile(username: string) {
    this.profileService.getUserProfile(username).toPromise().then(response => {
      if (response.succeeded) {
        let user = response.result as ProfileModel;
        this.oldUsername = user.username;
        this.editProfileForm.setValue({
          profilePicture: '',
          avatar: '',
          description: user.description,
          username: user.username,
          isBanned: user.isBanned,
          email: user.email,
          role: user.role
        });

        this.imgUrl = `${this.forumApiUrl}/${user.profilePicture}`;
      }
      else {
        this.location.back();
      }
    })
  }

  submit() {
    this.loading = true;

    let pictureData = this.editProfileForm.get('avatar').value;
    let profilePicture = null;
    if (pictureData !== '') {
      profilePicture = JSON.stringify(pictureData);
    }

    let updateProfileData = new UpdateProfileViewModel({
      username: this.editProfileForm.get('username').value,
      email: this.editProfileForm.get('email').value,
      description: this.editProfileForm.get('description').value,
      profilePicture: profilePicture,
      isBanned: this.editProfileForm.get('isBanned').value,
      role: this.editProfileForm.get('role').value
    });

    this.adminService.editUser(this.oldUsername, updateProfileData).toPromise().then(response => {
      if (response.succeeded) {
        this.snackBar.open('Le profil utilisateur a bien été mis à jour', 'Ok', {
          duration: 5000
        });
        this.location.back();
      }
      else {
        if (response.messages.length > 0) {
          response.messages.forEach(msg => {
            switch (msg) {
              case 'DuplicateUserName':
                this.editProfileForm.get('username').setErrors({
                  usernameNotUnique: true
                });
                break;
              case 'DuplicateEmail':
                this.editProfileForm.get('email').setErrors({
                  emailNotUnique: true
                });
                break;
              case 'UserNotAuthorized':
                this.snackBar.open('Vous n\'avez pas le droit d\'effectuer cette action.', 'Ok', {
                  duration: 5000
                });
                break;
            }
          })
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

  showImage() {
    let profilePicture = this.editProfileForm.get('profilePicture').value;
    if (profilePicture._files && profilePicture._files[0]) {
      let file = profilePicture._files[0];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        this.imgUrl = reader.result;
        let result = reader.result + '';
        this.editProfileForm.get('avatar').setValue({
          filename: file.name,
          filetype: file.type,
          value: result.split(',')[1]
        });
      }
    }
  }

  goBack() {
    this.location.back();
  }

}
