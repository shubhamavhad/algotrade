import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
// import { AddorgComponent } from './addorg/addorg.component';
import { MatDialog } from '@angular/material/dialog';
import { ConnectService } from 'src/app/service/connect.service';
import { AddorgComponent } from './addorg/addorg.component';
// import { UpdateorgComponent } from './updateorg/updateorg.component';
import { ToastrService } from 'ngx-toastr';
import { UpdateorgComponent } from './updateorg/updateorg.component';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss']
})
export class OrganizationsComponent implements AfterViewInit {
  dataSource = new MatTableDataSource<any>([]);
  account:any
  displayedColumns: string[] = ['srNo', 'Organization_Name', 'Admin_Email', 'Actions'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private service: ConnectService, private dialog: MatDialog, private toastr: ToastrService,private fb: FormBuilder) { }
  Addorg() {
    const popup = this.dialog.open(AddorgComponent, {
      enterAnimationDuration: '1000ms',
      exitAnimationDuration: '500ms',
      width: '25%',

    });
    popup.afterClosed().subscribe(res => {
      this.fetchOrganizations();
    });
  }
  updateOrg(element: any) {



    const orgIndex = this.dataSource.data.findIndex((org: any) => org.id === element.id);
    if (orgIndex !== -1) {
      console.log("Inner log");

      const popup = this.dialog.open(UpdateorgComponent, {
        enterAnimationDuration: '1000ms',
        exitAnimationDuration: '500ms',
        width: '24%',
        data: element

      });
      popup.afterClosed().subscribe(res => {
        this.fetchOrganizations();
      });
    } else {
      console.log("Orgozation is not found in the list");

    }
  }
  deleteOrg(element: any) {

    console.log("Delete the organization");
    if (confirm("Do you want to delete the Device?")) {
      this.service.delOrg(element).subscribe(res => {
        if (res) {
          this.toastr.success("Orgonization removed from your profile sucessfully", "Deleted Successfully");
        } else {
          this.toastr.error("Unknown Error occurred please try again after sometime", "Unknown Error");
        }
        this.fetchOrganizations()
      })
    }
  }
  ngAfterViewInit() {
    this.fetchOrganizations();
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
  fetchOrganizations() {
    if (sessionStorage.getItem('userRole') === '1') {
      this.service.getAllOrg().subscribe(

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
    else {
      const orgId = sessionStorage.getItem('orgId')?.toString();
      // console.log(sessionStorage.getItem('orgId'))
      
      this.account = this.fb.group({
        orgId:orgId
      });
      console.log(this.account.value);
      
      this.service.getOrgByid(this.account.value).subscribe(

        (data) => {
          console.log(data);
          this.dataSource.data = data.map((item: any, index: number) => ({
            ...item,
            srNo: index + 1
          }));
        },
      );
    }
  }
}