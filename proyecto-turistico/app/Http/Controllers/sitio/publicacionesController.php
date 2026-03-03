<?php

namespace App\Http\Controllers\Sitio;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PublicacionesController extends Controller
{
    /**
     * Listar todas las publicaciones del colaborador logueado
     */
public function index(Request $request): JsonResponse
{
    // El frontend debe enviar siempre el idusuario del colaborador
    $colaboradorId = $request->input('colaborador_id');

    if (!$colaboradorId) {
        return response()->json([
            'error' => 'Debe enviar el idusuario del colaborador logueado.'
        ], 400);
    }

    $publicaciones = DB::table('publicaciones')
        ->select(
            'idpublicacion',
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
        ->where('idusuario', $colaboradorId)
        ->orderBy('fecha', 'desc')
        ->get();

    if ($publicaciones->isEmpty()) {
        return response()->json([
            'error' => 'No se encontraron publicaciones para este colaborador'
        ], 404);
    }

    // Reforzar portadas con media si el campo imagen está vacío
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
     * Ver detalles completos de una publicación específica
     */
    public function show(Request $request, $idpublicacion)
    {
        $colaboradorId = $request->input('colaborador_id');

        if (!$colaboradorId) {
            return response()->json([
                'error' => 'Debe enviar el idusuario del colaborador logueado.'
            ], 400);
        }

        $publicacion = DB::table('publicaciones')
            ->where('idpublicacion', $idpublicacion)
            ->where('idusuario', $colaboradorId) // seguridad: solo ver publicaciones del colaborador
            ->first();

        if (!$publicacion) {
            return response()->json([
                'error' => 'No se encontró la publicación solicitada para este colaborador'
            ], 404);
        }

                $imagenes = DB::table('media')
            ->where('publicacion_id', $idpublicacion)
            ->get(); // devolvemos las imagenes 

                $lote = [
                'plana' => $imagenes->where('tipo', 'plana')->pluck('nombre')->values(),
                '360'   => $imagenes->where('tipo', '360')->pluck('nombre')->values(),
                'video' => $imagenes->where('tipo', 'video')->pluck('nombre')->values(),
                '3d'    => $imagenes->where('tipo', '3d')->pluck('nombre')->values(),
                'youtube' => $imagenes->whereNotNull('video_link')->pluck('video_link')->values(),
                ];

            $publicacion->imagenes = $lote; // agregamos las imagenes a la respuesta de la publicacion

        return response()->json($publicacion);
    }


public function update(Request $request, $idpublicacion = null): JsonResponse
{
    $idusuario = $request->input('idusuario');

    if (!$idusuario) {
        return response()->json([
            'error' => 'Debe enviar el idusuario del colaborador logueado.'
        ], 400);
    }

    // Turno 1: si no viene idpublicacion, devolvemos las publicaciones inactivas del usuario
    if (!$idpublicacion) {
        $publicaciones = DB::table('publicaciones')
            ->where('idusuario', $idusuario)
            ->where('estado', 'inactivo')
            ->get();

        if ($publicaciones->isEmpty()) {
            return response()->json([
                'error' => 'No se encontraron publicaciones inactivas para este usuario'
            ], 404);
        }

        return response()->json($publicaciones);
    }

    // Turno 2: si viene idpublicacion, intentamos actualizar
    $publicacion = DB::table('publicaciones')
        ->where('idpublicacion', $idpublicacion)
        ->where('idusuario', $idusuario)
        ->where('estado', 'inactivo')
        ->first();

    if (!$publicacion) {
        return response()->json([
            'error' => 'No se encontró publicación inactiva para este usuario'
        ], 404);
    }

    // Validar todos los campos editables
    $validated = $request->validate([
        'nombre'             => 'required|string|max:255',
        'departamento'       => 'required|string|max:100',
        'municipio'          => 'nullable|string|max:100',
        'distrito'           => 'nullable|string|max:100',
        'latitud'            => 'required|numeric',
        'longitud'           => 'required|numeric',
        'clasificacion'      => 'required|json',
        'politicas'          => 'nullable|json',
        'horarios'           => 'nullable|json',
        'costo_entrada'      => 'nullable|numeric|min:0',
        'imagen'             => 'nullable|string',
        'tarifas_desglosadas'=> 'nullable|json',
        'descripcion'        => 'nullable|string',
        'fecha'              => 'required|date',
        'personas'           => 'required|integer|min:1',
        'detalles'           => 'nullable|json',
    ]);

    // Guardar todos los campos como si fueran actualizados
    DB::table('publicaciones')
        ->where('idpublicacion', $idpublicacion)
        ->where('idusuario', $idusuario)
        ->update($validated);

    return response()->json([
        'message' => 'Publicación actualizada correctamente',
        'idpublicacion' => $idpublicacion
    ]);
}



public function destroy(Request $request, $idpublicacion)
    {
        $colaboradorId = $request->input('colaborador_id');

        if (!$colaboradorId) {
            return response()->json([
                'error' => 'Debe enviar el idusuario del colaborador logueado.'
            ], 400);
        }

        $publicacion = DB::table('publicaciones')
            ->where('idpublicacion', $idpublicacion)
            ->where('idusuario', $colaboradorId)
            ->where('estado', 'inactivo') // seguridad: solo eliminar publicaciones inactivas del colaborador
            ->first();

        if (!$publicacion) {
            return response()->json([
                'error' => 'No se encontró la publicación solicitada para este colaborador'
            ], 404);
        }

        // Eliminar imágenes asociadas
        $imagenes = DB::table('media')->where('publicacion_id', $idpublicacion)->get();
        foreach ($imagenes as $img) {
            \Storage::disk('public')->delete('publicaciones/' . $img->nombre);
        }
        DB::table('media')->where('publicacion_id', $idpublicacion)->delete();

        // Eliminar la publicación
        DB::table('publicaciones')->where('idpublicacion', $idpublicacion)->delete();

        return response()->json([
            'message' => 'Publicación eliminada correctamente',
            'idpublicacion' => $idpublicacion
        ]);
    }

}

