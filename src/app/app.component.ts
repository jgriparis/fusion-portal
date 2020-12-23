import { Component } from '@angular/core';
import { filter } from 'rxjs/operators';
import { Router, NavigationStart, Event as NavigationEvent } from '@angular/router';
import { SharedService } from './core/shared/services/shared.service';
import { AuthService } from './core/shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'portal-ng';

  constructor(
    private readonly router: Router,
    private readonly sharedService: SharedService,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {}
}
