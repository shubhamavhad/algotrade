import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConnectService } from 'src/app/service/connect.service';

@Component({
  selector: 'app-updateorg',
  templateUrl: './updateorg.component.html',
  styleUrls: ['./updateorg.component.scss']
})
export class UpdateorgComponent {
  updateOrgForm: any;
  organizationId: any;
  constructor(private service: ConnectService,
    private toastr: ToastrService,
    private fb: FormBuilder, // Inject FormBuilder for form creation,
    private dialog: MatDialogRef<UpdateorgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.organizationId = this.data; 
    console.log("Data",this.organizationId);
    this.updateOrgForm = this.fb.group({
      OrgadminId: ['', [Validators.required, Validators.email]]
    });
  }
  updateOrg() {
    const request={
      id:this.organizationId.id,
      OrgName:this.organizationId.OrgName,
      OrgadminId: this.updateOrgForm.get('OrgadminId').value 
    }
     console.log(request);
 
    this.service.updateOrg(this.organizationId.id,request).subscribe(
      (res) => {
        console.log("Data is updated successfully");
        
        this.toastr.success("Organization email updated successfully", "Success");
        this.dialog.close();
      },
      (err) => {
        console.error("Error occurred while updating organization email:", err);
        this.toastr.error("Failed to update organization email", "Error");
      }
    );

  }
}
