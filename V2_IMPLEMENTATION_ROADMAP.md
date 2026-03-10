# V2 Implementation Roadmap

**Created**: February 26, 2026
**Status**: Planning Phase
**Related Documents**:
- FEATURE_PLAN_V2.md
- DATABASE_SCHEMA_V2.md

---

## Overview

This roadmap breaks down V2 feature implementation into manageable phases.
Each phase builds on the previous, with clear milestones and deliverables.

**Total Estimated Duration**: 4 weeks
**Team Size**: 1 developer
**Tech Stack**: NestJS (Backend) + Next.js 15 (Frontend) + PostgreSQL

---

## Phase 1: Foundation (Week 1)

### Goal
Set up database schema and core backend APIs for campaign types and brand display name.

### Tasks

#### Day 1-2: Database Migrations
- [x] **Plan Complete** - Review FEATURE_PLAN_V2.md and DATABASE_SCHEMA_V2.md
- [ ] Create Migration 1: `AddCampaignType`
  - Add `campaign_type` column to campaigns
  - Update existing campaigns to 'OPEN'
  - Test rollback
- [ ] Create Migration 2: `CreateCampaignInvitations`
  - Create `campaign_invitations` table
  - Add indexes
  - Create TypeORM entity
- [ ] Create Migration 3: `AddBrandDisplayName`
  - Add `display_name` to brands
  - Backfill with `company_name`
- [ ] Run all migrations locally
- [ ] Test migrations on test database
- [ ] Document migration results

#### Day 3-4: Backend - Campaign Types API
- [ ] Update Campaign Entity
  - Add `campaign_type` field
  - Add validation
- [ ] Create CampaignInvitation Entity
  - Define relationships
  - Add status enum
- [ ] Create CampaignInvitationsService
  - `inviteInfluencers(campaignId, influencerIds[])`
  - `respondToInvitation(invitationId, action)`
  - `getInvitationsForCampaign(campaignId)`
  - `getPendingInvitations(influencerId)`
- [ ] Update CampaignsService
  - `create()` - support campaign_type
  - `getAvailableCampaigns(influencerId)` - filter by type + invitations
- [ ] Create API Endpoints
  - `POST /v1/campaigns` - add campaign_type field
  - `POST /v1/campaigns/:id/invite` - invite influencers
  - `GET /v1/campaigns/:id/invitations` - get invitations
  - `DELETE /v1/campaigns/:id/invitations/:influencerId` - remove
  - `POST /v1/campaigns/invitations/:id/respond` - accept/decline
  - `GET /v1/campaigns/invitations` - my invitations
- [ ] Write DTOs
  - `CreateCampaignDto` - add campaign_type
  - `InviteInfluencersDto`
  - `RespondToInvitationDto`
  - `CampaignInvitationResponseDto`
- [ ] Add validation
  - campaign_type must be OPEN | SPECIFIC
  - SPECIFIC campaigns require influencer_ids
  - Can't invite to OPEN campaign
- [ ] Test with Postman/Thunder Client
  - Create OPEN campaign
  - Create SPECIFIC campaign with invitations
  - Accept/decline invitations
  - Verify visibility rules

#### Day 5: Backend - Brand Display Name API
- [ ] Update Brand Entity
  - Add `display_name` field
  - Add `getPublicName()` method
- [ ] Update BrandService
  - `update()` - accept display_name
- [ ] Update DTOs
  - `UpdateBrandDto` - add optional display_name
  - `BrandPublicDto` - use getPublicName()
- [ ] Update all endpoints that return brands
  - Use `getPublicName()` for public-facing data
- [ ] Test
  - Update brand with display_name
  - Verify fallback to company_name
  - Check all API responses

### Deliverables
- ✅ 3 database migrations deployed
- ✅ Campaign types backend complete
- ✅ Brand display name backend complete
- ✅ All endpoints tested
- ✅ Postman collection updated

