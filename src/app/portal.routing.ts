import { Routes } from '@angular/router';
import { ClientHeaderComponent } from './core/clients/components/client-header/client-header.component';
import { AuthGuard } from './core/users/helpers/auth.guard';
import { LoginComponent } from './core/users/login/login.component';
import { UserHeaderComponent } from './core/users/user-header/user-header.component';
import {
  AdverttypeComponent,
  AuthorsComponent,
  BrandComponent,
  CategoryComponent,
  DashboardComponent,
  DatachartComponent,
  LanguageComponent,
  LsmsemComponent,
  MapsComponent,
  MediatypeComponent,
  RatecardComponent,
  RegionComponent,
  ReputationalComponent,
  SandboxComponent,
  SentimentComponent,
  SourceComponent,
  SpokespersonsComponent,
  VolumeComponent,
  WordsComponent
} from './analytics/components';
import { Role } from './core/shared/models/role';
import { LayoutComponent } from './core/shared/components/layout/layout.component';

const defaultRoute = '/portal/dashboard';

export const children: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'volume',
    component: VolumeComponent
  },
  {
    path: 'mediatype',
    component: MediatypeComponent
  },
  {
    path: 'source',
    component: SourceComponent
  },
  {
    path: 'region',
    component: RegionComponent
  },
  {
    path: 'category',
    component: CategoryComponent
  },
  {
    path: 'language',
    component: LanguageComponent
  },
  {
    path: 'lsmsem',
    component: LsmsemComponent
  },
  {
    path: 'ratecard',
    component: RatecardComponent
  },
  {
    path: 'brand',
    component: BrandComponent
  },
  {
    path: 'adverttype',
    component: AdverttypeComponent
  },
  {
    path: 'data',
    component: DatachartComponent
  },
  {
    path: 'sentiment',
    component: SentimentComponent
  },
  {
    path: 'spokespersons',
    component: SpokespersonsComponent
  },
  {
    path: 'data',
    component: DatachartComponent
  },
  {
    path: 'sandbox',
    component: SandboxComponent
  },
  {
    path: 'reputational',
    component: ReputationalComponent
  },
  {
    path: 'authors',
    component: AuthorsComponent
  },
  {
    path: 'words',
    component: WordsComponent
  },
  {
    path: 'client',
    component: ClientHeaderComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin, Role.Internal] }
  },
  {
    path: 'users',
    component: UserHeaderComponent,
    canActivate: [AuthGuard],
    data: { roles: [Role.Admin] }
  }
];

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: defaultRoute
  },
  {
    path: 'portal',
    children: [
      {
        path: '',
        component: LayoutComponent,
        children,
        canActivate: [AuthGuard]
      }
    ]
  },
  { path: 'login', component: LoginComponent },
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];
