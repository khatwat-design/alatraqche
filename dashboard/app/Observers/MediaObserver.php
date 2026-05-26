<?php

namespace App\Observers;

use App\Models\Banner;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaObserver
{
    public function saved(Media $media): void
    {
        if ($media->model_type === Banner::class) {
            Banner::clearCache();
            Banner::notifyStoreChange('banners');
        }
    }

    public function deleted(Media $media): void
    {
        if ($media->model_type === Banner::class) {
            Banner::clearCache();
            Banner::notifyStoreChange('banners');
        }
    }
}
