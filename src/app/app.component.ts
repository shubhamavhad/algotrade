import { Component } from '@angular/core';
import { ConnectService } from './service/connect.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'algotrade-frontend';
  constructor(private authservice:ConnectService,private router:Router){}
  
  isLoggedIn(): boolean {
    return this.authservice.isLoggedIn();
  }
  
 
}
