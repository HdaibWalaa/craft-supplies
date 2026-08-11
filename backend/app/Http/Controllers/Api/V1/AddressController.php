<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        return $request->validate(['first_name' => ['required', 'string', 'max:100'], 'last_name' => ['required', 'string', 'max:100'], 'company' => ['nullable', 'string', 'max:150'], 'phone' => ['nullable', 'string', 'max:40'], 'line_1' => ['required', 'string', 'max:255'], 'line_2' => ['nullable', 'string', 'max:255'], 'city' => ['required', 'string', 'max:100'], 'region' => ['nullable', 'string', 'max:100'], 'postal_code' => ['nullable', 'string', 'max:30'], 'country_code' => ['required', 'string', 'size:2'], 'is_default_shipping' => ['boolean'], 'is_default_billing' => ['boolean']]);
    }
}
