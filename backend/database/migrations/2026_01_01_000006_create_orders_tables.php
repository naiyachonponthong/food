<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('restaurant_id');
            $t->uuid('session_id');
            $t->string('order_number', 20);
            $t->integer('round_number')->default(1);
            $t->enum('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'])
                ->default('pending');
            $t->text('note')->nullable();
            $t->decimal('subtotal', 10, 2)->default(0.00);
            $t->decimal('discount', 10, 2)->default(0.00);
            $t->decimal('service_charge', 10, 2)->default(0.00);
            $t->decimal('vat_amount', 10, 2)->default(0.00);
            $t->decimal('total', 10, 2)->default(0.00);
            $t->uuid('served_by_id')->nullable();
            $t->timestamp('confirmed_at')->nullable();
            $t->timestamp('preparing_at')->nullable();
            $t->timestamp('ready_at')->nullable();
            $t->timestamp('served_at')->nullable();
            $t->timestamp('cancelled_at')->nullable();
            $t->string('cancel_reason')->nullable();
            $t->timestamps();
            $t->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $t->foreign('session_id')->references('id')->on('table_sessions')->cascadeOnDelete();
            $t->foreign('served_by_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('order_items', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('order_id');
            $t->uuid('menu_id');
            $t->string('name');
            $t->decimal('price', 10, 2);
            $t->decimal('cost', 10, 2)->nullable();
            $t->integer('quantity')->default(1);
            $t->text('note')->nullable();
            $t->boolean('is_refill')->default(false);
            $t->boolean('is_addon')->default(false);
            $t->enum('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'])
                ->default('pending');
            $t->decimal('subtotal', 10, 2);
            $t->timestamps();
            $t->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $t->foreign('menu_id')->references('id')->on('menus')->cascadeOnDelete();
        });

        Schema::create('order_item_options', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('order_item_id');
            $t->uuid('choice_id');
            $t->string('name');
            $t->decimal('price_addon', 10, 2)->default(0.00);
            $t->foreign('order_item_id')->references('id')->on('order_items')->cascadeOnDelete();
            $t->foreign('choice_id')->references('id')->on('menu_option_choices')->cascadeOnDelete();
        });

        Schema::create('payments', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('restaurant_id');
            $t->uuid('session_id')->unique();
            $t->string('receipt_number', 30)->unique();
            $t->enum('method', ['cash', 'qr_promptpay', 'credit_card', 'bank_transfer'])
                ->default('cash');
            $t->enum('status', ['unpaid', 'pending_verify', 'paid', 'refunded'])->default('unpaid');
            $t->decimal('subtotal', 10, 2);
            $t->decimal('package_charge', 10, 2)->default(0.00);
            $t->decimal('addon_charge', 10, 2)->default(0.00);
            $t->decimal('extension_charge', 10, 2)->default(0.00);
            $t->decimal('discount', 10, 2)->default(0.00);
            $t->decimal('service_charge', 10, 2)->default(0.00);
            $t->decimal('vat_amount', 10, 2)->default(0.00);
            $t->decimal('total', 10, 2);
            $t->decimal('amount_paid', 10, 2)->nullable();
            $t->decimal('change_amount', 10, 2)->nullable();
            $t->string('slip_url', 500)->nullable();
            $t->boolean('slip_verified')->default(false);
            $t->timestamp('verified_at')->nullable();
            $t->timestamp('paid_at')->nullable();
            $t->text('note')->nullable();
            $t->timestamps();
            $t->foreign('restaurant_id')->references('id')->on('restaurants')->cascadeOnDelete();
            $t->foreign('session_id')->references('id')->on('table_sessions')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_item_options');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
