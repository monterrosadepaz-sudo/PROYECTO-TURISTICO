<?php

namespace App\Http\Controllers\admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Controller;
use function Laravel\Prompts\text;

class RecuperacionController extends Controller
{
    /**
     * Endpoint oficial para recuperación de usuario.
     * Recibe el nombre de usuario desde el frontend,
     * valida en la tabla usuarios y envía el correo de recuperación.
     */
    public function enviarCorreoRecuperacion(Request $request)
    {
        // 1. Tomar el nombre de usuario desde el JSON del frontend
        $nombreUsuario = $request->input('usuario');

                //adicional

        $id = DB::selectOne("SELECT idusuario FROM usuarios WHERE nombre = ?", [$nombreUsuario])->idusuario;

        // 2. Buscar en la tabla usuarios por nombre
        $usuario = DB::selectOne("SELECT * FROM usuarios WHERE nombre = ?", [$nombreUsuario]);

        // 3. Validar existencia y correo asignado
        if (!$usuario || empty($usuario->email)) {
            return response()->json([
                'error' => 'El usuario es incorrecto o no tiene correo asignado, solicite apoyo de superusuario'
            ], 404);
        }

        // 4. Generar link de recuperación (por ahora directo)
        $link = url('http://100.79.243.60:5173/restablecer/'.$usuario->idusuario);

        // 5. Enviar correo al email mapeado
        Mail::raw("Este es un correo enviado en activacion del protocolo de seguridad y recuperacion de acceso por usuario al sistema turistico, si usted esta solicitando recuperar su usuario haga clik en el siguiente enlace, si no , ignore este correo: $link,", function ($message) use ($usuario) {
            $message->to($usuario->email)
                    ->subject('Recuperación de acceso - SISTEMA TURISMO');
        });



        // 6. Responder al frontend
        return response()->json([
            'message' => 'Correo de recuperación enviado',
            'idusuario' => $id
        ]);
    }

    public function restablecer($idusuario)
    {
        
        
        $idusuario = DB::selectOne("SELECT * FROM usuarios WHERE idusuario = ?", [$idusuario]);

        if (!$idusuario) {
            return response()->json([
                'error' => 'Usuario no encontrado'
            ], 404);
        }

        DB::update("UPDATE usuarios SET password = ? WHERE idusuario = ?", ['protocolo404', $idusuario->idusuario]);

        Mail::raw("Activacion de protocolo de seguridad, el colaborador ,$idusuario,ha restablecido su contraseña por el protocolo de seguridad, la nueva contraseña es: protocolo404, se recomienda que el colaborador cambie su contraseña una vez ingrese al sistema, si usted no esta al tanto de esta actividad,haga uso de sus facultades de administrador para mitigar la amenaza", function ($message) use ($idusuario) {
            $message->to(DB::select("SELECT email FROM usuarios WHERE rol = 'Administrador'")[0]->email)
                    ->subject('Notificación de restablecimiento de contraseña - SISTEMA TURISMO');
        });

        return response()->json([
            'message' => "su contraseña se a actualizado correctamente por la contraseña estandar de recuperacion, en cumpiimiento del protocolo de seguridad, su contraseña a sido reemplazada a protocolo404, usuario: $idusuario->nombre ,tambien debe estar conciente de que administracion sera notificado sobre esto. Una vez ingrese nuevamente a su cuenta debe actualizar su contraseña por una personal",
        ]);
    }
}