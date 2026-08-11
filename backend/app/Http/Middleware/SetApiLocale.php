<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetApiLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = config('app.supported_locales', ['ar', 'en']);
        $header = strtolower((string) $request->header('Accept-Language', ''));
        $requested = trim((string) (preg_split('/[-_,;]/', $header, 2)[0] ?? '')) ?: null;
        $locale = in_array($requested, $supported, true)
            ? $requested
            : config('app.locale', 'ar');

        app()->setLocale($locale);

        return $next($request);
    }
}
