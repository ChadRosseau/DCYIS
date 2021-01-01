import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portfolio-info',
  templateUrl: './portfolio-info.component.html',
  styleUrls: ['./portfolio-info.component.css']
})
export class PortfolioInfoComponent implements OnInit {
  newPortfolio;
  userObject;
  error: string;
  portfolios$;
  currentlyEditing;

  constructor(public auth: AuthService, private router: Router) {
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

  async addPortfolio(name, description, startingBalance, transactionCommission) {

    this.setError('');

    if (!name) {
      return this.setError("New portfolio must have name");
    } else if (!description) {
      return this.setError("New portfolio must have description");
    } else if (!startingBalance || startingBalance <= 0) {
      return this.setError("New portfolio starting balance must be a positive number");
    } else {
    }

    this.newPortfolio.adding = false;

    if (!transactionCommission) {
      transactionCommission = 0;
    }

    const dbUserPortfoliosRef = await this.auth.db.database.ref(`portfolios/${this.userObject.uid}`);
    let newPush = dbUserPortfoliosRef.push()
    let pushId = (await newPush).key;
    newPush.set({
      id: pushId,
      ownerUid: this.userObject.uid,
      name: name,
      description: description,
      startingBal: Number(startingBalance),
      balance: Number(startingBalance),
      transactionCommission: Number(transactionCommission),
      stocks: [],
      history: []
    });
  }

  cancelAdd() {
    this.newPortfolio.adding = false;
    this.newPortfolio.name = '';
    this.newPortfolio.description = '';
    this.newPortfolio.startingBal = 10000;
    this.newPortfolio.transactionCommission = 1;
  }

  errorDuringAdd(name, description, startingBalance, transactionCommission) {
    this.newPortfolio.adding = true;
    this.newPortfolio.name = name;
    this.newPortfolio.description = description;
    this.newPortfolio.startingBal = startingBalance;
    this.newPortfolio.transactionCommission = transactionCommission;
  }

  setPortfolio(pId) {
    this.auth.currentPortfolioId = pId;
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
