# Database Schema V2 - New Features

**Created**: February 26, 2026
**Status**: Planning Phase
**Related**: FEATURE_PLAN_V2.md

---

## Overview

This document outlines database schema changes for V2 features:
1. Campaign Types (Open vs. Specific)
2. Brand Display Name
3. Advanced Link Creation (custom slugs, multi-product, QR codes)

---

## Migration 1: Campaign Types

### Add `campaign_type` to campaigns table

```sql
-- Add campaign_type column
ALTER TABLE campaigns
  ADD COLUMN campaign_type VARCHAR(20) DEFAULT 'OPEN'
  CHECK (campaign_type IN ('OPEN', 'SPECIFIC'));

-- Update existing campaigns to OPEN
UPDATE campaigns SET campaign_type = 'OPEN' WHERE campaign_type IS NULL;

COMMENT ON COLUMN campaigns.campaign_type IS 'OPEN = visible to all, SPECIFIC = invitation only';
```

**TypeORM Migration:**
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCampaignType1709000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE campaigns
      ADD COLUMN campaign_type VARCHAR(20) DEFAULT 'OPEN'
      CHECK (campaign_type IN ('OPEN', 'SPECIFIC'))
    `);

    await queryRunner.query(`
      UPDATE campaigns SET campaign_type = 'OPEN' WHERE campaign_type IS NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN campaigns.campaign_type IS 'OPEN = visible to all, SPECIFIC = invitation only'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE campaigns DROP COLUMN campaign_type`);
  }
}
```

---

## Migration 2: Campaign Invitations

### Create `campaign_invitations` table

```sql
CREATE TABLE campaign_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campaign_id, influencer_id)
);

CREATE INDEX idx_campaign_invitations_campaign ON campaign_invitations(campaign_id);
CREATE INDEX idx_campaign_invitations_influencer ON campaign_invitations(influencer_id);
CREATE INDEX idx_campaign_invitations_status ON campaign_invitations(status);
CREATE INDEX idx_campaign_invitations_pending ON campaign_invitations(influencer_id, status) WHERE status = 'PENDING';

COMMENT ON TABLE campaign_invitations IS 'Tracks invitations for SPECIFIC campaigns';
COMMENT ON COLUMN campaign_invitations.status IS 'PENDING = waiting for response, ACCEPTED = can create links, DECLINED = rejected invitation';
```

**TypeORM Entity:**
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Campaign } from '../campaigns/campaign.entity';
import { Influencer } from '../influencers/influencer.entity';

@Entity('campaign_invitations')
@Unique(['campaign_id', 'influencer_id'])
export class CampaignInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  campaign_id: string;

  @Column()
  influencer_id: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDING'
  })
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';

  @CreateDateColumn()
  invited_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  responded_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Campaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @ManyToOne(() => Influencer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'influencer_id' })
  influencer: Influencer;
}
```

**TypeORM Migration:**
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCampaignInvitations1709100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE campaign_invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(campaign_id, influencer_id)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_campaign_invitations_campaign ON campaign_invitations(campaign_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_campaign_invitations_influencer ON campaign_invitations(influencer_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_campaign_invitations_status ON campaign_invitations(status)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_campaign_invitations_pending ON campaign_invitations(influencer_id, status) WHERE status = 'PENDING'
    `);

    await queryRunner.query(`
      COMMENT ON TABLE campaign_invitations IS 'Tracks invitations for SPECIFIC campaigns'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS campaign_invitations CASCADE`);
  }
}
```

---

## Migration 3: Brand Display Name

### Add `display_name` to brands table

```sql
-- Add display_name column (nullable initially)
ALTER TABLE brands
  ADD COLUMN display_name VARCHAR(255);

-- For existing brands, copy company_name to display_name
UPDATE brands
  SET display_name = company_name
  WHERE display_name IS NULL;

