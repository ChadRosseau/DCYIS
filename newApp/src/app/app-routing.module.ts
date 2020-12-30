import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { AuthGuard } from './services/auth.guard';

// Components
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BuyComponent } from './components/buy/buy.component';
import { SellComponent } from './components/sell/sell.component';
import { QuoteComponent } from './components/quote/quote.component';
import { HistoryComponent } from './components/history/history.component';
import { LoginComponent } from './components/login/login.component';


const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'buy', component: BuyComponent, canActivate: [AuthGuard] },
  { path: 'sell', component: SellComponent, canActivate: [AuthGuard] },
  { path: 'quote', component: QuoteComponent, canActivate: [AuthGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
