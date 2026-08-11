<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:100'], 'email' => ['required', 'email'], 'subject' => ['nullable', 'string', 'max:150'], 'message' => ['required', 'string', 'between:10,5000']]);
        ContactMessage::query()->create([...$data, 'status' => 'new']);
        dispatch(function () use ($data): void {
            Mail::raw("From: {$data['name']} <{$data['email']}>\n\n{$data['message']}", fn ($mail) => $mail->to(config('mail.support_address'))->subject($data['subject'] ?? 'New contact message'));
        })->afterResponse();

        return response()->json(['message' => 'Your message has been sent.'], 201);
    }
}
