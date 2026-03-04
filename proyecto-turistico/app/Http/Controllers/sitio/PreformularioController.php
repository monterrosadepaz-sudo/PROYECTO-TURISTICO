<?php

namespace App\Http\Controllers\sitio;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;

class PreformularioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $idusuario = $request->input('usuario');  

        $preformularios = DB::table('preformularios')
            ->where('idusuario', $idusuario)
            ->get();

        foreach ($preformularios as $p) {
            if (empty($p->imagen)) {
                $archivoPortada = DB::table('media')
                    ->where('preformulario_id', $p->idpreformulario)
                    ->orderBy('creado_en', 'asc')
                    ->first();

                $p->imagen = $archivoPortada ? $archivoPortada->nombre : null;
            }
        }

        return response()->json($preformularios);
    }

public function show($id): JsonResponse
{
    $preformulario = DB::table('preformularios')
        ->where('idpreformulario', $id)
        ->first();

    if (!$preformulario) {
        return response()->json(['error' => 'Preformulario no encontrado'], 404);
    }

    $archivos = DB::table('media')
        ->where('preformulario_id', $id)
        ->select('nombre','tipo','formato','video_link')
        ->get();

    $lotes = [
        'plana'   => $archivos->where('tipo', 'plana')->pluck('nombre')->values(),
        '360'     => $archivos->where('tipo', '360')->pluck('nombre')->values(),
        'video'   => $archivos->where('tipo', 'video')->pluck('nombre')->values(),
        '3d'      => $archivos->where('tipo', '3d')->pluck('nombre')->values(),
        'youtube' => $archivos->whereNotNull('video_link')->pluck('video_link')->values(),
    ];

    $preformulario->lote_imagenes = $lotes;

    return response()->json($preformulario);
}
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'usuario' => 'required|uuid',
        'nombre' => 'required|string|max:255',
        'departamento' => 'required|string|max:100',
        'municipio' => 'nullable|string|max:100',
        'distrito' => 'nullable|string|max:100',
        'latitud' => 'required|numeric',
        'longitud' => 'required|numeric',
        'clasificacion' => 'required|json',
        'politicas' => 'nullable|json',
        'horarios' => 'nullable|json',
        'costo_entrada' => 'nullable|numeric|min:0',
        'tarifas_desglosadas' => 'nullable|json',
        'descripcion' => 'nullable|string',
        'fecha' => 'required|date',
        'personas' => 'required|integer|min:1',
        'detalles' => 'nullable|json',
        'imagenes.*' => 'nullable|file|mimes:jpg,jpeg,png,ico,mp4,stl,h264,mpv|max:20,971,520',
        'video_link' => 'nullable|url'
    ]);

    $idPreformulario = Str::uuid();
    $portada = null;

    DB::table('preformularios')->insert([
        'idpreformulario' => $idPreformulario,
        'idusuario' => $validated['usuario'],
        'nombre' => $validated['nombre'],
        'departamento' => $validated['departamento'],
        'municipio' => $validated['municipio'] ?? null,
        'distrito' => $validated['distrito'] ?? null,
        'latitud' => $validated['latitud'],
        'longitud' => $validated['longitud'],
        'clasificacion' => $validated['clasificacion'],
        'politicas' => $validated['politicas'] ?? null,
        'horarios' => $validated['horarios'] ?? null,
        'costo_entrada' => $validated['costo_entrada'] ?? null,
        'tarifas_desglosadas' => $validated['tarifas_desglosadas'] ?? null,
        'descripcion' => $validated['descripcion'] ?? null,
        'fecha' => $validated['fecha'],
        'personas' => $validated['personas'],
        'detalles' => $validated['detalles'] ?? null,
        'estado' => 'pendiente',
        'imagen' => null
    ]);

    if ($request->hasFile('imagenes')) {
        $archivos = $request->file('imagenes');

        if (count($archivos) > 400) {
            return response()->json(['error' => 'Un payload no puede tener más de 400 archivos'], 400);
        }

        $pesoTotal = 0;
        foreach ($archivos as $archivo) {
            $pesoTotal += $archivo->getSize();
        }
        if ($pesoTotal > (400 * 1024 * 1024)) {
            return response()->json(['error' => 'El payload excede el límite de  20  GB'], 400);
        }

        foreach ($archivos as $index => $imagen) {
            $nombreArchivo = $imagen->getClientOriginalName();
            $extension = strtolower($imagen->getClientOriginalExtension());

            $pattern = '/^0000\d{8}preformulario-[A-Za-z0-9]{10}-\d+(-360)?\.(jpg|jpeg|png|ico|mp4|stl|h264|mpv)$/';
            if (!preg_match($pattern, $nombreArchivo)) {
                return response()->json(['error' => 'Nombre de archivo inválido'], 400);
            }

            $imagen->storeAs('preformularios', $nombreArchivo, 'public');

            if (str_contains($nombreArchivo, '-360')) {
                $tipo = '360';
            } else {
                $tipo = match ($extension) {
                    'jpg', 'jpeg', 'png', 'ico' => 'plana',
                    'mp4', 'h264', 'mpv'        => 'video',
                    'stl'                       => '3d',
                    default                     => 'plana',
                };
            }

            $peso = $imagen->getSize();

            DB::table('media')->insert([
                'lote_id'          => Str::uuid(),
                'preformulario_id' => $idPreformulario,
                'nombre'           => $nombreArchivo,
                'tipo'             => $tipo,
                'formato'          => $extension,
                'peso'             => $peso,
                'creado_en'        => now(),
                'video_link'       => null
            ]);

            if ($index === 0) {
                $portada = $nombreArchivo;
            }
        }

        DB::table('preformularios')
            ->where('idpreformulario', $idPreformulario)
            ->update(['imagen' => $portada]);
    }

    if ($request->filled('video_link')) {
        DB::table('media')->insert([
            'lote_id'          => Str::uuid(),
            'preformulario_id' => $idPreformulario,
            'nombre'           => 'YouTube Video',
            'tipo'             => '360',
            'formato'          => 'youtube',
            'peso'             => 0,
            'creado_en'        => now(),
            'video_link'       => $request->video_link
        ]);
    }

    return response()->json(['message' => 'Preformulario creado correctamente'], 201);
}

        public function update(Request $request, $id): JsonResponse
    {
        $idUsuario = $request->query('usuario');

        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'departamento' => 'sometimes|string|max:100',
            'municipio' => 'nullable|string|max:100',
            'latitud' => 'sometimes|numeric',
            'longitud' => 'sometimes|numeric',
            'clasificacion' => 'sometimes',
            'costo_entrada' => 'nullable|numeric|min:0',
            'descripcion' => 'nullable|string',
            'fecha' => 'sometimes|date',
        ]);

        $campos = [];
        $valores = [];

        foreach ($validated as $campo => $valor) {
            if ($campo === 'clasificacion' && !is_string($valor)) {
                $valor = json_encode($valor);
            }
            $campos[] = "$campo = ?";
            $valores[] = $valor;
        }

        $valores[] = $id;
        $valores[] = $idUsuario; 

        if (!empty($campos)) {
            DB::update(
                'UPDATE preformularios SET ' . implode(', ', $campos) . ' WHERE idpreformulario = ? AND idusuario = ?',
                $valores
            );
        }

        return response()->json(['message' => 'Preformulario actualizado correctamente']);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $idUsuario = $request->query('usuario'); 

        $imagenes = DB::table('media')->where('preformulario_id', $id)->get();
        foreach ($imagenes as $img) {
            if (!empty($img->nombre)) {
                Storage::disk('public')->delete('preformularios/' . $img->nombre);
            }
        }

        DB::table('media')->where('preformulario_id', $id)->delete();

        $borrado = DB::delete(
            'DELETE FROM preformularios WHERE idpreformulario = ? AND idusuario = ?',
            [$id, $idUsuario]
        );

        if ($borrado) {
            return response()->json(['message' => 'Preformulario eliminado']);
        }

        return response()->json(['message' => 'No se encontró el registro o no tienes permiso'], 404);
    }
}