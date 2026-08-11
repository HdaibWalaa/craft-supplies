<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogPostResource;
use App\Models\BlogPost;

class BlogPostController extends Controller
{
    public function index()
    {
        return BlogPostResource::collection(BlogPost::query()->where('status', 'published')->where('published_at', '<=', now())->with('media')->latest('published_at')->paginate(12));
    }

    public function show(string $slug): BlogPostResource
    {
        return BlogPostResource::make(BlogPost::query()->where('slug', $slug)->where('status', 'published')->where('published_at', '<=', now())
            ->with(['media', 'products.media', 'products.variants'])->firstOrFail());
    }
}
