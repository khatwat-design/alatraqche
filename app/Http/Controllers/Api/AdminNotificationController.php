<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Auth::user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => Auth::user()->unreadNotifications()->count(),
        ]);
    }

    public function unreadCount(): JsonResponse
    {
        return response()->json([
            'unread_count' => Auth::user()->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead(string $id): JsonResponse
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['ok' => true]);
    }

    public function markAllAsRead(): JsonResponse
    {
        Auth::user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }

    public function stream(Request $request): StreamedResponse
    {
        $token = $request->query('token');
        $accessToken = PersonalAccessToken::findToken($token);
        $user = $accessToken?->tokenable;

        if (! $user || ! $user->is_admin) {
            return response()->stream(function () {
                echo "event: error\ndata: {\"message\":\"Unauthorized\"}\n\n";
                @flush();
            }, 401, ['Content-Type' => 'text/event-stream']);
        }

        return response()->stream(function () use ($user) {
            while (ob_get_level() > 0) ob_end_clean();

            $lastCount = $user->unreadNotifications()->count();
            $this->sendSse('connected', ['unread_count' => $lastCount]);

            $tick = 0;
            while (true) {
                if (connection_aborted()) break;

                $current = $user->unreadNotifications()->count();

                if ($current !== $lastCount) {
                    $notifications = $user->notifications()
                        ->orderBy('created_at', 'desc')
                        ->take(20)
                        ->get();
                    $this->sendSse('notifications', [
                        'unread_count' => $current,
                        'list' => $notifications,
                    ]);
                    $lastCount = $current;
                }

                if ($tick % 10 === 0) {
                    $this->sendSse('ping', ['ts' => time()]);
                }

                @flush();
                sleep(3);
                $tick++;

                if ($tick >= 80) break;
            }
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache, no-store',
            'X-Accel-Buffering' => 'no',
            'Connection'        => 'keep-alive',
        ]);
    }

    private function sendSse(string $event, array $data): void
    {
        echo "event: {$event}\n";
        echo 'data: ' . json_encode($data) . "\n\n";
        @ob_flush();
        @flush();
    }
}
