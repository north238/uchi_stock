<?php

namespace App\Enums;

enum ItemStatus: string
{
    case InStock = 'in_stock'; // ある
    case Low     = 'low';      // 少ない
    case Out     = 'out';      // ない

    public function label(): string
    {
        return match ($this) {
            self::InStock => 'ある',
            self::Low     => '少ない',
            self::Out     => 'ない',
        };
    }

    /** 並び順の重み（小さいほど上＝買い時） */
    public function sortWeight(): int
    {
        return match ($this) {
            self::Out => 0, self::Low => 1, self::InStock => 2,
        };
    }

    /** ['in_stock','low','out'] */
    public static function values(): array
    {
        return array_map(fn ($c) => $c->value, self::cases());
    }
}
