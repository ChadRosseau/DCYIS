import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HelpersService } from '../../services/helpers.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  userObject = null;

  constructor(public auth: AuthService, public helper: HelpersService) {
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

  async lookUpBtn(symbol) {
    let data = await this.helper.lookup(symbol);

    console.log("final: " + data);
  }
}
