# Feature Plan V2: Campaign Types & Advanced Link Creation

**Created**: February 26, 2026
**Status**: Planning Phase
**Priority**: High

---

## Overview

This document outlines the next major features for the influencer platform:
1. **Campaign Types** (Open vs. Specific)
2. **Brand Display Name** (separate from profile/company name)
3. **Advanced Link Creation** (custom slugs, QR codes, multi-product links)

---

## Feature 1: Campaign Types (Open vs. Specific)

### Business Requirements

**Open Campaigns**
- Visible to ALL influencers on the platform
- Any influencer can browse and join
- Brand doesn't need to pre-approve influencers
- Great for product launches, seasonal promotions

**Specific/Closed Campaigns**
- Only visible to assigned/invited influencers
- Brand manually selects influencers
- Influencers receive invitation notifications
- Great for exclusive partnerships, targeted promotions

### Database Schema Changes

**Update `campaigns` table:**
```sql
ALTER TABLE campaigns
  ADD COLUMN campaign_type VARCHAR(20) DEFAULT 'OPEN'
  CHECK (campaign_type IN ('OPEN', 'SPECIFIC'));

CREATE TABLE campaign_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  UNIQUE(campaign_id, influencer_id)
);

CREATE INDEX idx_campaign_invitations_campaign ON campaign_invitations(campaign_id);
CREATE INDEX idx_campaign_invitations_influencer ON campaign_invitations(influencer_id);
CREATE INDEX idx_campaign_invitations_status ON campaign_invitations(status);
```

**TypeORM Entity:**
```typescript
@Entity('campaign_invitations')
@Unique(['campaign_id', 'influencer_id'])
export class CampaignInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  campaign_id: string;

  @Column()
  influencer_id: string;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';

  @CreateDateColumn()
  invited_at: Date;

  @Column({ nullable: true })
  responded_at?: Date;

  @ManyToOne(() => Campaign)
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @ManyToOne(() => Influencer)
  @JoinColumn({ name: 'influencer_id' })
  influencer: Influencer;
}
```

### Backend API Endpoints

**Brand Endpoints:**
```typescript
// Create campaign with type
POST /v1/campaigns
Body: {
  name: string;
  campaign_type: 'OPEN' | 'SPECIFIC';
  commission_rate: number;
  ...
}

// Invite influencers to specific campaign
POST /v1/campaigns/:id/invite
Body: {
  influencer_ids: string[];  // Array of influencer IDs
}

// Get campaign invitations
GET /v1/campaigns/:id/invitations
Response: {
  pending: CampaignInvitation[];
  accepted: CampaignInvitation[];
  declined: CampaignInvitation[];
}

// Remove influencer from campaign
DELETE /v1/campaigns/:id/invitations/:influencerId
```

**Influencer Endpoints:**
```typescript
// Browse available campaigns (OPEN + invited SPECIFIC)
GET /v1/campaigns/available
Query: ?page=1&limit=20&type=OPEN|SPECIFIC
Response: {
  campaigns: Campaign[];
  invitations: CampaignInvitation[];  // Pending invitations
}

// Respond to campaign invitation
POST /v1/campaigns/invitations/:id/respond
Body: {
  action: 'ACCEPT' | 'DECLINE';
}

// Get my invitations
GET /v1/campaigns/invitations
Query: ?status=PENDING|ACCEPTED|DECLINED
```

### Frontend UI Changes

**Brand Portal - Create Campaign (`/brand/campaigns/new`)**
```tsx
// Add campaign type selector
<RadioGroup>
  <Radio value="OPEN">
    Open Campaign
    <p>Visible to all influencers</p>
  </Radio>
  <Radio value="SPECIFIC">
    Specific Campaign
    <p>Only invited influencers can see and join</p>
  </Radio>
</RadioGroup>

// If SPECIFIC, show influencer selector
{campaignType === 'SPECIFIC' && (
  <InfluencerSelector
    onSelect={(ids) => setSelectedInfluencers(ids)}
  />
)}
```

**Brand Portal - Campaign Detail (`/brand/campaigns/[id]`)**
```tsx
// For SPECIFIC campaigns, show invitation management
<Card title="Invited Influencers">
  <Button onClick={openInviteModal}>+ Invite More</Button>

  <Table>
    <Column>Influencer</Column>
    <Column>Status</Column>
    <Column>Invited At</Column>
    <Column>Actions</Column>
  </Table>
</Card>
```

