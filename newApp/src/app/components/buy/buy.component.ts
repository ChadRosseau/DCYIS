import { Component, OnInit } from '@angular/core';
import { HelpersService } from '../../services/helpers.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.css']
})
export class BuyComponent implements OnInit {
  userObject;
  pageData;

  constructor(public auth: AuthService, public helper: HelpersService, private router: Router) {
    this.auth.user$.subscribe(u => {
      this.userObject = u;
    })
  }

  // Initialize page data
  ngOnInit() {
    this.pageData = {
      error: null,
      completePurchaseDisabled: false,
      summary: false,
      symbol: "",
      shares: 0,
      receiptMessage: "",
      commission: "",
      singlePrice: "",
      initialPrice: "",
      transactionFee: "",
      finalPrice: "",
      currentBal: "",
      newBal: ""
    }
  }

  // Function to reset page data, called by "back" button. Preserves user inputs.
  resetValues() {
    for (const [key, value] of Object.entries(this.pageData)) {
      if (key == 'error') {
        this.pageData[key] = null;
      } else if (key == 'summary' || key == 'completePurchaseDisabled') {
        this.pageData[key] = false;
      } else if (key == 'symbol' || key == 'shares') {
        // Pass, in order to preserve user-input values and allow them to edit it.
      } else {
        this.pageData[key] = ""
      }
    }
  }

  // Get receipt for purchase
  async receipt(symbol, shares) {

    // Check all inputs are valid.
    let error = this.helper.checkInputs(symbol, shares)

    // If there is an error, set page data to display it.
    if (error != null) {
      return this.setError(error);
    };

    // Get data on stock from IEX
    let success = await this.helper.lookupPromise([symbol]).then(fetchedData => {

      // If there is no data, return error.
      if (!fetchedData) {
        return this.setError(`${symbol} is not a valid stock symbol`);
      }

      let validSymbol = Object.keys(fetchedData)[0],
        data = fetchedData[validSymbol];

      // Set message for receipt
      this.pageData.receiptMessage = `${shares} piece(s) of '${data['name']}' (${data['symbol']}) stock:`;

      // Ensure there is not yet a summary being shown.
      if (this.pageData.summary == false) {

        // Declare storage variables, rounding to decimal standard where necessary (preparing for input into database).
        let userCash,
          newCash;
        let singlePrice = this.helper.round(data['price'], 2),
          initialPrice = this.helper.round(singlePrice * shares, 2),
          transactionFee: number,
          finalPrice: number;

        // Fetch current portfolio information from database.
        let portfolioUrl = `portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}`
        const dbPortfolioRef = this.auth.db.database.ref(portfolioUrl);
        dbPortfolioRef.once('value', (snapshot) => {

          // Parse data into readable json.
          let portfolio = snapshot.val();

          // Determine commission to apply from db.
          let transactionCommission = portfolio['transactionCommission'];
          let commissionType = portfolio['commissionType'];
          if (transactionCommission != 0) {
            if (commissionType == "percentage") {
              transactionFee = this.helper.round(initialPrice / (100 / transactionCommission), 2);
              this.pageData.commission = `${transactionCommission}%`;
            } else if (commissionType == "constant") {
              transactionFee = transactionCommission;
              this.pageData.commission = this.helper.usd(transactionCommission);
            }
          } else {
            transactionFee = 0;
          }

          // Set pagedata.
          this.pageData.error = null;

          // Store for later use
          finalPrice = this.helper.round(initialPrice + transactionFee, 2);

          // Return fetched data for next .then
          return snapshot;

        }).then((snapshot) => {

          // Again assign portfolio info (new scope).
          let portfolio = snapshot.val();

          // Determine current portfolio balance.
          userCash = portfolio['balance'];

          // Determine the amount of this stock the portfolio possesses.
          let currentStock;
          if (portfolio['stocks'] != undefined && portfolio['stocks'][data['symbol']] != undefined) {
            currentStock = portfolio['stocks'][data['symbol']];
          } else {
            currentStock = 0;
          }

          // Ensure portfolio has enough cash to complete purchase.
          if (userCash < finalPrice) {
            this.setError("Your portfolio balance cannot afford this purchase")
          }

          // Determine balance of portfolio after purchase.
          newCash = this.helper.round(userCash - finalPrice, 2);

          // Update page data
          this.pageData.symbol = data['symbol'];
          this.pageData.shares = shares;
          this.pageData.singlePrice = this.helper.usd(singlePrice);
          this.pageData.initialPrice = this.helper.usd(initialPrice);
          this.pageData.transactionFee = this.helper.usd(transactionFee);
          this.pageData.finalPrice = this.helper.usd(finalPrice);
          this.pageData.initialStock = currentStock;
          this.pageData.finalStock = (currentStock + Number(shares));
          this.pageData.currentBal = this.helper.usd(userCash);
          this.pageData.newBal = this.helper.usd(newCash);
        }).then(() => {
          // Display receipt.
          this.pageData.summary = true;
        }).catch(error => console.log(error));
      }
    })

  }



