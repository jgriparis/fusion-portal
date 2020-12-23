import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {
  isSuperUser = false;
  sandcount = 0;
  subscription: Subscription;
  public clientSubscription: string;

  constructor(private data: DataService) {
    this.subscription = this.data.getSandboxCount().subscribe((cnt) => {
      const sandboxData = JSON.parse(sessionStorage.getItem('sandbox'));
      this.sandcount = sandboxData ? sandboxData.length : 0;
    });

    const sandboxData = JSON.parse(sessionStorage.getItem('sandbox'));
    this.sandcount = sandboxData ? sandboxData.length : 0;
  }

  ngOnInit(): void {}

  get isMedium() {
    return sessionStorage.getItem('clientSubscription') == 'MEDIUM';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
