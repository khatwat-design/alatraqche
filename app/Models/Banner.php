<?php

namespace App\Models;

use App\Helpers\AssetHelper;
use App\Traits\BroadcastsStoreChange;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Banner extends Model implements HasMedia
{
    /** @use HasFactory<\Database\Factories\BannerFactory> */
    use HasFactory, InteractsWithMedia, BroadcastsStoreChange;

    protected static function storeChangeType(): string { return 'banners'; }

    protected $fillable = [
        'title',
        'image',
        'link_url',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::saved(fn () => cache()->forget('storefront.banners'));
        static::deleted(fn () => cache()->forget('storefront.banners'));
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('default');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(400)
            ->height(200)
            ->nonQueued()
            ->keepOriginalImageFormat();
        $this->addMediaConversion('large')
            ->width(1920)
            ->height(800)
            ->nonQueued()
            ->keepOriginalImageFormat();
    }

    public static function clearCache(): void
    {
        cache()->forget('storefront.banners');
    }

    public function getImagePublicUrlAttribute(): string
    {
        $media = $this->getFirstMedia('default');
        if ($media) {
            return $media->getUrl();
        }
        if ($this->image) {
            return AssetHelper::publicUrl($this->image) ?? '';
        }
        return '';
    }
}
