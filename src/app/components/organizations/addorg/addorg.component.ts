import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConnectService } from 'src/app/service/connect.service';
import * as uuid from 'uuid';

@Component({
  selector: 'app-addorg',
  templateUrl: './addorg.component.html',
  styleUrls: ['./addorg.component.scss']
})
export class AddorgComponent {
  organizationForm:any;
  
  constructor(
    private service: ConnectService,
    private toastr:ToastrService,
    private fb: FormBuilder, // Inject FormBuilder for form creation,
    private dialog:MatDialogRef<AddorgComponent>
  ) { 
  }
   ngOnInit(){
    this.organizationForm = this.fb.group({
      id:this.fb.control(uuid.v4()),
      OrgName: ['', Validators.required],
      OrgadminId: ['', [Validators.required,Validators.email]]
    });
  }
  addOrg(){
  this.service.addOrg(this.organizationForm.value).subscribe(res=>{
       if(res){
        this.toastr.success("Device Added Successfully","Thank you")
        this.dialog.close();
       }
       else
      {
        console.log("The Error Occurred");
        this.toastr.error('Try Again Later','Unknown Error Occurred');
      }
      },err =>{
         console.log(err)
         this.toastr.error('Try Again Later','Unknown Error Occurred');
  });
  }
  

}
