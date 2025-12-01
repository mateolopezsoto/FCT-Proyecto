<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInstalacionRequest;
use App\Http\Requests\UpdateInstalacionRequest;
use App\Models\Instalacion;

class InstalacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instalacions = Instalacion::with(['tipo'])->get()->map(function ($i) {
            $hoxe = now()->format('Y-m-d');
            $ocupada = $i->reservas()
                ->where('data_reserva', $hoxe)
                ->where('estado', 'Confirmada')
                ->exists();
            
            return [
                'id_instalacion' => $i->id_instalacion,
                'nome' => $i->nome,
                'capacidade' => $i->capacidade,
                'estado' => $i->estado,
                'tipo' => [
                    'id_tipo' => $i->tipo?->id_tipo,
                    'nome_tipo' => $i->tipo?->nome_tipo
                ],
                'Disponible' => !$ocupada && $i->estado == 'Disponible'
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
    public function store(StoreInstalacionRequest $request)
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
    public function update(UpdateInstalacionRequest $request, Instalacion $instalacion)
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
