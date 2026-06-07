<?php

namespace App\Observers;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaObserver
{
    public function created(Media $media): void
    {
        //
    }

    public function updated(Media $media): void
    {
        //
    }

    public function deleted(Media $media): void
    {
        //
    }

    public function restored(Media $media): void
    {
        //
    }

    public function forceDeleted(Media $media): void
    {
        //
    }
}
