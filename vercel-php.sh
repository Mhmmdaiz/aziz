#!/bin/bash

# 1. Unduh composer.phar secara manual ke folder root
curl -sS https://getcomposer.org/installer | php

# 2. Pindah ke folder backend
cd backend

# 3. Jalankan instalasi menggunakan php ../composer.phar
php ../composer.phar install --no-dev --prefer-dist --optimize-autoloader