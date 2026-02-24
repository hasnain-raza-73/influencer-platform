# API Documentation

**Last Updated**: February 18, 2026
**Base URL**: `http://localhost:3000/v1` (development) | `https://api.yourapp.com/v1` (production)

---

## Authentication

All protected endpoints require a JWT Bearer token:
```
Authorization: Bearer <access_token>
```

## Response Format

**Success**:
```json
{ "success": true, "data": { ... } }
```

**List/paginated**:
```json
{ "success": true, "data": [...], "meta": { "total": 100, "page": 1, "limit": 20, "total_pages": 5 } }
```

**Error**:
```json
{ "success": false, "message": "Human readable message", "statusCode": 404 }
```

---

## Auth Endpoints

### POST /auth/register
```json
// Request
{ "email": "user@example.com", "password": "SecurePass123!", "role": "BRAND" }
// role: "BRAND" | "INFLUENCER"

// Response
{ "success": true, "data": { "user": { "id": "uuid", "email": "...", "role": "BRAND" }, "access_token": "...", "refresh_token": "..." } }
```

### POST /auth/login
```json
{ "email": "user@example.com", "password": "SecurePass123!" }
// Response: same as register
```

### POST /auth/refresh
```json
{ "refresh_token": "..." }
// Response: { "access_token": "...", "refresh_token": "..." }
```

### GET /auth/me  `🔒 JWT`
Returns current user profile.

---

## Products Endpoints  `🔒 JWT`

### GET /products
Query params: `page`, `limit`, `category`, `brand_id`, `search`, `min_price`, `max_price`, `status`

Only returns `APPROVED` products to influencers/public. Brands see all their own products.

### GET /products/:id

### POST /products  `🔒 BRAND`
```json
{
  "name": "Product Name",
  "description": "...",
  "price": 99.99,
  "category": "Fashion",
  "product_url": "https://brand.com/product",
  "image_url": "https://cloudinary.com/...",
  "image_urls": ["https://...", "https://..."],
  "sku": "SKU123",
  "commission_rate": 15
}
```
New products start with `review_status: PENDING_REVIEW`.

### PUT /products/:id  `🔒 BRAND (owner)`
Same body as POST (all fields optional). Edits reset `review_status` to `PENDING_REVIEW`.

### DELETE /products/:id  `🔒 BRAND (owner)`

---

## Upload Endpoint  `🔒 JWT`

### POST /upload/image
```
Content-Type: multipart/form-data
Field: "file"  (image/jpeg | image/png | image/webp | image/gif, max 5 MB)
```
```json
// Response
{ "success": true, "data": { "url": "https://res.cloudinary.com/..." } }
```

---

## Campaigns Endpoints  `🔒 JWT`

### GET /campaigns  `🔒 BRAND`
Returns brand's own campaigns.

### GET /campaigns/available  `🔒 INFLUENCER`
Returns active campaigns available to join.

### GET /campaigns/:id

### POST /campaigns  `🔒 BRAND`
```json
{
  "name": "Campaign Name",
  "description": "...",
  "commission_rate": 15,
  "budget": 5000,
  "start_date": "2026-03-01",
  "end_date": "2026-04-01",
  "product_ids": ["uuid1", "uuid2"]
}
```

### PUT /campaigns/:id  `🔒 BRAND (owner)`

### DELETE /campaigns/:id  `🔒 BRAND (owner)`

### PATCH /campaigns/:id/status  `🔒 BRAND`
```json
{ "status": "active" }
// status: "draft" | "active" | "paused" | "ended"
```

---

## Tracking Endpoints

### GET /track/c/:code  `public`
Click tracking — logs click, sets attribution cookie, redirects to product URL.
Response: `302 Redirect`

### POST /tracking/links  `🔒 INFLUENCER`
```json
{ "product_id": "uuid" }
// Response: { "id": "uuid", "tracking_url": "http://localhost:3000/v1/track/c/abc123", "unique_code": "abc123", "product": {...} }
```

### GET /tracking/links  `🔒 INFLUENCER`
Returns influencer's tracking links with click/conversion stats.

