<?php

namespace App\Http\Controllers\sitio;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class MensajeColabController extends Controller
{
    /**
     * Obtener IDs necesarios para crear la solicitud
     * - Recibe el id del colaborador logueado
     * - Devuelve el id del admin responsable y el id de la publicación
     */
    public function obtenerDatosSolicitud(Request $request)
    {
        $colaboradorId = $request->input('colaborador_id');
        $publicacionId = $request->input('idpublicacion');

        $datos = DB::table('publicaciones')
            ->select('idpublicacion', 'aprobado_por')
            ->where('idusuario', $colaboradorId)
            ->where('idpublicacion', $publicacionId)
            ->first();

        if (!$datos) {
            return response()->json([
                'error' => 'No se encontró la publicación asociada a este colaborador'
            ], 404);
        }

        return response()->json([
            'idpublicacion' => $datos->idpublicacion,
            'admin_id'      => $datos->aprobado_por
        ]);
    }

    /**
     * Enviar solicitud de colaborador hacia admin
     */
    public function enviarSolicitud(Request $request)
    {
        $idmensaje = DB::selectOne("SELECT gen_random_uuid() as id")->id;
        $idregistro = DB::selectOne("SELECT gen_random_uuid() as id")->id;

        $mensajeData = [
            'idmensaje'       => $idmensaje,
            'idpublicacion'   => $request->input('idpublicacion'),
            'remitente_id'    => $request->input('remitente_id'),
            'destinatario_id' => $request->input('destinatario_id'),
            'accion'          => $request->input('accion'), // editar/eliminar
            'comentarios'     => $request->input('comentarios'),
            'fecha'           => now(),
            'estado'          => 'pendiente',
        ];

        // Insertar en mensajes_colab
        DB::table('mensajes_colab')->insert($mensajeData);

        // Crear registro en registro_interacciones
        DB::table('registro_interacciones')->insert([
            'idregistro'        => $idregistro,
            'idpublicacion'     => $mensajeData['idpublicacion'],
            'idmensaje_colab'   => $idmensaje,
            'accion_colab'      => $mensajeData['accion'],
            'comentarios_colab' => $mensajeData['comentarios'],
            'fecha'             => $mensajeData['fecha']
        ]);

        // Limpieza de solicitudes antiguas (>72h)
        DB::delete("DELETE FROM mensajes_colab WHERE fecha < NOW() - INTERVAL '72 hours'");

        return response()->json([
            'message'   => 'Solicitud enviada correctamente',
            'idmensaje' => $idmensaje,
            'idregistro'=> $idregistro,
            'fecha'     => $mensajeData['fecha']
        ]);
    }

    /**
     * Listar solicitudes activas de un colaborador
     */
    public function listarSolicitudesPorColab($colaboradorId)
    {
        $solicitudes = DB::table('mensajes_colab')
            ->where('remitente_id', $colaboradorId)
            ->orderBy('fecha', 'asc')
            ->get();

        return response()->json($solicitudes);
    }

    /**
     * Ver respuestas del admin y actualizar estados
     */
    public function verRespuesta($idcolaborador)
    {
        $respuesta = DB::table('mensajes_admin')
            ->select(
                'idmensaje',
                'idpublicacion',
                'remitente_id',
                'destinatario_id',
                'accion',
                'comentarios',
                'respuesta_a',
                'fecha',
                'estado'
            )
            ->where('destinatario_id', $idcolaborador)
            ->get();

        if ($respuesta->isEmpty()) {
            return response()->json(['error' => 'No se encontró respuesta para este mensaje'], 404);
        }

        // Marcar las respuestas del admin como "visto"
        DB::table('mensajes_admin')
            ->where('destinatario_id', $idcolaborador)
            ->update(['estado' => 'visto']);

        // Marcar las solicitudes originales del colaborador como "respondido"
        foreach ($respuesta as $resp) {
            DB::table('mensajes_colab')
                ->where('idmensaje', $resp->respuesta_a)
                ->update(['estado' => 'respondido']);
        }

        return response()->json($respuesta);
    }


    public function confirmar($idpublicacion, $idcolaborador)
    {
        DB::table('publicaciones')
            ->where('idpublicacion', $idpublicacion)
            ->where('idusuario', $idcolaborador)
            ->update(['estado' => 'pendiente']);
    }

}