import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forEach } from 'lodash';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/shared/services/data.service';
import { ClientService } from '../../clients/services/client.service';
import { Role } from '../../shared/models/role';
import { User } from '../../shared/models/user';
import { UserService } from '../user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-addedit-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  userForm: FormGroup;
  dropdownSettings = {};
  UserRows: Array<any>;
  selectedClients = [];
  listOfClients = [];
  user = new User();
  subscription: Subscription;
  formAction: string;

  constructor(
    private fb: FormBuilder,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private data: DataService
  ) {
    this.clientService
      .getClients()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const arrResult = [];
        res.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.clientName }));
        this.listOfClients = JSON.parse(JSON.stringify(arrResult));
      });

    this.userForm = this.fb.group({
      username: new FormControl('', [Validators.required, Validators.email]),
      internal: new FormControl(false),
      admin: new FormControl(false),
      disabled: new FormControl(false),
      password: new FormControl(''),
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      created: [null],
      updated: [null],
      drpClients: [null]
    });
  }

  ngOnInit(): void {
    this.reset();

    this.dropdownSettings = {
      singleSelection: false,
      primaryKey: 'item_id',
      labelKey: 'item_text',
      filterSelectAllText: 'Select All',
      filterUnSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      enableFilterSelectAll: true,
      text: 'Please select one/many clients',
      maxHeight: 250,
      lazyLoading: true
    };

    this.loadUserData();
  }

  get isExist() {
    return sessionStorage.getItem('userId') != '0';
  }

  get f() {
    return this.userForm.controls;
  }

  loadUserData() {
    const userId = sessionStorage.getItem('userId');

    const passwordControl = this.userForm.get('password');

    if (userId == '0') {
      passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
      this.reset();
      return;
    }

    const selClients = [];

    passwordControl.setValidators(null);

    this.userService
      .getById(Number(userId))
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((u) => {
        this.userForm.patchValue({
          username: u.user.username,
          firstname: u.user.firstName,
          lastname: u.user.lastName,
          admin: u.user.role == 'Admin' ? true : false,
          internal: u.user.internal,
          disabled: !u.user.enabled
        });

        u.user.clients.forEach((c) => selClients.push({ item_id: c.id, item_text: c.clientName }));
        this.selectedClients = JSON.parse(JSON.stringify(selClients));
      });
  }

  reset() {
    this.userForm.reset({
      admin: false,
      internal: false,
      disabled: false
    });
  }

  submitForm() {
    if (this.userForm.invalid) {
      return;
    }

    const userId = Number(sessionStorage.getItem('userId'));

    this.user.username = this.userForm.get('username').value;
    this.user.firstName = this.userForm.get('firstname').value;
    this.user.lastName = this.userForm.get('lastname').value;
    this.user.password = this.userForm.get('password').value;
    this.user.role = this.userForm.get('admin').value == true ? Role.Admin : Role.User;
    this.user.internal = this.userForm.get('internal').value;
    this.user.enabled = !this.userForm.get('disabled').value;

    const linkedClients = this.userForm.get('drpClients').value == null ? [] : this.userForm.get('drpClients').value;
    const userClients = [];

    if (userId == 0) {
      let newUserId = 0;
      this.userService.createUser(this.user).subscribe();

      this.reset();
      this.data.ChangeUserUpdated('User successfully created');
    } else {
      this.user.id = userId;

      linkedClients.forEach((l) => userClients.push({ userId: userId, clientId: l.item_id }));

      this.userService.assignUserToClient(userId, userClients).subscribe();

      this.userService.updateUser(this.user).subscribe();

      this.data.ChangeUserUpdated('User successfully updated');
      this.reset();
    }
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
