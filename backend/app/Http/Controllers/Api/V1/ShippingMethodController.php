<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\JordanGovernorate;
use App\Http\Controllers\Controller;
use App\Http\Resources\ShippingMethodResource;
use App\Services\ShippingRateResolver;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ShippingMethodController extends Controller
{
    public function index(Request $request, ShippingRateResolver $resolver): AnonymousResourceCollection
    {
        $data = $request->validate(['governorate' => ['required', Rule::enum(JordanGovernorate::class)]]);
        return ShippingMethodResource::collection($resolver->ratesFor($data['governorate']));
    }

    public function governorates(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => collect(JordanGovernorate::cases())->map(fn (JordanGovernorate $governorate) => [
            'code' => $governorate->value, 'label' => $governorate->label(),
        ])->values()]);
    }
}
