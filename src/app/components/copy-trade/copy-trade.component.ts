// import { Component, OnInit } from '@angular/core';
// import { FormBuilder } from '@angular/forms';
// import { MatTableDataSource } from '@angular/material/table';
// import { ToastrService } from 'ngx-toastr';
// import { ConnectService } from 'src/app/service/connect.service';

// @Component({
//   selector: 'app-copy-trade',
//   templateUrl: './copy-trade.component.html',
//   styleUrls: ['./copy-trade.component.scss']
// })
// export class CopyTradeComponent implements OnInit {
//   isChecked = true;
//   isCheckedforclient = true;
//   isRejectedOrd = true;
//   adminName: string;
//   userDetails: any[] = [];
//   checkAccounts: any[] = [];
//   adminAccounts: any[] = [];
//   userAccounts: any[] = [];
//   displayedColumns: string[] = ['id', 'brokerInfo', 'margin', 'pnl', 'poi', 'multiplier', 'trading', 'demat', 'connection', 'action'];
//   dataSource: MatTableDataSource<any>;
//   account: any;
//   accounts: any[] = [];
//   selectedUser: any | null = null; // Variable to hold the selected child user
//   selectedUnlinkedUser: any | null = null; // Variable to hold the selected unlinked user
//   multiplier: number = 1; // Default multiplier value
//   accountId: any;
//   userinfo: any;

//   constructor(private service: ConnectService, private toastr: ToastrService, private fb: FormBuilder) {
//     // Simulating fetching admin name from the backend
//     this.adminName = "SurajMain";
//     this.dataSource = new MatTableDataSource<any>;
//   }

//   ngOnInit() {
//     this.fetchUser();
//     this.fetchaccount();

//   }

//   disconnect() {
//     // Handle disconnect logic here
//   }

//   selectUser(event: any) {
//     const selectedIndex = event.target.selectedIndex;
//     if (selectedIndex > 0) {
//       const selectedAdmin = this.adminAccounts[selectedIndex - 1];
//       this.adminName = selectedAdmin.Name; // Update adminName with the selected admin's name
//       const adminWithChild = {
//         ...selectedAdmin,
//         child: selectedAdmin.child.map((child: any) => ({ ...child, isAdmin: false })),
//         isAdmin: true
//       };
//       this.dataSource.data = [adminWithChild, ...selectedAdmin.child];
//       console.log(this.dataSource.data);
//     } else {
//       this.adminName = "SurajMain"; // Default admin name if no admin is selected
//       this.dataSource.data = []; // Clear dataSource if no admin is selected
//     }
//   }

//   selectUnAssignUser(event: any) {
//     const selectedIndex = event.target.selectedIndex;
//     if (selectedIndex > 0) {
//       this.selectedUnlinkedUser = this.userAccounts[selectedIndex - 1];
//     } else {
//       this.selectedUnlinkedUser = null;
//     }
//   }

//   connectUser() {
//     if (this.selectedUnlinkedUser && this.multiplier) {
//       // Update the user status and multiplier value
//       this.selectedUnlinkedUser.isLinked = true;
//       this.selectedUnlinkedUser.multiplier = this.multiplier;

//       // Find the selected admin and append the updated user
//       const selectedAdmin = this.adminAccounts.find(admin => admin.Name === this.adminName);
//       if (selectedAdmin) {
//         if (!selectedAdmin.child) {
//           selectedAdmin.child = [];
//         }

//         // Ensure the user object includes all necessary fields
//         const updatedUser = {
//           ...this.selectedUnlinkedUser,
//           isLinked: true,
//           multiplier: this.multiplier
//         };
//         this.service.updateSingleAccountinfo(updatedUser).subscribe(   response => {
//           console.log(response);

//           this.toastr.success('Child User information updated sucessfully');
//         },
//         error => {
//           console.log(error);

//           this.toastr.error('Failed to update child account');
//         }
//       );

//         selectedAdmin.child.push(updatedUser);

//         // Remove the linked user from the userAccounts list
//         this.userAccounts = this.userAccounts.filter(user => user !== this.selectedUnlinkedUser);
//         this.selectedUnlinkedUser = null; // Clear the selected unlinked user

//         // Update the data source to reflect the changes
//         const adminWithChild = {
//           ...selectedAdmin,
//           child: selectedAdmin.child.map((child: any) => ({ ...child, isAdmin: false })),
//           isAdmin: true
//         };
//         this.dataSource.data = [adminWithChild, ...selectedAdmin.child];
//         console.log(selectedAdmin);
//         // console.log(selectedAdmin.id);

