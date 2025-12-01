// src/app/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

interface Usuario {
  id_usuario: number;
  nome: string;
  apelidos: string;
  correo: string;
  telefono?: string;
}

interface RegisterData {
  nome: string;
  apelidos: string;
  correo: string;
  telefono?: string;
  contrasinal: string;
}

interface LoginData {
  correo: string;
  contrasinal: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  // ESTADO GLOBAL REACTIVO
  usuario = signal<Usuario | null>(null);
  estaLogueado = signal(false);
  loading = signal(false);  // ← AQUÍ LO PONEMOS, al mismo nivel que los otros signals

  constructor(private http: HttpClient, private router: Router) {
    this.comprobarSesion();
  }

  async register(datos: RegisterData) {
    this.loading.set(true);  // ← empieza el loading
    try {

      const payload = {
      nome: datos.nome,
      apelidos: datos.apelidos,
      correo: datos.correo,
      telefono: datos.telefono ?? null,
      password: datos.contrasinal,                    // Laravel quiere "password"
      password_confirmation: datos.contrasinal       // y quiere que coincidir con este
    };

      // Agora si facer o rexistro
      const res: any = await lastValueFrom(
        this.http.post(`${this.apiUrl}/register`, payload)
      );

      await Swal.fire({
        icon: 'success',
        title: 'Rexistro correcto!',
        text: 'Xa podes iniciar sesión co teu novo usuario',
        timer: 3000,
        showConfirmButton: false
      });

      this.router.navigate(['/']);
    } catch (err: any) {
      const errors = err.error?.errors || {};
      let msg = 'Erro no rexistro';
      if (errors.correo?.[0]) msg = errors.correo[0];
      else if (errors.telefono?.[0]) msg = errors.telefono[0];
      else if (errors.password?.[0]) msg = errors.password[0];
      else if (err.error?.message) msg = err.error.message;

      await Swal.fire('Erro', msg, 'error');
    } finally {
      this.loading.set(false);  // ← siempre se apaga
    }
  }

  async login(credenciais: LoginData) {
    this.loading.set(true);  // ← empieza
    try {
      const payload = {
        correo: credenciais.correo,
        password: credenciais.contrasinal
      };

      const res: any = await lastValueFrom(
        this.http.post(`${this.apiUrl}/login`, payload)
      );

      // Gardamos o token en LocalStorage
      localStorage.setItem('token', res.access_token);

      this.usuario.set(res.user);
      this.estaLogueado.set(true);

      await Swal.fire({
      icon: 'success',
      title: 'Benvido!',
      text: `Ola ${res.user.nome}!`,
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    });
      this.router.navigate(['/reservas']);
    } catch (err: any) {
      await Swal.fire('Erro', err.error?.message || 'Credenciais incorrectas', 'error');
    } finally {
      this.loading.set(false);  // ← siempre se apaga
    }
  }

async comprobarSesion() {
  const token = localStorage.getItem('token');
  if (!token) {
    this.usuario.set(null);
    this.estaLogueado.set(false);
    return; // ← sale sin hacer petición
  }

  if (this.estaLogueado() && this.usuario()) {
    return;
  }

  this.loading.set(true);
  try {
    const res: any = await lastValueFrom(
      this.http.get(`${this.apiUrl}/user`)
    );
    this.usuario.set(res);
    this.estaLogueado.set(true);
  } catch (err: any) {
    // Si falla (token expirado o inválido), lo borramos
    localStorage.removeItem('token');
    this.usuario.set(null);
    this.estaLogueado.set(false);
  } finally {
    this.loading.set(false);
  }
}

  async logout() {
    this.loading.set(true);
    try {
      await lastValueFrom(
        this.http.post(`${this.apiUrl}/logout`, {})
      );
    } catch {}
    this.usuario.set(null);
    this.estaLogueado.set(false);
    await Swal.fire('Sesión pechada', 'Volve pronto!', 'info');
    this.router.navigate(['/']);
    this.loading.set(false);
  }
}