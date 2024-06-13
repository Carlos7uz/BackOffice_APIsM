import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AplicativoService } from '../../../core/services/aplicativo.service';
import { Aplicativo } from '../../../core/models/aplicativo.model';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    FlexLayoutModule,
    MatIcon,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent {
  appItems: { label: string, route: string }[] = [];

  navItems = [
    { label: 'Home', route: '', icon: 'home'},
    { label: 'Novo aplicativo', route: '/newapi', icon: 'add'},
  ]

  trackByFn(index: number, item: any) {
    return item.label; // Você pode retornar qualquer identificador único, como o próprio índice ou uma propriedade única do item
  }

  constructor(private aplicativoService: AplicativoService, private router: Router) { }

  aplicativos: Aplicativo[] = [];

  ngOnInit(): void {
    this.getAplicativos();
  }

  getAplicativos(): void{
    this.aplicativoService.getAplicativos().subscribe(aplicativos =>
      this.aplicativos = aplicativos
    );
  }

  onSelected(aplicativo: Aplicativo): void{
    this.router.navigate(['/aplicativo', aplicativo.id]);
  }
}
