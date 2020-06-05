import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, NgForm, FormGroupDirective } from '@angular/forms';
import { Location, JsonPipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpdateProfileViewModel } from '../../services/forumApiTypeScriptClient';
import { ProfileService } from '../../services/profile.service';
import { FileValidator } from 'ngx-material-file-input';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  readonly maxSize = 2097152;

  editProfileForm = new FormGroup({
    description: new FormControl(''),
    profilePicture: new FormControl('', [FileValidator.maxContentSize(this.maxSize)]),
    avatar: new FormControl('')
  });

  loading = false;
  imgUrl;
  description = "";

  constructor(private profileService: ProfileService, private location: Location, private snackBar: MatSnackBar) {
    this.getUserData();
  }

  ngOnInit(): void {
  }

  async getUserData(): Promise<void> {
    this.profileService.getSelfProfile().toPromise().then(response => {
      if (response.succeeded) {
        // On set la description dans le champ et dans une variable pour n'activer le bouton que si une modification a été faite
        this.editProfileForm.setValue({
          description: response.result.description,
          profilePicture: '',
          avatar: ''
        });
        this.description = response.result.description;
      }
      else {
        this.snackBar.open('Une erreur inconnue est survenue.', 'Ok', {
          duration: 5000
        });
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


    let updateProfileData = new UpdateProfileViewModel();
    updateProfileData.description = this.editProfileForm.get('description').value;
    updateProfileData.profilePicture = profilePicture;

    this.profileService.updateSelfProfile(updateProfileData).toPromise().then(result => {
      if (result.succeeded) {
        this.location.back();
      }
      else {
        if (result.messages.length > 0) {
          result.messages.forEach(msg => {
            switch (msg) {
              case 'InvalidFileType':
                this.snackBar.open('Le type de fichier est invalide.', 'Ok', {
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
          this.snackBar.open('Une erreur inconnue est servenue.', 'Ok', {
            duration: 5000
          });
        }
      }
      this.loading = false;
    });
  }

  goBack() {
    this.location.back();
  }

  showImage() {
    if (this.editProfileForm.get('profilePicture').status !== 'INVALID') {
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
  }

}