COMMENT ON COLUMN brands.display_name IS 'Public-facing brand name, falls back to company_name if not set';
```

**TypeORM Migration:**
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBrandDisplayName1709200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE brands
      ADD COLUMN display_name VARCHAR(255)
    `);

    // Backfill existing brands
    await queryRunner.query(`
      UPDATE brands
      SET display_name = company_name
      WHERE display_name IS NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN brands.display_name IS 'Public-facing brand name, falls back to company_name if not set'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE brands DROP COLUMN display_name`);
  }
}
```

**Updated Brand Entity:**
```typescript
@Entity('brands')
export class Brand {
  // ... existing fields

  @Column({ nullable: true })
  display_name?: string;

  // Virtual getter for public name
  getPublicName(): string {
    return this.display_name || this.company_name;
  }
}
```

---

## Migration 4: Advanced Tracking Links

### Add custom slug, QR code, and landing page config

```sql
-- Add new columns to tracking_links
ALTER TABLE tracking_links
  ADD COLUMN custom_slug VARCHAR(100) UNIQUE,
  ADD COLUMN is_bio_link BOOLEAN DEFAULT FALSE,
  ADD COLUMN qr_code_url VARCHAR(500),
  ADD COLUMN landing_page_config JSONB DEFAULT '{}';

-- Indexes
CREATE UNIQUE INDEX idx_tracking_links_custom_slug ON tracking_links(custom_slug) WHERE custom_slug IS NOT NULL;
CREATE INDEX idx_tracking_links_bio_links ON tracking_links(influencer_id, is_bio_link) WHERE is_bio_link = TRUE;

COMMENT ON COLUMN tracking_links.custom_slug IS 'Custom short URL slug (e.g., "my-link" for link.co/my-link)';
COMMENT ON COLUMN tracking_links.is_bio_link IS 'Whether this link appears in Link-in-Bio page';
COMMENT ON COLUMN tracking_links.qr_code_url IS 'Cloudinary URL of generated QR code';
COMMENT ON COLUMN tracking_links.landing_page_config IS 'JSON config for landing page appearance (title, description, theme)';
```

**Example `landing_page_config` JSON:**
```json
{
  "title": "Check out my favorite products!",
  "description": "I personally use and love these amazing items",
  "theme": "light",
  "color": "#FF5733"
}
```

**TypeORM Migration:**
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdvancedLinkFeatures1709300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tracking_links
      ADD COLUMN custom_slug VARCHAR(100),
      ADD COLUMN is_bio_link BOOLEAN DEFAULT FALSE,
      ADD COLUMN qr_code_url VARCHAR(500),
      ADD COLUMN landing_page_config JSONB DEFAULT '{}'
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_tracking_links_custom_slug
      ON tracking_links(custom_slug)
      WHERE custom_slug IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX idx_tracking_links_bio_links
      ON tracking_links(influencer_id, is_bio_link)
      WHERE is_bio_link = TRUE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tracking_links_custom_slug`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tracking_links_bio_links`);

    await queryRunner.query(`
      ALTER TABLE tracking_links
      DROP COLUMN custom_slug,
      DROP COLUMN is_bio_link,
      DROP COLUMN qr_code_url,
      DROP COLUMN landing_page_config
    `);
  }
}
```

**Updated TrackingLink Entity:**
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
    title?: string;
    description?: string;
    theme?: 'light' | 'dark';
    color?: string;
  };

  // Method to get the public URL
  getPublicUrl(baseUrl: string): string {
    if (this.custom_slug) {
      return `${baseUrl}/${this.custom_slug}`;
    }
    return `${baseUrl}/${this.unique_code}`;
  }
}
```

---

## Migration 5: Multi-Product Links

### Create `tracking_link_products` junction table

```sql
CREATE TABLE tracking_link_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_link_id UUID NOT NULL REFERENCES tracking_links(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tracking_link_id, product_id)
);

CREATE INDEX idx_tracking_link_products_link ON tracking_link_products(tracking_link_id, display_order);
CREATE INDEX idx_tracking_link_products_product ON tracking_link_products(product_id);

