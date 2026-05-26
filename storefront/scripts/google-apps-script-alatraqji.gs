/**
 * الأطرقجي — Google Apps Script لحفظ طلبات المتجر في Google Sheet
 *
 * ═══ الإعداد ═══
 * 1) أنشئ جدول Google Sheets جديد (أو افتح جدولاً موجوداً).
 * 2) من القائمة: Extensions (تمديدات) → Apps Script.
 * 3) الصق هذا الملف بالكامل في Code.gs واحذف أي كود قديم.
 * 4) احفظ المشروع (Ctrl+S / ⌘+S).
 * 5) Deploy → New deployment → نوع: Web app
 *    - Execute as: Me (أنا)
 *    - Who has access: Anyone (أي شخص)
 * 6) انسخ رابط Web app URL (ينتهي بـ /exec) إلى:
 *    GOOGLE_APPS_SCRIPT_URL في .env.local
 *
 * ═══ اختبار من المحرر ═══
 * شغّل الدالة testAddOrder من القائمة ثم راجع ورقة «الطلبات».
 */

var ORDERS_SHEET_NAME = 'الطلبات';

var HEADERS = [
  'رقم الفاتورة',
  'التاريخ',
  'اسم العميل',
  'الهاتف',
  'المدينة',
  'المنطقة',
  'الطابق أو مدخل المنزل',
  'وقت التوصيل المفضل',
  'طريقة الدفع',
  'عدد القطع',
  'المجموع الفرعي (د.ع.)',
  'رسوم التوصيل (د.ع.)',
  'الإجمالي (د.ع.)',
  'ملاحظات',
  'القناة',
  'تفاصيل المنتجات',
];

/**
 * يستقبل POST من موقع المتجر (action: addOrder).
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse(400, { success: false, error: 'لا توجد بيانات POST' });
    }

    var body = JSON.parse(e.postData.contents);
    if (body.action !== 'addOrder') {
      return jsonResponse(400, { success: false, error: 'إجراء غير معروف: ' + body.action });
    }

    var data = body.data || {};
    var sheet = getOrdersSheet();
    var rowNumber = sheet.getLastRow() + 1;

    sheet.appendRow([
      data.invoiceId || '',
      data.date || formatDateAr(),
      data.customerName || '',
      data.phone || '',
      data.city || '',
      data.address || '',
      data.carType || '',
      data.carModel || '',
      data.paymentMethod || 'الدفع عند الاستلام',
      numOrZero(data.itemsCount),
      numOrZero(data.subtotal),
      numOrZero(data.deliveryFee),
      numOrZero(data.total),
      data.notes || '',
      data.channel || 'web',
      data.items || '',
    ]);

    return jsonResponse(200, {
      success: true,
      message: 'تم حفظ الطلب',
      row: rowNumber,
      invoiceId: data.invoiceId || '',
    });
  } catch (err) {
    return jsonResponse(500, { success: false, error: String(err) });
  }
}

/** للتحقق أن الرابط يعمل من المتصفح */
function doGet() {
  return jsonResponse(200, {
    ok: true,
    message: 'سكربت طلبات الأطرقجي يعمل. استخدم POST مع action: addOrder',
    sheet: ORDERS_SHEET_NAME,
  });
}

function getOrdersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ORDERS_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(ORDERS_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#fef3c7');
    sheet.setFrozenRows(1);
    try {
      sheet.autoResizeColumns(1, HEADERS.length);
    } catch (ignore) {}
  }

  return sheet;
}

function formatDateAr() {
  return Utilities.formatDate(new Date(), 'Asia/Baghdad', 'yyyy-MM-dd HH:mm');
}

function numOrZero(value) {
  var n = Number(value);
  return isNaN(n) ? 0 : n;
}

function jsonResponse(statusCode, obj) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  // ملاحظة: Apps Script Web App لا يدعم رموز HTTP مخصصة في doPost؛
  // النجاح/الفشل يُعرف من JSON (success: true/false).
  return output;
}

/**
 * اختبار يدوي من محرر Apps Script (Run → testAddOrder).
 */
function testAddOrder() {
  var fakeEvent = {
    postData: {
      contents: JSON.stringify({
        action: 'addOrder',
        data: {
          invoiceId: 'TEST-' + Utilities.getUuid().substring(0, 8).toUpperCase(),
          date: formatDateAr(),
          customerName: 'عميل تجريبي',
          phone: '07701234567',
          city: 'بغداد',
          address: 'الكرادة',
          carType: 'طابق ثاني',
          carModel: 'مساءً',
          paymentMethod: 'الدفع عند الاستلام',
          itemsCount: 2,
          subtotal: 35000,
          deliveryFee: 0,
          total: 35000,
          notes: 'طلب اختبار من Apps Script',
          channel: 'test',
          items: 'فازة كريستال (1 × 17000 = 17000)\nسمكة كريستال (1 × 10000 = 10000)',
        },
      }),
    },
  };

  var result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
