<?php

namespace App\Events;

use App\Models\TableSession;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * One event class for all buffet timer alerts. broadcastAs() emits one
 * of: last-order-warning, timer-warning, timer-expired, time-extended.
 */
class TimerEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TableSession $session,
        public string $kind, // last-order-warning | timer-warning | timer-expired | time-extended
        public int $minutesLeft = 0,
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('restaurant.' . $this->session->restaurant_id),
            new PrivateChannel('kitchen.' . $this->session->restaurant_id),
            new PresenceChannel('table.' . $this->session->token),
        ];
    }

    public function broadcastAs(): string
    {
        return $this->kind;
    }

    public function broadcastWith(): array
    {
        $this->session->loadMissing('table');
        return [
            'session_id' => $this->session->id,
            'table_id' => $this->session->table_id,
            'table_name' => $this->session->table?->name,
            'minutes_left' => $this->minutesLeft,
            'expires_at' => $this->session->expires_at?->toIso8601String(),
        ];
    }
}
