import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConnectService } from 'src/app/service/connect.service';
import * as uuid from 'uuid';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss']
})
export class AddAccountComponent {
  addAccountform: any;
  userlist: any;
  userinfo: any;
  constructor(
    private service: ConnectService,
    private toastr: ToastrService,
    private fb: FormBuilder, // Inject FormBuilder for form creation,
    private dialog: MatDialogRef<AddAccountComponent>
  ) {
  }
  ngOnInit() {
    this.fetchUser()
    this.addAccountform = this.fb.group({
      id: this.fb.control(uuid.v4()),
      Name:['',Validators.required],
      Account_api: ['', Validators.required],
      Account_secret: ['', [Validators.required, Validators.email]],
      multiplier:['',Validators.required],
      isLinked:false,
      isTrade:false
    });
  }
  addAccount() {
    console.log(this.addAccountform.value);
    
    this.service.addAccount(this.addAccountform.value).subscribe(res => {
      if (res) {
        this.toastr.success("Account Added Successfully", "Thank you")
        this.dialog.close();
      }
      else {
        console.log("The Error Occurred");
        this.toastr.error('Try Again Later', 'Unknown Error Occurred');
      }
    }, err => {
      console.log(err)
      this.toastr.error('Account_details already exist','please update your account deatils');
    });
  }

  fetchUser() {
    if (sessionStorage.getItem('userRole') === '1') {
      this.service.getAllUser().subscribe((data) => {
        console.log(data);

        this.userlist = data
      })
    }else if(sessionStorage.getItem('userRole')==='2'){
      const orgId = sessionStorage.getItem('orgId');
      this.userinfo = this.fb.group({
        orgId: orgId?.toString()
      })
      this.service.getUserByOrgId(this.userinfo.value).subscribe((data)=>{
        console.log(data);
        
        this.userlist=data;
      })
    }
  }


}
