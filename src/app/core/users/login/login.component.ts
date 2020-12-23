import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import * as moment from 'moment';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthService
  ) {
    const dataFilter = {
      brand: [],
      dateFrom: moment().subtract(7, 'd').format('YYYY-MM-DD'),
      dateTo: moment(new Date()).format('YYYY-MM-DD'),
      source: [],
      mediatype: [],
      category: [],
      subcategory: [],
      adverttype: [],
      language: [],
      location: [],
      type: [],
      sentiment: [],
      author: [],
      topic: [],
      country: [],
      exclude: []
    };

    sessionStorage.setItem('clientFilter', JSON.stringify(dataFilter));
    sessionStorage.setItem('userFilter', JSON.stringify(dataFilter));

    // redirect to home if already logged in
    if (this.authenticationService.userValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.authenticationService
      .login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        (data) => {
          this.router.navigate([this.returnUrl || '/portal']);
        },
        (error) => {
          let message = '';
          const errorDiv = document.querySelector('.example-error');
          const messageDiv = errorDiv.querySelector('.message');

          message = 'Invalid username or password.';

          errorDiv.classList.remove('inactive');
          messageDiv.innerHTML = message;
          window.setTimeout(() => {
            errorDiv.classList.add('inactive');
            messageDiv.innerHTML = '';
          }, 2000);
          return true;
        }
      );
  }
}
