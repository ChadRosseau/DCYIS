import { Component, OnInit } from '@angular/core';
import { HelpersService } from '../../services/helpers.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.css']
})
export class SellComponent implements OnInit {

  userObject;
  pageData;

  constructor(public auth: AuthService, public helper: HelpersService, private router: Router) {
    this.auth.user$.subscribe(u => {
      this.userObject = u;
    })
  }

  ngOnInit() {
    this.pageData = {
      error: null,
      success: null,
      completePurchaseDisabled: false,
      summary: false,
      symbol: "",
      shares: 0,
      receiptMessage: "",
      disclaimerMessage: "",
      singlePrice: "",
      initialPrice: "",
      transactionFee: "",
      finalPrice: "",
      initialStock: "",
      finalStock: "",
      currentBal: "",
      newBal: ""
    }
  }

  resetValues() {

    for (const [key, value] of Object.entries(this.pageData)) {
      if (key == 'error' || key == 'success') {
        this.pageData[key] = null;
      } else if (key == 'summary' || key == 'completePurchaseDisabled') {
        this.pageData[key] = false;
      } else if (key == 'symbol' || key == 'shares') {

      } else {
        this.pageData[key] = ""
      }
    }
  }

  // Get receipt for purchase
  async receipt(symbol, shares) {

    let error = this.checkInputs(symbol, shares)

    if (error != null) {
      return this.setError(error);
    };

    // Get data on stock from IEX
    let success = await this.helper.lookupPromise(symbol).then(data => {

      if (data == null) {
        return this.setError(`'${symbol}' is not a valid stock symbol`);
      }

      // Set message for receipt
      this.pageData.receiptMessage = `Receipt for selling ${shares} piece(s) of '${data['name']}' (${data['symbol']}) stock:`;

      if (this.pageData.summary == false) {
        let currentStock,
          userCash,
          newCash;
        let singlePrice = this.helper.round(data['price'], 2),
          initialPrice = this.helper.round(singlePrice * shares, 2),
          transactionFee: number,
          finalPrice: number;

        const dbUserTransRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}/transactionCommission`);
        dbUserTransRef.once('value', (snapshot) => {
          let transactionPercent = snapshot.val();
          if (transactionPercent != 0) {
            transactionFee = this.helper.round(initialPrice / (100 / transactionPercent), 2)
          } else {
            transactionFee = 0;
          }
          this.pageData.disclaimerMessage = `Portfolio's set commission fee (% of transaction): ${transactionPercent}%`;
          finalPrice = this.helper.round(initialPrice - transactionFee, 2);
          this.pageData.error = null;
        }).then(() => {
          const dbUserBalRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}/balance`);
          dbUserBalRef.once('value', (snapshot) => {
            userCash = snapshot.val();
            console.log(snapshot.val());
          }).then(() => {
            const dbUserStocksRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}/stocks/${data['symbol']}`);
            dbUserStocksRef.once('value', (snapshot) => {
              if (snapshot.exists()) {
                currentStock = snapshot.val();
              } else {
                currentStock = 0;
              }
            }).then(() => {
              if (currentStock < Number(shares)) {
                this.setError("Your portfolio does not contain enough stock to perform this transaction");
              }

              newCash = this.helper.round(userCash + finalPrice, 2);
              // Update page data
              this.pageData.symbol = data['symbol'];
              this.pageData.shares = shares;
              this.pageData.singlePrice = this.helper.usd(singlePrice);
              this.pageData.initialPrice = this.helper.usd(initialPrice);
              this.pageData.transactionFee = this.helper.usd(transactionFee);
              this.pageData.finalPrice = this.helper.usd(finalPrice);
              this.pageData.initialStock = currentStock;
              this.pageData.finalStock = (currentStock - Number(shares));
              this.pageData.currentBal = this.helper.usd(userCash);
              this.pageData.newBal = this.helper.usd(newCash);
            })
          }).then(() => {
            this.pageData.summary = true;
          })
        })
      }
    }).catch(error => console.log(error));

  }

  async completePurchase(symbol, shares) {

    let error = this.checkInputs(symbol, shares)

    if (error != null) {
      return this.setError(error);
    };

    // Get data on stock from IEX
    let success = await this.helper.lookupPromise(symbol).then(data => {

      if (data == null) {
        return this.setError(`'${symbol}' is not a valid stock symbol`);
      }

      console.log(data['price']);


      if (this.pageData.summary == true) {
        let currentStock,
          userCash,
          newCash;
        let singlePrice = this.helper.round(data['price'], 2),
          initialPrice = this.helper.round(singlePrice * shares, 2),
          transactionFee: number,
          finalPrice: number;

        const dbUserTransRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}/transactionCommission`);
        dbUserTransRef.once('value', (snapshot) => {
          let transactionPercent = snapshot.val();
          if (transactionPercent != 0) {
            transactionFee = this.helper.round(initialPrice / (100 / transactionPercent), 2)
          } else {
            transactionFee = 0;
          }
          finalPrice = this.helper.round(initialPrice - transactionFee, 2);
          this.pageData.error = null;
        }).then(() => {
          const dbUserStocksRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}/stocks/${data['symbol']}`);
          dbUserStocksRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
              currentStock = snapshot.val();
            } else {
              currentStock = 0;
            }
          }).then(() => {
            if (currentStock < Number(shares)) {
              this.resetValues()
              return this.setError("Your portfolio balance cannot afford this purchase")
            }

            // Set new user balance
            let newStock = currentStock - Number(shares);
            dbUserStocksRef.set(newStock);

            // Record purchase in history db
            // db.execute("INSERT INTO purchaseHistory (userId, stockSymbol, quantity, price) VALUES (:userId, :symbol, :quantity, :price)", userId = session["user_id"], symbol = data['symbol'], quantity = shares, price = finalPrice)
            const dbUserHistory = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}/history`)
            const currentDate = new Date();
            const timestamp = currentDate.toISOString();
            dbUserHistory.push({
              ownerUid: this.auth.userKey,
              stockSymbol: data['symbol'],
              quantity: this.helper.toNegative(Number(shares)),
              orderValue: initialPrice,
              transactionFee: transactionFee,
              transactionValue: finalPrice,
              timestamp: timestamp
            });

            // Update portfolio stocks
            let currentBal;
            const dbUserBalRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}/balance`);
            dbUserBalRef.once('value', (snapshot) => {
              currentBal = snapshot.val();
            })
              .then(() => {
                dbUserBalRef.set(currentBal + finalPrice).then(() => {
                  this.pageData.success = "Success!";
                  return this.router.navigate(['overview'])
                });

                //     # render_template("confirmation.html")
                // buySummary = False
                // return redirect("/")
              })
          })
        })
      }
    }).catch(error => console.log(error))
  }

  checkInputs(symbol, shares) {
    try {
      shares = parseInt(shares);
    } catch (e) {
      return "Quantity must be an integer.";
    }

    // Ensure symbol was submitted
    if (!symbol) {
      return "Must provide a value for symbol";
    }

    // Ensure shares was submitted
    else if (!shares) {
      return "Must provide a value for quantity.";
    }

    // Ensure shares is over 0
    else if (shares < 1) {
      return "Quantity must be over 0.";
    }
  }

  setError(error) {
    this.pageData.error = error;
    this.pageData.completePurchaseDisabled = true;
  }



}
