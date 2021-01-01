import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HelpersService } from '../../services/helpers.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  userObject;
  stock$;
  noStocks;
  totalPortfolioValue;
  currentBal;

  constructor(public auth: AuthService, private helpers: HelpersService, private router: Router) {
    if (auth.user$) {
      this.auth.user$.subscribe(u => {
        this.userObject = u;
        if (u) {
          this.auth.db.object<any>(`portfolios/${u.uid}/${this.auth.currentPortfolioId}/stocks`).valueChanges().subscribe(values => {
            if (values == null) {
              return this.noStocks = true;
            } else {
              // Get current portfolio balance and assign to tracking variable.
              let totalStocksValue = 0;
              const dbUserBalRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}/balance`);
              dbUserBalRef.once('value', snapshot => {
                this.currentBal = snapshot.val()
                this.totalPortfolioValue = this.currentBal;
              })
                .then(() => {
                  // Loop through all stocks in portfolio, adding to array for html and recording value.
                  this.stock$ = [];
                  for (const [key, value] of Object.entries(values)) {
                    this.helpers.lookupPromise(key).then(data => {
                      let newVal = data['price'] * Number(value);
                      this.totalPortfolioValue += newVal;
                      this.stock$.push({
                        stockName: data['name'],
                        stockSymbol: data['symbol'],
                        quantity: value,
                        unitPrice: this.helpers.usd(data['price']),
                        totalValue: this.helpers.usd(newVal)
                      })
                    })
                  }
                });
            }
          }, error => {
            console.log(error);
          });
        }
      });
    }
  }

  ngOnInit() {
    this.noStocks = false;
  }

}
