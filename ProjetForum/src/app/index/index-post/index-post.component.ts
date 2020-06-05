import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";
import { PostModel } from '../../models/postModel';

@Component({
  selector: 'app-index-post',
  templateUrl: './index-post.component.html',
  styleUrls: ['./index-post.component.scss']
})
export class IndexPostComponent implements OnInit {

  @Input() post: PostModel;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigateToPost() {
    this.router.navigateByUrl(`category/${this.post.category}/posts/view/${this.post.id}`).then();
  }
}
