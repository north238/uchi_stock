<?php

namespace Tests\Feature;

use App\Enums\ItemStatus;
use App\Models\Group;
use App\Models\Item;
use App\Models\PurchaseHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItemStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_redirects_to_index_with_success_message(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);

        $response = $this
            ->actingAs($user)
            ->post(route('items.store'), [
                'name' => 'りんご',
                'status' => ItemStatus::InStock->value,
            ]);

        $item = Item::first();

        $response->assertRedirect(route('items.index'));
        $response->assertSessionHas('success', "{$item->name}を登録しました");
    }

    public function test_store_creates_initial_purchase_history_without_overriding_status(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);

        $this
            ->actingAs($user)
            ->post(route('items.store'), [
                'name' => 'バナナ',
                'status' => ItemStatus::Low->value,
            ]);

        $item = Item::where('name', 'バナナ')->firstOrFail();

        $this->assertDatabaseCount('purchase_histories', 1);
        $history = PurchaseHistory::first();
        $this->assertSame($item->id, $history->item_id);
        $this->assertSame($user->id, $history->user_id);
        $this->assertSame(ItemStatus::Low->value, $item->status->value);
    }
}
