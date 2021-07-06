import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { CompetitionsService } from './services/competitions.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public auth: AuthService, public competitions: CompetitionsService) {

  }
}
