<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Buscar usuario por nombre
        $user = DB::table('usuarios')
            ->where('nombre', $request->username)
            ->first();

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $passwordValida = false;

        // Caso 1: contraseña hasheada
        if (Hash::check($request->password, $user->passwordd)) {
            $passwordValida = true;
        }

        // Caso 2: contraseña en texto plano (usuarios antiguos)
        if ($request->password === $user->passwordd) {
            $passwordValida = true;
            // Upgrade automático
            DB::table('usuarios')
                ->where('idusuario', $user->idusuario)
                ->update(['passwordd' => Hash::make($request->password)]);
        }

        if ($passwordValida) {
            Session::put('idusuario', $user->idusuario);
            Session::put('rol', $user->rol);

            return response()->json([
                'message' => 'Login exitoso',
                'idusuario' => $user->idusuario,
                'nombre' => $user->nombre,
                'email' => $user->email,
                'rol' => $user->rol,
                'fecharegistro' => $user->fecharegistro,
                'foto_perfil' => $user->foto_perfil // solo el nombre del archivo
            ]);
        }

        return response()->json(['error' => 'Credenciales inválidas'], 401);
    }

    public function logout()
    {
        Session::forget(['idusuario', 'rol']);
        return response()->json(['message' => 'Logout exitoso']);
    }
}

