<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class RecuperacionController extends Controller
{
    public function enviarCorreoRecuperacion(Request $request)
    {
        // 1. Tomar el nombre de usuario desde el JSON del frontend
        $nombreUsuario = $request->input('usuario');

        // 2. Buscar en la tabla usuarios por nombre
        $usuario = DB::selectOne("SELECT * FROM usuarios WHERE nombre = ?", [$nombreUsuario]);

        // 3. Validar existencia y correo asignado
        if (!$usuario || empty($usuario->email)) {
            return response()->json([
                'error' => 'El usuario es incorrecto o no tiene correo asignado, solicite apoyo de superusuario'
            ], 404);
        }

        // 4. Generar link de recuperación (por ahora directo)
        $link = url('/recuperacion?usuario='.$usuario->nombre);

        // 5. Enviar correo al email mapeado
        Mail::raw("Haz clic en el siguiente enlace para recuperar tu acceso: $link", function ($message) use ($usuario) {
            $message->to($usuario->email)
                    ->subject('Recuperación de acceso - SISTEMA TURISMO');
        });

        // 6. Responder al frontend
        return response()->json([
            'message' => 'Correo de recuperación enviado'
        ]);
    }
}