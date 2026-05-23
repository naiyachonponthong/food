<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tables', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('restaurant_id');
            $t->integer('number');
            $t->string('name', 100);
            $t->integer('capacity')->default(4);
            $t->string('zone', 100)->nullable();
            $t->enum('qr_type', ['static', 'dynamic'])->default('static');
            $t->string('static_qr_code', 500)->nullable();
            $t->enum('status', ['available', 'occupied', 'reserved', 'closed'])->default('available');
            $t->boolean('is_active')->default(true);
            $t->timestamps();
            $t->unique(['restaurant_id', 'number']);
            $t->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
        });

        Schema::create('table_sessions', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('restaurant_id');
            $t->uuid('table_id');
            $t->uuid('token')->unique();
            $t->enum('status', ['active', 'closed', 'expired'])->default('active');
            $t->integer('guest_count')->default(1);
            // Buffet
            $t->uuid('package_id')->nullable();
            $t->integer('guest_adult')->default(0);
            $t->integer('guest_child')->default(0);
            $t->timestamp('started_at')->nullable();
            $t->timestamp('expires_at')->nullable();
            $t->timestamp('last_order_at')->nullable();
            $t->boolean('is_extended')->default(false);
            $t->integer('extension_count')->default(0);
            // Common
            $t->timestamp('opened_at')->useCurrent();
            $t->timestamp('closed_at')->nullable();
            $t->timestamps();
            $t->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $t->foreign('table_id')->references('id')->on('tables')->cascadeOnDelete();
            $t->foreign('package_id')->references('id')->on('packages')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('table_sessions');
        Schema::dropIfExists('tables');
    }
};
