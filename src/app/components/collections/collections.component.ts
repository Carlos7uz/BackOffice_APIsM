import { Component } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Collection, CollectionRequests } from '../../../core/models/collection.model';
import { CollectionService } from '../../../core/services/collection.service';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CollectionResponse } from '../../../core/models/collection-response.model';
import { ResponseDetails } from '../../../core/models/response-details';
import { CollectionError } from '../../../core/models/collection-error.model';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    FlexLayoutModule,
  ],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.css'
})
export class CollectionsComponent {
  collections: Collection[] = [];
  requests: CollectionRequests[] = [];

  executionStatusMap: { [collectionId: number]: boolean } = {};

  activeCollectionId?: number;
  expandedPanels: { [collectionId: number]: number[] } = {};

  responses: CollectionResponse[] = [];
  errors: CollectionError[] = [];

  constructor(
    private collectionService: CollectionService,
    private router: Router
  ){}

  ngOnInit(): void {
   this.getCollections();
  }

  getCollections(): void {
    this.collectionService.getCollections().subscribe((collections: Collection[]) => {
      this.collections = collections;
    });
  }

  goToNewCollection(){
    this.router.navigate(['/newcollection']);
  }

  /*
  executeCollection(collection: Collection): void {
    this.isExecutionActive = true;
    this.activeCollectionId = collection.id;
    this.responses = [];
    this.errors = [];

    this.collectionService.sendCollectionRequests(collection, collection.requests).subscribe({
      next: ({ responses, errors }) => {
        //this.responses = responses;
        this.errors = errors;

        if (Array.isArray(responses)) {
          this.responses = responses;
        } else if (errors.length > 0){
          //this.handleError(result);
          this.errors = errors
          console.error('Erros registrados:', errors);
        }
        this.isExecutionActive = false;
      },
      error: (error) => {
        this.handleError(error);
        this.isExecutionActive = false;
      },
      complete: () => {
        console.log('Processamento da coleção concluído.');
      }
    });
  }


  executeSingleRequest(collection: Collection, request: CollectionRequests): void {
    this.collectionService.sendCollectionRequests(collection, [request]).subscribe({
      next: (response: CollectionResponse[] | CollectionError) => {
        if (Array.isArray(response)) {
          const requestId = request.id;
          const collectionId = collection.id;

          const responseIndex = this.responses.findIndex((r) => r.requestId === requestId && r.collectionId === collectionId);

          if (responseIndex === -1) {
            this.responses.push(...response);
          } else {
            this.responses[responseIndex] = response[0];
          }
        } else {
          this.handleError(response);
        }
      },
      error: (error: HttpErrorResponse) => {
        const collectionError = this.convertToCollectionError(error, collection.id); // Converte o erro HTTP para CollectionError
        this.handleError(collectionError);
      }
    });
  }

  */

  executeCollection(collection: Collection): void {
    this.executionStatusMap[collection.id] = true;
    this.activeCollectionId = collection.id;
    this.responses = [];
    this.errors = [];

    this.collectionService.sendCollectionRequests(collection, collection.requests).subscribe({
      next: ({ responses, errors }) => {
        if (Array.isArray(responses)) {
          this.responses = responses;
        }
        if (Array.isArray(errors)) {
          this.errors = errors;
        }
        this.executionStatusMap[collection.id] = false; // Marca como concluído
      },
      error: (error: CollectionError) => {
        this.handleError(error);
        this.executionStatusMap[collection.id] = false; // Marca como concluído
      }
    });
  }

