<?php

namespace App\Filament\Resources\WebhookResource\Pages;

use App\Filament\Resources\WebhookResource;
use Filament\Actions;
use Filament\Resources\Pages\ManageRecords;

class ManageWebhooks extends ManageRecords
{
    protected static string $resource = WebhookResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
