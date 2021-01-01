import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentRoute: string;

  constructor(public auth: AuthService, public router: Router) {

    router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(event => {
      this.currentRoute = event.url;
    })
  }

  ngOnInit() {
    this.auth.currentPortfolioId = null;
  }



}
