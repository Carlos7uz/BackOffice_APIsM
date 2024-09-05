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
import { BehaviorSubject, forkJoin, tap } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { AuthRequest } from '../../../core/models/auth-request.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';

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
    MatFormFieldModule,
    MatTooltipModule,
    FlexLayoutModule,
    ModalContentComponent,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {
  private requestsSubject = new BehaviorSubject<Request[]>([]);
  requests$ = this.requestsSubject.asObservable();

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

  timer: any;
  timeRemaining: number = 0;

  //add 23/08
  searchTerms: { [key: string]: string } = {}; // Armazena os termos de busca para cada endpoint
  filteredRequests: { [key: string]: any[] } = {}; // Armazena as requests filtradas para cada endpoint

  constructor(
    private http: HttpClient,
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

    this.requestService.requests$.subscribe(requests => {
      this.requests = requests;
    });

    this.selectedApplication?.endpoints.forEach(endpoint => {
      this.filterRequests(endpoint.id);
    });
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  toggleVisibility(index: number) {
    this.visibilityStates[index] = !this.visibilityStates[index];
  }

  getApplication(id: number): void {
    this.applicationService.getApplication(id).subscribe(application => {
      this.selectedApplication = application;
      this.detailsVisible = this.selectedApplication.endpoints.map(() => false);

      //add 23/08
      this.selectedApplication.endpoints.forEach(endpoint => {
        this.searchTerms[endpoint.id] = ''; // Inicializa os termos de busca como strings vazias
        this.filteredRequests[endpoint.id] = []; // Copia as requests para serem filtradas
      });

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
          this.endpointRequests[endpointId] = Array.isArray(requests) ? requests.reverse() : [];
          this.filteredRequests[endpointId] = [...this.endpointRequests[endpointId]]; // Inicializa filteredRequests com os requests
        });

        // Comparar e exibir as requisições
        this.requestService.compareAndDisplayRequests([this.selectedApplication], requestsArray.flat());

        this.requestsSubject.next(requestsArray.flat());
      });
    });
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
      bodyFormated = urlEncodedBody;
    } else {
      const bodyJson = authParamsArray.reduce((acc: any, curr: any) => {
        acc[curr.authParamName] = curr.authParamValue;
        return acc;
      }, {});
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

        this.accessToken = token;

        if (this.accessToken) {
          this.startTimer();
        } else {
          alert('Erro ao copiar token');
        }
      });
    }
  }

  startTimer() {
    this.timeRemaining = 59 * 60; // 59 minutos em segundos
    this.timer = setInterval(() => {
      this.timeRemaining--;

      if (this.timeRemaining <= 0) {
        clearInterval(this.timer);
        alert('O tempo para o token expirou.');
      }

      // Verifica se o token é válido
      if (!this.accessToken) {
        clearInterval(this.timer);
        alert('Token não encontrado. Contagem encerrada.');
      }
    }, 1000); // Atualiza a cada segundo
  }

  checkClipboard() {
    if (document.hasFocus()) {
      navigator.clipboard.readText().then(text => {
        const storedToken = this.authService.getStoredToken();
        if (text !== storedToken) {
          clearInterval(this.timer);
          alert('Token não encontrado no clipboard. Contagem encerrada.');
        }
      }).catch(err => {
        console.error('Erro ao acessar o clipboard:', err);
        return;
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

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${this.pad(minutes)}:${this.pad(secs)}`;
  }

  pad(number: number): string {
    return number < 10 ? '0' + number : '' + number;
  }

  detailsEndpoint(i: number): void {
    this.detailsVisible[i] = !this.detailsVisible[i];
  }

  getRequestsByAppAndEndpoint(appId: number, endpointId: number) {
    return this.requestService.getRequestsByAppAndEndpoint(appId, endpointId)
  }

  // add23/08
  filterRequests(endpointId: number): void {
    const term = this.searchTerms[endpointId].toLowerCase(); // Obtém o termo de busca em minúsculas

    if (term) {
      this.filteredRequests[endpointId] = this.endpointRequests[endpointId].filter(request =>
        (request.timestamp || '').toLowerCase().includes(term) || // Filtra pela data
        ((request.response?.status || request.error?.status)?.toString() || '').includes(term) || // Filtra pelo status
        ((request.response?.statusText || request.error?.statusText) || '').toLowerCase().includes(term) || // Filtra pelo statusText
        ((request.response?.url || request.error?.url) || '').toLowerCase().includes(term) // Filtra pela URL
      );
    } else {
      this.filteredRequests[endpointId] = [...this.endpointRequests[endpointId]]; // Restaura todas as requests
    }
  }

  openTest(endpoint: Endpoint, app: Application, parameter: Parameter): void {
    const dialogRef = this.dialog.open(ModalContentComponent, {
      width: '65%',
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

  executeAllGetRequests(): void {
    if (!this.selectedApplication) {
      alert('Nenhuma aplicação selecionada.');
      return;
    }

    // Filtra os endpoints para pegar apenas os que são GET
    const getEndpoints = this.selectedApplication.endpoints.filter(endpoint => endpoint.reqFormControl === 'GET');

    // Mapeia as requisições GET
    const requests$ = getEndpoints.map(endpoint =>
      this.requestService.getRequestsByAppAndEndpoint(this.selectedApplication.id, endpoint.id)
    );

    // Executa todas as requisições em paralelo
    forkJoin(requests$).pipe(
      tap(results => {
        // Formata os resultados para o modal
        const formattedResults = getEndpoints.map((endpoint, index) => ({
          endpoint: endpoint.endpointUrlFormControl,
          requests: results[index]
        }));

        // Abre o modal com os resultados formatados
        this.openResultModal(formattedResults);
      })
    ).subscribe();
  }

  openResultModal(results: any[]): void {
    const dialogRef = this.dialog.open(ModalContentComponent, {
      width: '80%',
      height: '80%',
      data: {
        results: results
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Modal fechado');
    });
  }
}