**Influencer Portal - Campaigns (`/influencer/campaigns`)**
```tsx
// Tabs for campaign types
<Tabs>
  <Tab name="Available">
    {/* OPEN campaigns + accepted SPECIFIC */}
  </Tab>
  <Tab name="Invitations" badge={pendingCount}>
    {/* Pending invitations with Accept/Decline */}
  </Tab>
  <Tab name="Joined">
    {/* Campaigns already joined */}
  </Tab>
</Tabs>
```

---

## Feature 2: Brand Display Name

### Business Requirements

- Brands should have a **display name** separate from `company_name`
- Display name is shown publicly to influencers
- If no display name is set, fallback to `company_name`
- Useful for brands with long legal names but short marketing names
  - Example: `company_name`: "Tech Innovations LLC"
  - Example: `display_name`: "TechInn"

### Database Schema Changes

```sql
ALTER TABLE brands
  ADD COLUMN display_name VARCHAR(255);

-- For existing brands, set display_name = company_name
UPDATE brands SET display_name = company_name WHERE display_name IS NULL;
```

### Backend Changes

**Brand Entity Update:**
```typescript
@Entity('brands')
export class Brand {
  // ... existing fields

  @Column({ nullable: true })
  display_name?: string;

  // Getter for public name
  getPublicName(): string {
    return this.display_name || this.company_name;
  }
}
```

**Brand DTOs:**
```typescript
export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  display_name?: string;

  // ... other fields
}

export class BrandPublicDto {
  id: string;
  name: string;  // Uses getPublicName()
  logo_url?: string;
  description?: string;
}
```

### Frontend UI Changes

**Brand Settings (`/brand/settings`)**
```tsx
<Form>
  <Input
    label="Company Name"
    name="company_name"
    required
    description="Your legal business name"
  />

  <Input
    label="Display Name (Optional)"
    name="display_name"
    placeholder="Leave empty to use company name"
    description="Public-facing brand name shown to influencers"
  />
</Form>
```

**Everywhere brands are displayed:**
- Use `brand.display_name || brand.company_name`
- Update all campaign lists, product cards, etc.

---

## Feature 3: Advanced Link Creation

### Business Requirements

**Custom Slug with Availability Checker**
- Influencers can create custom short URLs: `link.co/custom-name`
- Real-time availability check (green checkmark if available)
- Auto-suggest alternatives if taken
- Slug validation (alphanumeric, hyphens only)

**QR Code Preview**
- Automatically generate QR code for each link
- Preview QR code before saving
- Download QR code as PNG/SVG
- Useful for physical marketing (flyers, posters)

**Add to Link-in-Bio Toggle**
- Mark links for inclusion in Link-in-Bio page
- Link-in-Bio page: `/bio/:username` shows all marked links
- Great for Instagram bio linking

**Multi-Product Links**
- Create one link that promotes 2-10 products
- Landing page shows all products in a beautiful grid
- Track which products get most clicks
- Perfect for collection promotions

**Link Appearance Preview**
- Live preview of landing page
- Shows how link will look to visitors
- Customizable theme/colors (future)

**Copy Link Button**
- One-click copy to clipboard
- Shows confirmation toast
- Copy variations: short URL, full URL, QR code link

### Database Schema Changes

```sql
-- Update tracking_links to support custom slugs and multi-product
ALTER TABLE tracking_links
  ADD COLUMN custom_slug VARCHAR(100) UNIQUE,
  ADD COLUMN is_bio_link BOOLEAN DEFAULT FALSE,
  ADD COLUMN qr_code_url VARCHAR(500),
  ADD COLUMN landing_page_config JSONB DEFAULT '{}';

-- Create junction table for multi-product links
CREATE TABLE tracking_link_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_link_id UUID NOT NULL REFERENCES tracking_links(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tracking_link_id, product_id)
);

CREATE INDEX idx_tracking_link_products_link ON tracking_link_products(tracking_link_id);
CREATE INDEX idx_tracking_link_products_product ON tracking_link_products(product_id);

-- Clicks table: add product_id to track which product in multi-product link
ALTER TABLE clicks
  ADD COLUMN product_id UUID REFERENCES products(id);

CREATE INDEX idx_clicks_product ON clicks(product_id);
```

