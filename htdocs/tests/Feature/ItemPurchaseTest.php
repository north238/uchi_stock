<?php

namespace Tests\Feature;

use App\Enums\ItemStatus;
use App\Models\Group;
use App\Models\Item;
use App\Models\PurchaseHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItemPurchaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_records_purchase_and_updates_status_to_in_stock(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create(['group_id' => $group->id, 'status' => ItemStatus::Low->value]);

        $response = $this
            ->actingAs($user)
            ->post(route('items.purchase.store', $item->id));

        $response->assertRedirect();

        $this->assertDatabaseCount('purchase_histories', 1);
        $history = PurchaseHistory::first();
        $this->assertSame($item->id, $history->item_id);
        $this->assertSame($user->id, $history->user_id);
        $this->assertSame(ItemStatus::InStock->value, $item->fresh()->status->value);
    }

    public function test_returns_404_for_other_groups_item(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $otherGroup = Group::create(['name' => '他グループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create(['group_id' => $otherGroup->id, 'status' => ItemStatus::Low->value]);

        $response = $this
            ->actingAs($user)
            ->post(route('items.purchase.store', $item->id));

        $response->assertNotFound();
        $this->assertDatabaseCount('purchase_histories', 0);
    }

    public function test_undo_restores_previous_status_and_removes_latest_history(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);
        $item = Item::factory()->create(['group_id' => $group->id, 'status' => ItemStatus::InStock->value]);
        $history = PurchaseHistory::factory()->create([
            'item_id' => $item->id,
            'user_id' => $user->id,
            'purchased_at' => now(),
        ]);

        $response = $this
            ->actingAs($user)
            ->delete(route('items.purchase.destroy', $item->id), [
                'previous_status' => ItemStatus::Low->value,
            ]);

        $response->assertRedirect();
        $this->assertModelMissing($history);
        $this->assertSame(ItemStatus::Low->value, $item->fresh()->status->value);
    }
}
