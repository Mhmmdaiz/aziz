<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// 1. Cek Maintenance Mode
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// 2. Registrasi Autoloader (Mencari folder vendor di dalam folder backend)
require __DIR__.'/../vendor/autoload.php';

// 3. Bootstrap Laravel
$app = require_once __DIR__.'/../bootstrap/app.php';

// 4. Handle Request
$app->handleRequest(Request::capture());