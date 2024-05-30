import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { UsersComponent } from './components/users/users.component';
import { OrganizationsComponent } from './components/organizations/organizations.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HoldingComponent } from './components/holding/holding.component';
import { PositionComponent } from './components/position/position.component';
import { OrdersComponent } from './components/orders/orders.component';
import { OtpAuthComponent } from './components/otp-auth/otp-auth.component';
import { AuthGuard } from './gaurd/auth.guard';
import { CopyTradeComponent } from './components/copy-trade/copy-trade.component';

const routes: Routes = [
  {path:'',redirectTo:'login',pathMatch: 'full'},
  {path:'dashboard',title:'Dashoard',component:DashboardComponent,canActivate:[AuthGuard]},
  {path:'accounts',title:'Accounts',component:AccountsComponent,canActivate:[AuthGuard]},
  {path:'copy-trade',title:'Copy-Trade',component:CopyTradeComponent},
  {path:'users',title:'Users',component:UsersComponent},
  {path:'dashboard',children:[
    {path:'holding',title:'Dashoard | holding',component:HoldingComponent},
    {path:'position',title:'Dashoard | position',component:PositionComponent},
    {path:'orders',title:'Dashoard | Orders',component:OrdersComponent}
  ]},
  {path:'organizations',title:'Organization',component:OrganizationsComponent,canActivate:[AuthGuard]},
  {path:'settings',component:SettingsComponent},
  {path:'login',component:LoginComponent},
  {path:'register',component:RegisterComponent},
  {path:'otp-auth',component:OtpAuthComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