**TypeORM Entities:**
```typescript
@Entity('tracking_links')
export class TrackingLink {
  // ... existing fields

  @Column({ unique: true, nullable: true })
  custom_slug?: string;

  @Column({ default: false })
  is_bio_link: boolean;

  @Column({ nullable: true })
  qr_code_url?: string;

  @Column({ type: 'jsonb', default: {} })
  landing_page_config: {
    theme?: 'light' | 'dark';
    color?: string;
    title?: string;
    description?: string;
  };

  @OneToMany(() => TrackingLinkProduct, tlp => tlp.tracking_link)
  link_products: TrackingLinkProduct[];
}

@Entity('tracking_link_products')
@Unique(['tracking_link_id', 'product_id'])
export class TrackingLinkProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tracking_link_id: string;

  @Column()
  product_id: string;

  @Column({ default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => TrackingLink, link => link.link_products)
  @JoinColumn({ name: 'tracking_link_id' })
  tracking_link: TrackingLink;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

@Entity('clicks')
export class Click {
  // ... existing fields

  @Column({ nullable: true })
  product_id?: string;  // For multi-product links

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product?: Product;
}
```

### Backend API Endpoints

```typescript
// Check custom slug availability
GET /v1/tracking/slugs/check/:slug
Response: {
  available: boolean;
  suggestions?: string[];  // If not available
}

// Create advanced tracking link
POST /v1/tracking/links/advanced
Body: {
  product_ids: string[];  // 1-10 products
  custom_slug?: string;
  is_bio_link?: boolean;
  landing_page_config?: {
    title?: string;
    description?: string;
    theme?: 'light' | 'dark';
  };
}
Response: {
  link: TrackingLink;
  url: string;  // e.g., link.co/my-custom-slug
  qr_code_url: string;
}

// Generate QR code for existing link
POST /v1/tracking/links/:id/qr-code
Response: {
  qr_code_url: string;  // Cloudinary URL
  qr_code_svg: string;  // Inline SVG data
}

// Get bio links for influencer
GET /v1/tracking/links/bio
Response: {
  links: TrackingLink[];
}

// Update bio link status
PATCH /v1/tracking/links/:id/bio
Body: {
  is_bio_link: boolean;
}

// Public landing page (no auth required)
GET /v1/l/:code  // Original code-based
GET /v1/l/:slug  // Custom slug
Response: HTML landing page with products

// Track click on multi-product landing page
GET /v1/track/c/:code/:productId  // Click specific product
```

### Frontend UI - Advanced Link Creator

**New Page: `/influencer/links/create`**

```tsx
export default function CreateAdvancedLink() {
  const [step, setStep] = useState(1); // Multi-step wizard
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [customSlug, setCustomSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [isBioLink, setIsBioLink] = useState(false);
  const [preview, setPreview] = useState(null);

  return (
    <TwoColumnLayout>
      {/* LEFT COLUMN - Form */}
      <div>
        {step === 1 && (
          <ProductSelector
            min={1}
            max={10}
            selected={selectedProducts}
            onChange={setSelectedProducts}
          />
        )}

        {step === 2 && (
          <div>
            <h3>Customize Your Link</h3>

            {/* Custom Slug Input */}
            <div>
              <Label>Custom URL (Optional)</Label>
              <InputGroup>
                <span>link.co/</span>
                <Input
                  value={customSlug}
                  onChange={(e) => {
                    setCustomSlug(e.target.value);
                    checkSlugAvailability(e.target.value);
                  }}
                  placeholder="my-custom-name"
                />
                {slugAvailable === true && <CheckIcon color="green" />}
                {slugAvailable === false && <XIcon color="red" />}
              </InputGroup>
              {slugAvailable === false && (
                <SuggestionList suggestions={suggestions} />
              )}
            </div>

            {/* Link-in-Bio Toggle */}
            <Toggle
              label="Add to Link-in-Bio"
              checked={isBioLink}
              onChange={setIsBioLink}
            />

            {/* Landing Page Customization */}
            <Input
              label="Link Title"
              placeholder="Check out my favorite products!"
            />
            <Textarea
              label="Description"
              placeholder="I personally use and love these..."
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <h3>Your Link is Ready!</h3>

            {/* Copy Link */}
            <CopyButton text={generatedUrl} />

            {/* Share Options */}
            <ShareButtons url={generatedUrl} />
          </div>
        )}

        <Button onClick={() => setStep(step + 1)}>
          {step < 3 ? 'Continue' : 'Create Link'}
        </Button>
      </div>

      {/* RIGHT COLUMN - Preview & QR Code */}
      <div>
        {step >= 2 && (
          <>
            {/* Landing Page Preview */}
            <Card title="Preview">
              <MiniLandingPage
                products={selectedProducts}
                title={landingConfig.title}
                description={landingConfig.description}
              />
            </Card>

            {/* QR Code Preview */}
            <Card title="QR Code">
              <QRCodePreview url={generatedUrl} />
              <Button variant="outline">Download QR Code</Button>
            </Card>
          </>
        )}
      </div>
    </TwoColumnLayout>
  );
}
```

