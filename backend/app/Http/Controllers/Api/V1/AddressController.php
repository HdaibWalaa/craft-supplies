<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\JordanGovernorate;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->addresses()->latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $address = $request->user()->addresses()->create($data);

        return response()->json(['data' => $address], 201);
    }

    public function update(Request $request, int $address): JsonResponse
    {
        $model = $request->user()->addresses()->findOrFail($address);
        $model->update($this->validated($request));

        return response()->json(['data' => $model->fresh()]);
    }

    public function destroy(Request $request, int $address): JsonResponse
    {
        $request->user()->addresses()->findOrFail($address)->delete();

        return response()->json(['message' => 'Address removed.']);
    }

    public function makeDefault(Request $request, int $address): JsonResponse
    {
        $model = $request->user()->addresses()->findOrFail($address);
        $request->user()->addresses()->update(['is_default_shipping' => false]);
        $model->update(['is_default_shipping' => true]);

        return response()->json(['data' => $model->fresh()]);
    }

    private function validated(Request $request): array
    {
        $data = $request->validate(['full_name' => ['required', 'string', 'max:200'], 'phone' => ['required', 'string', 'max:40', 'regex:/^(?:\+?962|00962|0)?7\d{8}$/'],
            'governorate' => ['required', Rule::enum(JordanGovernorate::class)], 'address' => ['required', 'string', 'max:1000'],
            'is_default_shipping' => ['boolean'], 'is_default_billing' => ['boolean']]);
        $data['phone'] = preg_replace('/[\s()-]/', '', $data['phone']);
        $data['country_code'] = 'JO';
        return $data;
    }
}
