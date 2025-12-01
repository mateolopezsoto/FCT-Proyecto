import { Component, inject, signal, computed, OnInit } from '@angular/core'; 
import { CommonModule, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ReservaService, Instalacion, Horario } from '../services/reserva.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservas',
  standalone: true,
  // SlicePipe es necesario para cortar la hora (HH:MM:SS -> HH:MM) en el template
  imports: [CommonModule, FormsModule, SlicePipe], 
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss'
})
export class ReservasComponent implements OnInit { 
  authService = inject(AuthService);
  reservaService = inject(ReservaService);
  router = inject(Router);

  // Estados de Filtro (Usados en el panel lateral)
  filtroTipo = signal('');
  filtroData = signal(new Date().toISOString().split('T')[0]); // Fecha de hoy por defecto
  filtroHorarioId = signal(''); 
  
  // Lista Filtrada: Signal calculado que reacciona a los cambios en los datos o en los filtros.
  instalacionsFiltradas = computed(() => {
    const instalacions = this.reservaService.instalacions();
    const tipoId = this.filtroTipo();
    const horarioId = this.filtroHorarioId();

    return instalacions.filter(inst => {
        let pasaFiltroTipo = true;
        let pasaFiltroHorario = true;

        // 1. FILTRADO POR TIPO
        if (tipoId) {
            pasaFiltroTipo = inst.tipo.id_tipo === +tipoId;
        }
        
        // 2. FILTRADO POR HORARIO
        // Aquí se añadiría lógica avanzada si el backend filtrara por horario/fecha
        // Por ahora, solo se aplica el filtro de UI si es necesario
        if (horarioId) {
             // Lógica pendiente de implementar la verificación de disponibilidad horaria
        }

        return pasaFiltroTipo && pasaFiltroHorario;
    });
  });

  // El effect de carga automática fue eliminado del servicio para evitar el bucle.
  // Ahora controlamos la carga aquí.
  ngOnInit(): void {
    if (this.authService.estaLogueado() && this.reservaService.instalacions().length === 0) {
      this.reservaService.cargarDatos();
    }
  }

  constructor() {
    // El computed signal 'instalacionsFiltradas' se encarga de la reactividad del filtro.
  }

  // Método para forzar la actualización del filtro
  filtrar() {
    // Se deja vacío porque la reactividad la maneja el computed signal
  }

  // Lógica para el botón Reservar (Modal SweetAlert2)
  async reservar(instalacion: Instalacion) {
    const horarios = this.reservaService.horarios();
    if (!horarios || horarios.length === 0) {
        Swal.fire('Erro', 'Non se puideron cargar os horarios dispoñibles.', 'error');
        return;
    }

    // Modal de confirmación para seleccionar Fecha y Horario
    const result = await Swal.fire({
        title: `Reservar: ${instalacion.nome}`,
        html: `
            <div style="text-align: left;">
                <!-- Campo de Fecha -->
                <label for="swal-date">Data:</label>
                <input id="swal-date" type="date" class="swal2-input" value="${this.filtroData()}">
                
                <!-- Campo de Horario (Se llena con el JS de didOpen) -->
                <label for="swal-horario">Horario:</label>
                <select id="swal-horario" class="swal2-input">
                    <option value="">Selecciona un horario</option>
                </select>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar Reserva',
        cancelButtonText: 'Cancelar',
        // Validación antes de cerrar el modal
        preConfirm: () => {
            const dateInput = document.getElementById('swal-date') as HTMLInputElement;
            const horarioSelect = document.getElementById('swal-horario') as HTMLSelectElement;

            const selectedDate = dateInput.value;
            const selectedHorarioId = horarioSelect.value;

            if (!selectedDate || !selectedHorarioId) {
                Swal.showValidationMessage('Debes seleccionar unha data e un horario.');
                return false;
            }
            return { data_reserva: selectedDate, id_horario: +selectedHorarioId };
        },
        // Llenar el Select de Horarios una vez que el modal está abierto
        didOpen: (popup) => {
            const select = popup.querySelector('#swal-horario') as HTMLSelectElement;
            horarios.forEach(h => {
                const option = document.createElement('option');
                option.value = h.id_horario.toString();
                // Usamos slice para formato HH:MM
                option.textContent = `${h.dia_semana} (${h.hora_inicio.slice(0, 5)} - ${h.hora_fin.slice(0, 5)})`;
                select.appendChild(option);
            });
        }
    });

    if (result.isConfirmed && result.value) {
        try {
            await this.reservaService.reservar({
                id_instalacion: instalacion.id_instalacion,
                id_horario: result.value.id_horario,
                data_reserva: result.value.data_reserva
            });
            // El servicio ya gestiona el Swal de éxito/error y la actualización de disponibilidad
        } catch (error) {
            // El error es propagado por el servicio
        }
    }
  }
}