COMMENT ON TABLE tracking_link_products IS 'Junction table for multi-product tracking links (2-10 products per link)';
COMMENT ON COLUMN tracking_link_products.display_order IS 'Order in which products appear on landing page (0-indexed)';
```

**TypeORM Entity:**
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { TrackingLink } from './tracking-link.entity';
import { Product } from '../products/product.entity';

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

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => TrackingLink, link => link.link_products, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'tracking_link_id' })
  tracking_link: TrackingLink;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
```

**TypeORM Migration:**
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrackingLinkProducts1709400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE tracking_link_products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tracking_link_id UUID NOT NULL REFERENCES tracking_links(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tracking_link_id, product_id)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_tracking_link_products_link
      ON tracking_link_products(tracking_link_id, display_order)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_tracking_link_products_product
      ON tracking_link_products(product_id)
    `);

    await queryRunner.query(`
      COMMENT ON TABLE tracking_link_products IS 'Junction table for multi-product tracking links (2-10 products per link)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tracking_link_products CASCADE`);
  }
}
```

**Updated TrackingLink Entity (with relationship):**
```typescript
@Entity('tracking_links')
export class TrackingLink {
  // ... existing fields

  @OneToMany(() => TrackingLinkProduct, tlp => tlp.tracking_link, {
    cascade: true,
    eager: true
  })
  link_products: TrackingLinkProduct[];

  // Helper to check if multi-product
  isMultiProduct(): boolean {
    return this.link_products && this.link_products.length > 1;
  }

  // Get all product IDs
  getProductIds(): string[] {
    return this.link_products
      .sort((a, b) => a.display_order - b.display_order)
      .map(lp => lp.product_id);
  }
}
```

---

## Migration 6: Track Product Clicks

### Add `product_id` to clicks table

```sql
-- Add product_id column to track which product was clicked in multi-product links
ALTER TABLE clicks
  ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL;

CREATE INDEX idx_clicks_product ON clicks(product_id);

COMMENT ON COLUMN clicks.product_id IS 'For multi-product links, tracks which specific product was clicked';
```

**TypeORM Migration:**
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductIdToClicks1709500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE clicks
      ADD COLUMN product_id UUID REFERENCES products(id) ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX idx_clicks_product ON clicks(product_id)
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN clicks.product_id IS 'For multi-product links, tracks which specific product was clicked'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_clicks_product`);
    await queryRunner.query(`ALTER TABLE clicks DROP COLUMN product_id`);
  }
}
```

**Updated Click Entity:**
```typescript
@Entity('clicks')
export class Click {
  // ... existing fields

  @Column({ nullable: true })
  product_id?: string;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product?: Product;
}
```

---

## Migration Execution Order

Run migrations in this exact order:

```bash
# 1. Campaign type
npm run migration:run -- -n AddCampaignType

# 2. Campaign invitations
npm run migration:run -- -n CreateCampaignInvitations

# 3. Brand display name
npm run migration:run -- -n AddBrandDisplayName

# 4. Advanced link features
npm run migration:run -- -n AddAdvancedLinkFeatures

# 5. Multi-product junction table
npm run migration:run -- -n CreateTrackingLinkProducts

# 6. Product clicks tracking
npm run migration:run -- -n AddProductIdToClicks
```

---

## Data Migration Scripts

### Migrate existing tracking_links to use link_products

After creating `tracking_link_products` table, migrate existing single-product links:

```typescript
// migration-scripts/migrate-tracking-links.ts
import { AppDataSource } from '../src/database/data-source';
import { TrackingLink } from '../src/modules/tracking/tracking-link.entity';
import { TrackingLinkProduct } from '../src/modules/tracking/tracking-link-product.entity';

async function migrateTrackingLinks() {
  await AppDataSource.initialize();

  const trackingLinks = await AppDataSource
    .getRepository(TrackingLink)
    .find();

  for (const link of trackingLinks) {
    // Create tracking_link_product entry for existing product_id
    await AppDataSource
      .getRepository(TrackingLinkProduct)
      .save({
        tracking_link_id: link.id,
        product_id: link.product_id,
        display_order: 0
      });
  }

  console.log(`Migrated ${trackingLinks.length} tracking links`);
  await AppDataSource.destroy();
}

