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
  oldPortfolioValue;
  totalPortfolioValue;
  totalPortfolioChange;
  currentBal;
  startingBal;
  currentPortfolioName;
  showTable;
  allStockKeys;
  image;

  constructor(public auth: AuthService, public helpers: HelpersService, private router: Router) {
    this.construct();
  }

  ngOnInit() {
    this.noStocks = false;
    this.showTable = false;
  }

  construct() {
    if (this.auth.user$) {
      this.auth.user$.subscribe(u => {
        this.userObject = u;
        if (u) {
          this.auth.db.object<any>(`portfolios/${u.uid}/${this.auth.currentPortfolioId}/history`).valueChanges().subscribe(values => {
            if (values == null) {
              this.auth.db.database.ref(`portfolios/${u.uid}/${this.auth.currentPortfolioId}`).once('value', snapshot => {
                let portfolio = snapshot.val();
                this.currentBal = portfolio['balance'];
                this.totalPortfolioValue = portfolio['balance'];
                this.startingBal = portfolio['startingBal'];
                this.currentPortfolioName = portfolio['name'];
              });
              this.noStocks = true;
              return this.showTable = true;
            } else {
              // Get current portfolio balance and assign to tracking variable.
              const dbUserBalRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}`);
              dbUserBalRef.once('value', snapshot => {
                let portfolio = snapshot.val();
                this.currentBal = portfolio['balance'];
                this.startingBal = portfolio['startingBal'];
                this.currentPortfolioName = portfolio['name'];
                this.totalPortfolioValue = this.currentBal;
              }).then(() => {
                // Loop through all stocks in portfolio, adding to array for html and recording value.
                this.history$ = [];
                let toLookup = [];
                let objectValues = Object.values(values)
                for (let i = 0; i < objectValues.length; i++) {
                  let value = objectValues[i];
                  this.helpers.getAllStocks(value['stockSymbol']).then(symbol => {
                    this.pushHistory(symbol, value);
                  }).catch(() => {
                    if (toLookup.includes(value['stockSymbol']) == false) {
                      toLookup.push(value['stockSymbol']);
                    }
                  }).then(() => {
                    if (i == objectValues.length - 1) {
                      if (toLookup.length != 0) {
                        this.helpers.lookupPromise(toLookup).then(data => {
                          for (const currentKey of Object.keys(data)) {
                            this.pushHistory(currentKey, data[currentKey]);
                          }
                        })
                      }
                    }
                  })
                }
              }).then(() => {
                const dbStartBalRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}/startingBal`);
                dbStartBalRef.once('value', snapshot => {
                  this.startingBal = snapshot.val();
                  this.showTable = true;
                  this.totalPortfolioChange = (((this.totalPortfolioValue / this.startingBal) - 1)) * 100;
                  this.setBackground();
                })
              })
            }
          })
        }
      }, error => { console.log(error); });
    }
  }

  setBackground() {
    if (this.auth.currentPortfolioStonks) {
      if (this.totalPortfolioChange > 0) {
        this.image = "https://i.kym-cdn.com/entries/icons/facebook/000/029/959/Screen_Shot_2019-06-05_at_1.26.32_PM.jpg";
      } else if (this.totalPortfolioChange < 0) {
        this.image = "https://i.pinimg.com/originals/89/92/ba/8992ba8a5962114770ad9eb4d6be733c.jpg";
      } else {
        this.image = "https://i.imgur.com/HlMGmgm.jpg";
      }
    } else {
      this.image = "https://c4.wallpaperflare.com/wallpaper/294/320/850/skyline-hong-kong-nightscape-cityscape-wallpaper-preview.jpg";
    }
  }

  pushHistory(data, value) {
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
    });
  }

}
