<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItemDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_deletes_own_group_item(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create(['group_id' => $group->id]);

        $response = $this
            ->actingAs($user)
            ->delete(route('items.destroy', $item->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertSoftDeleted($item);
    }

    public function test_returns_404_for_other_groups_item(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $otherGroup = Group::create(['name' => '他グループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create(['group_id' => $otherGroup->id]);

        $response = $this
            ->actingAs($user)
            ->delete(route('items.destroy', $item->id));

        $response->assertNotFound();
        $this->assertDatabaseHas('items', ['id' => $item->id, 'deleted_at' => null]);
    }
}
