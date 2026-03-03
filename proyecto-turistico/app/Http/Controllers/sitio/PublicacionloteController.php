<?php


namespace App\Http\Controllers\sitio;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class PublicacionloteController extends Controller
{
    // 1. Enlistar archivos de un lote
// 1. Enlistar archivos y enlaces
public function enlistar($idpublicacion): JsonResponse
{
    $imagenes = DB::table('media')
        ->select('id', 'publicacion_id', 'nombre', 'peso', 'video_link') 
        ->where('publicacion_id', $idpublicacion)
        ->get();

    if ($imagenes->isEmpty()) {
        return response()->json([
            'error' => 'No se encontraron archivos para esta publicación'
        ], 404);
    }

    return response()->json($imagenes);
}

// 2. Preparar cambios
public function preparar(Request $request, $idpublicacion): JsonResponse
{
    $cambios = $request->input('cambios', []);
    $sustituir = [];

    foreach ($cambios as $cambio) {
        if ($cambio['accion'] === 'eliminar') {
            $query = DB::table('media')->where('publicacion_id', $idpublicacion);

            if (!empty($cambio['nombre'])) {
                $query->where('nombre', $cambio['nombre']);
            } elseif (!empty($cambio['video_link'])) {
                $query->where('video_link', $cambio['video_link']);
            }

            $query->delete();
        } elseif ($cambio['accion'] === 'sustituir') {
            $query = DB::table('media')->where('publicacion_id', $idpublicacion);

            if (!empty($cambio['nombre'])) {
                $query->where('nombre', $cambio['nombre']);
            } elseif (!empty($cambio['video_link'])) {
                $query->where('video_link', $cambio['video_link']);
            }

            $query->delete();
            $sustituir[] = $cambio['nombre'] ?? $cambio['video_link'];
        }
    }

    return response()->json([
        'message'   => 'Hecho. Estoy en escucha para los archivos que marcaste como sustitución',
        'esperando' => $sustituir
    ]);
}

    // 3. Aplicar cambios
public function aplicar(Request $request, $idpublicacion): JsonResponse
{
    $archivosNuevos = $request->file('archivos_nuevos', []);
    $esperados = $request->input('esperando', []);

    if (count($archivosNuevos) !== count($esperados)) {
        return response()->json(['error' => 'Número de archivos no coincide'], 400);
    }

    // Closure para clasificar archivos
    $clasificarArchivo = function(string $nombre, string $extension): string {
        if (str_contains($nombre, '-360')) {
            return '360';
        }
        return match ($extension) {
            'jpg', 'jpeg', 'png', 'ico' => 'plana',
            'mp4', 'h264', 'mpv'        => 'video',
            'stl'                       => '3d',
            default                     => 'plana',
        };
    };

    // Procesar archivos físicos
    foreach ($archivosNuevos as $archivo) {
        $nombre = $archivo->getClientOriginalName();
        $extension = strtolower($archivo->getClientOriginalExtension());

        $regex = '/^0000\d{8}publicacion-[A-Za-z0-9]{10}-\d+(-360)?\.(jpg|jpeg|png|ico|mp4|stl|h264|mpv)$/';
        if (!preg_match($regex, $nombre)) {
            return response()->json(['error' => 'Nombre de archivo inválido'], 400);
        }

        $archivo->storeAs("publicaciones", $nombre, 'public');

        DB::table('media')->insert([
            'lote_id'        => Str::uuid(),
            'publicacion_id' => $idpublicacion,
            'nombre'         => $nombre,
            'tipo'           => $clasificarArchivo($nombre, $extension),
            'formato'        => $extension,
            'peso'           => $archivo->getSize(),
            'creado_en'      => now(),
            'video_link'     => null, // no aplica para archivos físicos
        ]);
    }

    // Procesar enlace de YouTube si viene en el request
    if ($request->filled('video_link')) {
        DB::table('media')->insert([
            'lote_id'        => Str::uuid(),
            'publicacion_id' => $idpublicacion,
            'nombre'         => 'YouTube Video',
            'tipo'           => '360', // lo marcamos como 360 porque es proyección
            'formato'        => 'youtube',
            'peso'           => 0,
            'creado_en'      => now(),
            'video_link'     => $request->input('video_link'),
        ]);
    }

    $archivosFinales = DB::table('media')
        ->where('publicacion_id', $idpublicacion)
        ->select('nombre','video_link') // devolvemos también el link
        ->get();

    return response()->json([
        'message' => 'Cambios aplicados correctamente',
        'archivos' => $archivosFinales
    ]);
}

    public function guardar(Request $request, $idpublicacion, $idusuario): JsonResponse
    {
        DB::update(
            "UPDATE publicaciones SET estado = ? WHERE idpublicacion = ? AND idusuario = ?",
            ['pendiente', $idpublicacion, $idusuario]
        );
        // Aquí podrías implementar lógica adicional si es necesario
        return response()->json(['message' => 'Cambios guardados correctamente']);
    }
}