  executeSingleRequest(collection: Collection, request: CollectionRequests): void {
    this.collectionService.sendCollectionRequests(collection, [request]).subscribe({
      next: ({ responses, errors }) => {
        if (responses.length > 0) {
          const response = responses[0]; // Como é uma única requisição, há apenas uma resposta.
          const requestId = request.id;
          const collectionId = collection.id;

          const responseIndex = this.responses.findIndex((r) => r.requestId === requestId && r.collectionId === collectionId);

          if (responseIndex === -1) {
            this.responses.push(response);
          } else {
            this.responses[responseIndex] = response;
          }
        }

        if (errors.length > 0) {
          this.handleError(errors[0]); // Como é uma única requisição, há apenas um erro.
        }
      },
      error: (error: HttpErrorResponse) => {
        const collectionError = this.convertToCollectionError(error, collection.id, request.id);
        this.handleError(collectionError);
      }
    });
  }

  isExecutionActive(collectionId: number): boolean {
    return this.executionStatusMap[collectionId] || false;
  }

  private handleError(error: CollectionError): void {
    // Verifica se já existe um erro para o mesmo requestId e collectionId
    const existingErrorIndex = this.errors.findIndex(e => e.requestId === error.requestId && e.collectionId === error.collectionId);
    if (existingErrorIndex !== -1) {
        this.errors[existingErrorIndex] = error;
    } else {
        this.errors.push(error);
    }
    console.error('Erro registrado:', error);
}

  isRequestSuccessful(requestId: number, collectionId: number): boolean {
    return this.responses.some(response => response.requestId === requestId && response.collectionId === collectionId);
  }

  hasResponse(requestId: number, collectionId: number): boolean {
    return this.responses.some(response => response.requestId === requestId && response.collectionId === collectionId);
  }

  hasError(requestId: number, collectionId: number): boolean {
    return this.errors.some(error => error.requestId === requestId && error.collectionId === collectionId);
  }

  getResponse(requestId: number, collectionId: number): CollectionResponse | undefined {
    return this.responses.find(response => response.requestId === requestId && response.collectionId === collectionId);
  }

  getErrors(requestId: number, collectionId: number): CollectionError | undefined {
    return this.errors.find(error => error.requestId === requestId && error.collectionId === collectionId);
  }

  convertToCollectionError(error: HttpErrorResponse, collectionId: number, requestId: number): CollectionError {
    return {
      collectionId: collectionId,
      requestId: requestId, // Ajuste conforme necessário
      url: error.url || '',
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      //headers: error.headers,
      body: error.error || 'Corpo da resposta não disponível'
    };
  }

  getActiveRequestId(error: HttpErrorResponse): number | undefined {
      const failedRequest = this.requests.find(req => error.url?.includes(req.url));
      return failedRequest?.id;
  }

  toggleAllPanels(collection: Collection): void {
    const collectionId = collection.id;
    const allRequestIds = collection.requests.map(req => req.id);

    if (this.areAllPanelsExpanded(collection)) {
      // Se todos os panels estiverem expandidos, recolha todos
      this.expandedPanels[collectionId] = [];
    } else {
      // Se nem todos os panels estiverem expandidos, expanda todos
      this.expandedPanels[collectionId] = [...allRequestIds];
    }
  }

  areAllPanelsExpanded(collection: Collection): boolean {
    const collectionId = collection.id;
    const allRequestIds = collection.requests.map(req => req.id);
    const expandedRequestIds = this.expandedPanels[collectionId] || [];
    return allRequestIds.length === expandedRequestIds.length;
  }
    /*
    if (responseIndex === -1) {
      const collectionResponse: CollectionResponse = {
        collectionId, // Adicione o collectionId à resposta
        requestId,
        status: response[0].status,
        statusText: response[0].statusText,
        url: response[0].url,
        type: response[0].type,
        headers: response[0].headers,
        body: response[0].body,
        response: response[0]
      };
      this.responses.push(collectionResponse); // Passar um array com o objeto collectionResponse
    } else {
      this.responses[responseIndex].response = response[0];
    }
  });
    executeSingleRequest(request: CollectionRequests): void {
    this.collectionService.sendCollectionRequests([request]).subscribe((response: ResponseDetails[]) => {
      this.responses.push(...response);
    });
  }
  */

}
