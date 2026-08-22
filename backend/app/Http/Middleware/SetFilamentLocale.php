<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetFilamentLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = config('app.supported_locales', ['ar', 'en']);
        $requested = strtolower((string) $request->query('locale', ''));

        if (in_array($requested, $supported, true)) {
            $request->session()->put('filament_locale', $requested);
        }

        $locale = $request->session()->get('filament_locale', config('app.locale', 'ar'));

        if (! in_array($locale, $supported, true)) {
            $locale = config('app.locale', 'ar');
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
