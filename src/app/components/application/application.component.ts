import { Application, AuthParameter, Parameter } from '../../../core/models/application.model';
import { Component, OnInit } from '@angular/core';
import { Endpoint } from '../../../core/models/application.model';

import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ModalContentComponent } from '../modal-content/modal-content.component';
import { MatIconModule } from '@angular/material/icon';
import { ApplicationService } from '../../../core/services/application.service';
import { Request } from '../../../core/models/request.model';
import { RequestService } from '../../../core/services/request.service';
import { forkJoin, map } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { AuthRequest } from '../../../core/models/auth-request.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    FlexLayoutModule,
    ModalContentComponent,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {
  selectedApplication!: Application;
  parameter!: Parameter;
  requests: Request[] = [];
  detailsVisible: boolean[] = [];
  endpointId!: number;

  endpointRequests: { [key: number]: Request[] } = {};

  authForm: FormGroup;
  accessToken: string | null = null;

  hide: boolean = true;
  visibilityStates: boolean[] = [];

  authRequest: AuthRequest[] = [];
  authParamsVisible: boolean = false;

  constructor(
    private applicationService: ApplicationService,
    private requestService: RequestService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private authService: AuthService,
    private spinner: NgxSpinnerService
  ) {
    this.authForm = this.fb.group({
      authParams: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.getApplication(id);
    });

    this.visibilityStates = new Array(this.authParams.length).fill(false);
  }

  toggleVisibility(index: number) {
    this.visibilityStates[index] = !this.visibilityStates[index];
  }

  getApplication(id: number): void {
    this.applicationService.getApplication(id).subscribe(application => {
      this.selectedApplication = application;
      this.detailsVisible = this.selectedApplication.endpoints.map(() => false);

      // Se authParams não existir, inicialize-o como um array vazio
      const authParams = this.selectedApplication.authParams || [];

      // Inicializa o authForm aqui após selectedApplication ser definido
      this.authForm = this.fb.group({
        authParams: this.fb.array(this.initAuthParams(authParams))
      });

      const requests$ = this.selectedApplication.endpoints.map(endpoint =>
        this.requestService.getRequestsByAppAndEndpoint(id, endpoint.id)
      );

      forkJoin(requests$).subscribe(requestsArray => {
        requestsArray.forEach((requests, index) => {
          const endpointId = this.selectedApplication.endpoints[index].id;
          this.endpointRequests[endpointId] = requests.reverse();
        });

        // Comparar e exibir as requisições
        this.requestService.compareAndDisplayRequests([this.selectedApplication], requestsArray.flat());
      });
    });
  }

  toggleAuthParamsVisibility() {
    this.authParamsVisible = !this.authParamsVisible;
  }

  initAuthParams(authParams: AuthParameter[] = []): FormGroup[] {
    return authParams.map(param => this.fb.group({
      id: [param.id],
      authParamName: [param.authParamName],
      authParamValue: [param.authParamValue]
    }));
  }

  get authParams(): FormArray {
    return this.authForm.get('authParams') as FormArray;
  }

  receiveAuthorization(){
    const authParamsArray = this.authParams.value;
    const authFormat = this.selectedApplication.authFormat;
    const authUrl = this.selectedApplication.authUrlFormControl;

    let bodyFormated: any;

    if(authFormat === 'x-www-form-urlencoded'){
      const urlEncodedBody = authParamsArray.map((param: any) =>
        `${encodeURIComponent(param.authParamName)}=${encodeURIComponent(param.authParamValue)}`
      ).join('&');
      console.log('Body montado (x-www-form-urlencoded) ->\n', urlEncodedBody);
      bodyFormated = urlEncodedBody;
    } else {
      const bodyJson = authParamsArray.reduce((acc: any, curr: any) => {
        acc[curr.authParamName] = curr.authParamValue;
        return acc;
      }, {});
      console.log('Body montado ->\n', JSON.stringify(bodyJson, null, 2));
      bodyFormated = bodyJson;
    }

    if(authUrl === undefined ){
      alert('URL de autenticação não informada.');
    }else{
      this.spinner.show();
      this.authService.authenticate(authUrl, authFormat, bodyFormated).subscribe(response => {
        console.log('Response:', response);
        const token = this.authService.getStoredToken();
        console.log('Stored Token:', token);
        this.spinner.hide();
        alert('Token disponibilizado');
      });
    }

  }

  getStoredToken(){
  const token = this.authService.getStoredToken();

  if(token){
    navigator.clipboard.writeText(token).then(() => {
      alert('Token copiado para a área de transferência.');
    }).catch(err => {
      alert(`Erro ao copiar token: ${err}`);
    })
  }else{
    alert('Nenhum token encontrado.');
  }
  }

  detailsEndpoint(i: number): void {
    this.detailsVisible[i] = !this.detailsVisible[i];
    /*
    const endpoint = this.selectedApplication.endpoints[i];
    const panel = this.endpointRequests[endpoint.id];
    if (panel.expanded) {
      panel.expanded = false;
    } else {
      panel.expanded = true;
    }
    */
  }

  getRequestsByAppAndEndpoint(appId: number, endpointId: number) {
    return this.requestService.getRequestsByAppAndEndpoint(appId, endpointId)
  }

  openTest(endpoint: Endpoint, app: Application, parameter: Parameter): void {
    const dialogRef = this.dialog.open(ModalContentComponent, {
      width: '50%',
      height: '90%',
      data: {
        parameter,
        endpoint,
        app,
        appId: app.id,
        appUrl: app.appUrlFormControl,
        appAuth: app.authUrlFormControl,
        endpointId: endpoint.id,
        endpointReq: endpoint.reqFormControl,
        endpointUrl: endpoint.endpointUrlFormControl
      },
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      console.log('The dialog was closed');
      console.log(`Dialog result: ${result}`);
    });
  }
}
