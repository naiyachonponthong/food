<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewOrderEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('restaurant.' . $this->order->restaurant_id),
            new PrivateChannel('kitchen.' . $this->order->restaurant_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'new-order';
    }

    public function broadcastWith(): array
    {
        $this->order->loadMissing('items', 'session.table');
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'round_number' => $this->order->round_number,
            'table_id' => $this->order->session?->table_id,
            'table_name' => $this->order->session?->table?->name,
            'items_count' => $this->order->items->count(),
            'total' => (float) $this->order->total,
        ];
    }
}
