<?php

namespace App\Http\Controllers\sitio;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class PublicoController extends Controller
{
    /**
     * Listar todas las publicaciones activas
     */
public function index(): JsonResponse
{
    $publicaciones = DB::table('publicaciones')
        ->select(
            'idpublicacion',
            'nombre',
            'departamento',
            'municipio',
            'distrito',
            'fecha',
            'imagen'
        )
        ->where('estado', 'activo')
        ->orderBy('fecha', 'desc')
        ->get();

    foreach ($publicaciones as $p) {
        // Si el campo imagen está vacío, reforzar con la primera imagen en media
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
     * Mostrar detalles de una publicación
     */
    public function show($id): JsonResponse
    {
        $publicacion = DB::table('publicaciones')
            ->select(
                'idpublicacion',
                'nombre',
                'departamento',
                'municipio',
                'distrito',
                'latitud',
                'longitud',
                'clasificacion',
                'politicas',
                'horarios',
                'costo_entrada',
                'tarifas_desglosadas',
                'descripcion',
                'fecha',
                'personas',
                'detalles',
                'imagen'
            )
            ->where('estado', 'activo')
            ->where('idpublicacion', $id)
            ->first();

        if (!$publicacion) {
            return response()->json(['error' => 'Publicación no encontrada o inactiva'], 404);
        }

        //recien me doy cuenta de que no estoy devolviendo todas las imagenes ,toca implementar este bloquesito

    $archivos = DB::table('media')
    ->where('publicacion_id', $id)
    ->get();

    $lotes = [
    'plana' => $archivos->where('tipo', 'plana')->pluck('nombre')->values(),
    '360'   => $archivos->where('tipo', '360')->pluck('nombre')->values(),
    'video' => $archivos->where('tipo', 'video')->pluck('nombre')->values(),
    '3d'    => $archivos->where('tipo', '3d')->pluck('nombre')->values(),
    'youtube' => $archivos->where('formato', 'youtube')->pluck('video_link')->values(),
    ];

        $publicacion->lote_imagenes = $lotes;

        return response()->json($publicacion);
    }
}