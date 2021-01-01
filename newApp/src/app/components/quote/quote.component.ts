import { Component, OnInit } from '@angular/core';
import { HelpersService } from '../../services/helpers.service';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.css']
})
export class QuoteComponent implements OnInit {
  priceMsg: String;
  symbolValue: String;

  constructor(public helper: HelpersService) { }

  ngOnInit() {
  }

  async getQuote(symbol) {
    this.priceMsg = "Loading...";
    if (!symbol) {
      return this.priceMsg = "Must provide symbol";
    }
    await this.helper.lookupPromise(symbol).then(data => {
      if (!data) {
        return this.priceMsg = `${symbol} is not a valid stock symbol`;
      }
      this.priceMsg = `Current price of '${data['name']}' stock: ${this.helper.usd(data['price'])}`;
      this.symbolValue = data['symbol'];
      return;
    }).catch(error => console.log(error));
  }
}
