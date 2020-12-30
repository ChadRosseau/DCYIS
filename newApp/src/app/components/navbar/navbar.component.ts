import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userObject = null;

  constructor(public auth: AuthService) {
    if (auth.user$) {
      this.auth.user$.subscribe(u => {
        this.userObject = u;
      })
    }
  }

  ngOnInit() {
  }

}