  async completePurchase(symbol, shares) {

    // Check all inputs are valid.
    let error = this.helper.checkInputs(symbol, shares)

    // If there is an error, set page data to display it.
    if (error != null) {
      return this.setError(error);
    };

    // Get data on stock from IEX
    let success = await this.helper.lookupPromise([symbol]).then(fetchedData => {

      // If there is no data, return error.
      if (!fetchedData) {
        return this.setError(`${symbol} is not a valid stock symbol`);
      }

      let validSymbol = Object.keys(fetchedData)[0],
        data = fetchedData[validSymbol];

      // Ensure summary has been shown.
      if (this.pageData.summary == true) {

        // Declare storage variables, rounding to decimal standard where necessary (preparing for input into database).
        let userCash,
          newCash;
        let singlePrice = this.helper.round(data['price'], 2),
          initialPrice = this.helper.round(singlePrice * shares, 2),
          transactionFee: number,
          finalPrice: number;

        // Fetch current portfolio information from database.
        let portfolioUrl = `portfolios/${this.auth.userKey}/${this.auth.currentPortfolioId}`
        const dbPortfolioRef = this.auth.db.database.ref(portfolioUrl);
        dbPortfolioRef.once('value', (snapshot) => {
          let portfolio = snapshot.val();

          // Determine commission to apply from db.
          let transactionPercent = portfolio['transactionCommission']
          // Removes chance of divide by 0 error.
          if (transactionPercent != 0) {
            transactionFee = this.helper.round(initialPrice / (100 / transactionPercent), 2)
          } else {
            transactionFee = 0;
          }

          // Store for later use.
          finalPrice = this.helper.round(initialPrice + transactionFee, 2);

          // Remove any previous errors shown.
          this.pageData.error = null;

          // Return for next promise.
          return portfolio;

        }).then((snapshot) => {
          // Again assign portfolio info (new scope).
          let portfolio = snapshot.val();

          // Determine current portfolio balance.
          userCash = portfolio['balance'];

          // Determine the amount of this stock the portfolio possesses.
          let currentStock;
          if (portfolio['stocks'] != undefined && portfolio['stocks'][data['symbol']] != undefined) {
            currentStock = portfolio['stocks'][data['symbol']];
          } else {
            currentStock = 0;
          }

          // Ensure portfolio has enough cash to complete purchase, this time *returning* if not.
          if (userCash < finalPrice) {
            this.resetValues()
            return this.setError("Your portfolio balance cannot afford this purchase")
          }

          // Update portfolio balance.
          newCash = this.helper.round(userCash - finalPrice, 2);
          const dbCashRef = this.auth.db.database.ref(`${portfolioUrl}/balance`)
          dbCashRef.set(newCash);

          // Update portfolio stocks
          const dbStockRef = this.auth.db.database.ref(`${portfolioUrl}/stocks`);;
          dbStockRef.child(data['symbol']).set(currentStock + Number(shares))

          // Record purchase in history db
          const currentDate = new Date();
          const timestamp = currentDate.getTime();
          const dbHistoryRef = this.auth.db.database.ref(`${portfolioUrl}/history`);
          dbHistoryRef.child(String(timestamp)).set({
            ownerUid: this.auth.userKey,
            stockSymbol: data['symbol'],
            quantity: Number(shares),
            orderValue: initialPrice,
            transactionFee: transactionFee,
            transactionValue: finalPrice,
            timestamp: timestamp
          });
        }).then(() => {
          // Function success, redirect to overview.
          return this.router.navigate(['overview'])
        });
      }
    }).catch(error => console.log(error))
  }

  // Function to return error in such a way that user can view.
  setError(error) {
    this.pageData.error = error;
    this.pageData.completePurchaseDisabled = true;
  }

}
