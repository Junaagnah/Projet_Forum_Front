import {Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PostModel } from "../models/postModel";
import { PostService } from "../services/post.service";
import { PostPaginationModel } from "../models/postPaginationModel";
import { PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {

  posts: Array<PostModel> = new Array<PostModel>();
  categoryId: number;
  postCount: number;
  pageEvent: PageEvent;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private location: Location,
              private postService: PostService) { }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.params.categoryId;
    if (this.categoryId !== null && this.categoryId !== undefined) {
      this.getPosts(0);
    }
    else {
      this.router.navigateByUrl('').then();
    }
  }

  getPosts(page: number) {
    this.postService.getPostsByCategoryWithPagination(this.categoryId, page).toPromise().then(response => {
      if (response.succeeded) {
        let result = response.result as PostPaginationModel;
        this.postCount = result.count;
        this.posts = result.posts;
      }
      else {
        this.router.navigateByUrl('').then();
      }
    })
  }

  navigateToPost(postId: number) {
    this.router.navigateByUrl(`category/${this.categoryId}/posts/view/${postId}`).then();
  }

  goBack() {
    this.location.back();
  }

  navigateToNewPost() {
    this.router.navigateByUrl(`category/${this.categoryId}/posts/create`).then();
  }

  public changePage(event?:PageEvent) {
    this.getPosts(event.pageIndex);
  }
}
