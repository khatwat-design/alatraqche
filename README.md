# الأطرقجي — متجر السجاد والمفروشات

منصة متكاملة لإدارة متجر الأطرقجي للسجاد والمفروشات، تشمل:
- **API (Laravel):** إدارة المنتجات، الطلبات، العملاء، الكوبونات، البنرات
- **Dashboard (Next.js):** لوحة تحكم ذهبية/سوداء لإدارة المتجر
- **Storefront (Next.js):** واجهة المتجر للعملاء

---

## المتطلبات

- PHP 8.2+
- Node.js 20+
- Composer
- SQLite (افتراضي) أو MySQL

---

## التشغيل السريع

### 1. API (Laravel)

```bash
cd alatraqche-dashboard
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve --port=8000
```

### 2. Dashboard (لوحة التحكم)

```bash
cd dashboard
cp .env.example .env.local  # ثم تأكد من `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
npm install
npm run dev
```

يفتح على `http://localhost:3000`

### 3. Storefront (المتجر)

```bash
cd storefront
cp .env.example .env.local  # ثم تأكد من `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
npm install
npm run dev
```

يفتح على `http://localhost:3001`

---

## بيانات الدخول الافتراضية

### لوحة التحكم (Admin)
| البريد الإلكتروني | كلمة المرور |
|---|---|
| `admin@alatraqji.local` | `password` |
| `test@alatraqche.local` | `test-test-123` |

### متجر (زبون تجريبي)
| الهاتف | كلمة المرور |
|---|---|
| `07700123456` | `07700123456` |

> جميع بيانات الاختبار تُنشأ بواسطة `php artisan db:seed`

---

## بنية المشروع

```
alatraqche-dashboard/
├── app/                    # Laravel (API, Models, Controllers)
│   ├── Http/
│   │   ├── Controllers/Api/   # API controllers
│   │   │   ├── AdminController.php         # إحصائيات + إعدادات
│   │   │   ├── AdminAuthController.php     # تسجيل دخول المدير
│   │   │   ├── AdminOrderController.php    # إدارة الطلبات
│   │   │   ├── AdminCustomerController.php # إدارة العملاء
│   │   │   ├── AdminProductController.php  # إدارة المنتجات
│   │   │   ├── CustomerAuthController.php  # تسجيل دخول الزبائن
│   │   │   └── ...
│   │   └── Middleware/
│   │       └── EnsureUserIsAdmin.php       # التحقق من صلاحية المدير
│   ├── Models/              # Eloquent Models
│   └── ...
├── dashboard/               # Next.js Dashboard
│   └── src/
│       ├── app/
│       │   ├── (dashboard)/ # الصفحات المحمية (لوحة التحكم)
│       │   └── login/      # صفحة تسجيل الدخول
│       └── components/
│           └── layout/     # Sidebar + Header
├── storefront/             # Next.js Storefront
│   └── app/
│       ├── products/       # صفحة المنتجات
│       ├── cart/           # سلة التسوق
│       ├── orders/         # الطلبات
│       └── auth/           # تسجيل الدخول للزبائن
├── routes/
│   └── api.php             # جميع مسارات API
├── database/
│   └── seeders/
│       ├── AdminUserSeeder.php     # حساب المدير
│       ├── TestDataSeeder.php      # بيانات اختبار شاملة
│       └── AlatraqjiDataSeeder.php # بيانات المتجر الأساسية
└── config/
    └── cors.php            # إعدادات CORS
```

---

## مسارات API

### المتجر (عامة)
| Method | Path | الوصف |
|--------|------|-------|
| GET | `/api/v1/store` | إعدادات المتجر |
| GET | `/api/v1/categories` | التصنيفات |
| GET | `/api/v1/products` | المنتجات (مع فلترة) |
| GET | `/api/v1/products/{id}` | تفاصيل منتج |
| GET | `/api/v1/banners` | البنرات |
| GET | `/api/v1/coupons/validate/{code}` | التحقق من كوبون |

### الطلبات (عامة)
| Method | Path | الوصف |
|--------|------|-------|
| POST | `/api/v1/orders` | إنشاء طلب جديد |
| GET | `/api/v1/my/orders` | طلبات الزبون (محمي) |
| GET | `/api/v1/my/orders/{invoiceId}` | تفاصيل طلب الزبون (محمي) |

### الزبائن (Auth)
| Method | Path | الوصف |
|--------|------|-------|
| POST | `/api/v1/auth/register` | تسجيل زبون جديد |
| POST | `/api/v1/auth/login` | تسجيل دخول زبون |
| GET | `/api/v1/auth/me` | بيانات الزبون (محمي) |

### لوحة التحكم (Admin — جميعها محمية)
| Method | Path | الوصف |
|--------|------|-------|
| POST | `/api/v1/admin/auth/login` | تسجيل دخول المدير |
| GET | `/api/v1/admin/auth/me` | بيانات المدير |
| GET | `/api/v1/admin/dashboard` | إحصائيات لوحة التحكم |
| GET | `/api/v1/admin/analytics` | تحليلات المتجر |
| GET | `/api/v1/orders` | قائمة الطلبات |
| GET | `/api/v1/orders/{id}` | تفاصيل طلب |
| PUT | `/api/v1/orders/{id}` | تحديث حالة طلب |
| GET | `/api/v1/customers` | قائمة العملاء |
| GET | `/api/v1/customers/{id}` | تفاصيل عميل |
| GET | `/api/v1/admin/products` | قائمة المنتجات (إدارة) |
| POST | `/api/v1/products` | إنشاء منتج |
| PUT | `/api/v1/products/{id}` | تحديث منتج |
| DELETE | `/api/v1/products/{id}` | حذف منتج |
| PUT | `/api/v1/store` | تحديث إعدادات المتجر |
| PUT | `/api/v1/auth/profile` | تحديث ملف المدير |

---

## بيلد المشروع

```bash
# API (لا يحتاج build)
php artisan optimize

# Dashboard
cd dashboard
npm run build

# Storefront
cd storefront
npm run build
```

---

## بيانات الاختبار

`php artisan db:seed` ينشئ:

- **13 تصنيف** (سجاد، أثاث، مفروشات، ستائر، الخ)
- **46 منتج** بأسعار متفاوتة
- **7 كوبونات خصم** (WELCOME10, SUM10, EXPIRED, MAXEDOUT, الخ)
- **15 زبون** مع طلبات
- **77 طلب** بحالات مختلفة (pending → delivered → cancelled)
- **4 بنرات إعلانية**

---

## التطوير

```bash
# تشغيل الخوادم الثلاثة معاً:
php artisan serve --port=8000 &     # API
npm run dev --prefix dashboard &    # لوحة التحكم (:3000)
npm run dev --prefix storefront &   # المتجر (:3001)
```

---
