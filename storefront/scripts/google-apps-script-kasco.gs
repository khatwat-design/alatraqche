/**
 * @deprecated استخدم الملف: scripts/google-apps-script-alatraqji.gs (نسخة محدّثة)
 * الأطرقجي للسجاد والأثاث والمفروشات — Google Apps Script لحفظ الطلبات في Google Sheet
 * التعليمات:
 * 1. أنشئ Google Sheet جديد (أو استخدم موجود).
 * 2. من القائمة: تمديدات (Extensions) > Apps Script
 * 3. احذف أي كود في Code.gs والصق هذا الكود بالكامل
 * 4. احفظ (Ctrl+S) ثم انشر (Deploy) > New deployment
 * 5. اختر نوع "Web app": Execute as Me، Who has access: Anyone
 * 6. انسخ رابط "Web app URL" والصقه في .env.local كـ GOOGLE_APPS_SCRIPT_URL
 */

function doPost(e) {
  try {
    const body = e.postData ? JSON.parse(e.postData.contents) : {};
    const action = body.action;
    const data = body.data || {};

    if (action !== 'addOrder') {
      return createResponse(400, { success: false, error: 'Invalid action' });
    }

    const sheet = getOrdersSheet();
    const row = [
      data.invoiceId || '',
      data.date || '',
      data.customerName || '',
      data.phone || '',
      data.city || '',
      data.address || '',
      data.carType || '',
      data.carModel || '',
      data.paymentMethod || 'الدفع عند الاستلام',
      data.itemsCount || 0,
      data.subtotal || 0,
      data.deliveryFee || 0,
      data.total || 0,
      data.notes || '',
      data.channel || 'web',
      data.items || ''
    ];
    sheet.appendRow(row);

    return createResponse(200, { success: true, message: 'تم حفظ الطلب' });
  } catch (err) {
    return createResponse(500, { success: false, error: err.toString() });
  }
}

function doGet(e) {
  return createResponse(200, { message: 'Al-Atraqji Orders Web App is running. Use POST with action: addOrder' });
}

function getOrdersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('الطلبات');
  if (!sheet) {
    sheet = ss.getSheetByName('Orders');
  }
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName('الطلبات');
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
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
      'المجموع الفرعي',
      'رسوم التوصيل',
      'الإجمالي',
      'ملاحظات',
      'القناة',
      'تفاصيل المنتجات'
    ]);
    sheet.getRange('1:1').setFontWeight('bold');
  }
  return sheet;
}

function createResponse(code, obj) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
