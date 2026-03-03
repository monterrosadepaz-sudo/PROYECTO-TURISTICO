<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class UsuariosController extends Controller
{
    // CREATE - Insertar usuario
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|unique:usuarios,nombre',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|string|min:4',
            'rol' => 'required|string',
            'foto_perfil' => 'nullable|file|mimes:jpg,jpeg,png,ico|max:10240',
            'numero' => 'nullable|string|max:20' // nuevo campo
        ]);

        $idUsuario = Str::uuid();
        $rutaFoto = null;

        if ($request->hasFile('foto_perfil')) {
            $archivo = $request->file('foto_perfil');
            $nombreArchivo = $archivo->getClientOriginalName();

            // Regex para validar convención de nombres
            $pattern = '/^0000[0-9a-f\-]{36}perfil-[A-Za-z0-9]{10}\.(jpg|jpeg|png|ico)$/';
            if (!preg_match($pattern, $nombreArchivo)) {
                return response()->json(['error' => 'Nombre de archivo inválido'], 400);
            }

            // Guardar en carpeta usuarios/
            $rutaFoto = $archivo->storeAs('usuarios', $nombreArchivo, 'public');
        } else {
            $rutaFoto = 'usuarios/perfil.png';
        }

        $usuario = [
            'idusuario' => $idUsuario,
            'nombre' => $request->nombre,
            'email' => $request->email,
            'passwordd' => Hash::make($request->password),
            'rol' => $request->rol,
            'fecharegistro' => now(),
            'foto_perfil' => basename($rutaFoto),
            'numero' => $request->numero // nuevo campo
        ];

        DB::table('usuarios')->insert($usuario);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'usuario' => collect($usuario)->except('passwordd')
        ]);
    }

    // READ - Listar todos los usuarios
    public function index()
    {
        $usuarios = DB::table('usuarios')
            ->select('idusuario','nombre','email','rol','fecharegistro','foto_perfil','numero');

        return response()->json($usuarios->get());
    }

    // READ - Mostrar un usuario por ID
    public function show($id)
    {
        $usuario = DB::table('usuarios')
            ->select('idusuario','nombre','email','rol','fecharegistro','foto_perfil','numero')
            ->where('idusuario', $id)
            ->first();

        if (!$usuario) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        return response()->json($usuario);
    }

    // UPDATE - Actualizar usuario
    public function update(Request $request, $idusuario)
    {
        $usuario = DB::table('usuarios')->where('idusuario', $idusuario)->first();
        if (!$usuario) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $request->validate([
            'nombre' => 'sometimes|string|unique:usuarios,nombre,' . $idusuario . ',idusuario',
            'email' => 'sometimes|email|unique:usuarios,email,' . $idusuario . ',idusuario',
            'rol' => 'sometimes|string',
            'password' => 'sometimes|string|min:4',
            'foto_perfil' => 'nullable|file|mimes:jpg,jpeg,png,ico|max:2048',
            'numero' => 'nullable|string|max:20' // nuevo campo
        ]);

        $data = [];
        if ($request->has('nombre')) $data['nombre'] = $request->nombre;
        if ($request->has('email')) $data['email'] = $request->email;
        if ($request->has('rol')) $data['rol'] = $request->rol;
        if ($request->has('password')) $data['passwordd'] = Hash::make($request->password);
        if ($request->has('numero')) $data['numero'] = $request->numero;

        if ($request->hasFile('foto_perfil')) {
            // Eliminar foto anterior si no es la genérica
            if ($usuario->foto_perfil && $usuario->foto_perfil !== 'perfil.png') {
                Storage::disk('public')->delete('usuarios/' . $usuario->foto_perfil);
            }

            $archivo = $request->file('foto_perfil');
            $nombreArchivo = $archivo->getClientOriginalName();

            // Regex para validar convención de nombres
            $pattern = '/^0000[0-9a-f\-]{36}perfil-[A-Za-z0-9]{10}\.(jpg|jpeg|png|ico)$/';
            if (!preg_match($pattern, $nombreArchivo)) {
                return response()->json(['error' => 'Nombre de archivo inválido'], 400);
            }

            // Guardar archivo
            $archivo->storeAs('usuarios', $nombreArchivo, 'public');
            $data['foto_perfil'] = $nombreArchivo;
        } elseif ($usuario->foto_perfil === null) {
            $data['foto_perfil'] = 'perfil.png';
        }

        DB::table('usuarios')->where('idusuario', $idusuario)->update($data);

        return response()->json([
            'message' => 'Usuario actualizado exitosamente',
            'usuario' => DB::table('usuarios')->where('idusuario', $idusuario)->first()
        ]);
    }

    // DELETE - Eliminar usuario
    public function destroy($idusuario)
    {
        $usuario = DB::table('usuarios')->where('idusuario', $idusuario)->first();
        if (!$usuario) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        if($usuario->rol === 'Administrador'){
            return response()->json(['error' => 'No se puede eliminar un usuario administrador'], 403);
        }

        if ($usuario->foto_perfil && $usuario->foto_perfil !== 'perfil.png') {
            Storage::disk('public')->delete('usuarios/' . $usuario->foto_perfil);
        }

        DB::table('usuarios')->where('idusuario', $idusuario)->delete();

        return response()->json(['message' => 'Usuario eliminado exitosamente']);
    }
}