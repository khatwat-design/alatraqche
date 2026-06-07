<?php

namespace App\Providers;

use App\Observers\MediaObserver;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
use Illuminate\Support\ServiceProvider;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Carbon::setLocale(config('app.locale', 'ar'));

        JsonResource::withoutWrapping();

        Media::observe(MediaObserver::class);
    }
}
