<?php

namespace App\Http\Controllers\admin;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;

class PreformularioAdminController extends Controller
{
    /**
     * Listar todos los preformularios pendientes
     */
    public function index()
    {
        $pendientes = DB::table('preformularios')
            ->where('estado', 'pendiente')
            ->get();

        foreach ($pendientes as $p) {
            if (empty($p->imagen)) {
                $archivoPortada = DB::table('media')
                    ->where('preformulario_id', $p->idpreformulario)
                    ->orderBy('creado_en', 'asc')
                    ->first();

                $p->imagen = $archivoPortada ? $archivoPortada->nombre : null;
            }
        }

        return response()->json($pendientes);
    }

    /**
     * Analizar un preformulario específico
     */
    public function analizar($id)
    {
        $preformulario = DB::table('preformularios')
            ->select(
                'idpreformulario','idusuario','nombre','departamento','latitud','longitud',
                'clasificacion','politicas','horarios','costo_entrada','estado','imagen',
                'municipio','distrito','tarifas_desglosadas','descripcion','fecha','personas','detalles'
            )
            ->where('idpreformulario', $id)
            ->first();

        if (!$preformulario) {
            return response()->json(['error' => 'Preformulario no encontrado'], 404);
        }

        $imagenes = DB::table('media')
            ->where('preformulario_id', $id)
            ->select('nombre','tipo','formato','video_link')
            ->get();

$lote = [
    'plana'   => $imagenes->where('tipo', 'plana')->pluck('nombre')->values(),
    '360'     => $imagenes->where('tipo', '360')->pluck('nombre')->values(),
    'video'   => $imagenes->where('tipo', 'video')->pluck('nombre')->values(),
    '3d'      => $imagenes->where('tipo', '3d')->pluck('nombre')->values(),
    'youtube' => $imagenes->whereNotNull('video_link')->pluck('video_link')->values(),
];


        $preformulario->lote_imagenes = $lote;

        if ($preformulario->imagen && !(str_starts_with($preformulario->imagen, '0000') && str_contains($preformulario->imagen, 'preformularios'))) {
            $preformulario->imagen = null;
        }

        $usuario = DB::selectOne(
            "SELECT nombre FROM usuarios WHERE idusuario = ?",
            [$preformulario->idusuario]
        );

        $preformulario->nombre_colaborador = $usuario ? $usuario->nombre : null;

        return response()->json($preformulario);
    }

        /**
     * Aprobar un preformulario
     */
    public function approve($id, Request $request): JsonResponse
    {
        $preformulario = DB::selectOne(
            "SELECT * FROM preformularios WHERE idpreformulario = ?",
            [$id]
        );

        if (!$preformulario) {
            return response()->json(['error' => 'Preformulario no encontrado'], 404);
        }

        $portada = null;
        if ($preformulario->imagen 
            && str_starts_with($preformulario->imagen, '0000') 
            && str_contains($preformulario->imagen, 'preformularios')) {
            $portada = $preformulario->imagen;
        }

        DB::update(
            "UPDATE preformularios SET estado = ? WHERE idpreformulario = ?",
            ['aprobado', $id]
        );

        $idPublicacion = Str::uuid();
        $idAdmin = $request->input('admin_id');

        DB::insert(
            "INSERT INTO publicaciones (
                idpublicacion, idpreformulario, idusuario, aprobado_por, fecha_aprobacion,
                nombre, departamento, municipio, distrito, latitud, longitud, clasificacion,
                politicas, horarios, costo_entrada, tarifas_desglosadas, descripcion,
                fecha, personas, detalles, estado, imagen
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $idPublicacion,
                $preformulario->idpreformulario,
                $preformulario->idusuario,
                $idAdmin,
                now(),
                $preformulario->nombre,
                $preformulario->departamento,
                $preformulario->municipio,
                $preformulario->distrito,
                $preformulario->latitud,
                $preformulario->longitud,
                json_encode($preformulario->clasificacion),
                json_encode($preformulario->politicas),
                json_encode($preformulario->horarios),
                $preformulario->costo_entrada,
                json_encode($preformulario->tarifas_desglosadas),
                $preformulario->descripcion,
                $preformulario->fecha,
                $preformulario->personas,
                json_encode($preformulario->detalles),
                'activo',
                $portada
            ]
        );

        DB::table('media')
            ->where('preformulario_id', $id)
            ->update(['publicacion_id' => $idPublicacion]);

        $usuario = DB::selectOne(
            "SELECT email FROM usuarios WHERE idusuario = ?",
            [$preformulario->idusuario]
        );

        if ($usuario && !empty($usuario->email)) {
            $mensaje = "Su sitio turístico en {$preformulario->nombre} ha sido aprobado y publicado en el sistema.";
            Mail::raw($mensaje, function ($message) use ($usuario) {
                $message->to($usuario->email)
                        ->subject('Confirmación de publicación - SISTEMA TURISMO');
            });
        }

        return response()->json(['message' => 'Preformulario aprobado y publicado']);
    }

    /**
     * Rechazar un preformulario
     */
    public function reject($id, Request $request)
    {
        $preformulario = DB::selectOne(
            "SELECT * FROM preformularios WHERE idpreformulario = ?",
            [$id]
        );

        if (!$preformulario) {
            return response()->json(['error' => 'Preformulario no encontrado'], 404);
        }

        DB::update(
            "UPDATE preformularios SET estado = ? WHERE idpreformulario = ?",
            ['rechazado', $id]
        );

        $idAdmin = $request->input('admin_id');

        $usuario = DB::selectOne(
            "SELECT email FROM usuarios WHERE idusuario = ?",
            [$preformulario->idusuario]
        );

        if ($usuario && !empty($usuario->email)) {
            $mensaje = "Lamentamos informarle que su solicitud para publicar el sitio turístico en {$preformulario->nombre} ha sido rechazada por la administración.";
            Mail::raw($mensaje, function ($message) use ($usuario) {
                $message->to($usuario->email)
                        ->subject('Notificación de rechazo - SISTEMA TURISMO');
            });
        }

        return response()->json(['message' => 'Preformulario rechazado']);
    }
}