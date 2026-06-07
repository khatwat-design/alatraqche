<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('store_name');
            $table->text('slogan_line1')->nullable();
            $table->text('slogan_line2')->nullable();
            $table->string('slogan_highlight_phrase')->nullable();
            $table->string('meta_title')->nullable();
            $table->string('header_background')->default('#000000');
            $table->string('footer_background')->default('#000000');
            $table->string('primary_color')->default('#d97706');
            $table->string('logo_path')->nullable();
            $table->text('address_line')->nullable();
            $table->decimal('map_lat', 10, 7)->nullable();
            $table->decimal('map_lng', 10, 7)->nullable();
            $table->text('map_embed_url')->nullable();
            $table->string('phone_primary')->nullable();
            $table->string('phone_secondary')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('tiktok_url')->nullable();
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('category_id');
            $table->string('name');
            $table->text('description');
            $table->unsignedBigInteger('price');
            $table->string('badge')->nullable();
            $table->string('image');
            $table->unsignedInteger('stock_qty')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
        });

        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('image');
            $table->string('link_url')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->index();
            $table->string('email')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_id')->unique();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('pending')->index();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_city')->nullable();
            $table->string('customer_address')->nullable();
            $table->string('floor_note')->nullable();
            $table->string('delivery_time_note')->nullable();
            $table->text('notes')->nullable();
            $table->string('payment_method')->nullable();
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('delivery_fee')->default(0);
            $table->unsignedBigInteger('total');
            $table->unsignedInteger('total_items');
            $table->string('channel')->default('web');
            $table->json('payload')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('product_id')->nullable();
            $table->string('name');
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('unit_price');
            $table->unsignedBigInteger('subtotal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('store_settings');
    }
};
