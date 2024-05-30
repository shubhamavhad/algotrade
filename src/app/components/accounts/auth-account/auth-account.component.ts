import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConnectService } from 'src/app/service/connect.service';

@Component({
  selector: 'app-auth-account',
  templateUrl: './auth-account.component.html',
  styleUrls: ['./auth-account.component.scss']
})
export class AuthAccountComponent {
 
  constructor(
    private service: ConnectService,
    private toastr: ToastrService,
    private fb: FormBuilder, // Inject FormBuilder for form creation,
    private dialog: MatDialogRef<AuthAccountComponent>
  ) { 
  }
  accsAuthForm: any;

  ngOnInit() {
    this.accsAuthForm = this.fb.group({
      requestTokenLink: ['', [Validators.required, this.validateUrl]],
    });
  }

  accsAuth() {
    console.log("This is the Request Token Link: " + this.accsAuthForm.value.requestTokenLink);
    const requestTokenLink = this.accsAuthForm.get('requestTokenLink').value;
    const requestToken = this.extractRequestToken(requestTokenLink);
    console.log('Request Token:', requestToken);
    this.dialog.close();
  }

  private extractRequestToken(url: string): string | null {
    const match = url.match(/request_token=([^&]*)/);
    return match ? match[1] : null;
  }

  validateUrl(control: any): { [key: string]: any } | null {
    const pattern = /request_token=([^&]*)/;
    const valid = pattern.test(control.value);
    return valid ? null : { invalidUrl: true };
  }
}
