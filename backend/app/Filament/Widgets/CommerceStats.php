<?php

namespace App\Filament\Widgets;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class CommerceStats extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $paid = Order::query()->where('payment_status', PaymentStatus::Paid);
        $revenue = (clone $paid)->sum('total');
        $orders = (clone $paid)->count();

        return [
            Stat::make('Revenue', '$'.number_format((float) $revenue, 2))->description('Paid orders'),
            Stat::make('Orders', number_format($orders))->description('Successfully paid'),
            Stat::make('Customers', number_format(User::query()->where('role', 'customer')->count())),
            Stat::make('Average order value', '$'.number_format($orders ? (float) $revenue / $orders : 0, 2)),
        ];
    }
}
