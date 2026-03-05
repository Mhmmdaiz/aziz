<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('orders', function (Blueprint $table) {
        // Menambahkan kolom order_id sebagai string unik
        $table->string('order_id')->unique()->after('id');
    });
}

public function down(): void
{
    Schema::table('orders', function (Blueprint $table) {
        // Menghapus kolom jika migration di-rollback
        $table->dropColumn('order_id');
    });
}
};
