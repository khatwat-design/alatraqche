<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // All shopper columns are handled by Shopper's migration
        // 2019_05_03_000001_create_customer_columns.php
    }

    public function down(): void
    {
    }
};
