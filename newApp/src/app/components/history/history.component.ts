import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HelpersService } from '../../services/helpers.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  userObject;
  history$;
  noStocks;
  totalPortfolioValue;
  totalPortfolioChange;
  currentBal;
  startingBal;

  constructor(public auth: AuthService, private helpers: HelpersService, private router: Router) {
    if (auth.user$) {
      this.auth.user$.subscribe(u => {
        this.userObject = u;
        if (u) {
          this.auth.db.object<any>(`portfolios/${u.uid}/${this.auth.currentPortfolioId}/history`).valueChanges().subscribe(values => {
            if (values == null) {
              return this.noStocks = true;
            } else {
              // Get current portfolio balance and assign to tracking variable.
              const dbUserBalRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}/balance`);
              dbUserBalRef.once('value', snapshot => {
                this.currentBal = snapshot.val()
                this.totalPortfolioValue = this.currentBal;
              }).then(() => {
                // Loop through all stocks in portfolio, adding to array for html and recording value.
                this.history$ = [];
                for (const value of Object.values(values)) {
                  this.helpers.lookupPromise(value['stockSymbol']).then(data => {
                    let newVal = data['price'] * Number(value['quantity']);
                    this.totalPortfolioValue += newVal;
                    this.history$.push({
                      stockName: data['name'],
                      stockSymbol: data['symbol'],
                      quantity: value['quantity'],
                      oldValue: this.helpers.usd(value['orderValue'] / Math.abs(value['quantity'])),
                      unitPrice: this.helpers.usd(data['price']),
                      oldTotalValue: value['orderValue'],
                      currentTotalValue: this.helpers.usd(Math.abs(newVal)),
                      percentChange: (((data['price'] / (value['orderValue'] / Math.abs(value['quantity']))) - 1) * 100),
                      timestamp: value['timestamp']
                    })
                  })
                }
              }).then(() => {
                const dbStartBalRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}/startingBal`);
                dbStartBalRef.once('value', snapshot => {
                  this.startingBal = snapshot.val();
                  console.log(this.totalPortfolioValue);
                  this.totalPortfolioChange = ((this.totalPortfolioValue / this.startingBal) - 1);
                })
              })
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
