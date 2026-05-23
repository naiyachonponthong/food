<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('restaurant_id');
            $t->string('name');
            $t->text('description')->nullable();
            $t->decimal('price_adult', 10, 2);
            $t->decimal('price_child', 10, 2)->default(0.00);
            $t->integer('price_child_min_age')->nullable();
            $t->integer('price_child_max_age')->nullable();
            $t->integer('duration_minutes');
            $t->integer('last_order_before')->default(15);
            $t->decimal('extension_price', 10, 2)->default(0.00);
            $t->integer('extension_minutes')->default(30);
            $t->boolean('is_active')->default(true);
            $t->integer('sort_order')->default(0);
            $t->timestamps();
            $t->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
        });

        Schema::create('package_items', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('package_id');
            $t->uuid('menu_id');
            $t->foreign('package_id')->references('id')->on('packages')->cascadeOnDelete();
            $t->foreign('menu_id')->references('id')->on('menus')->cascadeOnDelete();
        });

        Schema::create('package_addons', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('package_id');
            $t->uuid('menu_id');
            $t->decimal('price', 10, 2);
            $t->foreign('package_id')->references('id')->on('packages')->cascadeOnDelete();
            $t->foreign('menu_id')->references('id')->on('menus')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_addons');
        Schema::dropIfExists('package_items');
        Schema::dropIfExists('packages');
    }
};
