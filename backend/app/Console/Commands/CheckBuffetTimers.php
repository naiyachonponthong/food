<?php

namespace App\Console\Commands;

use App\Events\TimerEvent;
use App\Models\Notification;
use App\Models\TableSession;
use Illuminate\Console\Command;

class CheckBuffetTimers extends Command
{
    protected $signature = 'buffet:check-timers';
    protected $description = 'Check buffet sessions and fire timer events (last-order / 10min / expired).';

    public function handle(): int
    {
        $now = now();

        // Active buffet sessions that have started
        $sessions = TableSession::where('status', 'active')
            ->whereNotNull('package_id')
            ->whereNotNull('expires_at')
            ->with('table')
            ->get();

        $events = 0;

        foreach ($sessions as $s) {
            $minutesLeft = (int) ceil($now->diffInSeconds($s->expires_at, false) / 60);

            if ($s->expires_at->isPast()) {
                if (!$this->alreadyFired($s, 'timer-expired')) {
                    broadcast(new TimerEvent($s, 'timer-expired', 0));
                    $this->logNotif($s, 'timer_expired', 'หมดเวลา', 'โต๊ะ ' . $s->table?->name . ' หมดเวลาแล้ว');
                    $this->info("expired: {$s->id}");
                    $events++;
                }
                continue;
            }

            if ($s->last_order_at && $s->last_order_at->isPast() && !$this->alreadyFired($s, 'last-order-warning')) {
                broadcast(new TimerEvent($s, 'last-order-warning', $minutesLeft));
                $this->logNotif($s, 'last_order_warning', 'Last Order!', 'โต๊ะ ' . $s->table?->name . ' เหลือ ' . $minutesLeft . ' นาที');
                $this->info("last-order: {$s->id}");
                $events++;
                continue;
            }

            if ($minutesLeft <= 10 && $minutesLeft > 0 && !$this->alreadyFired($s, 'timer-warning')) {
                broadcast(new TimerEvent($s, 'timer-warning', $minutesLeft));
                $this->logNotif($s, 'timer_warning', 'เหลือเวลา 10 นาที', 'โต๊ะ ' . $s->table?->name . ' เหลือ ' . $minutesLeft . ' นาที');
                $this->info("timer-warning: {$s->id}");
                $events++;
            }
        }

        $this->info("Processed {$sessions->count()} sessions, fired {$events} events.");
        return self::SUCCESS;
    }

    /**
     * Avoid double-firing the same alert by checking the notification log.
     */
    protected function alreadyFired(TableSession $s, string $kind): bool
    {
        return Notification::where('restaurant_id', $s->restaurant_id)
            ->where('type', str_replace('-', '_', $kind))
            ->whereJsonContains('data->session_id', $s->id)
            ->exists();
    }

    protected function logNotif(TableSession $s, string $type, string $title, string $body): void
    {
        Notification::create([
            'restaurant_id' => $s->restaurant_id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => ['session_id' => $s->id, 'table_id' => $s->table_id, 'table_name' => $s->table?->name],
        ]);
    }
}
