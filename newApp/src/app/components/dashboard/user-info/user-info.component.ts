import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {

  userObject = null;

  constructor(public auth: AuthService, private router: Router) {
    if (auth.user$) {
      this.auth.user$.subscribe(u => {
        this.userObject = u;
      })
    }
  }

  ngOnInit() {
  }




}
