import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual, Like } from 'typeorm';
import { Product, ProductReviewStatus, ProductStatus } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, user: User): Promise<Product> {
    // Only brands can create products
    if (user.role !== UserRole.BRAND) {
      throw new ForbiddenException('Only brands can create products');
    }

    if (!user.brand) {
      throw new ForbiddenException('Brand profile not found');
    }

    // Sync image_url with first item in image_urls for backward compat
    const image_urls = createProductDto.image_urls || (createProductDto.image_url ? [createProductDto.image_url] : []);
    const image_url = image_urls[0] || createProductDto.image_url;

    const product = this.productRepository.create({
      ...createProductDto,
      brand_id: user.brand!.id,
      image_urls,
      image_url,
      review_status: ProductReviewStatus.PENDING_REVIEW,
      status: ProductStatus.INACTIVE, // stays inactive until approved
    });

    return await this.productRepository.save(product);
  }

  async findAll(filterDto: ProductFilterDto, requestingUser?: User): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    const { search, category, brand_id, status, min_price, max_price, page = 1, limit = 20 } = filterDto;

    const where: FindOptionsWhere<Product> = {};

    if (category) {
      where.category = category;
    }

    if (brand_id) {
      where.brand_id = brand_id;
    }

    if (status) {
      where.status = status;
    }

    if (min_price !== undefined && max_price !== undefined) {
      where.price = Between(min_price, max_price);
    } else if (min_price !== undefined) {
      where.price = MoreThanOrEqual(min_price);
    } else if (max_price !== undefined) {
      where.price = LessThanOrEqual(max_price);
    }

    // For brand owners: show all their products regardless of review status
    // For everyone else (influencers, public, no auth): only APPROVED products
    const isBrandOwner = requestingUser?.role === UserRole.BRAND && brand_id && requestingUser.brand?.id === brand_id;
    const isAdmin = requestingUser?.role === UserRole.ADMIN;
    if (!isBrandOwner && !isAdmin) {
      where.review_status = ProductReviewStatus.APPROVED;
    }

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Apply where conditions
    if (Object.keys(where).length > 0) {
      Object.entries(where).forEach(([key, value]) => {
        if (key === 'price' && typeof value === 'object') {
          // Handle price range
          if (min_price !== undefined) {
            queryBuilder.andWhere('product.price >= :min_price', { min_price });
          }
          if (max_price !== undefined) {
            queryBuilder.andWhere('product.price <= :max_price', { max_price });
          }
        } else {
          queryBuilder.andWhere(`product.${key} = :${key}`, { [key]: value });
        }
      });
    }

    // Search by name or description
    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by created_at desc
    queryBuilder.orderBy('product.created_at', 'DESC');

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      products,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['brand'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User): Promise<Product> {
    const product = await this.findOne(id);

    if (!user.brand) {
      throw new ForbiddenException('Brand profile not found');
    }

    // Only the brand that owns the product can update it
    if (user.role !== UserRole.BRAND || product.brand_id !== user.brand!.id) {
      throw new ForbiddenException('You can only update your own products');
    }

    Object.assign(product, updateProductDto);
    // Keep image_url in sync with image_urls[0]
    if (updateProductDto.image_urls && updateProductDto.image_urls.length > 0) {
      product.image_url = updateProductDto.image_urls[0];
    }
    return await this.productRepository.save(product);
  }

  async remove(id: string, user: User): Promise<void> {
    const product = await this.findOne(id);

    if (!user.brand) {
      throw new ForbiddenException('Brand profile not found');
    }

    // Only the brand that owns the product can delete it
    if (user.role !== UserRole.BRAND || product.brand_id !== user.brand!.id) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productRepository.remove(product);
  }

  async findByBrand(brandId: string, filterDto: ProductFilterDto, requestingUser?: User): Promise<{ products: Product[]; total: number; page: number; limit: number }> {
    return this.findAll({ ...filterDto, brand_id: brandId }, requestingUser);
  }
}
