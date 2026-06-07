<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->string('meta_pixel_id')->nullable()->after('tiktok_url');
            $table->string('tiktok_pixel_id')->nullable()->after('meta_pixel_id');
            $table->string('google_analytics_id')->nullable()->after('tiktok_pixel_id');
            $table->string('snapchat_pixel_id')->nullable()->after('google_analytics_id');
            $table->string('twitter_pixel_id')->nullable()->after('snapchat_pixel_id');
            $table->text('custom_head_snippet')->nullable()->after('twitter_pixel_id');
        });
    }

    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn([
                'meta_pixel_id',
                'tiktok_pixel_id',
                'google_analytics_id',
                'snapchat_pixel_id',
                'twitter_pixel_id',
                'custom_head_snippet',
            ]);
        });
    }
};
