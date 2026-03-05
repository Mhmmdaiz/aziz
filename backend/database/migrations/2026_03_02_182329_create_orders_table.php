<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->string('order_id')->unique(); // ID Unik (Contoh: TRX-12345)
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->decimal('amount', 15, 2); // Nominal asli dari server
        
        // Status awal harus PENDING. 
        // Jangan pernah percaya status 'PAID' dari input user.
        $table->enum('status', ['PENDING', 'PAID', 'FAILED', 'EXPIRED'])->default('PENDING');
        
        $table->string('snap_token')->nullable(); // Disimpan untuk redundansi/retry di frontend
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
