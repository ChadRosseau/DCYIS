import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class CompetitionsService {
  currentComp;

  constructor(private auth: AuthService, private helpers: HelpersService) {
    this.auth.db.database.ref(`compData`).once('value', snapshot => {
      let data = snapshot.val();
      this.currentComp = data['currentComp'];
      let lastUpdated = data[this.currentComp]['updated'];
      let datestamp = new Date(Date.now()),
        date = datestamp.getDate(),
        month = datestamp.getMonth(),
        year = datestamp.getFullYear();
      let dateString = `${date}/${month}/${year}`;

      if (lastUpdated != dateString) {
        this.updateStandings();
        this.auth.db.database.ref(`compData/${this.currentComp}/updated`).set(`${dateString}`)
      }
    })
  }

  updateStandings() {
    let portfolioList = [],
      portfolioStocks = {},
      tickerList = [];
    this.auth.db.database.ref(`compPortfolios/${this.currentComp}`).once('value', snapshot => {
      let data = snapshot.val();
      portfolioList = Object.values(data);
    }).then(() => {
      this.auth.db.database.ref(`portfolios`).once('value', snapshot => {
        let allPortfolios = snapshot.val();
        for (let i = 0; i < portfolioList.length; i++) {
          let portfolio = portfolioList[i];
          let owner = portfolio['ownerUid'],
            id = portfolio['id'];
          portfolioList[i]['currentValue'] = allPortfolios[owner][id]['balance'];
          portfolioStocks[owner] = [];
          if (allPortfolios[owner][id]['stocks']) {
            Object.keys(allPortfolios[owner][id]['stocks']).forEach(stock => {
              if (!tickerList.includes(stock)) { tickerList.push(stock) }
            })
            Object.entries(allPortfolios[owner][id]['stocks']).forEach(stock => {
              portfolioStocks[owner][stock[0]] = stock[1];
            })
          }
        }
      }).then(() => {
        this.helpers.lookupPromise(tickerList).then(data => {
          for (let i = 0; i < Object.values(portfolioList).length; i++) {
            let owner = Object.values(portfolioList)[i]['ownerUid'];
            if (!Object.keys(portfolioStocks).includes(owner)) { continue }
            let total = 0;
            Object.entries(portfolioStocks[owner]).forEach(element => {
              total = total + (data[element[0]]['price'] * Number(element[1]));
            });
            portfolioList[i]['currentValue'] = Math.round((portfolioList[i]['currentValue'] + total) * 100) / 100;
          }
        }).then(() => {
          let newObject = {}
          Object.values(portfolioList).forEach(portfolio => {
            newObject[portfolio['ownerUid']] = portfolio;
          })
          this.auth.db.database.ref(`compPortfolios/${this.currentComp}`).set(newObject);
        })
      })
    })
  }
}
