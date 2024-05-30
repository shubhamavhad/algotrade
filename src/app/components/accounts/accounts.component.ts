// import { Component } from '@angular/core';
import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { ConnectService } from 'src/app/service/connect.service';
import { AuthAccountComponent } from './auth-account/auth-account.component';
import { AddAccountComponent } from './add-account/add-account.component';
// import { AuthAccountComponent } from './auth-account/auth-account.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent {
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['srNo', 'userName', 'api_key', 'api_secret', 'Actions'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  data: any
  account: any;
  constructor(private service: ConnectService, private fb: FormBuilder, private dialog: MatDialog, private toastr: ToastrService) { }

  ngAfterViewInit() {
    this.fetchAccs();
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
  fetchAccs() {
    if (sessionStorage.getItem('userRole') === '1') {
      this.service.getAllAccs().subscribe(

        (data) => {
          console.log(data);

          this.dataSource.data = data.map((item: any, index: number) => ({
            ...item,
            srNo: index + 1
          }));

        },
        (error) => {
          console.error('Error fetching organizations:', error);
        }
      );
    }else if(sessionStorage.getItem('userRole')==='2'){
      const org_Id = sessionStorage.getItem('orgId');
      this.account = this.fb.group({ org_Id: org_Id?.toString() });
      this.service.accountInfoByOrgid(this.account.value).subscribe(

        (data) => {
          console.log(data);

          this.dataSource.data = data.map((item: any, index: number) => ({
            ...item,
            srNo: index + 1
          }));

        },
        (error) => {
          console.error('Error fetching organizations:', error);
        }
      );
    }
  }


  deleteAccs(element: any) {
    if (confirm("Do you want to delete the Device?")) {
      this.service.deleteAccount(element.id).subscribe(res => {
        if (res) {
          this.toastr.success("Account removed from your profile sucessfully", "Deleted Successfully");
        } else {
          this.toastr.error("Unknown Error occurred please try again after sometime", "Unknown Error");
        }
        this.fetchAccs()
      })
    }
  }
  updateAccs(data: any) {

  }
  Addacc() {
    const popup = this.dialog.open(AddAccountComponent, {
      enterAnimationDuration: '1000ms',
      exitAnimationDuration: '500ms',
      width: '25%',

    });
    popup.afterClosed().subscribe(res => {
      this.fetchAccs();
    });
  }
  setCreds(data: any) {
    this.data = this.fb.group({
      api_key: data.api_key,
      api_secret: data.api_secret
    });

    this.service.setCreds(this.data.value).subscribe(
      (res) => {
        if (res) {
          let link = res.login_url;
          console.log(link)
          window.open(link, '_blank')?.focus();
          const popup = this.dialog.open(AuthAccountComponent, {
            enterAnimationDuration: '1000ms',
            exitAnimationDuration: '500ms',
            width: '25%',

          });
          popup.afterClosed().subscribe(res => {
            console.log("Successfully Done")
          });
          // } else {
          //   console.log("The Error Occurred");
          //   this.toastr.error('No URL Link Provided', 'Error');
          // }
        } else {
          console.log("The Error Occurred");
          this.toastr.error('Try Again Later', 'Unknown Error Occurred');
        }
      },
      (err) => {
        console.log(err);
        this.toastr.error('Try Again Later', 'Unknown Error Occurred');
      }
    );
  }


}
