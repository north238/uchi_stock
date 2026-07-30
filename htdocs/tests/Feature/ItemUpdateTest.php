<?php

namespace Tests\Feature;

use App\Enums\ItemStatus;
use App\Models\Group;
use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItemUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_updates_own_group_item(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create([
            'group_id' => $group->id,
            'name' => '旧名称',
            'status' => ItemStatus::InStock->value,
        ]);

        $response = $this
            ->actingAs($user)
            ->put(route('items.update', $item->id), [
                'name' => '新名称',
                'status' => ItemStatus::Low->value,
                'quantity' => 3,
            ]);

        $response->assertRedirect(route('items.edit', ['id' => $item->id]));
        $response->assertSessionHas('success');

        $item->refresh();
        $this->assertSame('新名称', $item->name);
        $this->assertSame(ItemStatus::Low->value, $item->status->value);
        $this->assertSame(3, $item->quantity);
    }

    public function test_returns_404_for_other_groups_item(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $otherGroup = Group::create(['name' => '他グループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create(['group_id' => $otherGroup->id, 'name' => '旧名称']);

        $response = $this
            ->actingAs($user)
            ->put(route('items.update', $item->id), [
                'name' => '新名称',
            ]);

        $response->assertNotFound();
        $this->assertSame('旧名称', $item->fresh()->name);
    }

    public function test_validation_error_when_name_is_missing(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create(['group_id' => $group->id, 'name' => '旧名称']);

        $response = $this
            ->actingAs($user)
            ->put(route('items.update', $item->id), [
                'name' => '',
            ]);

        $response->assertSessionHasErrors('name');
        $this->assertSame('旧名称', $item->fresh()->name);
    }
}
