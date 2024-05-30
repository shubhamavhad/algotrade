import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {MatToolbarModule,} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';

import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UsersComponent } from './components/users/users.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OrganizationsComponent } from './components/organizations/organizations.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SettingsComponent } from './components/settings/settings.component';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { ToastrModule } from 'ngx-toastr';
import { MatFormFieldModule, } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { AddorgComponent } from './components/organizations/addorg/addorg.component';
import { AdduserComponent } from './components/users/adduser/adduser.component';
import { MatDialogModule } from '@angular/material/dialog';
import { UpdateorgComponent } from './components/organizations/updateorg/updateorg.component';
import { HoldingComponent } from './components/holding/holding.component';
import { PositionComponent } from './components/position/position.component';
import { OrdersComponent } from './components/orders/orders.component';
import { MatCardModule } from '@angular/material/card';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
// import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { AddAccountComponent } from './components/accounts/add-account/add-account.component';
import { AuthAccountComponent } from './components/accounts/auth-account/auth-account.component';
import { UpdateUserComponent } from './components/users/update-user/update-user.component';
import { OtpAuthComponent } from './components/otp-auth/otp-auth.component';
import { CopyTradeComponent } from './components/copy-trade/copy-trade.component';
import { FormsModule } from '@angular/forms';
import {  MatSlideToggleModule,_MatSlideToggleRequiredValidatorModule} from '@angular/material/slide-toggle';
// import { ToastrModule } from 'ngx-toastr';




@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    UsersComponent,
    DashboardComponent,
    OrganizationsComponent,
    AccountsComponent,
    LoginComponent,
    RegisterComponent,
    SettingsComponent,
    AddorgComponent,
    AdduserComponent,
    UpdateorgComponent,
    HoldingComponent,
    PositionComponent,
    OrdersComponent,
    AddAccountComponent,
    AuthAccountComponent,
    UpdateUserComponent,
    OtpAuthComponent,
    CopyTradeComponent,
    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    HttpClientModule,
    MatTableModule,
    MatDialogModule,
    ToastrModule.forRoot(),
    MatFormFieldModule,
    ReactiveFormsModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule,
    MatListModule,
    MatSidenavModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    FormsModule,
    MatSlideToggleModule,
    _MatSlideToggleRequiredValidatorModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
