 <?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    // Se agregan las rutas de autenticación explícitamente
      'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'api/login',
        'storage/publicaciones/*',
        'storage/preformularios/*',
    ],


    'allowed_methods' => ['*'],

    // Usamos '*' temporalmente para que el navegador no bloquee el "saludo" OPTIONS
    'allowed_origins' => ['*'], 

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Vital para que tu fetch con credentials: 'include' funcione
    'supports_credentials' => true,
];