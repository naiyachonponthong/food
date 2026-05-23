<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('menu_categories', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('restaurant_id');
            $t->string('name');
            $t->string('name_en')->nullable();
            $t->string('icon', 50)->nullable();
            $t->string('image', 500)->nullable();
            $t->integer('sort_order')->default(0);
            $t->boolean('is_active')->default(true);
            $t->timestamps();
            $t->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
        });

        Schema::create('menus', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('restaurant_id');
            $t->uuid('category_id');
            $t->string('name');
            $t->string('name_en')->nullable();
            $t->text('description')->nullable();
            $t->string('image', 500)->nullable();
            $t->decimal('price', 10, 2);
            $t->decimal('cost', 10, 2)->nullable();
            $t->integer('calories')->nullable();
            $t->boolean('is_available')->default(true);
            $t->boolean('is_featured')->default(false);
            $t->boolean('is_package_item')->default(false);
            $t->boolean('is_addon')->default(false);
            $t->integer('sort_order')->default(0);
            $t->json('tags')->nullable();
            $t->timestamps();
            $t->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $t->foreign('category_id')->references('id')->on('menu_categories')->cascadeOnDelete();
        });

        Schema::create('menu_options', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('menu_id');
            $t->string('name');
            $t->boolean('is_required')->default(false);
            $t->integer('max_select')->default(1);
            $t->integer('sort_order')->default(0);
            $t->foreign('menu_id')->references('id')->on('menus')->cascadeOnDelete();
        });

        Schema::create('menu_option_choices', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('option_id');
            $t->string('name');
            $t->decimal('price_addon', 10, 2)->default(0.00);
            $t->boolean('is_default')->default(false);
            $t->foreign('option_id')->references('id')->on('menu_options')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_option_choices');
        Schema::dropIfExists('menu_options');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('menu_categories');
    }
};
