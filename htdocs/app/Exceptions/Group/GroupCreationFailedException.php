<?php

namespace App\Exceptions\Group;


class GroupCreationFailedException extends BaseGroupException
{
    protected function getLogPrefix(): string
    {
        return '[GroupCreationFailedException] 作成時エラー';
    }
}
