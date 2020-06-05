import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  selected: number = 1;

  constructor() { }

  ngOnInit(): void {
  }

  changeSelected(val: number) {
    this.selected = val;
  }
}
