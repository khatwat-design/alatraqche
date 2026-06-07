<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\StoreSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class AlatraqjiDataSeeder extends Seeder
{
    public function run(): void
    {
        StoreSetting::current();

        $base = dirname(base_path()).DIRECTORY_SEPARATOR.'alatraqche'.DIRECTORY_SEPARATOR.'data';
        $catPath = $base.DIRECTORY_SEPARATOR.'categories.json';
        $prodPath = $base.DIRECTORY_SEPARATOR.'products.json';

        if (File::exists($catPath) && File::exists($prodPath)) {
            $this->importFromJson($catPath, $prodPath);
        } else {
            $this->seedDefaults();
        }
    }

    private function importFromJson(string $catPath, string $prodPath): void
    {
        $categories = json_decode(File::get($catPath), true);
        $products = json_decode(File::get($prodPath), true);

        if (! is_array($categories) || ! is_array($products)) {
            $this->seedDefaults();
            return;
        }

        $order = 0;
        foreach ($categories as $c) {
            Category::query()->updateOrCreate(
                ['id' => $c['id']],
                [
                    'name' => $c['name'],
                    'description' => $c['description'] ?? null,
                    'image' => $c['image'] ?? null,
                    'sort_order' => $order++,
                ]
            );
        }

        foreach ($products as $p) {
            $categoryId = $p['categoryId'] ?? 'bedding';
            $category = Category::query()->find($categoryId);
            if (! $category) {
                continue;
            }

            Product::query()->updateOrCreate(
                ['id' => $p['id']],
                [
                    'category_id' => $categoryId,
                    'name' => $p['name'],
                    'description' => $p['description'] ?? '',
                    'price' => (int) ($p['price'] ?? 0),
                    'badge' => $p['badge'] ?? null,
                    'image' => $p['image'] ?? '/products/pillow-1.jpg',
                    'stock_qty' => (int) ($p['stock_qty'] ?? $p['stock'] ?? 99),
                    'is_visible' => ($p['isVisible'] ?? true) !== false,
                    'sort_order' => 0,
                ]
            );
        }

        $this->command?->info('تم استيراد التصنيفات والمنتجات من مشروع alatraqche.');
    }

    private function seedDefaults(): void
    {
        if (Category::query()->exists()) {
            return;
        }

        $cats = [
            ['id' => 'carpets', 'name' => 'سجاد', 'sort_order' => 0],
            ['id' => 'furniture', 'name' => 'أثاث', 'sort_order' => 1],
            ['id' => 'bedding', 'name' => 'مفروشات', 'sort_order' => 2],
        ];

        foreach ($cats as $c) {
            Category::query()->updateOrCreate(
                ['id' => $c['id']],
                $c
            );
        }

        $this->command?->info('تم إنشاء تصنيفات افتراضية.');
    }
}
