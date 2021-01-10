import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  userObject = null;
  currentPortfolio = null;
  currentRoute: string;
  offset: boolean;

  constructor(public auth: AuthService, public router: Router) {
    if (auth.user$) {
      this.auth.user$.subscribe(u => {
        this.userObject = u;
      })
    }

    router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(event => {
      this.currentRoute = event.url;
      if (this.currentRoute == '/' || this.currentRoute == '/buy' || this.currentRoute == '/sell') {
        this.offset = false;
      } else {
        this.offset = true;
      }
    })
  }

  ngOnInit() {
  }

}
