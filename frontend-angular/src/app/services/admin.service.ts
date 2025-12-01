import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

// Reutilizamos las interfaces de ReservaService, si fuera necesario
import { TipoInstalacion, Instalacion } from './reserva.service';

// Interfaz para la edición (añadiendo el tipoId para el formulario)
export interface InstalacionAdmin extends Instalacion {
  id_tipo: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api';

  // ESTADO GLOBAL
  instalacions = signal<InstalacionAdmin[]>([]);
  tipos = signal<TipoInstalacion[]>([]);
  loading = signal(false);

  constructor() {
    // La carga inicial se disparará en el componente usando el método cargarDatos
  }

  // Carga todas las instalaciones y sus tipos (requiere token válido)
  async cargarDatos() {
    if (this.loading()) return;
    this.loading.set(true);

    try {
      // Necesitarás crear este endpoint en Laravel: /api/admin/instalacions
      const [instalacions, tipos] = await Promise.all([
        lastValueFrom(this.http.get<InstalacionAdmin[]>(`${this.apiUrl}/admin/instalacions`)),
        lastValueFrom(this.http.get<TipoInstalacion[]>(`${this.apiUrl}/tipos-instalacion`))
      ]);

      this.instalacions.set(instalacions || []);
      this.tipos.set(tipos || []);
    } catch (error: any) {
      console.error('Error cargando datos de administración:', error);
      Swal.fire('Erro', 'Non se puideron cargar os datos de administración.', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  // Lógica para ELIMINAR una instalación
  async eliminarInstalacion(id: number) {
    const result = await Swal.fire({
      title: 'Estás seguro/a?',
      text: "Non poderás reverter esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC3545',
      cancelButtonColor: '#FFA500',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      this.loading.set(true);
      try {
        await lastValueFrom(
          this.http.delete(`${this.apiUrl}/admin/instalacions/${id}`)
        );

        // Si es exitoso, actualizamos la lista localmente
        this.instalacions.update(insts => 
          insts.filter(i => i.id_instalacion !== id)
        );

        Swal.fire('Eliminada!', 'A instalación foi eliminada.', 'success');
      } catch (error) {
        Swal.fire('Erro', 'Non se puido eliminar a instalación.', 'error');
      } finally {
        this.loading.set(false);
      }
    }
  }
  
  // NOTA: Los métodos para ADD y EDITAR se implementarían en un servicio/componente de edición.
}