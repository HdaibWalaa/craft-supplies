<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, Order $order): bool
    {
        return $user->role === UserRole::Admin || $order->user_id === $user->id;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->role === UserRole::Admin;
    }
}