### Testing Checklist
- [ ] Create OPEN campaign → visible to all influencers
- [ ] Create SPECIFIC campaign → only invited can see
- [ ] Invite 3 influencers → all receive invitations
- [ ] Accept invitation → campaign appears in available
- [ ] Decline invitation → campaign disappears
- [ ] Remove invitation → influencer loses access
- [ ] Brand with display_name → shows custom name
- [ ] Brand without display_name → shows company_name

---

## Phase 2: Campaign Types UI (Week 2)

### Goal
Build frontend UI for campaign types and invitations.

### Tasks

#### Day 1-2: Brand Portal - Create Campaign
- [ ] Update `/brand/campaigns/new`
  - Add campaign type radio buttons
    - OPEN: "Visible to all influencers"
    - SPECIFIC: "Invitation only"
  - Conditionally show influencer selector for SPECIFIC
  - Create `<InfluencerSelector>` component
    - Search influencers
    - Multi-select with checkboxes
    - Show selected count
    - Remove selected
- [ ] Update campaign creation API call
  - Send `campaign_type`
  - Send `influencer_ids[]` if SPECIFIC
- [ ] Add validation
  - SPECIFIC requires at least 1 influencer
  - Show warning: "Invited influencers will be notified"
- [ ] Test
  - Create OPEN campaign
  - Create SPECIFIC campaign with 5 influencers

#### Day 3: Brand Portal - Campaign Management
- [ ] Create `/brand/campaigns/[id]` detail page
  - Show campaign type badge
  - For SPECIFIC campaigns, add "Invitations" section
- [ ] Create `<CampaignInvitations>` component
  - Table: Influencer | Status | Invited At | Actions
  - Filter by status (All/Pending/Accepted/Declined)
  - "Invite More" button → opens influencer selector modal
  - Remove invitation button (with confirmation)
- [ ] Create `<InviteInfluencersModal>` component
  - Reuse `<InfluencerSelector>`
  - Show already invited influencers (disabled)
  - Invite button
- [ ] API Integration
  - `GET /v1/campaigns/:id/invitations`
  - `POST /v1/campaigns/:id/invite`
  - `DELETE /v1/campaigns/:id/invitations/:influencerId`
- [ ] Real-time updates (optional)
  - Refresh invitations every 30s
  - Show "New response" badge

#### Day 4-5: Influencer Portal - Campaigns & Invitations
- [ ] Update `/influencer/campaigns`
  - Add tabs: Available | Invitations | Joined
  - "Available" tab:
    - Show OPEN campaigns
    - Show accepted SPECIFIC campaigns
    - Filter by status, commission rate
  - "Invitations" tab:
    - List pending invitations
    - Show campaign details
    - Accept/Decline buttons
    - Show who invited (brand name)
    - Badge with pending count
  - "Joined" tab:
    - Campaigns already joined
    - "Create Link" button
- [ ] Create `<CampaignInvitationCard>` component
  - Campaign name, brand logo
  - Commission rate, budget
  - Invited date
  - Accept/Decline buttons
  - Show loading state
- [ ] API Integration
  - `GET /v1/campaigns/available`
  - `GET /v1/campaigns/invitations?status=PENDING`
  - `POST /v1/campaigns/invitations/:id/respond`
- [ ] Success/Error handling
  - Show toast on accept/decline
  - Optimistic UI updates
  - Error recovery
- [ ] Test
  - View pending invitations
  - Accept invitation → moves to Available
  - Decline invitation → disappears
  - Create link from accepted SPECIFIC campaign

### Deliverables
- ✅ Brand portal: Create OPEN/SPECIFIC campaigns
- ✅ Brand portal: Manage invitations
- ✅ Influencer portal: View and respond to invitations
- ✅ All UI components tested
- ✅ Mobile responsive

### Testing Checklist
- [ ] Brand creates SPECIFIC campaign with 10 influencers
- [ ] All 10 influencers see invitation
- [ ] 5 accept, 3 decline, 2 ignore
- [ ] Brand sees invitation status breakdown
- [ ] Brand invites 5 more influencers
- [ ] Brand removes 1 influencer
- [ ] Influencer creates link for accepted campaign
- [ ] Responsive on mobile/tablet

