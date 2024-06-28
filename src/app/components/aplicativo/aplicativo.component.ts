import { Aplicativo } from './../../../core/models/aplicativo.model';
import { Component, OnInit } from '@angular/core';
import { Endpoint } from '../../../core/models/aplicativo.model';
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
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    FlexLayoutModule,
    ModalContentComponent
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

  abrirTeste(endpoint: Endpoint, app: Aplicativo): void {
    const dialogRef = this.dialog.open(ModalContentComponent, {
      width: '450px',
      height: '550px',
      data: {
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

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('The dialog was closed');
      console.log(`Dialog result: ${result}`)
    });
  }

  detalhesEndpoint(index: number): void {
    this.detalhesVisiveis[index] = !this.detalhesVisiveis[index];
  }

  alterarEndpoint(endpoit: Endpoint): void{

  }

  excluirEndpoint(endpoit: Endpoint): void{

  }
}
