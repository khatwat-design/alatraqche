# الأطرقجي للسجاد والأثاث والمفروشات — متجر إلكتروني

نسخة مبنية على قالب [Kasko](https://github.com/khatwat-design/kasko) لمتجر **الأطرقجي للسجاد والأثاث والمفروشات**. لا توجد لوحة إدارة؛ الإدارة عبر `data/products.json` وربط تلجرام وGoogle Sheets والبكسلات.

## التشغيل

```bash
npm install
npm run dev
```

يفتح الموقع على `http://localhost:3000`.

## الإعدادات (البيئة)

1. انسخ `ENV_EXAMPLE.txt` إلى `.env.local`.
2. عدّل المتغيرات:
   - **TELEGRAM_BOT_TOKEN** و **TELEGRAM_CHANNEL_ID**: لإرسال الطلبات إلى قناة/مجموعة تلجرام.
   - **GOOGLE_APPS_SCRIPT_URL**: رابط Web App من Google Apps Script لحفظ الطلبات في Google Sheet (انظر `scripts/google-apps-script-kasco.gs`).
   - **NEXT_PUBLIC_GA_ID**: (اختياري) معرف Google Analytics.
   - **NEXT_PUBLIC_META_PIXEL_ID**: (اختياري) معرف بكسل فيسبوك/ميتا.

## الشعار والمنتجات

- **الشعار**: ضع شعار المتجر في `public/images/logo.png` (يُستخدم في الهيدر والفوتر).
- **المنتجات**: عدّل `data/products.json` — أضف أو عدّل المنتجات (id, name, description, price, badge, category, image). ضع الصور في `public/products/` أو استخدم مسارات نسبية من `public/`.

## البناء والنشر

```bash
npm run build
npm start
```

## ملاحظات

- إدارة المحتوى عبر تعديل `data/products.json` وملفات المشروع.
- الطلبات تُرسل إلى تلجرام وتُسجّل في Google Sheets حسب الإعدادات أعلاه.
