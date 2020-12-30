import { isSyntheticPropertyOrListener } from '@angular/compiler/src/render3/util';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.afAuth.user;
    this.IsTest();
  }

  IsTest() {
    var test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      console.log("available")
    } catch (e) {
      console.log("not available")
    }
  }

}
