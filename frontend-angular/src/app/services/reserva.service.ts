import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

export interface TipoInstalacion {
  id_tipo: number;
  nome_tipo: string;
}

export interface Instalacion {
  id_instalacion: number;
  nome: string;
  capacidade: number;
  estado: string;
  tipo: { id_tipo: number; nome_tipo: string };
  disponible: boolean;
}

export interface Horario {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api';

  tipos = signal<TipoInstalacion[]>([]);
  instalacions = signal<Instalacion[]>([]);
  horarios = signal<Horario[]>([]);
  loading = signal(false);

  // CONSTRUCTOR: carga automática ao iniciar a app
  constructor() { 
    // Solo cargamos si el usuario está logueado
    effect(() => {
      if (this.authService.estaLogueado()) {
        this.cargarDatos();
      }
    }, { allowSignalWrites: true });
  }

  async cargarDatos() {
    if (this.loading()) return; 

    this.loading.set(true);
    // VAMOS A ELIMINAR ESTA LÍNEA QUE CAUSA EL NG0600:
    // this.authService.loading.set(true); 

    try {
      const [tipos, instalacions, horarios] = await Promise.all([
        lastValueFrom(this.http.get<TipoInstalacion[]>(`${this.apiUrl}/tipos-instalacion`)),
        lastValueFrom(this.http.get<Instalacion[]>(`${this.apiUrl}/instalacions`)),
        lastValueFrom(this.http.get<Horario[]>(`${this.apiUrl}/horarios`))
      ]);

      this.tipos.set(tipos || []);
      this.instalacions.set(instalacions || []);
      this.horarios.set(horarios || []);
    } catch (err) {
      Swal.fire('Erro', 'Non se puideron cargar as instalacións', 'error');
    } finally {
      this.loading.set(false);
      // VAMOS A ELIMINAR ESTA LÍNEA QUE CAUSA EL NG0600:
      // this.authService.loading.set(false);
    }
  }

  async reservar(datos: { id_instalacion: number; id_horario: number; data_reserva: string }) {
    this.loading.set(true);
    // this.authService.loading.set(true); // Eliminado

    try {
      await lastValueFrom(this.http.post(`${this.apiUrl}/reservas`, datos));
      Swal.fire('Perfecto!', 'Reserva confirmada', 'success');
      await this.cargarDatos(); 
    } catch (err: any) {
      const msg = err.error?.message || 'Erro ao reservar';
      Swal.fire('Erro', msg, 'error');
      throw  err;
    } finally {
      this.loading.set(false);
      // this.authService.loading.set(false); // Eliminado
    }
  }
}