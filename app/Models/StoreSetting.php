<?php

namespace App\Models;

use App\Helpers\AssetHelper;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class StoreSetting extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'store_name',
        'slogan_line1',
        'slogan_line2',
        'slogan_highlight_phrase',
        'meta_title',
        'header_background',
        'footer_background',
        'primary_color',
        'address_line',
        'map_lat',
        'map_lng',
        'map_embed_url',
        'phone_primary',
        'phone_secondary',
        'instagram_url',
        'facebook_url',
        'tiktok_url',
        'meta_pixel_id',
        'tiktok_pixel_id',
        'google_analytics_id',
        'snapchat_pixel_id',
        'twitter_pixel_id',
        'custom_head_snippet',
    ];

    protected function casts(): array
    {
        return [
            'map_lat' => 'decimal:7',
            'map_lng' => 'decimal:7',
        ];
    }

    public function registerMediaCollections(?Media $media = null): void
    {
        $this->addMediaCollection('logo')
            ->singleFile()
            ->registerMediaConversions(function (Media $media) {
                $this->addMediaConversion('thumb')
                    ->width(200)
                    ->height(200);
            });
    }

    public function getLogoUrlAttribute(): ?string
    {
        $media = $this->getFirstMedia('logo');
        if ($media) {
            return $media->getUrl();
        }
        return AssetHelper::publicUrl($this->logo_path);
    }

    public static function current(): self
    {
        $row = static::query()->first();
        if ($row) {
            return $row;
        }

        return static::query()->create([
            'store_name' => 'الأطرقجي للسجاد والأثاث والمفروشات',
            'slogan_line1' => 'الأطرقجي',
            'slogan_line2' => 'مكان يحتاجه كل بيت، نوفر كل أنواع السجاد والمفروشات والأثاث',
            'slogan_highlight_phrase' => 'السجاد والمفروشات والأثاث',
            'header_background' => '#000000',
            'footer_background' => '#000000',
            'primary_color' => '#d97706',
            'address_line' => 'بغداد - شارع فلسطين - قرب مستشفى الكندي',
            'map_lat' => '33.3479000',
            'map_lng' => '44.4100000',
            'phone_primary' => '07729002266',
            'phone_secondary' => '07730141462',
            'instagram_url' => 'https://www.instagram.com/al_atraqchy1',
        ]);
    }
}
