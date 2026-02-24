# New Session Guide

**READ THIS FIRST in every new coding session**
**Last Updated**: February 18, 2026

---

## Current Project Status

**Project**: Influencer-Brand Platform (Full-Stack SaaS)
**Phase**: MVP Polish — ~80% complete
**Stack**: NestJS (backend) + Next.js 15 (web) + PostgreSQL + Cloudinary

### What's Already Built (DO NOT re-implement):
1. **Authentication** — JWT register/login/refresh, role-based guards
2. **Products** — CRUD + multi-image Cloudinary upload + review funnel
3. **Tracking** — click tracking, pixel tracking, webhook conversions, attribution
4. **Campaigns** — brand campaign management, influencer browsing
5. **Payouts** — influencer payout requests and history
6. **Admin Module** — full admin backend (13 endpoints) + complete admin dashboard UI
7. **Frontend** — brand portal, influencer portal, admin dashboard (all pages done)

### Admin Credentials:
- **admin@platform.com** / **Admin@123456!**

---

## Quick Start Checklist

```bash
# 1. Start PostgreSQL
colima start
docker start influencer-platform-db

# 2. Start backend (port 3000)
cd packages/backend
npm run start:dev

# 3. Start frontend (port 3001)
cd packages/web
npm run dev

# 4. Run any pending migrations
cd packages/backend && npm run migration:run

# 5. Seed admin (one-time)
npm run seed:admin
```

**Verify backend is running:**
```bash
curl http://localhost:3000/v1/health
# → { "status": "ok" }
```

---

## Project Structure

```
packages/
├── backend/src/modules/
│   ├── auth/           ✅ JWT auth
│   ├── users/          ✅ User entity
│   ├── brands/         ✅ Brand profiles
│   ├── influencers/    ✅ Influencer profiles
│   ├── products/       ✅ Products + review funnel + image_urls
│   ├── campaigns/      ✅ Campaign management
│   ├── tracking/       ✅ Tracking links, clicks, conversions
│   ├── payouts/        ✅ Payout requests
│   ├── upload/         ✅ Cloudinary image upload
│   └── admin/          ✅ Admin module (all endpoints)
└── web/app/
    ├── auth/           ✅ Login + register
    ├── brand/          ✅ Full brand portal
    ├── influencer/     ✅ Full influencer portal
    └── admin/          ✅ Full admin dashboard
        ├── dashboard/
        ├── reports/
        ├── brands/[id]/
        ├── influencers/[id]/
        ├── campaigns/
        ├── products/
        ├── payouts/
        └── conversions/
```

---

## Key Files to Reference

| File | Purpose |
|---|---|
| `CURRENT_PROGRESS.md` | Complete feature checklist (source of truth) |
| `API_DOCUMENTATION.md` | All API endpoints with request/response examples |
| `ENVIRONMENT_SETUP.md` | Complete guide to env vars, JWT secrets, Cloudinary setup |
| `MVP.md` | **🚀 Deploy MVP in 30 min — 100% FREE, no domain needed** |
| `PRODUCTION.md` | Production deployment with custom domain (advanced) |
| `DATABASE_SCHEMA.md` | Database design (note: partially outdated) |
| `packages/backend/src/modules/admin/` | Admin service, controller, module |
| `packages/web/services/admin-service.ts` | Frontend admin API calls |
| `packages/web/app/admin/` | All admin UI pages |

---

## Common Commands

```bash
# Backend
cd packages/backend
npm run start:dev              # Dev server with hot reload
npm run migration:run          # Run pending migrations
npm run seed:admin             # Create admin@platform.com

# Frontend
cd packages/web
npm run dev                    # Next.js dev server (port 3001)
npm run build                  # Production build

# Database (psql)
docker exec -it influencer-platform-db psql -U postgres -d influencer_platform
\dt                            # List tables
SELECT * FROM users;
\q

# Kill port conflicts
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

---

## Environment Variables

**Backend** (`packages/backend/.env`):
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=influencer_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=<secret>
REFRESH_TOKEN_SECRET=<secret>
CLOUDINARY_CLOUD_NAME=<your_name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
```

---

## API Response Shape

The backend always returns:
```json
{ "success": true, "data": <T>, "meta": { "total": N, "page": 1, "limit": 20 } }
```
The frontend `api.get()` returns the full body, so:
- `r.data` = the actual data array/object
- `r.meta` = pagination metadata

Admin service methods explicitly construct `{ data: r.data || [], meta: r.meta }`.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| "Connection refused" backend | Start Colima + Docker container |
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9`, then restart |
| "Influencer not found" on detail page | Backend TS compile error — check `/tmp/backend.log` |
| `Cannot read properties of undefined (reading 'length')` | API shape issue — admin service uses `r.data \|\| []` |
| Home page keeps loading for admin | ADMIN case added to `/app/page.tsx` useEffect |

---

## What to Work on Next

Priority order:
1. **Bug fixes / polish** on existing pages
2. **Google OAuth** implementation (placeholder exists)
3. **Email notifications** (SendGrid/Resend) for product review status changes
4. **Tests** — unit tests for tracking/conversion service logic
5. **Production deployment** configuration

---

**Remember**: Read `CURRENT_PROGRESS.md` to see exactly what is done. Do not re-build completed features.
