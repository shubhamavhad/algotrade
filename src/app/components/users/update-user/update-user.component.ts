import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConnectService } from 'src/app/service/connect.service';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.scss']
})
export class UpdateUserComponent {
  updateForm: any;
  userData: any;
  userRole: any[] = [];
  constructor(
    private dialog: MatDialogRef<UpdateUserComponent>,
    private service: ConnectService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.userData = this.data;
    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // isActive: [false, Validators.requiredTrue],
      userRole: ['', Validators.required]
    });
    this.fetchUserRole();
  }

  fetchUserRole() {
    this.service.getUserRole().subscribe(res => {
      this.userRole = res;
    });
  }
  updateUser() {
    const request = {
      id: this.userData.id,
      name: this.updateForm.get('name').value,
      email: this.updateForm.get('email').value,
      phone: this.updateForm.get('phone').value,
      password: this.updateForm.get('password').value,
      isActive: this.userData.isActive,
      userRole: this.updateForm.get('userRole').value,
      orgId: this.userData.orgId,
      account_id:this.userData.account_id,
      account_passwd:this.userData.account_passwd,
      gtoken:this.userData.gtoken

    }
    this.service.updateUser(this.userData.id, request).subscribe(
      (res) => {
        console.log("Data is updated successfully");

        this.toastr.success("User updated successfully", "Success");
        this.dialog.close();
      },
      (err) => {
        console.error("Error occurred while updating organization email:", err);
        this.toastr.error("Failed to update organization email", "Error");
      }
    );
  }
}
