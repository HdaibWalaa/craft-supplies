<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->getFullUrl(),
            'thumb' => $this->hasGeneratedConversion('thumb') ? $this->getFullUrl('thumb') : $this->getFullUrl(),
            'medium' => $this->hasGeneratedConversion('medium') ? $this->getFullUrl('medium') : $this->getFullUrl(),
            'large' => $this->hasGeneratedConversion('large') ? $this->getFullUrl('large') : $this->getFullUrl(),
            'alt' => $this->getCustomProperty('alt', ''),
            'order' => $this->order_column,
        ];
    }
}
