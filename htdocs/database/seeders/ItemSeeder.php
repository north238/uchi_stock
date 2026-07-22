<?php

namespace Database\Seeders;

use App\Enums\ItemStatus;
use App\Models\Genre;
use App\Models\Group;
use App\Models\Item;
use App\Models\Place;
use App\Models\PurchaseHistory;
use App\Models\User;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $group = Group::where('name', '開発用グループ')->first();
        $user = User::where('email', 'test@example.com')->first();

        if (!$group || !$user || $group->items()->exists()) {
            return;
        }

        $genreNames = ['食品', '調味料', '日用品', '掃除用品'];
        $genres = collect($genreNames)->mapWithKeys(
            fn ($name) => [$name => Genre::firstOrCreate(['name' => $name, 'group_id' => $group->id])]
        );

        $placeNames = ['キッチン棚', '冷蔵庫', '洗面所', '玄関収納'];
        $places = collect($placeNames)->mapWithKeys(
            fn ($name) => [$name => Place::firstOrCreate(['name' => $name, 'group_id' => $group->id])]
        );

        $items = [
            ['name' => '米', 'status' => ItemStatus::Out, 'quantity' => null, 'genre' => '食品', 'place' => 'キッチン棚', 'purchased_days_ago' => 10],
            ['name' => '醤油', 'status' => ItemStatus::Low, 'quantity' => 1, 'genre' => '調味料', 'place' => 'キッチン棚', 'purchased_days_ago' => 30],
            ['name' => 'トイレットペーパー', 'status' => ItemStatus::Low, 'quantity' => 2, 'genre' => '日用品', 'place' => '洗面所', 'purchased_days_ago' => null],
            ['name' => '牛乳', 'status' => ItemStatus::InStock, 'quantity' => 1, 'genre' => '食品', 'place' => '冷蔵庫', 'purchased_days_ago' => 0],
            ['name' => '卵', 'status' => ItemStatus::InStock, 'quantity' => 6, 'genre' => '食品', 'place' => '冷蔵庫', 'purchased_days_ago' => 3],
            ['name' => '洗剤', 'status' => ItemStatus::Out, 'quantity' => null, 'genre' => '掃除用品', 'place' => '玄関収納', 'purchased_days_ago' => 45],
            ['name' => 'ティッシュ', 'status' => ItemStatus::InStock, 'quantity' => null, 'genre' => '日用品', 'place' => '洗面所', 'purchased_days_ago' => null],
            ['name' => 'コーヒー豆', 'status' => ItemStatus::Low, 'quantity' => null, 'genre' => '食品', 'place' => 'キッチン棚', 'purchased_days_ago' => 15],
        ];

        foreach ($items as $data) {
            $item = Item::create([
                'name' => $data['name'],
                'status' => $data['status']->value,
                'quantity' => $data['quantity'],
                'genre_id' => $genres[$data['genre']]->id,
                'place_id' => $places[$data['place']]->id,
                'group_id' => $group->id,
                'created_by' => $user->id,
            ]);

            if ($data['purchased_days_ago'] !== null) {
                PurchaseHistory::create([
                    'item_id' => $item->id,
                    'user_id' => $user->id,
                    'purchased_at' => now()->subDays($data['purchased_days_ago']),
                ]);
            }
        }
    }
}
