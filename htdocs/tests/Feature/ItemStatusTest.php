<?php

namespace Tests\Feature;

use App\Enums\ItemStatus;
use App\Models\Group;
use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItemStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_updates_status_for_own_group_item(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create(['group_id' => $group->id, 'status' => ItemStatus::InStock->value]);

        $response = $this
            ->actingAs($user)
            ->patch(route('items.status.update', $item->id), [
                'status' => ItemStatus::Low->value,
            ]);

        $response->assertRedirect();
        $this->assertSame(ItemStatus::Low->value, $item->fresh()->status->value);
    }

    public function test_returns_404_for_other_groups_item(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $otherGroup = Group::create(['name' => '他グループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create(['group_id' => $otherGroup->id, 'status' => ItemStatus::InStock->value]);

        $response = $this
            ->actingAs($user)
            ->patch(route('items.status.update', $item->id), [
                'status' => ItemStatus::Low->value,
            ]);

        $response->assertNotFound();
        $this->assertSame(ItemStatus::InStock->value, $item->fresh()->status->value);
    }

    public function test_rejects_invalid_status_value(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create(['group_id' => $group->id, 'status' => ItemStatus::InStock->value]);

        $response = $this
            ->actingAs($user)
            ->patchJson(route('items.status.update', $item->id), [
                'status' => 'invalid_value',
            ]);

        $response->assertStatus(422);
        $this->assertSame(ItemStatus::InStock->value, $item->fresh()->status->value);
    }
}
