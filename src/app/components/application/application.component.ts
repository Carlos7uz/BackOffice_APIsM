import { Application, Parameter } from '../../../core/models/application.model';
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
    FlexLayoutModule,
    ModalContentComponent
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


  constructor(
    private applicationService: ApplicationService,
    private requestService: RequestService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.getApplication(id);
    });
  }

  getApplication(id: number): void {
    this.applicationService.getApplication(id).subscribe(application => {
      this.selectedApplication = application;
      this.detailsVisible = this.selectedApplication.endpoints.map(() => false);

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

  detailsEndpoint(index: number): void {
    this.detailsVisible[index] = !this.detailsVisible[index];
  }

  getRequestsByAppAndEndpoint(appId: number, endpointId: number) {
    return this.requestService.getRequestsByAppAndEndpoint(appId, endpointId)
  }

  openTest(endpoint: Endpoint, app: Application, parameter: Parameter): void {
    const dialogRef = this.dialog.open(ModalContentComponent, {
      width: '99%',
      height: '97%',
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
