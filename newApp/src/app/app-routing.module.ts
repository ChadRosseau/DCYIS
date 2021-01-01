import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { AuthGuard } from './services/auth.guard';
import { DashboardGuard } from './services/dashboard.guard';

// Components
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BuyComponent } from './components/buy/buy.component';
import { SellComponent } from './components/sell/sell.component';
import { QuoteComponent } from './components/quote/quote.component';
import { HistoryComponent } from './components/history/history.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { OverviewComponent } from './components/overview/overview.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'quote', component: QuoteComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'profile', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'portfolios', component: DashboardComponent, canActivate: [AuthGuard] }
    ]
  },
  { path: 'overview', component: OverviewComponent, canActivate: [DashboardGuard] },
  { path: 'buy', component: BuyComponent, canActivate: [DashboardGuard] },
  { path: 'sell', component: SellComponent, canActivate: [DashboardGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [DashboardGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