---

## Phase 3: Advanced Links - Custom Slugs & QR Codes (Week 3)

### Goal
Implement custom slugs, slug availability checker, and QR code generation.

### Tasks

#### Day 1: Database Migrations
- [ ] Create Migration 4: `AddAdvancedLinkFeatures`
  - Add `custom_slug` to tracking_links
  - Add `is_bio_link` to tracking_links
  - Add `qr_code_url` to tracking_links
  - Add `landing_page_config` to tracking_links
  - Create indexes
- [ ] Run migration locally
- [ ] Test migration

#### Day 2-3: Backend - Custom Slugs
- [ ] Update TrackingLink Entity
  - Add `custom_slug` field (unique, nullable)
  - Add `is_bio_link` field (default false)
  - Add `qr_code_url` field (nullable)
  - Add `landing_page_config` field (jsonb)
  - Add `getPublicUrl(baseUrl)` method
- [ ] Create SlugService
  - `checkAvailability(slug): Promise<boolean>`
  - `suggestSlugs(attempted: string): Promise<string[]>`
  - `validateSlug(slug): ValidationResult`
  - `reserveSlug(slug, trackingLinkId): Promise<void>`
- [ ] Create QRCodeService
  - Install `qrcode` npm package: `npm install qrcode @types/qrcode`
  - `generateQRCode(url: string): Promise<Buffer>`
  - `uploadQRCode(buffer: Buffer): Promise<string>` (Cloudinary)
  - `generateAndUploadQRCode(url: string): Promise<string>`
- [ ] Update TrackingService
  - `createAdvancedLink(dto): Promise<TrackingLink>`
  - `updateBioLinkStatus(linkId, isBioLink): Promise<void>`
- [ ] Create API Endpoints
  - `GET /v1/tracking/slugs/check/:slug` - check availability
  - `POST /v1/tracking/links/advanced` - create with custom slug
  - `POST /v1/tracking/links/:id/qr-code` - generate QR
  - `PATCH /v1/tracking/links/:id/bio` - toggle bio link
  - `GET /v1/tracking/links/bio` - get my bio links
- [ ] Add validation
  - Slug format: lowercase, alphanumeric, hyphens only
  - Length: 3-50 characters
  - No consecutive hyphens
  - Cannot start/end with hyphen
  - Reserved slugs (admin, api, static, etc.)
- [ ] Test
  - Check slug availability
  - Create link with custom slug
  - Try duplicate slug → error + suggestions
  - Generate QR code → uploads to Cloudinary
  - Toggle bio link status

#### Day 4-5: Frontend - Advanced Link Creator
- [ ] Create `/influencer/links/create` page
  - Multi-step wizard (3 steps)
  - Two-column layout (form + preview)
- [ ] Step 1: Product Selection
  - Search/filter products
  - Select 1-10 products
  - Show selected count
  - Continue button (disabled if none selected)
- [ ] Step 2: Customize Link
  - Custom slug input
    - Prefix: "link.co/"
    - Real-time validation
    - Debounced availability check (500ms)
    - Green checkmark if available
    - Red X if taken + show suggestions
  - Link-in-Bio toggle
  - Landing page customization:
    - Title input
    - Description textarea
    - Theme selector (light/dark)
- [ ] Step 3: Review & Create
  - Show generated URL
  - Copy button (with confirmation toast)
  - Share buttons (Twitter, Facebook, LinkedIn)
  - QR code preview
  - Download QR code button
  - "Create Link" button
- [ ] Right column: Live Preview
  - Preview landing page appearance
  - Show QR code
  - Update in real-time
- [ ] API Integration
  - `GET /v1/tracking/slugs/check/:slug`
  - `POST /v1/tracking/links/advanced`
  - `POST /v1/tracking/links/:id/qr-code`
- [ ] Components
  - `<CustomSlugInput>` - with availability checker
  - `<QRCodePreview>` - displays QR code
  - `<LandingPagePreview>` - mini preview
  - `<CopyButton>` - copy to clipboard
  - `<ShareButtons>` - social share
