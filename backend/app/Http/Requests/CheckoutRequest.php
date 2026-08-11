<?php

namespace App\Http\Requests;

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
        $address = ['first_name' => ['required', 'string', 'max:100'], 'last_name' => ['required', 'string', 'max:100'], 'company' => ['nullable', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:40'], 'line_1' => ['required', 'string', 'max:255'], 'line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'], 'region' => ['nullable', 'string', 'max:100'], 'postal_code' => ['nullable', 'string', 'max:30'],
            'country_code' => ['required', 'string', 'size:2']];
        $rules = ['cart_token' => ['nullable', 'uuid'], 'email' => ['required', 'email'], 'shipping_method' => ['required', Rule::in(['standard', 'express'])],
            'discount_code' => ['nullable', 'string', 'max:50'], 'billing_same_as_shipping' => ['nullable', 'boolean']];
        foreach ($address as $field => $fieldRules) {
            $rules["shipping_address.{$field}"] = $fieldRules;
            $rules["billing_address.{$field}"] = ['nullable', ...array_slice($fieldRules, 1)];
        }

        return $rules;
    }
}
