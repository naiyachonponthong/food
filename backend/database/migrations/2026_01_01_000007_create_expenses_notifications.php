<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expense_categories', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('restaurant_id');
            $t->string('name', 100);
            $t->string('icon', 50)->nullable();
            $t->integer('sort_order')->default(0);
            $t->timestamps();
            $t->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
        });

        Schema::create('expenses', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('restaurant_id');
            $t->uuid('category_id');
            $t->decimal('amount', 10, 2);
            $t->text('note')->nullable();
            $t->date('expense_date');
            $t->uuid('created_by_id')->nullable();
            $t->timestamps();
            $t->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $t->foreign('category_id')->references('id')->on('expense_categories')->cascadeOnDelete();
            $t->foreign('created_by_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('notifications', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('restaurant_id');
            $t->string('type', 50);
            $t->string('title');
            $t->text('body')->nullable();
            $t->json('data')->nullable();
            $t->boolean('is_read')->default(false);
            $t->timestamps();
            $t->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('expense_categories');
    }
};