//         // console.log(selectedAdmin._id);
//         // const updatedAdminData = {
//         //   _id: selectedAdmin._id, // Admin account ID
//         //   child: selectedAdmin.child, // Updated child accounts
//         //   Name:selectedAdmin.Name,
//         //   Account_api:selectedAdmin.Account_api,
//         //   Account_secret:selectedAdmin.Account_secret,
//         //   isLinked:selectedAdmin.isLinked,
//         //   multiplier:selectedAdmin.multiplier,
//         //   id:selectedAdmin.id
//         // };

//         this.service.updateAccountInfo(selectedAdmin).subscribe(
//           response => {
//             console.log(response);

//             this.toastr.success('User linked successfully and admin updated');
//           },
//           error => {
//             console.log(error);

//             this.toastr.error('Failed to update admin');
//           }
//         );
//         // this.fetchUser();
//         // this.fetchaccount();
//         // Send the updated admin to the backend
//       } else {
//         this.toastr.error('Admin not found');
//       }
//     } else {
//       this.toastr.error('Please select a user and enter a multiplier');
//     }
//   }

//   applyFilter(event: any) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.dataSource.filter = filterValue.trim().toLowerCase();

//     if (this.dataSource.paginator) {
//       this.dataSource.paginator.firstPage();
//     }
//   }

//   getDisplayedAccounts() {
//     return this.selectedUser ? [this.selectedUser] : this.accounts;
//   }

//   fetchaccount() {
//     if (sessionStorage.getItem('userRole') === '1') {
//       this.service.getaccountInfo().subscribe((data) => {
//         this.checkAccounts = data;
//         console.log(this.userDetails);
//         // console.log(this.checkAccounts);
//         this.adminAccounts = this.checkAccounts.filter((account: { Name: string; }) => {
//           const userDetail = this.userDetails.find((user: { email: string; userRole: string; }) => user.email === account.Name);
//           return userDetail && (userDetail.userRole === '1' || userDetail.userRole === '2');
//         });
//         console.log(this.adminAccounts);
//         //checking unlinked account 
//         this.userAccounts = data.filter((user: { isLinked: any; }) => !user.isLinked);
//         // console.log(this.userAccounts);
//       });
//     } else if (sessionStorage.getItem('userRole') === '2') {
//       const org_Id = sessionStorage.getItem('orgId');
//       this.account = this.fb.group({
//         org_Id: org_Id?.toString()
//       });
//       console.log(this.account.value);

//       this.service.accountInfoByOrgid(this.account.value).subscribe((data) => {
//         console.log(data);
//         this.checkAccounts = data;
//         console.log(this.checkAccounts);
//         console.log(this.userDetails);
//         this.adminAccounts = this.checkAccounts.filter((account: { Name: string; }) => {
//           const userDetail = this.userDetails.find((user: { email: string; userRole: string; }) => user.email === account.Name);
//           return userDetail && (userDetail.userRole === '1' || userDetail.userRole === '2');
//         });
//         console.log(this.adminAccounts);

//         this.userAccounts = data.filter((user: { isLinked: any; }) => !user.isLinked);


//       });
//     }
//   }

//   treading(element: any) {
//     console.log(element);
//   }

//   selectAdmin(event: Event) {
//     // Handle the selection of an admin
//   }

//   deleteuser(user: any) {
//     // Find the selected admin
//     const selectedAdmin = this.adminAccounts.find(admin => admin.Name === this.adminName);
//     if (selectedAdmin) {
//       // Find the index of the selected user in the admin's child array
//       const userIndex = selectedAdmin.child.findIndex((child: any) => child === user);
//       if (userIndex !== -1) {
//         // Remove the user from the admin's child list
//         const deletedUser = selectedAdmin.child.splice(userIndex, 1)[0];
//         // Update the user's status to unlinked
//         deletedUser.isLinked = false;
//         // Add the unlinked user back to the userAccounts array
//         this.service.updateSingleAccountinfo(deletedUser).subscribe(   response => {
//           console.log(response);

//           this.toastr.success('Child User information updated sucessfully');
//         },
//         error => {
//           console.log(error);

//           this.toastr.error('Failed to update child account');
//         }
//       );

//         this.userAccounts.push(deletedUser);
//         console.log(this.userAccounts);

