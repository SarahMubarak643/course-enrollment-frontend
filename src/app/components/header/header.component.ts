import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  navOpen = false;

  constructor(public auth: AuthService, private router: Router) {}

  toggleNav(): void {
    this.navOpen = !this.navOpen;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
