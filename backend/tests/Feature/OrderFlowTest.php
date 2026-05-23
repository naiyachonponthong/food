<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\Table;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderFlowTest extends TestCase
{
    use RefreshDatabase;

    protected string $token;
    protected string $sessionToken;
    protected string $sessionId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        // Login as staff
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'staff@plearn.test',
            'password' => 'password',
        ])->json();
        $this->token = $login['token'];

        // Open a session on the first table
        $table = Table::first();
        $sess = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/sessions', [
                'table_id' => $table->id,
                'guest_count' => 2,
                'qr_type' => 'dynamic',
            ])
            ->json('session');
        $this->sessionToken = $sess['token'];
        $this->sessionId = $sess['id'];
    }

    public function test_customer_can_fetch_menus_via_token(): void
    {
        $resp = $this->getJson("/api/v1/public/{$this->sessionToken}/menus");
        $resp->assertOk();
        $this->assertCount(17, $resp->json('menus'));
    }

    public function test_customer_can_place_order_and_kitchen_sees_it(): void
    {
        $menu = Menu::first();
        $place = $this->postJson("/api/v1/public/{$this->sessionToken}/orders", [
            'items' => [['menu_id' => $menu->id, 'quantity' => 2]],
        ]);
        $place->assertCreated();
        $place->assertJsonPath('order.status', 'pending');
        $place->assertJsonPath('order.items.0.quantity', 2);

        // Kitchen queue must include the new order
        $queue = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/kitchen/queue');
        $queue->assertOk();
        $this->assertCount(1, $queue->json('orders'));
    }

    public function test_bill_total_includes_service_charge_and_vat(): void
    {
        $menu = Menu::where('price', '>', 0)->first();
        $this->postJson("/api/v1/public/{$this->sessionToken}/orders", [
            'items' => [['menu_id' => $menu->id, 'quantity' => 2]],
        ])->assertCreated();

        $bill = $this->getJson("/api/v1/public/{$this->sessionToken}/bill")->json('bill');
        $expectedSubtotal = (float) $menu->price * 2;
        $expectedService = round($expectedSubtotal * 0.10, 2);
        $expectedVat = round(($expectedSubtotal + $expectedService) * 0.07, 2);
        $expectedTotal = round($expectedSubtotal + $expectedService + $expectedVat, 2);

        $this->assertSame((float) $expectedSubtotal, (float) $bill['subtotal']);
        $this->assertSame((float) $expectedService, (float) $bill['serviceCharge']);
        $this->assertSame((float) $expectedVat, (float) $bill['vat']);
        $this->assertSame((float) $expectedTotal, (float) $bill['total']);
    }

    public function test_call_staff_creates_notification(): void
    {
        $this->postJson("/api/v1/public/{$this->sessionToken}/call-staff", [
            'reason' => 'ขอเครื่องปรุง',
        ])->assertOk();

        $notifs = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/notifications')
            ->json('notifications');
        $this->assertNotEmpty($notifs);
        $this->assertEquals('call_staff', $notifs[0]['type']);
    }
}
