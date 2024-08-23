import { Component, Input, OnInit } from '@angular/core';
import { RequestService } from '../../../../../../core/services/request.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Request } from '../../../../../../core/models/request.model';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recent-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './recent-requests.component.html',
  styleUrl: './recent-requests.component.css'
})
export class RecentRequestsComponent implements OnInit {
  @Input() requests: Request[] = [];

  constructor(
    private requestService: RequestService,
    private router: Router,
  ){}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.requestService.getRequests().subscribe(requests => {
      this.requests = this.filterAndSortRecentRequests(requests);
    });
  }

  filterAndSortRecentRequests(requests: Request[]): Request[] {
    // Função para converter a string de timestamp em um objeto Date
    const parseTimestamp = (timestamp: string): Date => {
      const [datePart, timePart] = timestamp.split(', ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute, second);
    };

    // Ordena as requisições por timestamp da mais recente para a mais antiga
    const sortedRequests = requests
      .filter(request => request.timestamp) // Garante que o timestamp não seja undefined
      .sort((a: any, b: any) => parseTimestamp(b.timestamp).getTime() - parseTimestamp(a.timestamp).getTime());

    // Retorna as 10 requisições mais recentes
    return sortedRequests.slice(0, 10);
  }

  redirectToApp(appId: number){
    this.router.navigate(['/aplicativo', appId])
  }

}
