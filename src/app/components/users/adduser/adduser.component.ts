import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConnectService } from 'src/app/service/connect.service';
import * as uuid from 'uuid';

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.scss']
})
export class AdduserComponent implements OnInit {
  registerForm!: FormGroup;
  orglist: any[] = [];
  userRole: any[] = [];
  account: any;

  constructor(
    private dialog: MatDialogRef<AdduserComponent>,
    private service: ConnectService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      id: this.fb.control(uuid.v4()),
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // confirmPassword: ['', Validators.required],
      orgId: ['', Validators.required].toString(),
      isActive: [false, Validators.requiredTrue],
      userRole: ['', Validators.required],
      account_id: ['', Validators.required],
      account_passwd: ['', Validators.required],
      gtoken: ['', Validators.required]
    });

    this.loadOrg();
    this.fetchUserRole();
  }

  loadOrg() {
    if (sessionStorage.getItem('userRole') === '1') {
      this.service.getAllOrg().subscribe(res => {
        console.log(res);
        this.orglist = res;
      });
    } else {
      const orgId = sessionStorage.getItem('orgId')?.toString();
      // console.log(sessionStorage.getItem('orgId'))

      this.account = this.fb.group({
        orgId: orgId
      });
      console.log(this.account.value);

      this.service.getOrgByid(this.account.value).subscribe(

        (data) => {
          this.orglist = data;
        });
    }
  }

  fetchUserRole() {

    this.service.getUserRole().subscribe(res => {
      if (sessionStorage.getItem('userRole') === '2') { // Organization Admin
        this.userRole = res.filter((role: any) => role.userRole === 'User');
      } else {
        this.userRole = res;
      }
      // this.userRole = res;
    });
  }
  // Custom validator function for matching passwords

  addUser() {
    console.log(this.registerForm.value);

    this.service.addUser(this.registerForm.value).subscribe(res => {
      if (res) {
        this.toastr.success("User Added Successfully", "Thank you")
        this.dialog.close();
      }
      else {
        console.log("The Error Occurred");
        this.toastr.error('Try Again Later', 'Unknown Error Occurred');
      }
    }, err => {
      console.log(err)
    });
  }
}