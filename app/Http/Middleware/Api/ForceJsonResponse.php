<?php

namespace App\Http\Middleware\Api;

use Closure;
use Illuminate\Http\Request;

class ForceJsonResponse
{
    public function handle(Request $request, Closure $next)
    {
        $request->headers->set('Accept', 'application/json');

        $response = $next($request);

        if ($response instanceof \Illuminate\Http\Response) {
            $response->headers->set('Content-Type', 'application/json; charset=utf-8');
        }

        return $response;
    }
}
