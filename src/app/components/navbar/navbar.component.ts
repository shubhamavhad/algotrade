import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  showDropdown: boolean = false;

  constructor(private router: Router) {}

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }
  name = sessionStorage.getItem('name');
  logout(): void {
    // Clear session storage
    sessionStorage.clear();
    // Redirect to login page
    this.router.navigate(['/login']);
  }
}