- [ ] Test
  - Create link with custom slug
  - Try duplicate slug → see suggestions
  - Enable bio link
  - Download QR code
  - Copy link to clipboard

### Deliverables
- ✅ Custom slug backend complete
- ✅ QR code generation working
- ✅ Advanced link creator UI complete
- ✅ Slug availability checker real-time
- ✅ QR code download working

### Testing Checklist
- [ ] Check available slug → green checkmark
- [ ] Check taken slug → red X + 3 suggestions
- [ ] Create link with custom slug "my-promo"
- [ ] Access link at link.co/my-promo → redirects correctly
- [ ] Generate QR code → scan with phone → redirects
- [ ] Download QR code → opens PNG file
- [ ] Toggle bio link on → verify in database
- [ ] Copy link → paste in browser → works

---

## Phase 4: Multi-Product Links & Landing Pages (Week 4)

### Goal
Enable links with 2-10 products and beautiful landing pages.

### Tasks

#### Day 1: Database Migrations
- [ ] Create Migration 5: `CreateTrackingLinkProducts`
  - Create `tracking_link_products` junction table
  - Add indexes
  - Create TypeORM entity
- [ ] Create Migration 6: `AddProductIdToClicks`
  - Add `product_id` to clicks table
  - Add index
- [ ] Data Migration Script
  - Migrate existing single-product links
  - Create tracking_link_product entry for each
- [ ] Run migrations locally
- [ ] Test rollback

#### Day 2: Backend - Multi-Product Links
- [ ] Create TrackingLinkProduct Entity
  - Define relationships
  - Add display_order field
- [ ] Update TrackingLink Entity
  - Add `link_products` relationship (OneToMany)
  - Add `isMultiProduct()` method
  - Add `getProductIds()` method
- [ ] Update Click Entity
  - Add `product_id` field (nullable)
- [ ] Update TrackingService
  - `createAdvancedLink()` - support multiple products
  - `getLink()` - eager load link_products
  - `trackClick()` - accept optional productId
- [ ] Update ClickService
  - `trackClick()` - record product_id
  - `getClicksByProduct(linkId)` - analytics per product
- [ ] Update API Endpoints
  - `POST /v1/tracking/links/advanced` - accept product_ids[]
  - `GET /v1/track/c/:code/:productId?` - optional productId
  - `GET /v1/tracking/links/:id/analytics` - per-product breakdown
- [ ] Validation
  - Minimum 1 product, maximum 10 products
  - All products must exist and be ACTIVE
  - All products must belong to same brand
- [ ] Test
  - Create link with 5 products
  - Track click on product #3
  - Verify analytics show per-product clicks

#### Day 3: Backend - Public Landing Pages
- [ ] Create LandingPageController
  - `GET /v1/l/:code` - render landing page (HTML)
  - `GET /v1/l/:slug` - custom slug variant
  - No auth required
- [ ] Create LandingPageService
  - `renderLandingPage(link: TrackingLink): string` - generate HTML
  - Support light/dark theme
  - Inject config (title, description)
- [ ] Create Landing Page Template
  - Use EJS or Handlebars
  - Responsive design
  - Product grid layout
  - Click tracking on each product
- [ ] Add meta tags for social sharing
  - Open Graph tags
  - Twitter Cards
  - Preview image (first product image)
- [ ] Test
  - Visit /v1/l/abc123 → renders landing page
  - Visit /v1/l/my-custom-slug → renders landing page
  - Share on Twitter → preview shows
  - Click product → redirects + tracks

#### Day 4: Frontend - Multi-Product Selection
- [ ] Update `/influencer/links/create` Step 1
  - Multi-select products (checkboxes)
  - Show 1-10 validation
  - Drag-and-drop to reorder
  - Live count: "3 / 10 products selected"
- [ ] Create `<ProductMultiSelector>` component
  - Search/filter
  - Category filter
  - Select all / Deselect all
  - Sortable list (react-beautiful-dnd or dnd-kit)
- [ ] Update preview
  - Show all selected products
  - Preview landing page layout
