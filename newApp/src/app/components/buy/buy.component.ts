import { Component, OnInit } from '@angular/core';
import { HelpersService } from '../../services/helpers.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.css']
})
export class BuyComponent implements OnInit {
  userObject;
  pageData;

  constructor(public auth: AuthService, public helper: HelpersService) {
    this.auth.user$.subscribe(u => {
      this.userObject = u;
    })
  }

  ngOnInit() {
    this.pageData = {
      error: null,
      summary: false,
      symbol: "",
      shares: 0,
      receiptMessage: "",
      singlePrice: "",
      initialPrice: "",
      transactionFee: "",
      finalPrice: "",
      currentBal: "",
      newBal: ""
    }
  }

  resetValues() {

    for (const [key, value] of Object.entries(this.pageData)) {
      if (key == 'error') {
        this.pageData[key] = null;
      } else if (key == 'summary') {
        this.pageData[key] = false;
      } else if (key == 'symbol' || key == 'shares') {

      } else {
        this.pageData[key] = ""
      }
    }
  }

  // Buy shares of stock
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

      console.log(data['price']);
      let singlePrice = this.helper.round(data['price'], 2),
        initialPrice = this.helper.round(singlePrice * shares, 2),
        transactionFee = this.helper.round(initialPrice / 100, 2),
        finalPrice = this.helper.round(initialPrice + transactionFee, 2);

      // Set message for receipt
      // this.pageData.receiptMessage = `Receipt for ${shares} piece(s) of '${data['name']}' (${data['symbol']}) stock:`;

      if (this.pageData.summary == false) {
        console.log(this.auth.userKey)
        let userCash;
        let newCash;
        const dbUserBalRef = this.auth.db.database.ref(`portfolios/${this.auth.userKey}/balance`);
        dbUserBalRef.once('value', (snapshot) => {
          userCash = snapshot.val();
          this.pageData.error = null;
        }).then(() => {
          if (userCash < finalPrice) {
            this.setError("Your portfolio balance cannot afford this purchase")
          }
          newCash = this.helper.round(userCash - finalPrice, 2);
          // Update page data
          this.pageData.symbol = data['symbol'];
          this.pageData.shares = shares;
          this.pageData.singlePrice = this.helper.usd(singlePrice);
          this.pageData.initialPrice = this.helper.usd(initialPrice);
          this.pageData.transactionFee = this.helper.usd(transactionFee);
          this.pageData.finalPrice = this.helper.usd(finalPrice);
          this.pageData.currentBal = this.helper.usd(userCash);
          this.pageData.newBal = this.helper.usd(newCash);
          return newCash;

        }).then(() => {
          // console.log(newCash);
          // console.log(this.helper.usd(newCash));
          // this.pageData.newBal = this.helper.usd(newCash);
          this.pageData.summary = true;
        })
      }
    }).catch(error => console.log(error));

    // elif buySummary == True:

    //       # Get user data from db
    // userCash = db.execute("SELECT cash FROM users WHERE id=:userId", userId = session["user_id"])[0]['cash']

    //       # Ensure user has enough cash for purchase
    //       if userCash < finalPrice:
    //       return console.log("Your account balance cannot afford this purchase.")

    //       # Set new user balance
    //   newCash = round(userCash - finalPrice, 2)
    //   db.execute("UPDATE users SET cash=:newCash WHERE id=:userId", newCash = newCash, userId = session["user_id"])

    //       # Record purchase in history db
    //   db.execute("INSERT INTO purchaseHistory (userId, stockSymbol, quantity, price) VALUES (:userId, :symbol, :quantity, :price)", userId = session["user_id"], symbol = data['symbol'], quantity = shares, price = finalPrice)

    //       # Check for instance of user and stock in userStocks db
    //   checkExists = db.execute("SELECT EXISTS(SELECT * from userStocks WHERE userId=:userId AND stockSymbol=:symbol);", userId = session["user_id"], symbol = data['symbol'])
    //   checkExists = checkExists[0]
    //   checkExists = list(checkExists.values())
    //   checkExists = checkExists[0]
    //   if checkExists == 0:
    //     db.execute("INSERT INTO userStocks (userId, stockSymbol, quantity) VALUES (:userId, :symbol, :quantity)", userId = session["user_id"], symbol = data['symbol'], quantity = shares)
    //   else:
    //   currentQuantity = db.execute("SELECT quantity FROM userStocks WHERE userId=:userId AND stockSymbol=:symbol", userId = session["user_id"], symbol = data['symbol'])
    //   currentQuantity = currentQuantity[0]['quantity']
    //   newQuantity = currentQuantity + shares
    //   db.execute("UPDATE userStocks SET quantity=:newQuantity WHERE userId=:userId AND stockSymbol=:symbol", userId = session["user_id"], symbol = data['symbol'], newQuantity = newQuantity)

    //       # render_template("confirmation.html")
    //   buySummary = False
    //   return redirect("/")

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
  }

}
