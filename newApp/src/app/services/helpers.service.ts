import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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

  log() {
    console.log(this.userObject.uid);
  }

  apology(message) {
    // Render message as an error to user.
    this.errorMessage = message;
    return this.router.navigate(['/error'])
  }

  async lookupPromise(symbolList) {
    return await this.lookup(symbolList).then(data => {
      return new Promise((resolve, reject) => {
        if (!data) {
          reject("No data")
        }
        let keysList = Object.keys(data);
        for (let i = 0; i < keysList.length; i++) {
          let currentKey = keysList[i];
          if (data[currentKey] != undefined) {
            this.updateStorage(data[currentKey]['symbol'], data[currentKey]);
          } else {
            console.log(`${data[currentKey]['symbol']} not a valid symbol, storage update failed.`)
          }
        }
        resolve(data);
      })
    }).catch(error => console.log(error));
  }

  updateStorage(symbol, data) {
    let storage = sessionStorage.getItem("stockData")
    console.log(`Updated '${data["name"]}' information`);
    if (storage != null) {
      let json = JSON.parse(storage);
      json[symbol] = data;
      sessionStorage.setItem("stockData", JSON.stringify(json));
    } else {
      sessionStorage.setItem("stockData", JSON.stringify({ [symbol]: data }));
    }
  }

  getAllStocks(symbol) {
    let storage = sessionStorage.getItem("stockData")
    return new Promise((resolve, reject) => {
      if (storage != null) {
        let json = JSON.parse(storage);
        let keys = Object.keys(json);
        if (keys.includes(symbol)) {
          return resolve(json[symbol]);
        } else {
          return reject(keys);
        }
      } else {
        return reject(symbol);
      }
    })
  }

  // Look up quote for symbol.
  async lookup(symbolList) {
    let symbols = "",
      listLen = symbolList.length;
    for (let i = 0; i < listLen; i++) {
      if (i == listLen - 1) {
        symbols = symbols.concat(symbolList[i]);
      } else {
        symbols = symbols.concat(symbolList[i] + ",");
      }
    }

    // Contact API
    let apiKey = environment.API_KEY,
      proxyUrl = 'https://salty-plains-62865.herokuapp.com/',
      targetUrl = `https://cloud.iexapis.com/stable/stock/market/batch?types=quote&symbols=${symbols}&token=${apiKey}`;
    const data = await fetch(proxyUrl + targetUrl);
    try {
      const json = await data.json();
      let finalData = {},
        keys = Object.keys(json);
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i],
          data = json[key]['quote'],
          final;
        if (data == null) {
          final = null;
        } else {
          final = {
            "name": data["companyName"],
            "price": parseFloat(data["latestPrice"]),
            "symbol": data["symbol"]
          }
        }
        finalData = {
          ...finalData,
          [key]: final
        }
      }
      return finalData;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // Check user inputs of buy/sell.
  checkInputs(symbol, shares) {
    // Ensure symbol was submitted
    if (!symbol) {
      return "Must provide a value for symbol";
    }

    // Ensure shares was submitted
    else if (!shares) {
      return "Must provide a value for quantity.";
    }

    // Ensure shares is over 0
    else if (shares <= 0) {
      return "Quantity must be over 0.";
    }

    // Ensure shares is a integer.
    try {
      shares = parseInt(shares);
    } catch (e) {
      return "Quantity must be an integer.";
    }
  }


  // Format value as USD.
  usd(value) {
    value = Number(value).toFixed(2);
    return `$${value}`;
  }

  round(num, decimals) {
    num = num.toFixed(decimals);
    return Number(num);
  }

  // Convert positive integer to negative
  toNegative(num) {
    return (num - (2 * num));
  }

  toPercent(percentChange) {
    if (percentChange) {
      percentChange = percentChange.toFixed(2);
      if (percentChange > 0) {
        return `+${percentChange}%`;
      } else if (percentChange < 0) {
        return `${percentChange}%`;
      } else {
        return `0.00%`;
      }
    } else {
      return `0.00%`;
    }
  }

  // Determine color for percent
  getPercentColor(percentChange, quantity) {
    if (percentChange) {
      if ((percentChange > 0 && quantity > 0) || (percentChange < 0 && quantity < 0)) {
        return "green";
      } else if ((percentChange < 0 && quantity > 0) || (percentChange > 0 && quantity < 0)) {
        return "red";
      } else {
        return "black";
      }
    } else {
      return "black";
    }
  }

  toTime(dateISO) {
    const zDatetime = new Date(dateISO);
    let date = this.datePad(zDatetime.getDate()),
      month = this.datePad(zDatetime.getMonth()),
      year = this.datePad(zDatetime.getFullYear()),
      hour = this.datePad(zDatetime.getHours()),
      minute = this.datePad(zDatetime.getMinutes()),
      second = this.datePad(zDatetime.getSeconds());
    let timestamp = `${date}/${month + 1}/${year} - ${hour}:${minute}:${second}`;
    return timestamp;
  }

  datePad(n) {
    return n < 10 ? '0' + n : n;
  }
}
