import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
// import { MatDialog } from '@angular/material/dialog';
// import { AdduserComponent } from './adduser/adduser.component';
import { ConnectService } from 'src/app/service/connect.service';
import { AdduserComponent } from './adduser/adduser.component';
import { MatDialog } from '@angular/material/dialog';
// import { UpdateUserComponent } from './update-user/update-user.component';
import { ToastrService } from 'ngx-toastr';
import { UpdateUserComponent } from './update-user/update-user.component';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['srNo', 'user', 'email', 'phoneNo', 'Userrole', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  userinfo: any;
  checkUserRole: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  account: any;

  constructor(private service: ConnectService, private dialog: MatDialog, private toastr: ToastrService, private fb: FormBuilder) { }

  ngOnInit() {
    this.checkUserRole = sessionStorage.getItem('userRole')
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  Adduser() {
    const popup = this.dialog.open(AdduserComponent, {
      enterAnimationDuration: '1000ms',
      exitAnimationDuration: '500ms',
      width: '70%',

    });
    popup.afterClosed().subscribe(res => {
      this.fetchUser();
    });

  }

  updateUser(element: any) {

    const userIndex = this.dataSource.data.findIndex((user: any) => user.id === element.id);
    if (userIndex !== -1) {
      const popup = this.dialog.open(UpdateUserComponent, {
        enterAnimationDuration: '1000ms',
        exitAnimationDuration: '500ms',
        width: '25%',
        data: element

      });
      popup.afterClosed().subscribe(res => {
        this.fetchUser();
      });
    } else {
      console.log("User  is not found in the list");
    }
  }
  deleteUser(element: any) {
    console.log(element);

    if (confirm("Do you want to delete the Device?")) {
      this.service.deleteUser(element).subscribe(res => {
        if (res) {
          this.toastr.success("Orgonization removed from your profile sucessfully", "Deleted Successfully");
        } else {
          this.toastr.error("Unknown Error occurred please try again after sometime", "Unknown Error");
        }
        this.fetchUser()
      })
    }
  }

  ngAfterViewInit() {
    this.fetchUser();
    console.log();

    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  fetchUser() {
    if (sessionStorage.getItem('userRole') === '1') {
      this.service.getAllUser().subscribe(
        (data: any) => {
          console.log(data);

          this.dataSource.data = data.map((item: any, index: number) => ({
            ...item,
            srNo: index + 1
          }));

        },
        (error: any) => {
          console.error('Error fetching user:', error);
        }
      );
    } else if (sessionStorage.getItem('userRole')==='2') {
      const orgId = sessionStorage.getItem('orgId');
      this.userinfo = this.fb.group({
        orgId: orgId?.toString()
      })
      this.service.getUserByOrgId(this.userinfo.value).subscribe((data) => {
        console.log(data);
        // this.dataSource.data=data;
        this.dataSource.data = data.map((item: any, index: number) => ({
          ...item,
          srNo: index + 1
        }));
      })
    } else {
      const userId = sessionStorage.getItem('userId');
      console.log(userId);
      
      this.userinfo = this.fb.group({
        id: userId?.toString()
      })
      this.service.getUserbyUserId(this.userinfo.value).subscribe((data) => {
        console.log(data);
        this.dataSource.data = data.map((item: any, index: number) => ({
          ...item,
          srNo: index + 1
        }));

      })

    }
  }
}
