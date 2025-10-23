<?php

namespace App\Exceptions\Group;

use App\Exceptions\Group\BaseGroupException;

class GroupHasMembersException extends BaseGroupException
{
    protected function getLogPrefix(): string
    {
        return '[GroupHasMembersException] グループにメンバーが存在';
    }
}
