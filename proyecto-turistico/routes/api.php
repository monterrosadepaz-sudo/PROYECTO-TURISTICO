<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\admin\LoginController;
use App\Http\Controllers\admin\RecuperacionController;
use App\Http\Controllers\admin\UsuariosController;
use App\Http\Controllers\sitio\PreformularioController;
use App\Http\Controllers\admin\PreformularioAdminController;
use App\Http\Controllers\admin\PublicacionesAdminController;
use App\Http\Controllers\sitio\publicacionesController;
use App\Http\Controllers\sitio\MensajeColabController;
use App\Http\Controllers\admin\MensajesAdminController;
use App\Http\Controllers\sitio\PublicoController;
use App\Http\Controllers\sitio\EditarloteController;
use App\Http\Controllers\sitio\publicacionloteController;

//rutas para logueo
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout']);

//ruta del modo de recuperacion
Route::post('/recuperacion', [RecuperacionController::class, 'enviarCorreoRecuperacion']);
Route::get('/recuperacion/restablecer/{idusuario}', [RecuperacionController::class, 'restablecer']);
//crud de usuarios
Route::apiResource('/usuarios', UsuariosController::class);
Route::put('/usuarios/{idusuario}', [UsuariosController::class, 'update']);
Route::delete('/usuarios/{idusuario}', [UsuariosController::class, 'destroy']);

//preformularios del lado del colaborador
Route::post('/preformularios/listar', [PreformularioController::class, 'index']);
Route::post('/preformularios/crear', [PreformularioController::class, 'store']);
Route::get('/preformularios/detalles/{id}', [PreformularioController::class, 'show']);
Route::put('/preformularios/actualizar/{id}', [PreformularioController::class, 'update']);
//agregada de ultimo momento
//aca estaba el end point de actualizar lote antes de que decidiera moverlo a su propio controller
Route::delete('/preformularios/borrar/{id}', [PreformularioController::class, 'destroy']);

//preformularios del lado del admin
Route::get('/admin/preformularios', [PreformularioAdminController::class, 'index']);
Route::get('/admin/preformularios/{id}', [PreformularioAdminController::class, 'show']);
Route::get('/admin/preformularios/{id}/analizar', [PreformularioAdminController::class, 'analizar']);
Route::post('/admin/preformularios/{id}/approve', [PreformularioAdminController::class, 'approve']); 
Route::post('/admin/preformularios/{id}/reject', [PreformularioAdminController::class, 'reject']);
Route::delete('/admin/preformularios/{id}', [PreformularioAdminController::class, 'destroy']);

//ruta para listar y ver publicaciones del lado del colaborador
Route::get('/colaborador/publicaciones/listar', [publicacionesController::class, 'index']);
Route::post('/colaborador/publicaciones/detalles/{idpublicacion}', [publicacionesController::class, 'show']);
Route::post('/colaborador/publicaciones/actualizar/{idpublicacion}', [publicacionesController::class, 'update']);
//agregada de ultimo momento,es para editar fotos
//aca estaba el end point de actualizar lote antes de que decidiera moverlo a su propio controller
Route::delete('/colaborador/publicaciones/borrar/{idpublicacion}', [publicacionesController::class, 'destroy']);

//ruta para listar y ver publicaciones del lado del admin
Route::get('/admin/publicaciones', [PublicacionesAdminController::class, 'index']);
Route::get('/admin/publicaciones/inactivas', [PublicacionesAdminController::class, 'listarinactivos']);
//se decidio manejar el estado "pendiente" en el contexto de las publicaciones,vease funcion
Route::get('/admin/publicaciones/pendientes', [PublicacionesAdminController::class, 'listarpendientes']);
Route::get('/admin/publicaciones/{id}', [PublicacionesAdminController::class, 'show']);


//rutas pa que el admin active y desactive las publicaciones del colaborador
Route::post('/admin/publicaciones/activar/{id}', [PublicacionesAdminController::class, 'activar']);
Route::post('/admin/publicaciones/desactivar/{id}', [PublicacionesAdminController::class, 'desactivar']);


//end point para devolver id en caso de solicitud de editar publicacion
Route::post('/colaborador/solicitud/obtener', [MensajeColabController::class, 'obtenerDatosSolicitud']);

//end point para enviar solicitud de colaborador hacia admin
Route::post('/colaborador/solicitud/enviar', [MensajeColabController::class, 'enviarSolicitud']);

//end point para listar solicitudes del colab del lado del colab-------
Route::get('/colaborador/solicitudes/listar/{idcolaborador}', [MensajeColabController::class, 'listarSolicitudesColab']);

//end point para que el colab vea las respuesta del admin
Route::get('/colaborador/solicitudes/mensajes/{idcolaborador}', [MensajeColabController::class, 'verRespuesta']);

//end point para listar solicitudes pendientes del admin
Route::get('/admin/solicitudes/listar', [MensajesAdminController::class, 'index']);

//end point para ver detalle de una solicitud y marcarla como vista
Route::get('/admin/solicitudes/detalles/{idmensaje}', [MensajesAdminController::class, 'show']);

//end point para enviar respuesta del admin al colaborador
Route::post('/admin/solicitudes/responder', [MensajesAdminController::class, 'enviarRespuesta']);




//end point para ver publicacion del lado del sitio
Route::get('/publico/publicaciones/listar', [PublicoController::class, 'index']);
Route::get('/publico/publicaciones/detalles/{id}', [PublicoController::class, 'show']);


//nuevos end point para editar lotes de publicaciones

Route::get('/colaborador/publicaciones/lotes/{idpublicacion}', [PublicacionloteController::class, 'enlistar']);
Route::post('/colaborador/publicaciones/lotes/editar/{idpublicacion}', [PublicacionloteController::class, 'preparar']);
Route::post('/colaborador/preformularios/lotes/editar/{idpublicacion}', [PublicacionloteController::class, 'aplicar']);

//end point para guardar cambios cuando se edita un lote o datos planos o ambos 

Route::put('/colaborador/publicaciones/guardar/{idpublicacion}/{idusuario}', [PublicacionloteController::class, 'guardar']);



//este fue un end point que cree cuando recien empezaba a experimentar con end points, lo dejo por si acaso para probar la conexion entre el frontend y el backend, pero se puede eliminar sin problemas

Route::get('/ping', function () {
    return response()->json([
        'status' => 'OK',
        'message' => 'Conexión establecida correctamente'
    ]);
});