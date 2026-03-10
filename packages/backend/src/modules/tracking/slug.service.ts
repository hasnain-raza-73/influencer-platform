import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingLink } from './entities/tracking-link.entity';

@Injectable()
export class SlugService {
  private readonly RESERVED_SLUGS = [
    'admin',
    'api',
    'dashboard',
    'login',
    'logout',
    'register',
    'signup',
    'signin',
    'bio',
    'link',
    'links',
    'track',
    'redirect',
    'analytics',
    'settings',
    'profile',
    'help',
    'support',
    'contact',
    'about',
    'terms',
    'privacy',
    'qr',
    'preview',
  ];

  constructor(
    @InjectRepository(TrackingLink)
    private readonly trackingLinkRepository: Repository<TrackingLink>,
  ) {}

  /**
   * Validate slug format
   * Rules: 3-30 characters, alphanumeric and hyphens only, no leading/trailing hyphens
   */
  validateSlugFormat(slug: string): { valid: boolean; error?: string } {
    if (!slug || slug.trim() === '') {
      return { valid: false, error: 'Slug cannot be empty' };
    }

    const trimmedSlug = slug.trim();

    if (trimmedSlug.length < 3) {
      return { valid: false, error: 'Slug must be at least 3 characters long' };
    }

    if (trimmedSlug.length > 30) {
      return { valid: false, error: 'Slug must be at most 30 characters long' };
    }

    // Check if slug contains only alphanumeric characters and hyphens
    const validPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/i;
    if (!validPattern.test(trimmedSlug)) {
      return {
        valid: false,
        error:
          'Slug can only contain letters, numbers, and hyphens (no spaces or special characters)',
      };
    }

    // Check if slug starts or ends with hyphen
    if (trimmedSlug.startsWith('-') || trimmedSlug.endsWith('-')) {
      return {
        valid: false,
        error: 'Slug cannot start or end with a hyphen',
      };
    }

    // Check for consecutive hyphens
    if (trimmedSlug.includes('--')) {
      return { valid: false, error: 'Slug cannot contain consecutive hyphens' };
    }

    // Check if slug is reserved
    if (this.RESERVED_SLUGS.includes(trimmedSlug.toLowerCase())) {
      return { valid: false, error: 'This slug is reserved and cannot be used' };
    }

    return { valid: true };
  }

  /**
   * Check if a slug is available (not already taken)
   * @param slug The slug to check
   * @param excludeTrackingLinkId Optional tracking link ID to exclude from check (for updates)
   * @returns Object with availability status and suggestions if taken
   */
  async checkAvailability(
    slug: string,
    excludeTrackingLinkId?: string,
  ): Promise<{
    available: boolean;
    suggestions?: string[];
  }> {
    // First validate the slug format
    const validation = this.validateSlugFormat(slug);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    const normalizedSlug = slug.trim().toLowerCase();

    // Check if slug exists in database
    const query = this.trackingLinkRepository
      .createQueryBuilder('link')
      .where('LOWER(link.custom_slug) = :slug', { slug: normalizedSlug });

    // Exclude current tracking link if updating
    if (excludeTrackingLinkId) {
      query.andWhere('link.id != :excludeId', {
        excludeId: excludeTrackingLinkId,
      });
    }

    const existingLink = await query.getOne();

    if (!existingLink) {
      return { available: true };
    }

    // Slug is taken, generate suggestions
    const suggestions = await this.generateSuggestions(normalizedSlug);

    return {
      available: false,
      suggestions,
    };
  }

  /**
   * Generate alternative slug suggestions
   */
  private async generateSuggestions(slug: string): Promise<string[]> {
    const suggestions: string[] = [];
    const maxSuggestions = 3;

    // Strategy 1: Add numbers
    for (let i = 1; i <= 5; i++) {
      const suggestion = `${slug}-${i}`;
      const exists = await this.slugExists(suggestion);
      if (!exists) {
        suggestions.push(suggestion);
        if (suggestions.length >= maxSuggestions) break;
      }
    }

    // Strategy 2: Add random suffix if still need more suggestions
    if (suggestions.length < maxSuggestions) {
      for (let i = 0; i < 3; i++) {
        const randomNum = Math.floor(Math.random() * 999) + 100;
        const suggestion = `${slug}-${randomNum}`;
        const exists = await this.slugExists(suggestion);
        if (!exists && !suggestions.includes(suggestion)) {
          suggestions.push(suggestion);
          if (suggestions.length >= maxSuggestions) break;
        }
      }
    }

    return suggestions.slice(0, maxSuggestions);
  }

  /**
   * Check if a slug exists in the database
   */
  private async slugExists(slug: string): Promise<boolean> {
    const count = await this.trackingLinkRepository
      .createQueryBuilder('link')
      .where('LOWER(link.custom_slug) = :slug', { slug: slug.toLowerCase() })
      .getCount();

    return count > 0;
  }

  /**
   * Normalize a slug (lowercase, trim)
   */
  normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
  }

  /**
   * Generate a slug from a string (useful for auto-generating from product names)
   */
  generateSlugFromText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 30); // Limit to 30 characters
  }
}
