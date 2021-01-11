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
  currentPortfolioName;

  constructor(public auth: AuthService, public helpers: HelpersService, private router: Router) {
    if (auth.user$) {
      this.auth.user$.subscribe(u => {
        this.userObject = u;
        if (u) {
          this.auth.db.object<any>(`portfolios/${u.uid}/${this.auth.currentPortfolioId}/stocks`).valueChanges().subscribe(values => {
            if (values == null) {
              this.auth.db.database.ref(`portfolios/${u.uid}/${this.auth.currentPortfolioId}`).once('value', snapshot => {
                let portfolio = snapshot.val();
                this.currentBal = portfolio['balance'];
                this.totalPortfolioValue = portfolio['balance'];
                this.currentPortfolioName = portfolio['name'];
              })
              return this.noStocks = true;
            } else {
              // Get current portfolio balance and assign to tracking variable.
              const dbUserBalRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}`);
              dbUserBalRef.once('value', snapshot => {
                let portfolio = snapshot.val();
                this.currentBal = portfolio['balance'];
                this.totalPortfolioValue = this.currentBal;
                this.currentPortfolioName = portfolio['name'];
              })
                .then(() => {

                  this.stock$ = [];
                  let toLookup = [];
                  let objectEntries = Object.entries(values)
                  for (let i = 0; i < objectEntries.length; i++) {
                    let key = objectEntries[i][0],
                      value = objectEntries[i][1]
                    this.helpers.getAllStocks(key).then(data => {
                      this.pushStock(data, value);
                    }).catch(() => {
                      if (toLookup.includes(key) == false) {
                        toLookup.push(key);
                      }
                    }).then(() => {
                      if (i == objectEntries.length - 1) {
                        if (toLookup.length != 0) {
                          this.helpers.lookupPromise(toLookup).then(data => {
                            for (const currentKey of Object.keys(data)) {
                              this.pushStock(data[currentKey], values[currentKey]);
                            }
                          })
                        }
                      }
                    })
                  }
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

  pushStock(data, value) {
    let newVal = data['price'] * Number(value);
    this.totalPortfolioValue += newVal;
    this.stock$.push({
      stockName: data['name'],
      stockSymbol: data['symbol'],
      quantity: value,
      unitPrice: this.helpers.usd(data['price']),
      totalValue: this.helpers.usd(newVal)
    })
  }

}
