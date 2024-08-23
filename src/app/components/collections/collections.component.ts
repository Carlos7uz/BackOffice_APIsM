import { Component } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Collection } from '../../../core/models/collection.model';
import { CollectionService } from '../../../core/services/collection.service';
import { CommonModule } from '@angular/common';
import { Request } from '../../../core/models/request.model';


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
  requests: Request[] = [];


  constructor(
    private collectionService: CollectionService,
  ){}

  ngOnInit(): void {
   this.getCollections();
  }

  getCollections(): void {
    this.collectionService.getCollections().subscribe((collections: Collection[]) => {
      this.collections = collections;
    });
  }

}
