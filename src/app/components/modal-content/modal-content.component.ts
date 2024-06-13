import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { Header } from '../../../core/models/auth.model';
import { Endpoint } from './../../../core/models/aplicativo.model';

@Component({
  selector: 'app-modal-content',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    FormsModule,
  ],
  templateUrl: './modal-content.component.html',
  styleUrl: './modal-content.component.css'
})
export class ModalContentComponent {
  currentView: 'params' | 'headers' | 'body' | 'details' = 'params';
  endpoint: Endpoint;
  headers: Header[] = [];
  body: string = '';
  executionDetails: { endpoint: Endpoint; headers: Header[]; body: string | object } | null = null;

  constructor(
    public dialogRef: MatDialogRef<ModalContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.endpoint = data.endpoint;
  }

  close(): void {
    this.dialogRef.close();
  }

  switchView(view: 'params' | 'headers' | 'body' | 'details'): void {
    this.currentView = view;
  }

  addHeader(): void {
    this.headers.push({ key: '', value: '' });
  }

  executeEndpoint(): void {
    let parsedBody;
    try {
      parsedBody = JSON.parse(this.body);
    } catch (e) {
      console.error("Body JSON parsing error:", e);
      parsedBody = this.body;  // fallback para o texto original
    }

    console.log('Endpoint:', JSON.stringify(this.endpoint, null, 2));
    console.log('Headers:', JSON.stringify(this.headers, null, 2));
    console.log('Body:', JSON.stringify(parsedBody, null, 2));

    this.executionDetails = {
      endpoint: this.endpoint,
      headers: this.headers,
      body: parsedBody
    };

    this.switchView('details')
  }
}
