<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment

## IMPORTANT: Never overwrite server .env.local
The server's `.env.local` has the correct API URL:
`NEXT_PUBLIC_API_URL=https://dashbord.alatraqchy.com/api/v1`

When rsyncing to the server, ALWAYS exclude `.env.local`:
rsync -avz --delete --exclude=node_modules --exclude=.env.local ...

The local `.env.local` is for development only (uses http://localhost:8000).

## API availability
The Laravel API runs via PHP-FPM behind Nginx, NOT on port 8000.
Accesible at: `https://dashbord.alatraqchy.com/api/v1`
The built-in PHP server on port 8000 (`ego-api` PM2 process) is for a different project (ego-finance) and conflicts with alatraqche.
Never try to run `php artisan serve` on port 8000 for alatraqche.
