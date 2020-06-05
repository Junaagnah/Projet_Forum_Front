import { Component, OnInit, Input } from '@angular/core';
import { CategoryModel } from '../../models/categoryModel';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index-category',
  templateUrl: './index-category.component.html',
  styleUrls: ['./index-category.component.scss']
})
export class IndexCategoryComponent implements OnInit {

  @Input() categories: Array<Object>;
  user = null;
  subUser;

  constructor(private authenticationService: AuthenticationService, private router: Router) {
    this.user = authenticationService.currentUserValue;
    this.subUser = authenticationService.currentUser.subscribe(value => {
      this.user = value;
    })
  }

  ngOnInit(): void {
  }

  createPost(categoryId: number) {
    this.router.navigateByUrl(`category/${categoryId}/posts/create`).then();
  }

  navigateToCategory(catId: number) {
    this.router.navigateByUrl(`category/${catId}`).then();
  }

}
