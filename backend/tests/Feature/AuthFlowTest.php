<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_owner_can_login_and_fetch_profile(): void
    {
        $loginResp = $this->postJson('/api/v1/auth/login', [
            'email' => 'owner@plearn.test',
            'password' => 'password',
        ]);
        $loginResp->assertOk()->assertJsonStructure(['user' => ['id', 'name', 'role'], 'token']);

        $token = $loginResp->json('token');

        $me = $this->withHeader('Authorization', "Bearer $token")->getJson('/api/v1/auth/me');
        $me->assertOk()->assertJsonPath('user.email', 'owner@plearn.test');
        $me->assertJsonPath('user.role', 'owner');
    }

    public function test_login_rejects_bad_password(): void
    {
        $resp = $this->postJson('/api/v1/auth/login', [
            'email' => 'owner@plearn.test',
            'password' => 'wrong',
        ]);
        $resp->assertStatus(422);
    }

    public function test_protected_route_requires_token(): void
    {
        $this->getJson('/api/v1/tables')->assertStatus(401);
    }
}
