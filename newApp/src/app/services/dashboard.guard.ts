import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) { }
  canActivate(next, state) {
    if (this.auth.currentPortfolioId == null) {
      console.log('access denied');
      this.router.navigate(['/dashboard/profile']);
      return false;
    }
    return true;
  }

}
