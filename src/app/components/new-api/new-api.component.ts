import { Application } from '../../../core/models/application.model';
import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogModule} from '@angular/material/dialog';
import { ApplicationService } from '../../../core/services/application.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';

//Erro quando input esta invalido
export class errorInput implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

@Component({
  selector: 'app-new-api',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatExpansionModule,
    FlexLayoutModule,
    MatFormFieldModule

  ],
  templateUrl: './new-api.component.html',
  styleUrl: './new-api.component.css'
})
export class NewApiComponent {

  formNewApi: FormGroup;
  matcher = new errorInput();

  detailsVisible: boolean[] = [];

  trackByFn(index: number, item: any): any {
    return index;
  }

  urlPattern = '^(https?:\\/\\/)?' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  '(\\:\\d+)?' + // port
  '(\\/[-a-z\\d%_.~+]*)*' + // path
  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
  '(\\#[-a-z\\d_]*)?$'; // fragment locator


  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private applicationService: ApplicationService,
    private router: Router
  ){
    this.formNewApi = this.formBuilder.group({
    nameFormControl: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    appUrlFormControl: ['', [Validators.required, Validators.pattern(this.urlPattern), Validators.minLength(3), Validators.maxLength(100)]],
    authUrlFormControl: ['', [Validators.minLength(3), Validators.maxLength(100)]],
    endpoints: this.formBuilder.array([])
    });
    this.endpoints.controls.forEach(() => this.detailsVisible.push(true));
  }

  get endpoints(): FormArray {
    return this.formNewApi.get('endpoints') as FormArray;
  }

  createEndpointGroup(): FormGroup {
    return this.formBuilder.group({
      id: [this.applicationService.getNextEndpointId()],
      reqFormControl: ['', Validators.required],
      endpointUrlFormControl: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      params: this.formBuilder.array([])
    });

  }

  createParamGroup(): FormGroup {
    return this.formBuilder.group({
      id: [this.applicationService.getNextParamId()],
      paramNameFormControl: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      value: [''],
      required: [false],
      paramUrl: [false]
    });
  }

  addEndpoint(): void {
    this.endpoints.push(this.createEndpointGroup());
    this.detailsVisible.push(true);
  }

  detailsEndpoint(index: number, event: Event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário
    this.detailsVisible[index] = !this.detailsVisible[index];
  }

  addParam(endpointIndex: number): void {
    const params = this.endpoints.at(endpointIndex).get('params') as FormArray;
    params.push(this.createParamGroup());
    this.formNewApi.updateValueAndValidity();
  }

  getParamsControls(endpoint: AbstractControl): AbstractControl[] {
    return (endpoint.get('params') as FormArray).controls;
  }

  getFormControl(parent: AbstractControl, controlName: string): FormControl | null {
    if (parent instanceof FormGroup) {
      return parent.get(controlName) as FormControl;
    } else {
      return null;
    }
  }

  toggleRequired(param: AbstractControl): void {
    const control = this.getFormControl(param, 'required');
    if (control) {
      control.setValue(!control.value);
    }
  }

  toggleUrlParam(param: AbstractControl): void {
    const control = this.getFormControl(param, 'paramUrl');
    if (control) {
      control.setValue(!control.value);
    }
  }

  removeParam(endpointIndex: number, paramIndex: number): void {
    const endpoint = this.endpoints.at(endpointIndex) as FormGroup;
    const params = endpoint.get('params') as FormArray;
    if (params && paramIndex >= 0 && paramIndex < params.length) {
      params.removeAt(paramIndex);
    }
  }

  cadastrarAPI(): void {
    if (this.formNewApi.valid) {
      const formValue = this.formNewApi.value;
      let endpointId = 1; // Counter for endpoint IDs
      let paramId = 1; // Counter for parameter IDs

      const aplicativo: Application = {
        id: 0,  // Assuming 0 for new records
        nameFormControl: formValue.nameFormControl,
        appUrlFormControl: formValue.appUrlFormControl,
        authUrlFormControl: formValue.authUrlFormControl,
        endpoints: formValue.endpoints.map((endpoint: any) => {
          const currentEndpointId = endpointId++; // Assign unique ID to each endpoint
          return {
            id: currentEndpointId,
            reqFormControl: endpoint.reqFormControl,
            endpointUrlFormControl: endpoint.endpointUrlFormControl,
            params: endpoint.params.map((param: any) => {
              const currentParamId = paramId++; // Assign unique ID to each parameter
              return {
                id: currentParamId,
                paramNameFormControl: param.paramNameFormControl,
                value: param.value,
                required: param.required,
                paramUrl: param.paramUrl
              }
            })
          }
        })
      };

      this.applicationService.addAplicativo(aplicativo).subscribe({
        next: () => {
          alert('Cadastrado com sucesso!');
          this.router.navigate(['']).then(() => {
            location.reload();
          });
        },
        error: (error: HttpErrorResponse) => { // Definimos o tipo explicitamente aqui
          console.error('Erro ao cadastrar API:', error);
        }
      });
    } else {
      console.log('Formulário inválido', this.getFormValidationErrors(this.formNewApi));
    }
  }

  getFormValidationErrors(form: FormGroup): any[] {
    const errors: any[] = [];
    Object.keys(form.controls).forEach(key => {
      const controlErrors: any = form.get(key)?.errors;
      if (controlErrors) {
        errors.push({ key, controlErrors });
      }
      if (form.get(key) instanceof FormArray) {
        const formArray = form.get(key) as FormArray;
        formArray.controls.forEach((control, index) => {
          const arrayErrors = this.getFormValidationErrors(control as FormGroup);
          arrayErrors.forEach(error => {
            errors.push({ key: `${key}[${index}]`, ...error });
          });
        });
      } else if (form.get(key) instanceof FormGroup) {
        const groupErrors = this.getFormValidationErrors(form.get(key) as FormGroup);
        groupErrors.forEach(error => {
          errors.push({ key: `${key}`, ...error });
        });
      }
    });
    return errors;
  }
}
