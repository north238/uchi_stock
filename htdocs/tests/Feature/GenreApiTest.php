<?php

namespace Tests\Feature;

use App\Models\Genre;
use App\Models\Group;
use App\Models\Place;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class GenreApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_genre_returns_created_record(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);

        $response = $this
            ->actingAs($user)
            ->postJson(route('api.genres.store'), ['name' => '掃除用品']);

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', '掃除用品');
        $genre = Genre::where('name', '掃除用品')->firstOrFail();
        $response->assertJsonPath('data.id', $genre->id);
    }

    public function test_store_genre_is_associated_with_users_group(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);

        $this
            ->actingAs($user)
            ->postJson(route('api.genres.store'), ['name' => '掃除用品']);

        $genre = Genre::where('name', '掃除用品')->firstOrFail();
        $this->assertSame($group->id, $genre->group_id);
    }

    public function test_index_genre_returns_only_own_group_genres(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $otherGroup = Group::create(['name' => '別グループ']);
        $user = User::factory()->create(['group_id' => $group->id]);

        Genre::create(['name' => '自グループのジャンル', 'group_id' => $group->id]);
        Genre::create(['name' => '他グループのジャンル', 'group_id' => $otherGroup->id]);

        $response = $this
            ->actingAs($user)
            ->getJson(route('api.genres.index'));

        $response->assertStatus(200);
        $names = collect($response->json())->pluck('name');
        $this->assertTrue($names->contains('自グループのジャンル'));
        $this->assertFalse($names->contains('他グループのジャンル'));
    }

    public function test_store_place_returns_created_record(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $user = User::factory()->create(['group_id' => $group->id]);

        $response = $this
            ->actingAs($user)
            ->postJson(route('api.places.store'), ['name' => '冷蔵庫']);

        $response->assertStatus(200);
        $response->assertJsonPath('data.name', '冷蔵庫');
        $place = Place::where('name', '冷蔵庫')->firstOrFail();
        $response->assertJsonPath('data.id', $place->id);
    }

    public function test_index_place_returns_only_own_group_places(): void
    {
        $group = Group::create(['name' => 'テストグループ']);
        $otherGroup = Group::create(['name' => '別グループ']);
        $user = User::factory()->create(['group_id' => $group->id]);

        Place::create(['name' => '自グループの保管場所', 'group_id' => $group->id]);
        Place::create(['name' => '他グループの保管場所', 'group_id' => $otherGroup->id]);

        $response = $this
            ->actingAs($user)
            ->getJson(route('api.places.index'));

        $response->assertStatus(200);
        $names = collect($response->json())->pluck('name');
        $this->assertTrue($names->contains('自グループの保管場所'));
        $this->assertFalse($names->contains('他グループの保管場所'));
    }

    public function test_genres_table_no_longer_has_color_id_column(): void
    {
        $this->assertFalse(Schema::hasColumn('genres', 'color_id'));
    }
}
