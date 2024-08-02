import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged, map, Observable, startWith, Subject, switchMap } from 'rxjs';
import { Application } from '../../../models/application.model';
import { ApplicationService } from '../../../services/application.service';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-applications-search',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatAutocompleteModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule

  ],
  templateUrl: './applications-search.component.html',
  styleUrl: './applications-search.component.css'
})
export class ApplicationsSearchComponent implements OnInit {
  searchControl = new FormControl('')
  applications$: Application[] = [];
  filteredOptions!: Observable<Application[]>;

  constructor(private applicationService: ApplicationService, private router: Router){}

  ngOnInit() {
    this.applicationService.getApplications().subscribe(apps => {
      this.applications$ = apps;
      this.filteredOptions = this.searchControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value || ''))
        );
    });
  }

  private _filter(value: any): Application[] {
    const filterValue = (typeof value === 'string' ? value : '').toLowerCase();
    return this.applications$.filter(application => application.nameFormControl.toLowerCase().includes(filterValue));
}


  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const selectedApp = event.option.value as Application;
    if (selectedApp && selectedApp.id) {
      this.router.navigate([`/aplicativo/${selectedApp.id}`]);
      this.searchControl.setValue('');
    }
  }

  displayFn(application: Application): string {
    return application && application.nameFormControl ? application.nameFormControl : '';
}

}