- [ ] API Integration
  - Send `product_ids[]` in order
- [ ] Test
  - Select 5 products
  - Reorder via drag-and-drop
  - Verify order saved correctly

#### Day 5: Frontend - Link-in-Bio Page
- [ ] Create `/bio/:username` public page
  - No auth required
  - SSR or SSG for SEO
- [ ] Layout
  - Profile section:
    - Avatar (large, centered)
    - Display name
    - Bio
    - Social links (Instagram, TikTok, YouTube, Twitter)
  - Links section:
    - Grid of link cards
    - Each card: image, title, description
    - Click → opens link
- [ ] Create `<BioLinkCard>` component
  - Product image background
  - Title overlay
  - Hover effect
  - Click tracking
- [ ] API Integration
  - `GET /v1/influencers/username/:username/bio` - public endpoint
  - Returns influencer + bio_links
- [ ] SEO
  - Dynamic meta tags
  - og:image for sharing
  - Structured data (JSON-LD)
- [ ] Test
  - Visit /bio/johndoe
  - See all bio links
  - Click link → redirects + tracks
  - Share on social media → preview shows

### Deliverables
- ✅ Multi-product links backend complete
- ✅ Landing pages working
- ✅ Link-in-Bio page live
- ✅ Product-level analytics
- ✅ All UI components complete

### Testing Checklist
- [ ] Create link with 10 products
- [ ] Reorder products via drag-and-drop
- [ ] Visit landing page → see all 10 products
- [ ] Click product #5 → redirects to brand site
- [ ] Analytics show product #5 got 1 click
- [ ] Toggle bio link on
- [ ] Visit /bio/username → see link in grid
- [ ] Click bio link → opens landing page
- [ ] Mobile responsive on all screen sizes

---

## Phase 5: Polish & Launch (Bonus)

### Goal
Final touches, testing, and production deployment.

### Tasks

#### Final Testing
- [ ] End-to-end testing
  - Brand creates SPECIFIC campaign
  - Invites 10 influencers
  - Influencers accept invitations
  - Influencers create multi-product links with custom slugs
  - Links generate QR codes
  - Links added to bio
  - Customers click and convert
  - Analytics show per-product breakdown
- [ ] Performance testing
  - Load test landing pages (100+ concurrent)
  - Optimize images (Cloudinary transformations)
  - Add caching headers
- [ ] Security review
  - SQL injection prevention (TypeORM parameterized queries)
  - XSS prevention (React auto-escaping)
  - CSRF protection (cookies)
  - Rate limiting on slug checker
- [ ] Mobile testing
  - Test on iPhone (Safari)
  - Test on Android (Chrome)
  - Test on tablet
  - Fix responsive issues

#### Production Deployment
- [ ] Backend (Render)
  - Run all 6 migrations
  - Update environment variables
  - Deploy new backend
  - Monitor logs
- [ ] Frontend (Vercel)
  - Add new routes
  - Update environment variables
  - Deploy frontend
  - Test live site
- [ ] Database (Supabase)
  - Backup before migrations
  - Run migrations on production
  - Verify data integrity
- [ ] Monitoring
  - Set up error tracking (Sentry)
  - Set up analytics (PostHog / Mixpanel)
  - Create dashboards

#### Documentation
- [ ] Update API_DOCUMENTATION.md
  - Document all new endpoints
  - Add request/response examples
  - Update Postman collection
- [ ] Update USER_GUIDE.md
  - How to create SPECIFIC campaigns
  - How to respond to invitations
  - How to create custom slug links
  - How to set up Link-in-Bio
- [ ] Create CHANGELOG.md
  - V2.0.0 release notes
  - Breaking changes (if any)
  - Migration guide

### Deliverables
- ✅ All features tested end-to-end
- ✅ Production deployment complete
- ✅ Documentation updated
- ✅ V2 launched

---

## Dependencies & Prerequisites

