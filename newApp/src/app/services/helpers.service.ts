import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { StylesCompileDependency } from '@angular/compiler';
import { callbackify } from 'util';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {
  userObject;
  errorMessage;
  stockData;

  constructor(
    public auth: AuthService,
    public router: Router
  ) {
    if (auth.user$) {
      this.auth.user$.subscribe(u => {
        this.userObject = u;
      })
    }
  }

  ngOnInit() {

  }

  log() {
    console.log(this.userObject.uid);
  }

  apology(message) {
    // Render message as an error to user.
    this.errorMessage = message;
    return this.router.navigate(['/error'])
  }

  lookupPromise(symbol) {
    let data = this.lookup(symbol)
    return new Promise((resolve, reject) => {
      if (data != null) {
        resolve(data)
      } else {
        reject("Invalid symbol");
      }
    })
  }

  // Look up quote for symbol.
  lookup = async (symbol) => {
    // Contact API
    let apiKey = environment.API_KEY,
      proxyUrl = 'https://salty-plains-62865.herokuapp.com/',
      targetUrl = `https://cloud-sse.iexapis.com/stable/stock/${symbol}/quote?token=${apiKey}`;
    const data = await fetch(proxyUrl + targetUrl);
    try {
      const json = await data.json(),
        final = {
          name: json["companyName"],
          price: parseFloat(json["latestPrice"]),
          symbol: json["symbol"]
        }
      return final;
    } catch (e) {
      console.log(e);
      return null;
    }
  }


  // .then(d => d.json())
  // .then(res => {
  //   return res;
  // }).catch(e => {
  //   console.log(e);
  //   return e;
  // });

  // // Parse response
  // try {
  //   let quote = data;
  //   return {
  //     "name": quote["companyName"],
  //     "price": parseFloat(quote["latestPrice"]),
  //     "symbol": quote["symbol"]
  //   }
  // } catch (e) {
  //   if (e instanceof TypeError) { return null; }
  // }


  // Format value as USD.
  usd(value) {
    value = value.toFixed(2);
    return `$${value}`;
  }

  round(num, decimals) {
    num = num.toFixed(decimals);
    return Number(num);
  }

  toNegative(num) {
    return (num - (2 * num));
  }

  // Convert positive integer to negative
  toPercent(percentChange) {
    percentChange = percentChange.toFixed(2);
    if (percentChange > 0) {
      return `+${percentChange}%`;
    } else {
      return `${percentChange}%`;
    }
  }

  // Determine color for percent
  getPercentColor(percentChange, quantity) {
    if ((percentChange > 0 && quantity > 0) || (percentChange < 0 && quantity < 0)) {
      return "green"
    } else if ((percentChange < 0 && quantity > 0) || (percentChange > 0 && quantity < 0)) {
      return "red"
    } else {
      return "black"
    }
  }
}
