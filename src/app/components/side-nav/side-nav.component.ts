import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { Application } from '../../../core/models/application.model';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatFormFieldModule} from '@angular/material/form-field';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl, FormsModule } from '@angular/forms';
import { ApplicationsSearchComponent } from '../../../core/shared/components/applications-search/applications-search.component';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RouterOutlet,
    FlexLayoutModule,
    MatIcon,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    ApplicationsSearchComponent
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent {
  applications: Application[] = [];
  appItems: { label: string, route: string }[] = [];
  navItems = [
    { label: 'Home', route: '', icon: 'home'},
    { label: 'New app', route: '/newapi', icon: 'add'},
    { label: 'Profile', route: '/profile', icon: 'person'},
  ]

  trackByFn(index: number, item: any) {
    return item.label;
  }

  constructor(private applicationService: ApplicationService, private router: Router, private spinner: NgxSpinnerService ) { }

  ngOnInit(): void {
    this.getApplications();

  }

  getApplications(): void {
    this.applicationService.getApplications().subscribe((applications: Application[]) => {
      this.applications = applications;
    });
  }

  onSelected(application: Application): void{
    this.router.navigate(['/aplicativo', application.id]);
  }

  onApplicationSelected(application: Application) {
    this.router.navigate(['/aplicativo', application.id]);
    console.log(`Selected application: ${application.id}`);
  }

}
