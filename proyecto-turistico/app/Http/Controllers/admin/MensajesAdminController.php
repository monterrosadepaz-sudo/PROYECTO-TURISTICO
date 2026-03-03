<?php

namespace App\Http\Controllers\admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class MensajesAdminController extends Controller
{
    /**
     * Index: Listar todas las solicitudes pendientes para un admin
     */
    public function index(Request $request)
    { 
        $idadmin = $request->input('idadmin');

        if (!$idadmin) {
            return response()->json(['error' => 'Debe enviar idadmin'], 400);
        }

        $solicitudes = DB::table('mensajes_colab')
            ->select(
                'idmensaje',
                'idpublicacion',
                'remitente_id',
                'destinatario_id',
                'accion',
                'comentarios',
                'fecha',
                'estado'
            )
            ->where('destinatario_id', $idadmin)
            ->orderBy('fecha', 'asc')
            ->get();

        return response()->json($solicitudes);
    }

    /**
     * Show: Ver detalle de una solicitud y marcarla como vista
     */
    public function show($idmensaje)
    {
        $solicitud = DB::table('mensajes_colab')
            ->where('idmensaje', $idmensaje)
            ->first();

        if (!$solicitud) {
            return response()->json(['error' => 'Solicitud no encontrada'], 404);
        }

        // Actualizar estado a "visto"
        DB::table('mensajes_colab')
            ->where('idmensaje', $idmensaje)
            ->update(['estado' => 'visto']);

        // Reflejar el cambio en el objeto devuelto
        $solicitud->estado = 'visto';

        return response()->json($solicitud);
    }

    /**
     * Enviar respuesta del admin al colaborador
     */
/**
 * Enviar respuesta del admin al colaborador
 */
public function enviarRespuesta(Request $request)
{
    // Validación de campos requeridos
    $required = ['idpublicacion', 'remitente_id', 'destinatario_id', 'accion', 'comentarios', 'respuesta_a'];
    foreach ($required as $field) {
        if (!$request->input($field)) {
            return response()->json(['error' => "Falta el campo requerido: $field"], 400);
        }
    }

    $idmensaje = DB::selectOne("SELECT gen_random_uuid() as id")->id;

    $mensajeData = [
        'idmensaje'       => $idmensaje,
        'idpublicacion'   => $request->input('idpublicacion'),
        'remitente_id'    => $request->input('remitente_id'),   // admin
        'destinatario_id' => $request->input('destinatario_id'), // colaborador
        'accion'          => $request->input('accion'), // aprobar/rechazar/solicitar_correccion
        'comentarios'     => $request->input('comentarios'),
        'respuesta_a'     => $request->input('respuesta_a'), // idmensaje del colaborador
        'fecha'           => now(),
        'estado'          => 'pendiente' // siempre pendiente hasta que el colaborador la vea
    ];

    // Insertar en mensajes_admin
    DB::table('mensajes_admin')->insert($mensajeData);

    // Actualizar registro en registro_interacciones
    DB::table('registro_interacciones')
        ->where('idpublicacion', $mensajeData['idpublicacion'])
        ->whereNull('idmensaje_admin') // solo actualiza si aún no hay respuesta
        ->update([
            'idmensaje_admin'   => $idmensaje,
            'accion_admin'      => $mensajeData['accion'],
            'comentarios_admin' => $mensajeData['comentarios'],
            'fecha'             => $mensajeData['fecha']
        ]);

    // Limpieza de respuestas antiguas (>72h)
    DB::delete("DELETE FROM mensajes_admin WHERE fecha < NOW() - INTERVAL '72 hours'");

    return response()->json([
        'message'        => 'Respuesta enviada correctamente',
        'idmensaje'      => $idmensaje,
        'idpublicacion'  => $mensajeData['idpublicacion'],
        'admin_id'       => $mensajeData['remitente_id'],
        'colaborador_id' => $mensajeData['destinatario_id'],
        'accion'         => $mensajeData['accion'],
        'comentarios'    => $mensajeData['comentarios'],
        'fecha'          => $mensajeData['fecha'],
        'estado'         => $mensajeData['estado']
    ]);
}
}