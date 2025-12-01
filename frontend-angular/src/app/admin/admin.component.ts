import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, InstalacionAdmin } from '../services/admin.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router'; // Para la redirección de edición

@Component({
  selector: 'app-admin-instalacions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'] // Usaremos el estilo del HTML base
})
export class AdminInstalacionsComponent implements OnInit {
  adminService = inject(AdminService);
  authService = inject(AuthService);
  router = inject(Router);

  // Estados de Filtro
  filtroTipoId = signal('');
  filtroEstado = signal('');

  // Lista Filtrada (Computed Signal)
  instalacionsFiltradas = computed(() => {
    const instalacions = this.adminService.instalacions();
    const tipoId = this.filtroTipoId();
    const estado = this.filtroEstado();

    return instalacions.filter(inst => {
      let pasaFiltroTipo = true;
      let pasaFiltroEstado = true;

      // Filtrar por Tipo
      if (tipoId) {
        // Aseguramos que el tipo de la instalación coincida con el tipo seleccionado
        pasaFiltroTipo = inst.id_tipo === +tipoId; 
      }

      // Filtrar por Estado
      if (estado) {
        pasaFiltroEstado = inst.estado.toLowerCase() === estado.toLowerCase();
      }

      return pasaFiltroTipo && pasaFiltroEstado;
    });
  });

  // Lista de estados disponibles para el filtro
  estadosDisponibles = ['Disponible', 'En Mantemento', 'Ocupada']; 

  ngOnInit(): void {
    // NOTA: Aquí deberías verificar si el usuario tiene Rol: Administrador
    if (this.authService.estaLogueado()) {
        this.adminService.cargarDatos();
    } else {
        // Redirigir si no está logueado (aunque el guard debería evitar esto)
        this.router.navigate(['/']); 
    }
  }

  // Evento al hacer clic en el botón Eliminar
  onEliminar(id: number) {
    this.adminService.eliminarInstalacion(id);
  }

  // Evento al hacer clic en el botón Editar
  onEditar(id: number) {
    // Redirige a la ruta de edición, pasando el ID como parámetro
    this.router.navigate(['/admin/instalacions/editar', id]); 
  }

  onEngadir() {
    this.router.navigate(['/admin/instalacions/engadir']); 
  }
}