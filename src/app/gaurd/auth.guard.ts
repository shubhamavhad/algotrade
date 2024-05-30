import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ConnectService } from '../service/connect.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: ConnectService, private router: Router,private toastr:ToastrService) {}

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      if(route.url.length>0){
        let menu=route.url[0].path;
        if(menu=='organizations')
          {
            if(this.authService.getuserRoleSession()=='1'||this.authService.getuserRoleSession()=='2')
              {
                return true;
              }
              else{
              this.toastr.error("Sorry you don't have access to the tab! This is going to be reported","Admin Only");
              this.router.navigate(['/dashboard']);
              return false;
              }
          }else if(menu=='accounts'){
              if(this.authService.getuserRoleSession()=='1'|| this.authService.getuserRoleSession()=='2'){
                return true;
              }else{
                this.toastr.error("Sorry you don't have access to the tab! This is going to be reported","Admin Only");
                this.router.navigate(['/dashboard'])
              }
          }
          else{
            return true;
          }
      }
      return true;
    } else {
      this.router.navigate(['/login']); // Redirect to login page if not logged in
      return false;
    }
  }
  
}
