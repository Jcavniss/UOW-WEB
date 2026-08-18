# GamerDiary

GamerDiary is a  web application for maintaining a personal video game diary. Users can register, browse and filter the game catalog, add games to their personal library, change game statuses, submit ratings, select a favorite game, and edit their profile.

The project consists of two independent applications:

- `client` — the React user interface;
- `server` — the Laravel REST API;
- PostgreSQL — the primary database.

## Technology stack

| Component | Technologies |
|---|---|
| Frontend | React 18.3, Vite 6.3, Tailwind CSS 4.1, JavaScript |
| Backend | PHP 8.3+, Laravel 13, Laravel Sanctum 4 |
| Database | PostgreSQL 15+ |
| Package management | Composer 2.7+, Node.js 20+, npm 10+ |

## Requirements

Install the following software before starting the project:

- PHP 8.3 or newer;
- Composer 2.7 or newer;
- PostgreSQL 15 or newer;
- Node.js 20 or newer with npm 10+;
- Git — optional, but recommended for working with the project.

The following PHP extensions must be enabled:

```text
curl
fileinfo
mbstring
openssl
PDO
pdo_pgsql
pgsql
```

Check the installed versions with:

```bash
php --version
composer --version
node --version
npm --version
psql --version
```

## PostgreSQL setup

### Windows

The PostgreSQL service normally starts automatically after installation. Check its status in PowerShell:

```powershell
Get-Service *postgres*
```

If the service is stopped, open PowerShell as Administrator and run the following command, replacing the service name if necessary:

```powershell
Start-Service postgresql-x64-18
```

Open SQL Shell (`psql`) from the Start menu or run:

```powershell
psql -U postgres -d postgres -W
```

If `psql` is not recognized, add the PostgreSQL `bin` directory to `PATH` or specify the full path to `psql.exe`.

### Linux

Start PostgreSQL:

```bash
sudo systemctl enable --now postgresql
sudo -u postgres psql
```

### macOS

If PostgreSQL was installed with Homebrew, start the service for the installed version:

```bash
brew services list
brew services start postgresql@18
psql postgres
```

### Create the application user and database

In the open `psql` console, create a dedicated application user:

```text
CREATE ROLE gamerdiary_user WITH LOGIN;
\password gamerdiary_user
CREATE DATABASE gamerdiary OWNER gamerdiary_user;
\q
```

The `\password` command prompts for the new password twice. Characters are not displayed while typing. Save this password because it is required in `server/.env`.

## Backend setup and startup

### Windows PowerShell

```powershell
cd server
composer install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
php artisan key:generate
```

### Linux/macOS

```bash
cd server
composer install
test -f .env || cp .env.example .env
php artisan key:generate
```

Open `server/.env` and verify the following settings:

```dotenv
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://127.0.0.1:5173

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=gamerdiary
DB_USERNAME=gamerdiary_user
DB_PASSWORD="application_user_password"
```

Never commit the actual database password to Git.

Create the database tables and development seed data:

```bash
php artisan config:clear
php artisan migrate --seed
php artisan storage:link
```

Start the backend:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

The API will be available at:

```text
http://127.0.0.1:8000/api
```

Test the API by opening:

```text
http://127.0.0.1:8000/api/games
```

## Frontend setup and startup

Run the frontend in a second terminal while keeping the backend running.

### Windows PowerShell

```powershell
cd client
npm.cmd install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm.cmd run dev -- --host 127.0.0.1
```

The `npm.cmd` command is used because PowerShell may block the `npm.ps1` script due to its execution policy.

### Linux/macOS

```bash
cd client
npm install
test -f .env || cp .env.example .env
npm run dev -- --host 127.0.0.1
```

The `client/.env` file must contain the API URL:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
```

Open the application in a browser:

```text
http://127.0.0.1:5173
```

Use `127.0.0.1`, not `localhost`: the frontend origin must exactly match `FRONTEND_URL` in `server/.env`, otherwise the browser will block requests due to CORS.

## Development accounts

After running `php artisan migrate --seed`, the following local accounts are available:

```text
Administrator: admin@example.com
Password: password

User: player@example.com
Password: password
```

These credentials are intended for local development only.

## Quick startup after the initial setup

Terminal 1 — backend:

```bash
cd server
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2 — frontend on Windows:

```powershell
cd client
npm.cmd run dev -- --host 127.0.0.1
```

Terminal 2 — frontend on Linux/macOS:

```bash
cd client
npm run dev -- --host 127.0.0.1
```

## Troubleshooting

### `fe_sendauth: no password supplied`

The `DB_PASSWORD` variable in `server/.env` is empty.

### `password authentication failed for user`

The password in `server/.env` does not match the PostgreSQL user's password. Verify the credentials with `psql`, then run `php artisan config:clear`.

### CORS error

Open the frontend through `http://127.0.0.1:5173`. To use `localhost`, update `FRONTEND_URL` in `server/.env` and the frontend startup address at the same time.

### `npm.ps1 cannot be loaded`

On Windows, use `npm.cmd` instead of `npm`:

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

### The backend reports an error after changing `.env`

Clear the Laravel configuration cache:

```bash
php artisan config:clear
```

## Production frontend build

Windows:

```powershell
cd client
npm.cmd run build
```

Linux/macOS:

```bash
cd client
npm run build
```

The production files will be generated in `client/dist`.