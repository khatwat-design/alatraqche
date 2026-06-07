<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->warn('جاري إنشاء بيانات الاختبار...');

        $this->createCategories();
        $this->createProductsWithOptions();
        $this->createCoupons();
        $this->createBanners();
        $this->createOrders();

        $this->command?->info('✅ تم إنشاء جميع بيانات الاختبار بنجاح!');
    }

    private function createCategories(): void
    {
        $cats = [
            ['id' => 'carpets', 'name' => 'سجاد', 'description' => 'سجاد يدوي وآلي بأجود الخامات'],
            ['id' => 'furniture', 'name' => 'أثاث', 'description' => 'أثاث منزلي ومكتبي عصري'],
            ['id' => 'bedding', 'name' => 'مفروشات', 'description' => 'مفروشات وشراشف فاخرة'],
            ['id' => 'curtains', 'name' => 'ستائر', 'description' => 'ستائر راقية بأحدث التصاميم'],
            ['id' => 'mattresses', 'name' => 'مراتب', 'description' => 'مراتب طبية ومريحة'],
            ['id' => 'lighting', 'name' => 'إضاءة', 'description' => 'ثريات وإضاءة منزلية'],
            ['id' => 'decor', 'name' => 'ديكور', 'description' => 'قطع ديكور وتحف فنية'],
            ['id' => 'kitchen', 'name' => 'مطبخ', 'description' => 'أدوات وأثاث المطبخ'],
            ['id' => 'bath', 'name' => 'حمام', 'description' => 'مستلزمات الحمام'],
            ['id' => 'garden', 'name' => 'حديقة', 'description' => 'أثاث ومستلزمات الحديقة'],
            ['id' => 'electronics', 'name' => 'إلكترونيات', 'description' => 'أجهزة كهربائية وإلكترونية'],
            ['id' => 'gifts', 'name' => 'هدايا', 'description' => 'هدايا وتحف تذكارية'],
        ];

        foreach ($cats as $i => $c) {
            Category::query()->updateOrCreate(
                ['id' => $c['id']],
                [
                    'name' => $c['name'],
                    'description' => $c['description'],
                    'sort_order' => $i,
                ]
            );
        }

        $this->command?->info('✓ ١٢ تصنيف');
    }

    private function createProductsWithOptions(): void
    {
        if (Product::query()->exists()) {
            $this->command?->warn('  المنتجات موجودة مسبقاً، يتم تخطيها...');
            return;
        }

        // Create size option template
        $sizeOption = ProductOption::query()->create([
            'name' => 'المقاس',
            'slug' => 'size',
            'type' => 'select',
        ]);

        $sizeValues = [];
        foreach (['S', 'M', 'L', 'XL', 'XXL'] as $i => $s) {
            $sizeValues[] = ProductOptionValue::query()->create([
                'product_option_id' => $sizeOption->id,
                'value' => $s,
                'price_adjustment' => $i * 5000,
                'sort_order' => $i,
            ]);
        }

        // Create color option template
        $colorOption = ProductOption::query()->create([
            'name' => 'اللون',
            'slug' => 'color',
            'type' => 'select',
        ]);

        $colorValues = [];
        $colors = ['أحمر', 'أزرق', 'أخضر', 'أسود', 'أبيض', 'ذهبي', 'فضي', 'بيج'];
        foreach ($colors as $i => $c) {
            $colorValues[] = ProductOptionValue::query()->create([
                'product_option_id' => $colorOption->id,
                'value' => $c,
                'price_adjustment' => 0,
                'sort_order' => $i,
            ]);
        }

        $products = [
            // سجاد (6)
            ['carpets', 'سجادة صلاة فاخرة', 45000, 'جديد'],
            ['carpets', 'سجادة أرضية تركية', 185000, 'تخفيض'],
            ['carpets', 'سجادة غرفة نوم ناعمة', 120000, null],
            ['carpets', 'سجاد رسمي للمجالس', 320000, 'مميز'],
            ['carpets', 'سجادة ممرات حديثة', 85000, null],
            ['carpets', 'سجادة صوف طبيعي', 250000, 'جديد'],
            // أثاث (5)
            ['furniture', 'كنبة كلاسيكية ٣ مقاعد', 650000, null],
            ['furniture', 'طاولة طعام ٦ كراسي', 850000, 'تخفيض'],
            ['furniture', 'خزانة ملابس بعجل', 420000, null],
            ['furniture', 'سرير خشب متين', 380000, 'مميز'],
            ['furniture', 'رفوف مكتبية', 175000, null],
            // مفروشات (4)
            ['bedding', 'شرشف مزدوج قطن', 65000, 'جديد'],
            ['bedding', 'وسادة طبية', 35000, null],
            ['bedding', 'لحاف شتوي', 95000, 'تخفيض'],
            ['bedding', 'مخدة دانتيل فاخرة', 55000, null],
            // ستائر (3)
            ['curtains', 'ستارة قطيفة ثقيلة', 85000, null],
            ['curtains', 'ستارة شيفون مخمل', 110000, 'مميز'],
            ['curtains', 'برقع طاقة مطعم', 45000, null],
            // مراتب (3)
            ['mattresses', 'مرتبة طبية ١٨ سم', 280000, 'تخفيض'],
            ['mattresses', 'مرتبة سوفت توب ٢٥ سم', 420000, 'جديد'],
            ['mattresses', 'مرتبة إسفنج عادي ١٥ سم', 180000, null],
            // إضاءة (3)
            ['lighting', 'ثريا كريستال كلاسيك', 250000, 'مميز'],
            ['lighting', 'أباجورة طاولة أنيقة', 65000, null],
            ['lighting', 'لمبة حائط مودرن', 35000, 'جديد'],
            // ديكور (3)
            ['decor', 'مزهرية زجاج كبيرة', 45000, null],
            ['decor', 'لوحة جدارية مودرن', 95000, 'مميز'],
            ['decor', 'ساعة حائط خشب', 55000, null],
            // مطبخ (2)
            ['kitchen', 'طقم قدور ١٠ قطع', 120000, 'تخفيض'],
            ['kitchen', 'طقم صحون ٢٤ قطعة', 85000, null],
            // حمام (2)
            ['bath', 'منشفة فاخرة كبيرة', 25000, null],
            ['bath', 'حقيبة أدوات حمام', 35000, 'جديد'],
            // حديقة (2)
            ['garden', 'طاولة حديقة مع كرسيين', 175000, null],
            ['garden', 'مظلة حديقة ٣ م', 95000, 'تخفيض'],
            // إلكترونيات (2)
            ['electronics', 'مروحة سقف ديكور', 85000, null],
            ['electronics', 'سخان كهربائي', 45000, null],
            // هدايا (1)
            ['gifts', 'سلة هدايا منوعة', 65000, 'جديد'],
        ];

        foreach ($products as $i => [$catId, $name, $price, $badge]) {
            $slug = 'prod-' . str($name)->slug() . '-' . ($i + 1);
            $product = Product::query()->create([
                'id' => $slug,
                'category_id' => $catId,
                'name' => $name,
                'description' => "{$name} — منتج عالي الجودة من الأطرقجي. مناسب لجميع المنازل العراقية.",
                'price' => $price,
                'badge' => $badge,
                'image' => '/products/placeholder.svg',
                'stock_qty' => rand(10, 100),
                'is_visible' => true,
                'sort_order' => $i,
            ]);

            // Attach options to some products
            if ($catId === 'bedding' || $catId === 'carpets') {
                $product->options()->attach($sizeOption->id);
            }
            if ($catId === 'curtains' || $catId === 'decor' || $catId === 'lighting') {
                $product->options()->attach($colorOption->id);
            }
            if ($catId === 'bedding') {
                $product->options()->attach($colorOption->id);
            }
        }

        $this->command?->info('✓ ' . count($products) . ' منتج مع خيارات');
    }

    private function createCoupons(): void
    {
        if (Coupon::query()->exists()) {
            $this->command?->warn('  الكوبونات موجودة مسبقاً، يتم تخطيها...');
            return;
        }

        $coupons = [
            [
                'code' => 'WELCOME10',
                'type' => 'percentage',
                'value' => 10,
                'min_order_amount' => 50000,
                'max_discount' => 50000,
                'usage_limit' => 100,
                'starts_at' => Carbon::now()->subMonth(),
                'expires_at' => Carbon::now()->addMonths(3),
                'is_active' => true,
            ],
            [
                'code' => 'FIRST20',
                'type' => 'percentage',
                'value' => 20,
                'min_order_amount' => 100000,
                'max_discount' => 100000,
                'usage_limit' => 50,
                'starts_at' => Carbon::now()->subDays(5),
                'expires_at' => Carbon::now()->addMonths(2),
                'is_active' => true,
            ],
            [
                'code' => 'FLAT25000',
                'type' => 'fixed',
                'value' => 25000,
                'min_order_amount' => 100000,
                'max_discount' => null,
                'usage_limit' => 200,
                'starts_at' => Carbon::now()->subDays(10),
                'expires_at' => Carbon::now()->addMonths(6),
                'is_active' => true,
            ],
            [
                'code' => 'SALE50',
                'type' => 'percentage',
                'value' => 50,
                'min_order_amount' => 250000,
                'max_discount' => 150000,
                'usage_limit' => 20,
                'starts_at' => Carbon::now()->subDays(2),
                'expires_at' => Carbon::now()->addDays(28),
                'is_active' => true,
            ],
            [
                'code' => 'EXPIRED',
                'type' => 'fixed',
                'value' => 10000,
                'min_order_amount' => null,
                'max_discount' => null,
                'usage_limit' => 5,
                'starts_at' => Carbon::now()->subMonths(3),
                'expires_at' => Carbon::now()->subMonth(),
                'is_active' => true,
            ],
            [
                'code' => 'MAXEDOUT',
                'type' => 'percentage',
                'value' => 5,
                'min_order_amount' => null,
                'max_discount' => null,
                'usage_limit' => 3,
                'starts_at' => Carbon::now()->subMonth(),
                'expires_at' => Carbon::now()->addMonth(),
                'is_active' => true,
            ],
            [
                'code' => 'VIP100K',
                'type' => 'fixed',
                'value' => 100000,
                'min_order_amount' => 500000,
                'max_discount' => null,
                'usage_limit' => 10,
                'starts_at' => Carbon::now()->subDay(),
                'expires_at' => Carbon::now()->addMonths(1),
                'is_active' => true,
            ],
        ];

        $couponModels = [];
        foreach ($coupons as $c) {
            $couponModels[] = Coupon::query()->create($c);
        }

        // Manually set MAXEDOUT to have used_count = usage_limit
        Coupon::query()->where('code', 'MAXEDOUT')->update(['used_count' => 3]);

        $this->command?->info('✓ ' . count($coupons) . ' كوبون خصم');
    }

    private function createBanners(): void
    {
        if (Banner::query()->exists()) {
            $this->command?->warn('  البنرات موجودة مسبقاً، يتم تخطيها...');
            return;
        }

        $images = [
            'https://images.unsplash.com/photo-1600166898405-da9535204843?w=1200&h=400&fit=crop',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=400&fit=crop',
            'https://images.unsplash.com/photo-1522771739019-7c73f3f3121f?w=1200&h=400&fit=crop',
            'https://images.unsplash.com/photo-1606741965425-5e7cd18e4ca1?w=1200&h=400&fit=crop',
        ];

        $banners = [
            [
                'title' => 'تخفيضات كبرى على السجاد',
                'link_url' => '/products?category=carpets',
                'sort_order' => 0,
            ],
            [
                'title' => 'أثاث عصري بتصاميم جديدة',
                'link_url' => '/products?category=furniture',
                'sort_order' => 1,
            ],
            [
                'title' => 'المراتب الطبية — جودة ونوم هاني',
                'link_url' => '/products?category=mattresses',
                'sort_order' => 2,
            ],
            [
                'title' => 'استعد للصيف مع مستلزمات الحديقة',
                'link_url' => '/products?category=garden',
                'sort_order' => 3,
            ],
        ];

        foreach ($banners as $i => $b) {
            Banner::query()->create([
                'title' => $b['title'],
                'image' => $images[$i] ?? null,
                'link_url' => $b['link_url'],
                'sort_order' => $b['sort_order'],
                'is_active' => true,
            ]);
        }

        $this->command?->info('✓ ' . count($banners) . ' بنر');
    }

    private function createOrders(): void
    {
        // Create customers
        $customers = [
            ['name' => 'أحمد محمد', 'phone' => '07701234567'],
            ['name' => 'سارة علي', 'phone' => '07702345678'],
            ['name' => 'محمد حسين', 'phone' => '07703456789'],
            ['name' => 'زينب جاسم', 'phone' => '07704567890'],
            ['name' => 'علي رضا', 'phone' => '07705678901'],
            ['name' => 'فاطمة كاظم', 'phone' => '07706789012'],
            ['name' => 'حسن عباس', 'phone' => '07707890123'],
            ['name' => 'نور الهدى', 'phone' => '07708901234'],
            ['name' => 'مصطفى جواد', 'phone' => '07709012345'],
            ['name' => 'رقية مهدي', 'phone' => '07700123456'],
            ['name' => 'عباس نوري', 'phone' => '07701122334'],
            ['name' => 'كوثر هاشم', 'phone' => '07702233445'],
            ['name' => 'حيدر شاكر', 'phone' => '07703344556'],
            ['name' => 'زهراء حميد', 'phone' => '07704455667'],
            ['name' => 'أمير سعد', 'phone' => '07705566778'],
        ];

        $customerModels = [];
        foreach ($customers as $c) {
            $customerModels[] = Customer::query()->firstOrCreate(
                ['phone' => $c['phone']],
                ['name' => $c['name'], 'password' => bcrypt($c['phone'])]
            );
        }

        $this->command?->info('✓ ' . count($customers) . ' زبون');

        // Products for order items
        $allProducts = Product::all();

        // Coupons for applying to some orders
        $coupons = Coupon::where('is_active', true)->get()->keyBy('code');
        $activeCouponCodes = ['WELCOME10', 'FIRST20', 'FLAT25000', 'SALE50', 'VIP100K'];

        $statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        $cities = ['بغداد', 'البصرة', 'أربيل', 'الموصل', 'كركوك', 'النجف', 'كربلاء', 'السليمانية', 'دهوك', 'بابل'];

        $orders = 0;
        $couponUsage = []; // Track coupon usage to stop when limit is hit

        for ($i = 0; $i < 75; $i++) {
            $customer = $customerModels[array_rand($customerModels)];
            $numItems = rand(1, 4);
            $itemRecords = [];
            $subtotal = 0;
            $totalItems = 0;

            for ($j = 0; $j < $numItems; $j++) {
                $product = $allProducts->random();
                $qty = rand(1, 3);
                $price = $product->price;
                $itemSubtotal = $price * $qty;
                $itemRecords[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'subtotal' => $itemSubtotal,
                    'options' => null,
                ];
                $subtotal += $itemSubtotal;
                $totalItems += $qty;
            }

            $deliveryFee = rand(0, 25000);
            $discount = 0;
            $couponId = null;

            // Apply coupon to ~30% of orders
            if ($i % 3 === 0 && $subtotal >= 50000) {
                $availableCoupons = array_filter($activeCouponCodes, function ($code) use ($coupons, &$couponUsage) {
                    if (!isset($coupons[$code])) return false;
                    $coupon = $coupons[$code];
                    $used = $couponUsage[$code] ?? 0;
                    return $used < ($coupon->usage_limit ?? 999);
                });

                if (!empty($availableCoupons)) {
                    $code = $availableCoupons[array_rand($availableCoupons)];
                    $couponModel = $coupons[$code];
                    $discount = (int) $couponModel->calculateDiscount($subtotal);
                    $couponId = $couponModel->id;
                    $couponUsage[$code] = ($couponUsage[$code] ?? 0) + 1;
                }
            }

            // Distribute status: more towards delivered/shipped
            $statusWeight = rand(1, 100);
            $status = match (true) {
                $statusWeight <= 20 => 'pending',
                $statusWeight <= 30 => 'confirmed',
                $statusWeight <= 40 => 'processing',
                $statusWeight <= 60 => 'shipped',
                $statusWeight <= 85 => 'delivered',
                default => 'cancelled',
            };

            $total = $subtotal + $deliveryFee - $discount;

            $order = Order::query()->create([
                'invoice_id' => 'INV-' . strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 10)),
                'customer_id' => $customer->id,
                'status' => $status,
                'customer_name' => $customer->name,
                'customer_phone' => $customer->phone,
                'customer_city' => $cities[array_rand($cities)],
                'customer_address' => 'شارع ' . ['الجمهورية', 'الرشيد', 'فلسطين', 'السعدون', 'المنصور', 'الكرادة', 'الحرية', 'النضال', 'المتنبي', 'أبو نواس'][array_rand(range(0, 9))],
                'notes' => rand(0, 1) ? null : ['يرجى الاتصال قبل التوصيل', 'الباب الأيمن', 'ممنوع الدخول للسيارة', 'حي القادسية', 'بالقرب من المدرسة'][array_rand(range(0, 4))],
                'payment_method' => 'cod',
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'total' => max(0, $total),
                'discount' => $discount,
                'total_items' => $totalItems,
                'coupon_id' => $couponId,
                'channel' => rand(0, 3) === 0 ? 'whatsapp' : 'web',
                'created_at' => Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59)),
                'updated_at' => Carbon::now(),
            ]);

            foreach ($itemRecords as $item) {
                $item['order_id'] = $order->id;
                OrderItem::query()->create($item);
            }

            $orders++;

            // Update coupon used_count
            if ($couponId) {
                Coupon::query()->where('id', $couponId)->increment('used_count');
            }
        }

        $this->command?->info("✓ {$orders} طلب");
    }
}
