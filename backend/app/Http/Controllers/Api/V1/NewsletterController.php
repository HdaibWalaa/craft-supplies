<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email', 'max:255']]);
        NewsletterSubscriber::query()->updateOrCreate(['email' => strtolower($data['email'])], ['status' => 'subscribed', 'locale' => app()->getLocale(), 'subscribed_at' => now(), 'unsubscribed_at' => null]);

        return response()->json(['message' => 'You are subscribed.'], 201);
    }
}
