// تكامل Google Sheets باستخدام Google Apps Script
// لا حاجة لتثبيت أي حزم - فقط استدعاء الـ Web App URL

export async function addOrderToGoogleSheets(orderData: any) {
  try {
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    
    if (!scriptUrl) {
      console.log('Google Apps Script URL not configured');
      return { success: false, error: 'Missing script URL' };
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        action: 'addOrder',
        data: {
          invoiceId: orderData.invoiceId,
          date: new Date().toLocaleDateString('ar-IQ'),
          customerName: orderData.customer.name,
          phone: orderData.customer.phone,
          city: orderData.customer.city,
          address: orderData.customer.address,
          carType: orderData.customer.carType || '',
          carModel: orderData.customer.carModel || '',
          paymentMethod: orderData.customer.paymentMethod || 'الدفع عند الاستلام',
          itemsCount: orderData.summary.totalItems,
          subtotal: orderData.summary.subtotal,
          deliveryFee: orderData.summary.deliveryFee,
          total: orderData.summary.total,
          notes: orderData.customer.notes || '',
          channel: orderData.channel || 'web',
          items: orderData.items.map((item: any) => 
            `${item.name} (${item.quantity} × ${item.price} = ${item.subtotal})`
          ).join('\n')
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    console.error('Error adding order to Google Sheets:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
