<?php

namespace App\Http\Requests;

use App\Enums\JordanGovernorate;
use App\Models\ShippingMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cart_token' => ['nullable', 'uuid'], 'full_name' => ['required', 'string', 'max:200'],
            'phone' => ['required', 'string', 'max:40', 'regex:/^(?:\+?962|00962|0)?7\d{8}$/'],
            'governorate' => ['required', Rule::enum(JordanGovernorate::class)], 'address' => ['required', 'string', 'max:1000'],
            'save_address' => ['nullable', 'boolean'], 'shipping_method_id' => ['required', 'integer', Rule::exists(ShippingMethod::class, 'id')->where('is_active', true)],
            'discount_code' => ['nullable', 'string', 'max:50'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $phone = preg_replace('/[\s()-]/', '', (string) $this->input('phone'));
        if (is_string($phone) && str_starts_with($phone, '00962')) $phone = '+962'.substr($phone, 5);
        if (is_string($phone) && preg_match('/^7\d{8}$/', $phone)) $phone = '0'.$phone;
        $this->merge(['phone' => $phone, 'save_address' => $this->boolean('save_address')]);
    }
}
