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
        Schema::table('store_settings', function (Blueprint $table) {
            if (! Schema::hasColumn('store_settings', 'delivery_fee')) {
                $table->integer('delivery_fee')->default(0)->after('primary_color');
            }
            if (! Schema::hasColumn('store_settings', 'free_delivery_threshold')) {
                $table->integer('free_delivery_threshold')->nullable()->after('delivery_fee');
            }
        });
    }

    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn(['delivery_fee', 'free_delivery_threshold']);
        });
    }
};
