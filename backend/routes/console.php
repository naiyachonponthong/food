<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Buffet timer scheduling — checks expires_at / last_order_at every minute
Schedule::command('buffet:check-timers')->everyMinute();

// Nightly cleanup of zombie sessions
Schedule::command('sessions:cleanup')->dailyAt('02:00');
