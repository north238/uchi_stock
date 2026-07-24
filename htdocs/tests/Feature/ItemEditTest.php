<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\Item;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItemEditTest extends TestCase
{
    use RefreshDatabase;

    public function test_shows_edit_screen_for_own_group_item(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create(['group_id' => $group->id]);

        $response = $this
            ->actingAs($user)
            ->get(route('items.edit', $item->id));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Items/Edit')
                ->where('item.id', $item->id)
        );
    }

    public function test_returns_404_for_other_groups_item(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $otherGroup = Group::create(['name' => '他グループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create(['group_id' => $otherGroup->id]);

        $response = $this
            ->actingAs($user)
            ->get(route('items.edit', $item->id));

        $response->assertNotFound();
    }
}
