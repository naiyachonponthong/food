<?php

namespace Tests\Feature;

use App\Console\Commands\CheckBuffetTimers;
use App\Models\Notification;
use App\Models\Package;
use App\Models\Table;
use App\Models\TableSession;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BuffetTimerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_last_order_warning_fires_when_threshold_passed(): void
    {
        $pkg = Package::first();
        $table = Table::where('status', 'available')->first();
        TableSession::create([
            'restaurant_id' => $table->restaurant_id,
            'table_id' => $table->id,
            'package_id' => $pkg->id,
            'guest_count' => 3,
            'guest_adult' => 2,
            'guest_child' => 1,
            'status' => 'active',
            'opened_at' => now(),
            'started_at' => now()->subMinutes(110),
            'expires_at' => now()->addMinutes(10),
            'last_order_at' => now()->subMinute(), // past
        ]);

        $this->artisan('buffet:check-timers')->assertSuccessful();

        $this->assertDatabaseHas('notifications', ['type' => 'last_order_warning']);
    }

    public function test_command_does_not_double_fire(): void
    {
        $pkg = Package::first();
        $table = Table::where('status', 'available')->first();
        TableSession::create([
            'restaurant_id' => $table->restaurant_id,
            'table_id' => $table->id,
            'package_id' => $pkg->id,
            'guest_count' => 3,
            'status' => 'active',
            'opened_at' => now(),
            'started_at' => now()->subMinutes(110),
            'expires_at' => now()->addMinutes(10),
            'last_order_at' => now()->subMinute(),
        ]);

        $this->artisan('buffet:check-timers')->assertSuccessful();
        $this->artisan('buffet:check-timers')->assertSuccessful();
        $this->artisan('buffet:check-timers')->assertSuccessful();

        $count = Notification::where('type', 'last_order_warning')->count();
        $this->assertEquals(1, $count, 'Should only fire once per session');
    }
}
