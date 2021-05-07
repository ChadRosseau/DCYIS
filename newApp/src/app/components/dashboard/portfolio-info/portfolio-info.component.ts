import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { HelpersService } from '../../../services/helpers.service';

@Component({
  selector: 'app-portfolio-info',
  templateUrl: './portfolio-info.component.html',
  styleUrls: ['./portfolio-info.component.css']
})
export class PortfolioInfoComponent implements OnInit {
  newPortfolio = {
    adding: false,
    name: "",
    description: "",
    startingBal: 10000,
    transactionCommission: 1
  };
  userObject;
  error: string;
  portfolios$;
  currentlyEditing;

  constructor(public auth: AuthService, private router: Router, private helper: HelpersService) {
    if (auth.user$) {
      this.auth.user$.subscribe(u => {
        this.userObject = u;
        if (u) {
          this.auth.db.object<any>(`portfolios/${u.uid}`).valueChanges().subscribe(values => {
            if (values != null) {
              this.portfolios$ = (Object as any).values(values);
            }
          }, error => {
            console.log(error);
          });
        }
      });
    }
  }

  ngOnInit() {
    this.newPortfolio = {
      adding: false,
      name: "",
      description: "",
      startingBal: 10000,
      transactionCommission: 1
    };
    this.error = "";
    this.currentlyEditing = -1;
  }

  addPortfolio(commissionType) {

    this.setError('');

    let name = this.newPortfolio.name,
      description = this.newPortfolio.description,
      startingBalance = this.newPortfolio.startingBal,
      transactionCommission = this.newPortfolio.transactionCommission;

    if (!name) {
      return this.setError("New portfolio must have name");
    } else if (!description) {
      return this.setError("New portfolio must have description");
    } else if (!startingBalance || startingBalance <= 0) {
      return this.setError("New portfolio starting balance must be a positive number");
    } else {
    }

    if (!transactionCommission || transactionCommission < 0) {
      transactionCommission = 0;
    }

    const dbUserPortfoliosRef = this.auth.db.database.ref(`portfolios/${this.userObject.uid}`);
    let newPush = dbUserPortfoliosRef.push()
    let pushId = newPush.key;
    newPush.set({
      id: pushId,
      ownerUid: this.userObject.uid,
      name: name,
      description: description,
      startingBal: Number(startingBalance),
      balance: Number(startingBalance),
      transactionCommission: Number(transactionCommission),
      commissionType: commissionType,
      stocks: [],
      history: [],
      stonks: false
    });

    this.cancelAdd();
  }

  cancelAdd() {
    this.newPortfolio = {
      adding: false,
      name: "",
      description: "",
      startingBal: 10000,
      transactionCommission: 1
    };
    console.log("cancelled");
  }

  setPortfolio(pId, stonks) {
    this.auth.currentPortfolioId = pId;
    this.auth.currentPortfolioStonks = stonks;
    console.log(pId);
    return this.router.navigate(['overview'])
  }

  startEditing(index) {
    this.currentlyEditing = index;
  }

  submitEdits(pId, index) {
    console.log(pId);
    console.log(index);
    console.log(this['pName' + index].value);
    this.currentlyEditing = -1;
  }

  setError(error) {
    this.error = error;
  }


}
