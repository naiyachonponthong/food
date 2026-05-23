<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('name');
            $t->string('slug', 100)->unique();
            $t->string('logo', 500)->nullable();
            $t->string('cover_image', 500)->nullable();
            $t->text('address')->nullable();
            $t->string('phone', 20)->nullable();
            $t->string('tax_id', 20)->nullable();
            $t->boolean('has_vat')->default(false);
            $t->decimal('vat_rate', 5, 2)->default(7.00);
            $t->string('currency', 10)->default('THB');
            $t->string('timezone', 50)->default('Asia/Bangkok');
            $t->timestamps();
        });

        Schema::create('restaurant_settings', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('restaurant_id')->unique();
            $t->enum('mode', ['normal', 'buffet'])->default('normal');
            $t->boolean('auto_confirm_order')->default(false);
            $t->boolean('kitchen_print_auto')->default(true);
            $t->boolean('slip_verify_enabled')->default(false);
            $t->string('promptpay_number', 20)->nullable();
            $t->decimal('service_charge', 5, 2)->default(0.00);
            $t->string('theme_color', 7)->default('#3B82F6');
            $t->json('featured_menu_ids')->nullable();
            $t->boolean('allow_call_staff')->default(true);
            $t->json('call_staff_options')->nullable();
            $t->boolean('allow_self_checkout')->default(true);
            $t->timestamps();
            $t->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_settings');
        Schema::dropIfExists('restaurants');
    }
};
