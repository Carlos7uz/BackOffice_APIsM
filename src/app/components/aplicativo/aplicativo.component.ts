import { Component, OnInit } from '@angular/core';
import { Aplicativo, Endpoint } from '../../../core/models/aplicativo.model';
import { AplicativoService } from '../../../core/services/aplicativo.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ModalContentComponent } from '../modal-content/modal-content.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-aplicativo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    FlexLayoutModule,
    ModalContentComponent,
    MatDialogModule,
  ],
  templateUrl: './aplicativo.component.html',
  styleUrl: './aplicativo.component.css'
})
export class AplicativoComponent implements OnInit {
  selectedAplicativo!: Aplicativo;
  detalhesVisiveis: boolean[] = [];

  constructor(
    private aplicativoService: AplicativoService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.getAplicativo(id);
    });
  }

  getAplicativo(id: number): void {
    this.aplicativoService.getAplicativo(id).subscribe(aplicativo => {
      this.selectedAplicativo = aplicativo;
      this.detalhesVisiveis = this.selectedAplicativo.endpoints.map(() => false);
    });
  }

  abrirTeste(endpoint: Endpoint): void {
    const dialogRef = this.dialog.open(ModalContentComponent, {
      width: '400px',
      data: { endpoint }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('The dialog was closed');
    });
  }

  detalhesEndpoint(index: number): void {
    this.detalhesVisiveis[index] = !this.detalhesVisiveis[index];
  }
}
