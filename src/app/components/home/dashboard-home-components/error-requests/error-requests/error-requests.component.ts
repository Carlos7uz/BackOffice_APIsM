import { RequestService } from './../../../../../../core/services/request.service';
import { Component, Input, OnInit } from '@angular/core';
import { Request } from '../../../../../../core/models/request.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-error-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
  ],
  templateUrl: './error-requests.component.html',
  styleUrl: './error-requests.component.css'
})
export class ErrorRequestsComponent implements OnInit {
  @Input() requests: Request[] = [];

  errorRequests: Request[] = [];

  constructor(
    private requestService: RequestService,
    private router: Router,
  ){}

  ngOnInit(): void {

    this.loadRequests();
  }

  loadRequests(): void {
    this.requestService.getRequests().subscribe(requests => {
      this.filterErrorRequests(requests);
    });
  }

  filterErrorRequests(requests: Request[]): void {
    // Função para converter a string de timestamp em um objeto Date
    const parseTimestamp = (timestamp: string): Date => {
      const [datePart, timePart] = timestamp.split(', ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute, second);
    };

    // Filtra as requisições com status diferente de 200
    const filteredErrors = requests
      .filter(request => request.response?.status !== 200) // Filtra erros
      .sort((a: any, b: any) => parseTimestamp(b.timestamp).getTime() - parseTimestamp(a.timestamp).getTime()) // Ordena por timestamp
      .slice(0, 10); // Pega as 10 mais recentes

    this.errorRequests = filteredErrors;
  }

  redirectToApp(appId: number){
    this.router.navigate(['/aplicativo', appId])
  }
}
