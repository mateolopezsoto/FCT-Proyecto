import { Component, inject, signal, effect, OnInit } from '@angular/core'; // Añadimos OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ReservaService, Instalacion } from '../services/reserva.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss'
})
export class ReservasComponent implements OnInit { // Implementamos OnInit
  authService = inject(AuthService);
  reservaService = inject(ReservaService);

  filtroTipo = '';
  filtroData = new Date().toISOString().split('T')[0];
  instalacionsFiltradas = signal<Instalacion[]>([]);

  // Eliminamos el constructor, usamos ngOnInit para la carga inicial
  // y un effect separado solo para el filtrado.

  ngOnInit(): void {
    // 1. Inicia la carga de datos si ya estamos logueados.
    // El canActivate ya se aseguró de esto, pero lo hacemos por si acaso.
    if (this.authService.estaLogueado()) {
      this.cargar();
    }
  }

  constructor() {
    // 2. Este effect se mantiene para que el filtrado se reactive
    // cuando la lista de instalaciones (instalacions) cambie.
    effect(() => {
      // Re-ejecuta el filtro cada vez que la lista de instalaciones o el filtroTipo cambian
      const listaInstalacions = this.reservaService.instalacions();
      this.filtrar(listaInstalacions);
    }, { allowSignalWrites: true });
    // No necesitamos el effect del constructor que llama a cargar()
    // porque la carga inicial se hace en ngOnInit, y la recarga
    // después del login ya la maneja el effect dentro de ReservaService.
  }

  async cargar() {
    // **NOTA IMPORTANTE:** Eliminamos el control de loading de authService aquí.
    // El ReservaService ya gestiona su propio loading durante la llamada.
    try {
      await this.reservaService.cargarDatos();
      // El filtro se ejecutará automáticamente por el effect del constructor
    } catch (err) {
      console.error('Error cargando os datos das reservas', err);
      // El mensaje de error ya lo muestra el servicio, lo dejamos como fallback
      Swal.fire('Erro', 'Non se puideron cargar as instalacións', 'error');
    }
  }

  // Modificamos filtrar para recibir la lista y que sea compatible con el effect
  filtrar(lista: Instalacion[] | null = null) {
    let listaFiltrada = lista ?? this.reservaService.instalacions();

    if (this.filtroTipo) {
      listaFiltrada = listaFiltrada.filter(i => i.tipo?.id_tipo === +this.filtroTipo);
    }

    this.instalacionsFiltradas.set(listaFiltrada);
  }

  // Lógica para el botón Reservar (pendiente de implementación)
  async reservar(instalacion: Instalacion) {
    // Faltaría pedir la fecha/hora en el HTML/modal, pero aquí está el esqueleto
    const { value: dataReserva } = await Swal.fire({
      title: 'Selecciona unha data para reservar',
      input: 'date',
      inputValue: new Date().toISOString().split('T')[0],
      showCancelButton: true,
      confirmButtonText: 'Confirmar Reserva',
      cancelButtonText: 'Cancelar'
    });

    if (dataReserva) {
        // En un paso posterior, también necesitarás pedir el horario (id_horario)
        // Por ahora, asumimos un valor dummy para probar el backend:
        const dummyHorarioId = 1; 

        try {
            await this.reservaService.reservar({
                id_instalacion: instalacion.id_instalacion,
                id_horario: dummyHorarioId,
                data_reserva: dataReserva
            });
        } catch (error) {
            // El servicio ya gestiona el error de Swal.fire
        }
    }
  }
}