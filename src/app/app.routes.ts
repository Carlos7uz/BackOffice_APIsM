import { Routes } from '@angular/router';
import { AplicativoComponent } from './components/aplicativo/aplicativo.component';
import { NewApiComponent } from './components/new-api/new-api.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'aplicativo/:id', component: AplicativoComponent },
  { path: 'newapi', component: NewApiComponent }
];
