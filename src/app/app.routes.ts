import { Routes } from '@angular/router';
import { ApplicationComponent } from './components/application/application.component';
import { NewApiComponent } from './components/new-api/new-api.component';
import { HomeComponent } from './components/home/home.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'aplicativo/:id', component: ApplicationComponent },
  { path: 'newapi', component: NewApiComponent },
];
