<?php

namespace App\Http\Controllers\admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class PublicacionesAdminController extends Controller
{
    /**
     * Listar todas las publicaciones activas
     * Caso 1: Publicación activa y sin cambios
     */
public function index()
{
    $publicaciones = DB::table('publicaciones')
        ->select(
            'idpublicacion',
            'idusuario',
            'nombre',
            'departamento',
            'municipio',
            'distrito',
            'estado',
            'fecha',
            'aprobado_por',
            'fecha_aprobacion',
            'imagen'
        )
        ->where('estado', 'activo')
        ->orderBy('fecha', 'desc')
        ->get();

    foreach ($publicaciones as $p) {
        if (empty($p->imagen)) {
            $archivoPortada = DB::table('media')
                ->where('publicacion_id', $p->idpublicacion)
                ->orderBy('creado_en', 'asc')
                ->first();

            $p->imagen = $archivoPortada ? $archivoPortada->nombre : null;
        }
    }

    return response()->json($publicaciones);
}

public function listarinactivos()
{
    $publicaciones = DB::table('publicaciones')
        ->select(
            'idpublicacion',
            'idusuario',
            'nombre',
            'departamento',
            'municipio',
            'distrito',
            'estado',
            'fecha',
            'aprobado_por',
            'fecha_aprobacion',
            'imagen'
        )
        ->where('estado', 'inactivo')
        ->orderBy('fecha', 'desc')
        ->get();

    foreach ($publicaciones as $p) {
        if (empty($p->imagen)) {
            $archivoPortada = DB::table('media')
                ->where('publicacion_id', $p->idpublicacion)
                ->orderBy('creado_en', 'asc')
                ->first();

            $p->imagen = $archivoPortada ? $archivoPortada->nombre : null;
        }
    }

    return response()->json($publicaciones);
}

public function listarpendientes()
{
    $publicaciones = DB::table('publicaciones')
        ->select(
            'idpublicacion',
            'idusuario',
            'nombre',
            'departamento',
            'municipio',
            'distrito',
            'estado',
            'fecha',
            'aprobado_por',
            'fecha_aprobacion',
            'imagen'
        )
        ->where('estado', 'pendiente')
        ->orderBy('fecha', 'desc')
        ->get();

    foreach ($publicaciones as $p) {
        if (empty($p->imagen)) {
            $archivoPortada = DB::table('media')
                ->where('publicacion_id', $p->idpublicacion)
                ->orderBy('creado_en', 'asc')
                ->first();

            $p->imagen = $archivoPortada ? $archivoPortada->nombre : null;
        }
    }

    return response()->json($publicaciones);
}

    /**
     * Ver detalles de una publicación específica
     */
    public function show($id)
    {
        $publicacion = DB::table('publicaciones')
            ->where('idpublicacion', $id)
            ->first();

        if (!$publicacion) {
            return response()->json(['error' => 'Publicación no encontrada'], 404);
        }

            $imagenes = DB::table('media')
            ->where('publicacion_id', $id)
            ->get(); // devolvemos las imagenes 

            $lote = [
                'plana' => $imagenes->where('tipo', 'plana')->pluck('nombre')->values(),
                '360'   => $imagenes->where('tipo', '360')->pluck('nombre')->values(),
                'video' => $imagenes->where('tipo', 'video')->pluck('nombre')->values(),
                '3d'    => $imagenes->where('tipo', '3d')->pluck('nombre')->values(),
                'youtube' => $imagenes->whereNotNull('video_link')->pluck('video_link')->values(),
                 ];


            $publicacion->lote_imagenes = $lote; // agregamos las imagenes a la respuesta de la publicacion

        // Obtener datos del colaborador
        $usuario = DB::selectOne(
            "SELECT nombre, email FROM usuarios WHERE idusuario = ?",
            [$publicacion->idusuario]
        );

        // Adjuntar datos del colaborador
        $publicacion->colaborador_id = $publicacion->idusuario;
        $publicacion->colaborador_nombre = $usuario ? $usuario->nombre : null;
        $publicacion->colaborador_email = $usuario ? $usuario->email : null;

        return response()->json($publicacion);
    }

    /**
     * Desactivar una publicación
     * Caso 2: Publicación necesita cambios (detectados por el admin)
     * Devuelve el correo del colaborador para que el admin lo contacte manualmente
     */
    public function desactivar($id, Request $request)
    {
        $publicacion = DB::selectOne(
            "SELECT * FROM publicaciones WHERE idpublicacion = ?",
            [$id]
        );

        if (!$publicacion) {
            return response()->json(['error' => 'Publicación no encontrada'], 404);
        }

        DB::update(
            "UPDATE publicaciones SET estado = ? WHERE idpublicacion = ?",
            ['inactivo', $id]
        );

        $usuario = DB::selectOne(
            "SELECT email FROM usuarios WHERE idusuario = ?",
            [$publicacion->idusuario]
        );

        return response()->json([
            'message' => 'Publicación desactivada',
            'idpublicacion' => $id,
            'colaborador_id' => $publicacion->idusuario,
            'colaborador_email' => $usuario ? $usuario->email : null
        ]);
    }

    /**
     * Activar una publicación
     * Caso 3: El colaborador ya efectuó cambios y el admin la reactiva
     */
    public function activar($id, Request $request)
    {
        $publicacion = DB::selectOne(
            "SELECT * FROM publicaciones WHERE idpublicacion = ?",
            [$id]
        );

        if (!$publicacion) {
            return response()->json(['error' => 'Publicación no encontrada'], 404);
        }

        DB::update(
            "UPDATE publicaciones SET estado = ? WHERE idpublicacion = ?",
            ['activo', $id]
        );

        return response()->json([
            'message' => 'Publicación activada nuevamente',
            'idpublicacion' => $id,
            'colaborador_id' => $publicacion->idusuario
        ]);
    }
}