### Technical Dependencies
```json
{
  "backend": {
    "qrcode": "^1.5.3",
    "@types/qrcode": "^1.5.5",
    "ejs": "^3.1.9" // or handlebars for landing pages
  },
  "frontend": {
    "react-beautiful-dnd": "^13.1.1", // or @dnd-kit/core
    "@headlessui/react": "^1.7.17", // for modals, tabs
    "react-qr-code": "^2.0.12" // QR code preview
  }
}
```

### Environment Variables
```bash
# Backend .env
SHORT_URL_BASE=https://link.co  # or your custom domain
PUBLIC_BIO_BASE=https://influencer-platform-web.vercel.app/bio

# Frontend .env
NEXT_PUBLIC_BIO_BASE=/bio
```

### NPM Scripts
```json
{
  "scripts": {
    "migration:generate": "npm run typeorm migration:generate",
    "migration:run": "npm run typeorm migration:run",
    "migration:revert": "npm run typeorm migration:revert",
    "data:migrate-links": "ts-node migration-scripts/migrate-tracking-links.ts"
  }
}
```

---

## Risk Mitigation

### Technical Risks
1. **Custom slug conflicts**
   - Mitigation: Unique index, real-time checking, suggestions
2. **QR code generation slow**
   - Mitigation: Background job queue (Bull), cache generated QR codes
3. **Landing page performance**
   - Mitigation: SSR/SSG, CDN caching, image optimization
4. **Multi-product link complexity**
   - Mitigation: Limit to 10 products, clear UI/UX

### User Experience Risks
1. **Slug availability confusion**
   - Mitigation: Clear messaging, instant feedback, helpful suggestions
2. **Too many products selected**
   - Mitigation: Visual feedback, max 10 limit, drag-and-drop ordering
3. **Invitation spam**
   - Mitigation: Limit invitations per campaign, notification settings

---

## Success Metrics

### Technical Metrics
- [ ] All 6 migrations deploy successfully (0 rollbacks)
- [ ] API response time < 200ms (p95)
- [ ] Landing page load time < 2s (p95)
- [ ] 0 critical bugs in production

### Business Metrics
- [ ] 50% of new campaigns are SPECIFIC
- [ ] 80% invitation acceptance rate
- [ ] 70% of influencers use custom slugs
- [ ] 50% of links are multi-product
- [ ] 40% of influencers enable Link-in-Bio
- [ ] 100 QR code downloads in first week

### User Satisfaction
- [ ] 4.5+ star rating on features (NPS survey)
- [ ] < 5% support tickets related to V2 features
- [ ] Positive feedback from beta testers

---

## Rollback Plan

If critical issues arise after V2 launch:

### Immediate Actions
1. Revert frontend deployment (Vercel)
2. Disable new endpoints via feature flag
3. Investigate root cause

### Database Rollback
```bash
# Rollback all 6 migrations in reverse order
npm run migration:revert  # AddProductIdToClicks
npm run migration:revert  # CreateTrackingLinkProducts
npm run migration:revert  # AddAdvancedLinkFeatures
npm run migration:revert  # AddBrandDisplayName
npm run migration:revert  # CreateCampaignInvitations
npm run migration:revert  # AddCampaignType
```

### Data Preservation
- Campaign invitations: Export to CSV before rollback
- Custom slugs: Map to old unique_codes
- Multi-product links: Fallback to first product
- Bio links: Disable temporarily

---

## Next Steps After V2

### V3 Features (Future)
- **Link Analytics Dashboard**: Detailed click heatmaps, geo-distribution
- **A/B Testing**: Test different landing page designs
- **Link Expiration**: Time-limited links (flash sales)
- **Password-Protected Links**: Exclusive access links
- **Link Scheduling**: Auto-activate/deactivate links
- **Branded Short Domains**: Custom domain for links (e.g., brand.co/slug)
- **Landing Page Builder**: Drag-and-drop page customization
- **Product Recommendations**: AI-suggested products for links

---

## Contact & Support

**Questions?** Contact the development team:
- Email: dev@influencer-platform.com
- Slack: #v2-features
- Docs: See FEATURE_PLAN_V2.md for details

---

**End of V2 Implementation Roadmap**
