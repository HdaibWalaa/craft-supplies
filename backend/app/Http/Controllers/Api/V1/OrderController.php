<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Order::class);

        return OrderResource::collection(Order::query()->where('user_id', $request->user()->id)->with('items')->latest()->paginate(15));
    }

    public function show(Request $request, string $orderNumber): OrderResource
    {
        $order = Order::query()->where('user_id', $request->user()->id)->where('order_number', $orderNumber)->with('items')->firstOrFail();
        $this->authorize('view', $order);

        return OrderResource::make($order);
    }
}
