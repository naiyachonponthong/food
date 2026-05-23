<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChangedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order, public string $newStatus)
    {
    }

    public function broadcastOn(): array
    {
        $this->order->loadMissing('session');
        return [
            new PrivateChannel('restaurant.' . $this->order->restaurant_id),
            new PresenceChannel('table.' . ($this->order->session?->token ?? '')),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order-' . $this->newStatus;
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => $this->newStatus,
        ];
    }
}
