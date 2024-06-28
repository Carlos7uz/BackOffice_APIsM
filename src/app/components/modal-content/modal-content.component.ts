import { Detalhe } from './../../../core/models/detalhe.model';
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { Aplicativo, Endpoint, Parameter } from './../../../core/models/aplicativo.model';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RequisicaoService } from '../../../core/services/requisicao.service';
import { Requisicao } from '../../../core/models/requisicao.model';
import {MatTabsModule} from '@angular/material/tabs';

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
  currentView: 'params' | 'headers' | 'body' | 'details' = 'params';
  app: Aplicativo;
  endpoint: Endpoint;
  executionDetails: any;
  //endpoints: Endpoint[];
  //detalhe!: Detalhe
  //body: string = '';
  //sla: HttpResponse


  constructor(
    private fb: FormBuilder,
    private requisicaoService: RequisicaoService,
    public dialogRef: MatDialogRef<ModalContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.app = data.app;
    this.endpoint = data.endpoint;

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
      paramValue: [param.paramValue || '', param.required ? Validators.required : null]
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
      cabecalhoChave: ['', Validators.required],
      cabecalhoValor: ['', Validators.required]
    }));
  }

  removeHeader(index: number): void {
    this.headers.removeAt(index);
  }

  switchView(view: 'params' | 'headers' | 'body' | 'details'): void {
    this.currentView = view;
  }

  executeRequest(): void {
    if (this.form.invalid) {
      const invalidControls: string[]=[];

      // Verifica cada controle dentro de 'params' e 'headers' para encontrar controles inválidos
      this.params.controls.forEach((control, index) => {
        if (control.invalid) {
          invalidControls.push(`Parâmetro ${index + 1}: ParamValue`);
        }
      });

      this.headers.controls.forEach((control, index) => {
        if (control.invalid) {
          invalidControls.push(`Cabeçalho ${index + 1}: ${control.value.cabecalhoChave}`);
        }
      });

      console.error('Erro no formulário. Controles inválidos:', invalidControls);
      return;
    }

    const requisicao: Requisicao = {
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
        paramValue: param.paramValue
      })),
      headers: this.headers.value.map((header: any, index: number) => ({
        id: index + 1,
        cabecalhoChave: header.cabecalhoChave,
        cabecalhoValor: header.cabecalhoValor
      })),
      body: this.form.get('body')?.value || null
    };;

    this.requisicaoService.addRequisicao(requisicao).subscribe(response => {
      console.log('Requisição executada com sucesso', response);
      this.executionDetails = response;
      this.currentView = 'details';
    }, error => {
      console.error('Erro ao executar requisição', error);
    });
  }
}
