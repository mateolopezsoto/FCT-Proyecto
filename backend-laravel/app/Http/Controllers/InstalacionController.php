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
     * Retorna todas las instalaciones disponibles, verificando el estado de reserva para hoy.
     */
    public function index()
    {
        // El middleware 'auth:sanctum' ya ha verificado el token para llegar aquí.
        
        $instalacions = Instalacion::with(['tipo'])->get()->map(function ($i) {
            
            $hoxe = Carbon::now()->format('Y-m-d');
            
            // Comprobación de que la instalación no esté reservada y confirmada para hoy
            $ocupada = $i->reservas()
                ->where('data_reserva', $hoxe)
                ->where('estado', 'Confirmada') // Usamos 'Confirmada' para coincidir con la DB
                ->exists();
            
            // Estado de la instalación basado en la columna 'estado' (Disponible, En Mantemento, etc.)
            $esta_dispoñible = strtolower($i->estado) === 'disponible';
            
            return [
                'id_instalacion' => $i->id_instalacion,
                'nome' => $i->nome,
                'capacidade' => $i->capacidade,
                'estado' => $i->estado,
                'tipo' => [
                    'id_tipo' => $i->tipo?->id_tipo,
                    'nome_tipo' => $i->tipo?->nome_tipo
                ],
                // Es disponible si no está ocupada HOY Y su estado general es 'Disponible'
                'disponible' => !$ocupada && $esta_dispoñible
            ];
        });
        
        return response()->json($instalacions);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Instalacion $instalacion)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Instalacion $instalacion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Instalacion $instalacion)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Instalacion $instalacion)
    {
        //
    }
}