**Updated Link List (`/influencer/tracking-links`)**

```tsx
<Table>
  <Column>Link</Column>
  <Column>Products</Column>
  <Column>Clicks</Column>
  <Column>QR Code</Column>
  <Column>Actions</Column>
</Table>

<Row>
  <Cell>
    {link.custom_slug ? (
      <code>link.co/{link.custom_slug}</code>
    ) : (
      <code>{link.unique_code}</code>
    )}
    {link.is_bio_link && <Badge>In Bio</Badge>}
  </Cell>

  <Cell>
    {link.link_products.length > 1 ? (
      <AvatarGroup products={link.link_products} />
    ) : (
      link.product.name
    )}
  </Cell>

  <Cell>{link.clicks}</Cell>

  <Cell>
    <QRCodeIcon onClick={() => showQRModal(link)} />
  </Cell>

  <Cell>
    <CopyButton url={link.url} />
    <EditButton onClick={() => editLink(link)} />
  </Cell>
</Row>
```

**Public Link-in-Bio Page: `/bio/:username`**

```tsx
export default function LinkInBioPage({ username }: Props) {
  const { influencer, bioLinks } = useBioLinks(username);

  return (
    <PublicLayout>
      <Avatar src={influencer.avatar_url} size="xl" />
      <h1>{influencer.display_name}</h1>
      <p>{influencer.bio}</p>

      <SocialLinks
        instagram={influencer.social_instagram}
        tiktok={influencer.social_tiktok}
        youtube={influencer.social_youtube}
      />

      <LinkGrid>
        {bioLinks.map(link => (
          <LinkCard
            key={link.id}
            title={link.landing_page_config.title}
            description={link.landing_page_config.description}
            image={link.link_products[0]?.product.image_urls[0]}
            url={link.url}
            onClick={() => trackClick(link.id)}
          />
        ))}
      </LinkGrid>
    </PublicLayout>
  );
}
```

---

## Implementation Phases

### Phase 1: Campaign Types (Week 1)
- [ ] Database migration for `campaign_type` and `campaign_invitations`
- [ ] Backend API endpoints for invitations
- [ ] Brand portal UI for creating OPEN/SPECIFIC campaigns
- [ ] Brand portal UI for managing invitations
- [ ] Influencer portal UI for viewing invitations
- [ ] Notification system for invitations

### Phase 2: Brand Display Name (Week 1)
- [ ] Database migration for `display_name` column
- [ ] Backend DTO updates
- [ ] Brand settings UI
- [ ] Update all brand displays across platform

### Phase 3: Custom Slugs & Availability (Week 2)
- [ ] Database migration for `custom_slug`
- [ ] Slug availability checker endpoint
- [ ] Custom slug input with real-time validation
- [ ] Slug suggestion algorithm

### Phase 4: Multi-Product Links (Week 2-3)
- [ ] Database migration for `tracking_link_products`
- [ ] Backend API for multi-product link creation
- [ ] Product selector UI (2-10 products)
- [ ] Multi-product landing page
- [ ] Click tracking per product

### Phase 5: QR Codes & Link-in-Bio (Week 3)
- [ ] QR code generation service (using `qrcode` npm package)
- [ ] QR code storage (Cloudinary)
- [ ] QR code preview/download UI
- [ ] Link-in-Bio toggle
- [ ] Public Link-in-Bio page

### Phase 6: Landing Page Customization (Week 4)
- [ ] Landing page config (title, description, theme)
- [ ] Live preview component
- [ ] Public landing page template
- [ ] Theme support (light/dark)

