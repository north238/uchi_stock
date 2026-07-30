<?php

namespace Tests\Feature;

use App\Enums\ItemStatus;
use App\Models\Group;
use App\Models\Item;
use App\Models\PurchaseHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItemIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_lists_only_own_group_items(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $otherGroup = Group::create(['name' => '他グループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $ownItem = Item::factory()->create(['group_id' => $group->id]);
        Item::factory()->create(['group_id' => $otherGroup->id]);

        $response = $this
            ->actingAs($user)
            ->get(route('items.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Items/Index')
                ->has('items', 1)
                ->where('items.0.id', $ownItem->id)
        );
    }

    public function test_sorts_by_status_by_default(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);

        $inStock = Item::factory()->create(['group_id' => $group->id, 'status' => ItemStatus::InStock->value]);
        $out = Item::factory()->create(['group_id' => $group->id, 'status' => ItemStatus::Out->value]);
        $low = Item::factory()->create(['group_id' => $group->id, 'status' => ItemStatus::Low->value]);

        $response = $this
            ->actingAs($user)
            ->get(route('items.index'));

        $response->assertInertia(
            fn ($page) => $page
                ->component('Items/Index')
                ->where('items.0.id', $out->id)
                ->where('items.1.id', $low->id)
                ->where('items.2.id', $inStock->id)
        );
    }

    public function test_sorts_by_purchased_when_requested(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);

        $neverPurchased = Item::factory()->create(['group_id' => $group->id, 'status' => ItemStatus::InStock->value]);
        $purchasedRecently = Item::factory()->create(['group_id' => $group->id, 'status' => ItemStatus::InStock->value]);
        $purchasedLongAgo = Item::factory()->create(['group_id' => $group->id, 'status' => ItemStatus::InStock->value]);

        PurchaseHistory::factory()->create([
            'item_id' => $purchasedRecently->id,
            'user_id' => $user->id,
            'purchased_at' => now()->subDay(),
        ]);
        PurchaseHistory::factory()->create([
            'item_id' => $purchasedLongAgo->id,
            'user_id' => $user->id,
            'purchased_at' => now()->subDays(10),
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('items.index', ['sort' => 'purchased']));

        $response->assertInertia(
            fn ($page) => $page
                ->component('Items/Index')
                ->where('items.0.id', $neverPurchased->id)
                ->where('items.1.id', $purchasedLongAgo->id)
                ->where('items.2.id', $purchasedRecently->id)
        );
    }
}
