import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { HelpersService } from 'src/app/services/helpers.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  compPortfolios;
  users;

  constructor(public auth: AuthService, public helpers: HelpersService) { }

  ngOnInit() {
    // Fetch users
    let userRef = this.auth.db.object<any>(`users`).valueChanges();
    userRef.subscribe(data => {
      this.users = data;
    })

    // Fetch portfolio data
    let dbCompPortRef = this.auth.db.object<any>(`compPortfolios/S2021`).valueChanges();
    dbCompPortRef.subscribe(data => {
      let portfolios = Object.values(data);
      portfolios.sort((a, b) => {
        if (a['currentValue'] < b['currentValue']) {
          return 1;
        } else if (a['currentValue'] > b['currentValue']) {
          return -1;
        } else {
          return 0;
        }
      })
      for (let i = 0; i < portfolios.length; i++) {
        portfolios[i]['percentChange'] = this.findPercent(portfolios[i]['currentValue'])
      }
      this.compPortfolios = portfolios;
    })
  }

  findPercent(value) {
    return ((value / 100000) - 1) * 100;
  }

  getColor(percent) {
    if (percent > 0) {
      return 'green';
    } else if (percent < 0) {
      return 'red';
    } else {
      return 'black';
    }
  }

}
