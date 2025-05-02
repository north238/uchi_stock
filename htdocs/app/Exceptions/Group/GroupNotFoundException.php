<?php

namespace App\Exceptions\Group;

use App\Exceptions\Group\BaseGroupException;

class GroupNotFoundException extends BaseGroupException
{
    protected function getLogPrefix(): string
    {
        return '[GroupNotFoundException] 該当グループなし';
    }
}
