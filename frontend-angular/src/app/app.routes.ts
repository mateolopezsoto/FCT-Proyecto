import { Routes } from '@angular/router';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const routes: Routes = [
  // Ruta raíz → Login
  {
    path: '',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },

  // Registro
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.component').then(m => m.RegistroComponent)
  },
  
  // Reservas
  {
    path: 'reservas',
    loadComponent: () => import('./reservas/reservas.component').then(c => c.ReservasComponent),
    // Lógica del canActivate Guard corregida
    canActivate: [async () => {
      const auth = inject(AuthService);
      const router = inject(Router);
      const token = localStorage.getItem('token'); // Se lee el token

      // 1. Si el signal ya indica que está logueado, permite el acceso.
      if (auth.estaLogueado()) {
        return true;
      }
      
      // 2. Si hay un token (p. ej., después de un login o al recargar)
      //    pero el signal no está actualizado, forzamos la comprobación asíncrona.
      if (token) {
        // Esperamos a que la sesión se compruebe completamente.
        // Esto actualiza el signal `estaLogueado` a true o false.
        try {
          await auth.comprobarSesion(); 
        } catch {
          // Si comprobarSesion falla (token expirado/inválido), 
          // el servicio ya habrá limpiado el token y signals.
        }
      }

      // 3. Evaluar el estado final del signal después de la comprobación.
      if (auth.estaLogueado()) {
        return true;
      } else {
        // Si no hay token o la comprobación falló, redirigir a la raíz (Login)
        router.navigate(['/']);
        return false;
      }
    }]
  },

  // Ruta 404/Wildcard
  { path: '**', redirectTo: ''}, 
];