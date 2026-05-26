<?php

namespace App\Models;

use App\Helpers\AssetHelper;
use App\Traits\BroadcastsStoreChange;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Product extends Model implements HasMedia
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory, InteractsWithMedia, Searchable, BroadcastsStoreChange;

    protected static function storeChangeType(): string { return 'products'; }

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'category_id',
        'name',
        'description',
        'price',
        'badge',
        'stock_qty',
        'is_visible',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'stock_qty' => 'integer',
            'is_visible' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id');
    }

    public function options(): BelongsToMany
    {
        return $this->belongsToMany(ProductOption::class, 'product_option_product');
    }

    public function mailableName(): string
    {
        return $this->name;
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'category_name' => $this->category?->name ?? '',
        ];
    }

    public function registerMediaCollections(?Media $media = null): void
    {
        $this->addMediaCollection('default')
            ->singleFile()
            ->registerMediaConversions(function (Media $media) {
                $this->addMediaConversion('thumb')
                    ->width(300)
                    ->height(300);
                $this->addMediaConversion('large')
                    ->width(1200)
                    ->height(1200);
            });
    }

    public function getImagePublicUrlAttribute(): string
    {
        $media = $this->getFirstMedia('default');
        if ($media) {
            return $media->getUrl('large');
        }
        return AssetHelper::publicUrl($this->image) ?? '';
    }

    public function toStorefrontArray(): array
    {
        $img = $this->image_public_url;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'badge' => $this->badge,
            'category' => $this->category?->name ?? '',
            'categoryId' => $this->category_id,
            'image' => $img,
            'isVisible' => $this->is_visible,
            'options' => $this->options()->with('values')->get()->map(fn ($o) => [
                'id' => $o->id,
                'name' => $o->name,
                'slug' => $o->slug,
                'type' => $o->type,
                'values' => $o->values->sortBy('sort_order')->values()->map(fn ($v) => [
                    'id' => $v->id,
                    'value' => $v->value,
                    'priceAdjustment' => (float) $v->price_adjustment,
                ]),
            ]),
        ];
    }
}
