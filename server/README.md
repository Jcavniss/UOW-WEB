# GamerDiary server

Laravel 13 REST API for GamerDiary, using PostgreSQL, Eloquent, Form Requests,
API Resources, Policies, and Laravel Sanctum Bearer tokens.

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

For the full environment reference, endpoint list, security model, development
credentials, and test instructions, see the root `README.md`.