### GET /pixel/track  `public`
Pixel conversion tracking (called from brand's site).
Query params: `order_id`, `amount`, `brand_id`, `products` (JSON encoded, optional)
Response: `1×1 transparent GIF`

### POST /webhooks/conversion
```
Header: X-API-Key: <brand_api_key>
```
```json
{
  "order_id": "ORD_123",
  "amount": 150.00,
  "currency": "USD",
  "customer_email": "customer@example.com",
  "products": [{ "id": "PROD_456", "quantity": 2, "price": 75.00 }],
  "timestamp": "2026-02-01T10:30:00Z"
}
```
```json
// Response
{ "success": true, "data": { "conversion_id": "uuid", "attributed": true, "commission": 15.00 } }
```

---

## Payouts Endpoints  `🔒 INFLUENCER`

### GET /payouts/balance
```json
{ "success": true, "data": { "available_balance": 450.00, "pending_balance": 120.00, "total_paid": 1200.00 } }
```

### GET /payouts
Query params: `status`, `page`, `limit`

### POST /payouts/request
```json
{ "amount": 200.00, "bank_info": { "bank_name": "...", "account_number": "...", "routing_number": "..." } }
```

---

## Admin Endpoints  `🔒 ADMIN role only`

All admin endpoints require login as `admin@platform.com`.

### GET /admin/overview
```json
{
  "success": true,
  "data": {
    "total_brands": 12,
    "total_influencers": 45,
    "pending_reviews": 3,
    "needs_revision": 1,
    "active_campaigns": 8,
    "total_campaigns": 20,
    "total_conversions": 340,
    "pending_payout_amount": 1200.00,
    "total_platform_revenue": 45000.00
  }
}
```

### GET /admin/brands
Query params: `status` (ACTIVE|SUSPENDED), `search`, `page`, `limit`

### GET /admin/brands/:id
```json
{
  "success": true,
  "data": {
    "brand": { "id": "...", "company_name": "...", "user": { "email": "..." }, ... },
    "campaigns": [...],
    "products": [...],
    "stats": {
      "total_campaigns": 5,
      "active_campaigns": 2,
      "total_products": 12,
      "approved_products": 10,
      "pending_products": 2,
      "total_revenue": 15000.00,
      "total_conversions": 120
    }
  }
}
```

### PATCH /admin/brands/:id/status
```json
{ "status": "SUSPENDED" }
// or "ACTIVE" — updates both brand.status AND user.status
```

### GET /admin/influencers
Query params: `status`, `search`, `page`, `limit`

### GET /admin/influencers/:id
```json
{
  "success": true,
  "data": {
    "influencer": { "id": "...", "display_name": "...", "user": { "email": "..." }, ... },
    "tracking_links": [{ "id": "...", "clicks": 50, "product": { "name": "...", "brand": {...} }, ... }],
    "conversions": [...],
    "stats": {
      "total_clicks": 500,
      "total_conversions": 40,
      "total_earnings": 600.00,
      "total_sales": 4000.00,
      "active_links": 5
    }
  }
}
```

### PATCH /admin/influencers/:id/status
```json
{ "status": "SUSPENDED" }
// or "ACTIVE" — updates both influencer.status AND user.status
```

### GET /admin/campaigns
Query params: `status`, `brand_id`, `page`, `limit`

### PATCH /admin/campaigns/:id/close
No body. Sets campaign status to `ended`.

### GET /admin/products
Query params: `review_status` (PENDING_REVIEW|APPROVED|NEEDS_REVISION|REJECTED|ALL), `brand_id`, `page`, `limit`
Default: `review_status=PENDING_REVIEW`

### PATCH /admin/products/:id/review
```json
{
  "review_status": "APPROVED",
  "review_notes": "Looks good!"
}
// review_status: "APPROVED" | "NEEDS_REVISION" | "REJECTED"
// APPROVED → product.status = ACTIVE
// NEEDS_REVISION / REJECTED → product.status = INACTIVE
```

### GET /admin/payouts
Query params: `status`, `page`, `limit`

### GET /admin/conversions
Query params: `status`, `page`, `limit`

---

## Error Codes

| Code | Meaning |
|---|---|
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | Valid token but insufficient role |
| `404 Not Found` | Resource does not exist |
| `400 Bad Request` | Validation error on request body |
| `409 Conflict` | Duplicate entry (e.g. tracking link already exists) |
| `500 Internal Server Error` | Unexpected server error |

---

## Rate Limits (planned)

- Public endpoints: 100 req/min per IP
- Authenticated endpoints: 1000 req/min per user
- Tracking endpoints: 10,000 req/min globally
- Webhook endpoint: 100 req/min per brand API key

---

## Pagination

All list endpoints support:
- `page` — page number (1-indexed, default: 1)
- `limit` — items per page (default: 20, max: 100)

Response `meta` object:
```json
{ "total": 100, "page": 1, "limit": 20, "total_pages": 5 }
```
