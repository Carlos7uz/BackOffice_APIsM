import { Component } from '@angular/core';
import { RecentRequestsComponent } from "./dashboard-home-components/recent-requests/recent-requests/recent-requests.component";
import { ErrorRequestsComponent } from './dashboard-home-components/error-requests/error-requests/error-requests.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RecentRequestsComponent,
    ErrorRequestsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
