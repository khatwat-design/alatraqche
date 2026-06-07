<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name') }}</title>
    @vite(['resources/js/app.js', 'resources/css/app.css'])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-gray-50">
    @inertia
</body>
</html>
