<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservaRequest;
use App\Http\Requests\UpdateReservaRequest;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReservaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        $request->validate([
            'id_instalacion' => 'required|exists:Instalacion, id_instalacion',
            'id_horario' => 'required|exists:Horario, id_horario',
            'data_reserva' => 'required|date|after_or_equal:today'
        ]);

        $existe = Reserva::where('id_instalacion', $request->id_instalacion)
            ->where('id_horario', $request->id_horario)
            ->where('data_reserva', $request->data_reserva)
            ->where('estado', 'confirmada')
            ->exists();
        
        if ($existe) {
            return response()->json(['message' => 'Xa hai reserva nese horario'], 422);
        }

        $reserva = Reserva::create([
            'data_reserva' => $request->data_reserva,
            'estado' => 'confirmada',
            'id_usuario' => auth('sanctum')->id(),
            'id_instalacion' => $request->id_instalacion,
            'id_horario' => $request->id_horario,
            'id_admin' => 1 // Provisional, logo o xestionamos
        ]);

        return response()->json(['message' => 'Reserva confirmada!', 'reserva' => $reserva], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Reserva $reserva)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reserva $reserva)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateReservaRequest $request, Reserva $reserva)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reserva $reserva)
    {
        //
    }
}
