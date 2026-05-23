<?php

namespace App\Events;

use App\Models\TableSession;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallStaffEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public TableSession $session, public string $reason)
    {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('restaurant.' . $this->session->restaurant_id)];
    }

    public function broadcastAs(): string
    {
        return 'call-staff';
    }

    public function broadcastWith(): array
    {
        $this->session->loadMissing('table');
        return [
            'session_id' => $this->session->id,
            'table_id' => $this->session->table_id,
            'table_name' => $this->session->table?->name,
            'reason' => $this->reason,
        ];
    }
}
