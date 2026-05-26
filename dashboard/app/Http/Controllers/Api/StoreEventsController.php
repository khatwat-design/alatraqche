<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StoreEventsController extends Controller
{
    /**
     * SSE stream — يبقى مفتوحاً ويرسل ping كل 25 ثانية
     * وعند أي تغيير (بنر / منتج / تصنيف) يرسل event فوري.
     */
    public function stream(Request $request): StreamedResponse
    {
        return response()->stream(function () {
            // تنظيف أي output buffer موجود
            while (ob_get_level() > 0) {
                ob_end_clean();
            }

            $lastSent = Cache::get('storefront.last_change', 0);
            $this->sendEvent('connected', ['ts' => $lastSent]);

            $tick = 0;
            while (true) {
                if (connection_aborted()) break;

                $current = Cache::get('storefront.last_change', 0);

                if ($current !== $lastSent) {
                    $changed = Cache::get('storefront.last_change_type', 'all');
                    $this->sendEvent('change', ['type' => $changed, 'ts' => $current]);
                    $lastSent = $current;
                }

                // ping كل 25 ثانية لإبقاء الاتصال حياً
                if ($tick % 5 === 0) {
                    $this->sendEvent('ping', ['ts' => time()]);
                }

                @flush();

                sleep(5);
                $tick++;

                // أعد الاتصال بعد 4 دقائق (Nginx/proxy timeouts)
                if ($tick >= 48) break;
            }
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache, no-store',
            'X-Accel-Buffering' => 'no',
            'Connection'        => 'keep-alive',
        ]);
    }

    /**
     * Lightweight polling endpoint — يرجع آخر timestamp للتغيير.
     * Next.js يستقصيه كل 3 ثوانٍ.
     */
    public function status(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'ts'   => Cache::get('storefront.last_change', 0),
            'type' => Cache::get('storefront.last_change_type', 'all'),
        ]);
    }

    private function sendEvent(string $event, array $data): void
    {
        echo "event: {$event}\n";
        echo 'data: ' . json_encode($data) . "\n\n";
        @ob_flush();
        @flush();
    }
}
