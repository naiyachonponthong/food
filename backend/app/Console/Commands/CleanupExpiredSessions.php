<?php

namespace App\Console\Commands;

use App\Models\TableSession;
use Illuminate\Console\Command;

class CleanupExpiredSessions extends Command
{
    protected $signature = 'sessions:cleanup';
    protected $description = 'Close buffet sessions that are well past expiry but never marked closed.';

    public function handle(): int
    {
        $cutoff = now()->subHours(2);
        $stale = TableSession::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', $cutoff)
            ->with('table')
            ->get();

        foreach ($stale as $s) {
            $s->update(['status' => 'expired', 'closed_at' => now()]);
            $s->table?->update(['status' => 'available']);
            $this->info("Expired stale session {$s->id} (table {$s->table?->name})");
        }

        $this->info("Cleaned {$stale->count()} stale sessions.");
        return self::SUCCESS;
    }
}
