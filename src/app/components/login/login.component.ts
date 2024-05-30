import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConnectService } from 'src/app/service/connect.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  userdata:any;
  loginForm:any;
  constructor(
    private service: ConnectService,
    private toastr:ToastrService,
    private fb: FormBuilder,
    private router:Router
  ) {    
    sessionStorage.clear();
  }
 ngOnInit() {
  this.loginForm=this.fb.group({
    username: ['', Validators.required],
    password:['',Validators.required]
  })
 }
  getNum(){
    console.log(this.loginForm.value);
    if(this.loginForm.valid){
      console.log("in the loop");
      
      this.service.getUserLogin(this.loginForm.value).subscribe((res:any)=>{
        console.log(res);
        const userRole=res.userRole;
        const token = res.access_token
        const orgId=res.orgId
        const userid=res.id
        const name=res.name
        sessionStorage.setItem('token',token);
        sessionStorage.setItem('userRole',userRole);
        sessionStorage.setItem('orgId',orgId);
        sessionStorage.setItem('userId',userid);
        sessionStorage.setItem('name',name);
        this.router.navigate(['/dashboard']);
        this.toastr.success("login successfully")
      },
      (error) => {
        console.log(error);
        this.toastr.error('Invalid email or password');
      });

    }
  }
}
