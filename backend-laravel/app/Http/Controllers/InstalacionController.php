<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Instalacion;
use Carbon\Carbon;
use Illuminate\Http\Request;

class InstalacionController extends Controller
{
    /**
     * Display a listing of the resource.
     * Retorna todas las instalaciones con su estado de disponibilidad HOY.
     */
    public function index()
    {
        // El middleware 'auth:sanctum' ya ha verificado el token.
        
        $instalacions = Instalacion::with(['tipo'])->get()->map(function ($i) {
            
            $hoxe = Carbon::now()->format('Y-m-d');
            
            // 1. Comprobación de reserva para el día de hoy (estado 'Confirmada')
            // Se debe evitar crear reservas si la instalación está 'En Mantemento'.
            $reservada_hoxe = $i->reservas()
                ->where('data_reserva', $hoxe)
                ->where('estado', 'Confirmada')
                ->exists();
            
            // 2. Comprobación del estado general de la instalación (columna 'estado')
            $esta_dispoñible = strtolower($i->estado) === 'disponible';
            
            // 3. Determinar el estado final de disponibilidad (booleano)
            $disponible_final = $esta_dispoñible && !$reservada_hoxe;

            return [
                'id_instalacion' => $i->id_instalacion,
                'nome' => $i->nome,
                'capacidade' => $i->capacidade,
                'estado_general' => $i->estado, // Estado de la columna DB
                'tipo' => [
                    'id_tipo' => $i->tipo?->id_tipo,
                    'nome_tipo' => $i->tipo?->nome_tipo
                ],
                // Propiedad usada por Angular para el botón y la vista
                'disponible' => $disponible_final 
            ];
        });
        
        return response()->json($instalacions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // ...
    }

    // ... (otros métodos)
}