//         const adminWithChild = {
//           ...selectedAdmin,
//           child: selectedAdmin.child.map((child: any) => ({ ...child, isAdmin: false })),
//           isAdmin: true
//         };
//         this.dataSource.data = [adminWithChild, ...selectedAdmin.child];

//         this.service.updateAccountInfo(selectedAdmin).subscribe(
//           response => {
//             console.log(response);

//             this.toastr.success('User unlinked successfully and admin updated');
//           },
//           error => {
//             console.log(error);

//             this.toastr.error('Failed to update admin');
//           }
//         );
//       } else {
//         this.toastr.error('User not found in admin account');
//       }
//     } else {
//       this.toastr.error('Admin not found');
//     }
//   }

//   fetchUser() {
//     if (sessionStorage.getItem('userRole') === '1') {
//       this.service.getAllUser().subscribe((data) => {
//         this.userDetails = data;
//       });

//     } else if (sessionStorage.getItem('userRole') === '2') {
//       const orgId = sessionStorage.getItem('orgId');
//       this.userinfo = this.fb.group({
//         orgId: orgId?.toString()
//       })
//       this.service.getUserByOrgId(this.userinfo.value).subscribe((data) => {
//         this.userDetails=data;

//       })
//     }
//   }
// }


//updated code 
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { ConnectService } from 'src/app/service/connect.service';

@Component({
  selector: 'app-copy-trade',
  templateUrl: './copy-trade.component.html',
  styleUrls: ['./copy-trade.component.scss']
})
export class CopyTradeComponent implements OnInit {
  isChecked = true;
  isCheckedforclient = true;
  isRejectedOrd = true;
  adminName: string;
  userDetails: any[] = [];
  checkAccounts: any[] = [];
  adminAccounts: any[] = [];
  userAccounts: any[] = [];
  displayedColumns: string[] = ['id', 'brokerInfo', 'margin', 'pnl', 'poi', 'multiplier', 'trading', 'demat', 'connection', 'action'];
  dataSource: MatTableDataSource<any>;
  account: any;
  accounts: any[] = [];
  selectedUser: any | null = null;
  selectedUnlinkedUser: any | null = null;
  multiplier: number = 1;
  accountId: any;
  userinfo: any;

  constructor(private service: ConnectService, private toastr: ToastrService, private fb: FormBuilder) {
    this.adminName = "SurajMain";
    this.dataSource = new MatTableDataSource<any>();
  }

  ngOnInit() {
    this.fetchUser();
    this.fetchaccount();
  }

  selectUser(event: any) {
    const selectedIndex = event.target.selectedIndex;
    if (selectedIndex > 0) {
      const selectedAdmin = this.adminAccounts[selectedIndex - 1];
      this.adminName = selectedAdmin.Name;
      this.isChecked = selectedAdmin.isTrade;
      this.updateDataSource(selectedAdmin);
    } else {
      this.adminName = "SurajMain";
      this.dataSource.data = [];
    }
  }

  selectUnAssignUser(event: any) {
    const selectedIndex = event.target.selectedIndex;
    if (selectedIndex > 0) {
      this.selectedUnlinkedUser = this.userAccounts[selectedIndex - 1];
    } else {
      this.selectedUnlinkedUser = null;
    }
  }

  connectUser() {
    if (this.selectedUnlinkedUser && this.multiplier) {
      this.selectedUnlinkedUser.isLinked = true;
      this.selectedUnlinkedUser.multiplier = this.multiplier;

      const updatedUser = {
        ...this.selectedUnlinkedUser,
        isLinked: true,
        multiplier: this.multiplier
      };

      const selectedAdmin = this.adminAccounts.find(admin => admin.Name === this.adminName);

      if (selectedAdmin) {
        if (!selectedAdmin.child) {
          console.log("firts time child user");
          
          selectedAdmin.child = [];
          selectedAdmin.child.push(updatedUser);
          const updatedAdminData = {
            ...selectedAdmin,
            child: selectedAdmin.child
          };
          console.log(updatedAdminData);
          
          this.service.updateSingleAccountinfo(updatedUser).subscribe(
            response => {
              this.toastr.success('Child User information updated successfully');
              this.service.addAccount(updatedAdminData).subscribe(
                response => {
                  this.toastr.success('Admin account updated successfully');
                  this.refreshData();
                },
                error => {
                  this.toastr.error('Failed to update admin account');
                }
              );
            },
            error => {
              this.toastr.error('Failed to update child account');
            }
          );
        } else {
          console.log("multiple child user");
          
          selectedAdmin.child.push(updatedUser);

          const updatedAdminData = {
            ...selectedAdmin,
            child: selectedAdmin.child
          };
          console.log(updatedUser);
          console.log(updatedAdminData);


          this.service.updateSingleAccountinfo(updatedUser).subscribe(
            response => {
              this.toastr.success('Child User information updated successfully');
              this.service.updateAccountInfo(updatedAdminData).subscribe(
                response => {
                  this.toastr.success('Admin account updated successfully');
                  this.refreshData();
                },
                error => {
                  this.toastr.error('Failed to update admin account');
                }
              );
            },
            error => {
              this.toastr.error('Failed to update child account');
            }
          );
        }
      } else {
        this.toastr.error('Admin not found');
      }

    } else {
      this.toastr.error('Please select a user and enter a multiplier');
    }
  }

  applyFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  fetchaccount() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole === '1') {
      this.service.getaccountInfo().subscribe(data => {
        this.processAccountsData(data);
      });
    } else if (userRole === '2') {
      const org_Id = sessionStorage.getItem('orgId');
      this.account = this.fb.group({ org_Id: org_Id?.toString() });
      this.service.accountInfoByOrgid(this.account.value).subscribe(data => {
        this.processAccountsData(data);
      });
    }
  }

  processAccountsData(data: any) {
    this.checkAccounts = data;
    this.adminAccounts = this.checkAccounts.filter(account => {
      const userDetail = this.userDetails.find(user => user.email === account.Name);
      return userDetail && (userDetail.userRole === '1' || userDetail.userRole === '2');
    });
    this.userAccounts = data.filter((user: { isLinked: any; }) => !user.isLinked);
  }

  deleteuser(user: any) {
    const selectedAdmin = this.adminAccounts.find(admin => admin.Name === this.adminName);
    if (selectedAdmin) {
      const userIndex = selectedAdmin.child.findIndex((child: any) => child === user);
      if (userIndex !== -1) {
        const deletedUser = selectedAdmin.child.splice(userIndex, 1)[0];
        deletedUser.isLinked = false;

        const updatedAdminData = {
          ...selectedAdmin,
          child: selectedAdmin.child
        };

        this.service.updateSingleAccountinfo(deletedUser).subscribe(
          response => {
            this.toastr.success('Child User information updated successfully');
            this.service.updateAccountInfo(updatedAdminData).subscribe(
              response => {
                this.toastr.success('Admin account updated successfully');
                this.refreshData();
              },
              error => {
                this.toastr.error('Failed to update admin account');
              }
            );
          },
          error => {
            this.toastr.error('Failed to update child account');
          }
        );
      } else {
        this.toastr.error('User not found in admin account');
      }
    } else {
      this.toastr.error('Admin not found');
    }
  }

  fetchUser() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole === '1') {
      this.service.getAllUser().subscribe(data => {
        this.userDetails = data;
      });
    } else if (userRole === '2') {
      const orgId = sessionStorage.getItem('orgId');
      this.userinfo = this.fb.group({ orgId: orgId?.toString() });
      this.service.getUserByOrgId(this.userinfo.value).subscribe(data => {
        this.userDetails = data;
      });
    }
  }

  refreshData() {
    this.fetchUser();
    this.fetchaccount();
  }

  updateDataSource(selectedAdmin: any) {
    const adminWithChild = {
      ...selectedAdmin,
      child: selectedAdmin.child.map((child: any) => ({ ...child, isAdmin: false })),
      isAdmin: true
    };
    this.dataSource.data = [adminWithChild, ...selectedAdmin.child];
  }

  toggleTradeStatus(account: any) {
    account.isTrade = account.isTrade;
    const selectedAdmin = this.adminAccounts.find(admin => admin.Name === this.adminName);
    if (selectedAdmin) {
      this.service.updateSingleAccountinfo(account).subscribe(
        response => {
          this.toastr.success('Trade status updated successfully');
          const updatedAdminData = {
            ...selectedAdmin,
            child: selectedAdmin.child.map((child: any) => child.id === account.id ? account : child)
          };
          this.service.updateAccountInfo(updatedAdminData).subscribe(
            response => {
              this.toastr.success('Admin account updated successfully');
              this.refreshData();
            },
            error => {
              this.toastr.error('Failed to update admin account');
            }
          );
        },
        error => {
          this.toastr.error('Failed to update trade status');
        }
      );
    } else {
      this.toastr.error('Admin not found');
    }
  }
}
