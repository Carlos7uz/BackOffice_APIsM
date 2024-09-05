import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CollectionsComponent } from './components/collections/collections.component';
import { NewApiComponent } from './components/new-api/new-api.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ApplicationComponent } from './components/application/application.component';
import { Page404Component } from '../core/components/page404/page404.component';
import { NewCollectionComponent } from './components/collections/new-collection/new-collection.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'collections', component: CollectionsComponent },
  { path: 'newapi', component: NewApiComponent },
  { path: 'newcollection', component: NewCollectionComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'aplicativo/:id', component: ApplicationComponent },
  { path: '**', component: Page404Component }
];
