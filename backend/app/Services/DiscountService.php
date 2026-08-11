<?php

namespace App\Services;

use App\Enums\DiscountType;
use App\Models\DiscountCode;
use Illuminate\Validation\ValidationException;

class DiscountService
{
    public function validate(?string $code, int $subtotalCents, bool $lock = false): array
    {
        if (! $code) {
            return [null, 0];
        }
        $query = DiscountCode::query()->where('code', strtoupper($code));
        if ($lock) {
            $query->lockForUpdate();
        }
        $discount = $query->first();
        if (! $discount || ! $discount->is_active || ($discount->starts_at && $discount->starts_at->isFuture()) || ($discount->ends_at && $discount->ends_at->isPast())) {
            $this->invalid('This discount code is invalid or expired.');
        }
        if ($discount->usage_limit !== null && $discount->usage_count >= $discount->usage_limit) {
            $this->invalid('This discount code has reached its usage limit.');
        }
        if ($subtotalCents < $this->cents($discount->minimum_spend)) {
            $this->invalid('The cart does not meet this discount minimum.');
        }
        $amount = $discount->type === DiscountType::Percentage
            ? (int) round($subtotalCents * ((float) $discount->value / 100))
            : min($this->cents($discount->value), $subtotalCents);

        return [$discount, $amount];
    }

    private function invalid(string $message): never
    {
        throw ValidationException::withMessages(['discount_code' => [$message]]);
    }

    private function cents(string|float|int $amount): int
    {
        return (int) round((float) $amount * 100);
    }
}