### Phase 7: Copy & Share Features (Week 4)
- [ ] Copy to clipboard functionality
- [ ] Share buttons (Twitter, Facebook, LinkedIn)
- [ ] Short URL service integration (optional)

---

## Technical Considerations

### QR Code Generation
```typescript
import * as QRCode from 'qrcode';
import { v2 as cloudinary } from 'cloudinary';

async function generateQRCode(url: string): Promise<string> {
  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 1024,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(qrDataUrl, {
    folder: 'qr-codes',
    resource_type: 'image'
  });

  return result.secure_url;
}
```

### Slug Validation
```typescript
function validateSlug(slug: string): boolean {
  // Only lowercase letters, numbers, and hyphens
  const regex = /^[a-z0-9-]+$/;

  // Length: 3-50 characters
  if (slug.length < 3 || slug.length > 50) return false;

  // Cannot start/end with hyphen
  if (slug.startsWith('-') || slug.endsWith('-')) return false;

  // No consecutive hyphens
  if (slug.includes('--')) return false;

  return regex.test(slug);
}
```

### Slug Suggestions
```typescript
async function suggestSlugs(attempted: string): Promise<string[]> {
  const suggestions = [];

  // Try with numbers
  for (let i = 1; i <= 5; i++) {
    const slug = `${attempted}-${i}`;
    if (await isSlugAvailable(slug)) {
      suggestions.push(slug);
    }
  }

  // Try with influencer username
  const username = getCurrentUser().influencer.display_name
    .toLowerCase()
    .replace(/\s+/g, '-');
  suggestions.push(`${username}-${attempted}`);

  // Try with random suffix
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  suggestions.push(`${attempted}-${randomSuffix}`);

  return suggestions.slice(0, 3);
}
```

---

## Database Migration Order

1. **Migration 1**: Add `campaign_type` to campaigns
2. **Migration 2**: Create `campaign_invitations` table
3. **Migration 3**: Add `display_name` to brands
4. **Migration 4**: Add `custom_slug`, `is_bio_link`, `qr_code_url`, `landing_page_config` to tracking_links
5. **Migration 5**: Create `tracking_link_products` table
6. **Migration 6**: Add `product_id` to clicks table

---

## Testing Checklist

### Campaign Types
- [ ] Create OPEN campaign → visible to all influencers
- [ ] Create SPECIFIC campaign → only invited influencers can see
- [ ] Invite influencer → receives notification
- [ ] Influencer accepts → can create links
- [ ] Influencer declines → campaign disappears
- [ ] Remove invitation → influencer loses access

### Custom Slugs
- [ ] Create link with custom slug → slug is reserved
- [ ] Try duplicate slug → shows error + suggestions
- [ ] Invalid characters → shows validation error
- [ ] Slug too short/long → shows validation error
- [ ] Access link via custom slug → redirects correctly

### Multi-Product Links
- [ ] Create link with 2 products → landing page shows both
- [ ] Create link with 10 products → landing page shows all 10
- [ ] Click product A → tracking records product_id
- [ ] Click product B → separate tracking entry
- [ ] Analytics shows per-product breakdown

### QR Codes
- [ ] Generate QR code → uploads to Cloudinary
- [ ] Scan QR code → redirects to landing page
- [ ] Download QR code → downloads PNG file
- [ ] QR code for custom slug → works correctly

### Link-in-Bio
- [ ] Toggle bio link on → appears in /bio/:username
- [ ] Toggle bio link off → disappears from bio page
- [ ] Visit /bio/:username → shows all bio links
- [ ] Click bio link → tracks click
- [ ] Multiple products in bio link → landing page works

---

## Success Metrics

- [ ] 80% of influencers use custom slugs
- [ ] 60% of links are multi-product (2+ products)
- [ ] 40% of influencers enable Link-in-Bio
- [ ] QR code downloads: 100+ per week
- [ ] SPECIFIC campaigns have 2x higher conversion than OPEN
- [ ] Average 4 products per multi-product link

---

## Next Steps

1. Review and approve this plan
2. Create database migrations
3. Update technical architecture document
4. Begin Phase 1 implementation
5. Set up testing environment
6. Deploy to staging for testing

---

**End of Feature Plan V2**
