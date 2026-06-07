<?php

namespace App\Mail;

use App\Helpers\OrderHelper;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Order $order;

    public string $statusLabel;

    public function __construct(Order $order)
    {
        $this->order = $order;
        $this->statusLabel = OrderHelper::statusLabelAr($order->status);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تحديث حالة الطلب #'.$this->order->invoice_id,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.orders.status-updated',
            with: [
                'order' => $this->order,
                'statusLabel' => $this->statusLabel,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