migrateTrackingLinks();
```

---

## Updated ERD

```
┌─────────┐       ┌─────────┐       ┌──────────┐       ┌─────────────┐
│  users  │───┬───│ brands  │───────│ products │───────│ campaigns   │
└─────────┘   │   └─────────┘       └──────────┘       └─────────────┘
              │   display_name              │                  │
              │   company_name              │           campaign_type
              │                             │                  │
              │   ┌─────────────┐           │                  │
              └───│ influencers │           │                  │
                  └─────────────┘           │                  │
                        │                   │                  │
                        │ ┌─────────────────┴──────────────────┘
                        │ │                 campaign_invitations
                        │ │
                  ┌─────▼─▼────────────────────┐
                  │    tracking_links          │
                  │  - custom_slug             │
                  │  - is_bio_link             │
                  │  - qr_code_url             │
                  │  - landing_page_config     │
                  └────────┬───────────────────┘
                           │
                  ┌────────┴────────────┐
                  │                     │
            ┌─────▼───────┐   ┌────────▼────────────┐
            │   clicks    │   │ tracking_link_      │
            │ + product_id│   │    products         │
            └─────────────┘   │ (junction table)    │
                              └─────────────────────┘
                                        │
                                  ┌─────▼──────┐
                                  │  products  │
                                  └────────────┘
```

---

## Query Examples

### Get all bio links for an influencer

```sql
SELECT
  tl.*,
  json_agg(
    json_build_object(
      'product_id', p.id,
      'product_name', p.name,
      'price', p.price,
      'image_url', p.image_urls[1]
    ) ORDER BY tlp.display_order
  ) AS products
FROM tracking_links tl
LEFT JOIN tracking_link_products tlp ON tl.id = tlp.tracking_link_id
LEFT JOIN products p ON tlp.product_id = p.id
WHERE tl.influencer_id = $1
  AND tl.is_bio_link = TRUE
GROUP BY tl.id
ORDER BY tl.created_at DESC;
```

### Get pending campaign invitations for influencer

```sql
SELECT
  ci.*,
  c.name AS campaign_name,
  c.commission_rate,
  b.display_name AS brand_name
FROM campaign_invitations ci
JOIN campaigns c ON ci.campaign_id = c.id
JOIN brands b ON c.brand_id = b.id
WHERE ci.influencer_id = $1
  AND ci.status = 'PENDING'
ORDER BY ci.invited_at DESC;
```

### Get product-level analytics for multi-product link

```sql
SELECT
  p.id,
  p.name,
  COUNT(c.id) AS clicks,
  COUNT(DISTINCT c.ip_address) AS unique_clicks
FROM tracking_link_products tlp
JOIN products p ON tlp.product_id = p.id
LEFT JOIN clicks c ON c.tracking_link_id = tlp.tracking_link_id
  AND c.product_id = p.id
WHERE tlp.tracking_link_id = $1
GROUP BY p.id, p.name, tlp.display_order
ORDER BY tlp.display_order;
```

---

## Performance Considerations

### Indexes
- ✅ `custom_slug` has unique index (partial, only when NOT NULL)
- ✅ `is_bio_link` has filtered index (only TRUE values)
- ✅ `campaign_invitations` has compound index on `(influencer_id, status)` for pending invitations
- ✅ `tracking_link_products` ordered by `display_order`

### Query Optimization
- Use `eager: true` on `link_products` relationship to avoid N+1 queries
- Consider materialized view for Link-in-Bio pages (if they become very popular)
- Add Redis caching for slug availability checks (high frequency)

---

## Rollback Plan

If issues arise, migrations can be rolled back in reverse order:

```bash
# Rollback all V2 migrations
npm run migration:revert  # AddProductIdToClicks
npm run migration:revert  # CreateTrackingLinkProducts
npm run migration:revert  # AddAdvancedLinkFeatures
npm run migration:revert  # AddBrandDisplayName
npm run migration:revert  # CreateCampaignInvitations
npm run migration:revert  # AddCampaignType
```

---

**End of Database Schema V2**
