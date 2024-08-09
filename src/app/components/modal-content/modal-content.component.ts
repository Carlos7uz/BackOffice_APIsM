import { RequestHistoryService } from './../../../core/services/request-history.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { Application, Endpoint, Parameter } from '../../../core/models/application.model';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RequestService } from '../../../core/services/request.service';
import { Request } from '../../../core/models/request.model';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpRequestService } from '../../../core/services/http-request.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ResponseDetails } from '../../../core/models/response-details';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-modal-content',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
  ],
  templateUrl: './modal-content.component.html',
  styleUrl: './modal-content.component.css'
})
export class ModalContentComponent {
  form!: FormGroup;
  currentView!: 'details' | 'error';
  app: Application;
  endpoint: Endpoint;
  parameter: Parameter;
  executionDetails: any;
  errorDetails: any;
  responseHttp: any;
  endpointRequests: { [key: number]: Request[] } = {};


  constructor(
    private fb: FormBuilder,
    private requestService: RequestService,
    private httpRequestService: HttpRequestService,
    public dialogRef: MatDialogRef<ModalContentComponent>,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.app = data.app;
    this.endpoint = data.endpoint;
    this.parameter = data.parameter;

    this.form = this.fb.group({
      params: this.fb.array(this.initParams(this.endpoint.params)),
      headers: this.fb.array([]),
      body: ['']
    });
  }

  /*
  ngOnInit(): void {
    this.form = this.fb.group({
      params: this.fb.array(this.initParams(this.endpoint.params)),
      headers: this.fb.array([]),
      body: ['', Validators.required]
    });
  }
  */

  initParams(params: Parameter[]): FormGroup[] {
    return params.map(param => this.fb.group({
      id: [param.id],
      paramNameFormControl: [param.paramNameFormControl],
      paramValue: [param.value || '', param.required ? Validators.required : null],
      paramUrl: [param.paramUrl || false]
    }));
  }

  get params() {
    return this.form.get('params') as FormArray;
  }

  get headers() {
    return this.form.get('headers') as FormArray;
  }

  close(): void {
    this.dialogRef.close();
  }

  addHeader(): void {
    this.headers.push(this.fb.group({
      id: [''],
      key: ['Authorization', Validators.required],
      value: ['Bearer', Validators.required]
    }));
  }

  removeHeader(index: number): void {
    this.headers.removeAt(index);
  }

  executeRequest(): void {
    if (this.form.invalid) {
      this.handleInvalidForm();
      return;
    }

    //Request Object
    const request = this.createRequestObject();

    //validacao do body
    if (request.body && typeof request.body === 'string') {
      try {
        request.body = JSON.parse(request.body);
      } catch (error) {
        console.error('Erro no formulário. Body inválido:', error);
        return;
      }
    }

    console.log('Olha a request', request);

    // Exibir loading
    this.spinner.show();

    this.httpRequestService.makeRequest(
      request.appUrl,
      request.endpointUrl,
      request.endpointReq,
      request.params,
      request.body,
      request.headers
    ).subscribe({
      next: (response: ResponseDetails) => {
        this.handleSuccessResponse(response, request);
      },
      error: (error: HttpErrorResponse) => {
        this.handleErrorResponse(error, request);
      }
    });
  }

// Metodos do ExecuteRequest
  private handleInvalidForm(): void {
    const invalidControls: string[] = [];

    this.params.controls.forEach((control, index) => {
      if (control.invalid) {
        invalidControls.push(`Parâmetro ${index + 1}: ParamValue`);
      }
    });

    this.headers.controls.forEach((control, index) => {
      if (control.invalid) {
        invalidControls.push(`Cabeçalho ${index + 1}: Chave: ${control.value.key || null} Valor: ${control.value.value || null}`);
      }
    });

    alert('Erro no formulário. Controles inválidos: ' + invalidControls.join(', '));
  }

  private createRequestObject(): Request {
    return {
      id: '',
      appId: this.data.appId,
      appUrl: this.data.appUrl,
      appAuth: this.data.appAuth,
      endpointId: this.data.endpointId,
      endpointReq: this.data.endpointReq,
      endpointUrl: this.data.endpointUrl,
      params: this.params.value.map((param: any) => ({
        id: param.id,
        paramName: param.paramNameFormControl,
        paramValue: param.paramValue,
        paramUrl: param.paramUrl
      })),
      headers: this.headers.value
        .filter((header: any) => header.key && header.value)
        .map((header: any, index: number) => ({
          id: index + 1,
          key: header.key,
          value: header.value
        })),
      body: JSON.stringify(this.params.value.reduce((acc: any, param: any) => {
        if (param.paramNameFormControl && param.paramValue) {
          acc[param.paramNameFormControl] = param.paramValue;
        }
        return acc;
      }, {}))
    };
  }

  private handleSuccessResponse(response: ResponseDetails, request: Request): void {
    this.spinner.hide();
    this.executionDetails = response;
    this.currentView = 'details';
    this.responseHttp = response.body;

    this.saveRequest(request, response);
  }

  private handleErrorResponse(error: HttpErrorResponse, request: Request): void {
    this.spinner.hide();
    this.errorDetails = error;
    this.currentView = 'error';

    alert(`Erro na requisição: ${error.message}`);

    this.saveRequest(request, undefined, error)
  }

  private saveRequest(request: Request, response?: ResponseDetails, error?: HttpErrorResponse): void {
    this.requestService.addRequest({
      ...request,
      response: response,
      error: error,
      timestamp: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }).subscribe({
      next: () => {
        this.requestService.getRequestsByAppAndEndpoint(this.data.appId, this.data.endpointId)
        .subscribe({
          next: (requests: Request[]) => {
            this.endpointRequests[this.data.endpointId] = requests;
            this.cdr.detectChanges();
            console.log('Histórico atualizado:', requests);
          },
          error: (error: HttpErrorResponse) => {
            console.error('Erro ao carregar o histórico:', error);
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao salvar a requisição:', error);
      }
    });
  }
  //Fim metodos ExecuteRequest
}
