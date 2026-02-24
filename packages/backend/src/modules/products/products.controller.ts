import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/user.entity';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() filterDto: ProductFilterDto, @CurrentUser() user?: User) {
    // If the caller is a brand, force-filter to their own products only
    if (user?.role === UserRole.BRAND && user.brand) {
      filterDto.brand_id = user.brand.id;
    }
    const result = await this.productsService.findAll(filterDto, user);
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return {
      success: true,
      data: product,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: User) {
    const product = await this.productsService.create(createProductDto, user);
    return {
      success: true,
      data: product,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
  ) {
    const product = await this.productsService.update(id, updateProductDto, user);
    return {
      success: true,
      data: product,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BRAND)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.productsService.remove(id, user);
    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }

  @Get('brand/:brandId')
  @HttpCode(HttpStatus.OK)
  async findByBrand(@Param('brandId') brandId: string, @Query() filterDto: ProductFilterDto) {
    const result = await this.productsService.findByBrand(brandId, filterDto);
    return {
      success: true,
      data: result,
    };
  }
}
