import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { UserPaginationModel } from "../../models/userPaginationModel";
import { UserModel } from "../../models/userModel";
import { AdministrationService } from "../../services/administration.service";
import {PageEvent} from "@angular/material/paginator";
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {

  page: number = 0;
  users: UserPaginationModel = new UserPaginationModel();
  displayedColumns: string[] = [ 'username', 'email', 'role', 'editButton' ];

  searchForm = new FormGroup({
    search: new FormControl(''),
    filter: new FormControl(0)
  });

  roles = {
    1: 'Utilisateur simple',
    2: 'Modérateur',
    3: 'Administrateur'
  };

  filters = [
    {
      id: 0,
      name: 'Tous'
    },
    {
      id: 1,
      name: 'Non bannis'
    },
    {
      id: 2,
      name: 'Bannis'
    }
  ];

  constructor(private router: Router,
              private adminService: AdministrationService) { }

  ngOnInit(): void {
    this.users.users = new Array<UserModel>();
    this.getUsers();
  }

  editUser(username: string) {
    this.router.navigateByUrl(`administration/editUser/${username}`).then();
  }

  getUsers(search: string = "", filter: number = 0) {
    this.adminService.getUsers(this.page, search, filter).toPromise().then(response => {
      if (response.succeeded) {
        this.users = response.result;
      }
      else {
        // Si cela n'a pas fonctionné c'est que l'utilisateur n'a pas le droit d'être ici malgré l'adminGuard, on le renvoie à l'accueil
        this.router.navigateByUrl('').then();
      }
    })
  }

  changePage(event?:PageEvent) {
    this.page = event.pageIndex;
    this.getUsers();
  }

  searchUser() {
    let userToSearch = this.searchForm.get('search').value;
    let filter = this.searchForm.get('filter').value;
    this.getUsers(userToSearch, filter);
  }

}
