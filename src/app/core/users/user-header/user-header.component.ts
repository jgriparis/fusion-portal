import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/shared/services/data.service';
import { UserService } from '../user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  singledropdownSettings = {};
  listOfUser = [];
  subscription: Subscription;
  selectedUser = [];

  constructor(
    private viewContainerRef: ViewContainerRef,
    private cfr: ComponentFactoryResolver,
    private readonly userService: UserService,
    private data: DataService
  ) {
    this.subscription = this.data
      .getUserUpdated()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((filt) => {
        this.errorMessage(filt);
        this.getUsers();
        this.viewContainerRef.clear();
        this.selectedUser = [];
      });
    this.data.changeNav('Users');
  }

  getUser(item: any) {
    sessionStorage.setItem('userId', item.item_id);
    this.loadUserComponent();
  }

  async loadUserComponent() {
    this.viewContainerRef.clear();
    const { UserComponent } = await import('../user/user.component');
    this.viewContainerRef.createComponent(this.cfr.resolveComponentFactory(UserComponent));
  }

  ngOnInit(): void {
    this.singledropdownSettings = {
      singleSelection: true,
      primaryKey: 'item_id',
      labelKey: 'item_text',
      enableSearchFilter: true,
      maxHeight: 250,
      lazyLoading: true,
      text: 'Please select a user'
    };

    this.getUsers();
  }

  getUsers() {
    this.userService
      .getAll()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const arrResult = [];
        res.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.username }));
        this.listOfUser = JSON.parse(JSON.stringify(arrResult));
      });
  }

  createUser() {
    this.selectedUser = [];
    sessionStorage.setItem('userId', '0');
    this.loadUserComponent();
  }

  errorMessage(errMessage) {
    let message = ' ';
    const errorDiv = document.querySelector('.example-error');
    const messageDiv = errorDiv.querySelector('.message');

    message += errMessage;

    errorDiv.classList.remove('inactive');
    messageDiv.innerHTML = message;
    window.setTimeout(() => {
      errorDiv.classList.add('inactive');
      messageDiv.innerHTML = '';
    }, 3000);
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
