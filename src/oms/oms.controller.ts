import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Logger,
    Post,
    Query,
    Version,
    Headers,
    Delete,
    Put,
  } from '@nestjs/common';
  import {
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiHeader,
    ApiQuery,
  } from '@nestjs/swagger';
  import { ApiTag } from '../enums/apiTag';
  import { HttpError } from '../errors/custom.errors';
  import { Controllers } from '../enums/controller';
  import { Roles } from '../role/role-decorators';
  import { Role } from 'src/role/role-guard';
  import {
    CreateOrderRequestDto,
    CreateOrderRequestDtoValidation,
  } from './dto/create-order.dto';
  import { OrderService } from './oms.service';
  import { OrderEntity } from './entity/order.entity';
  import {
    UpdateOrderRequestDto,
    UpdateOrderRequestDtoValidation,
  } from './dto/update-order.dto';
  import { PaginationValidation } from '../utils/page-validations';
  
  @Controller(Controllers.Operation)
  @ApiTags(ApiTag.Order)
  export class OrderController {
    private readonly logger = new Logger(OrderController.name);
    constructor(public readonly orderService: OrderService) {}
  
    // POST API
    @Version('1')
    @Post()
    @Roles(Role.PLATFORM_USER)
    @ApiOperation({
      summary: 'Create Order',
      description: 'Create Order API: Will create an order.',
    })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'will provide successful message',
    })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid request object.',
    })
    @ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error.',
    })
    @ApiHeader({
      name: 'Authorization',
      description: 'Authorization to access api.',
    })
    async createOrder(
      @Headers() headers,
      @Body() createOrderRequestDto: CreateOrderRequestDto,
    ): Promise<OrderEntity> {
      // Dto validation
      try {
        await CreateOrderRequestDtoValidation.validateAsync(
          createOrderRequestDto,
        );
      } catch (e) {
        throw HttpError(
          HttpStatus.BAD_REQUEST,
          `Invalid request object: ${e.message}`,
        );
      }
      return await this.orderService.createOrder(headers, createOrderRequestDto);
    }
  
    // POST API
    @Version('1')
    @Put()
    @Roles(Role.PLATFORM_USER)
    @ApiOperation({
      summary: 'Update Order',
      description:
        'Update Order API: Responsible for Updating order items and order details.',
    })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Order has been successfully updated.',
    })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid request object.',
    })
    @ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal server error.',
    })
    @ApiHeader({
      name: 'Authorization',
      description: 'Authorization to access api.',
    })
    async updateOrder(
      @Headers() headers,
      @Body() updateOrderRequestDto: UpdateOrderRequestDto,
    ): Promise<OrderEntity> {
      // Dto validation
      try {
        await UpdateOrderRequestDtoValidation.validateAsync(
          updateOrderRequestDto,
        );
      } catch (e) {
        throw HttpError(
          HttpStatus.BAD_REQUEST,
          `Invalid request object: ${e.message}`,
        );
      }
      return await this.orderService.updateOrder(headers, updateOrderRequestDto);
    }
  
    @Version('1')
    @Get()
    @Roles(Role.PLATFORM_USER)
    @ApiOperation({
      summary: 'Get Order with order id.',
      description: 'Get order details with the order id.',
    })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Order Found successfully.',
    })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Order not found.',
    })
    @ApiQuery({
      type: String,
      name: 'id',
      description: 'id is required for getting the details of order.',
    })
    @ApiHeader({
      name: 'Authorization',
      description: 'Authorization for access API.',
    })
    async getOrder(
      @Headers() headers,
      @Query('id') id: string,
    ): Promise<OrderEntity> {
      if (!id) {
        this.logger.error(
          `Inside ${this.getOrder.name}: query params is invalid`,
        );
        throw HttpError(HttpStatus.BAD_REQUEST, `Invalid query params`);
      }
      return await this.orderService.getOrderById(headers, id);
    }
  
    @Version('1')
    @Get('orders')
    @Roles(Role.PLATFORM_USER)
    @ApiOperation({
      summary: 'Get All Orders with pagination.',
      description: 'Orders API: Will give the list of orders with pagination.',
    })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully Executed.',
    })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal Server error.',
    })
    @ApiQuery({
      type: Number,
      name: 'page',
      description: 'An integer value representing the page number.',
    })
    @ApiQuery({
      type: Number,
      name: 'page_size',
      description: 'page_size: An integer value representing the page size.',
    })
    @ApiHeader({
      name: 'Authorization',
      description: 'Authorization to access api.',
    })
    async getOrders(
      @Headers() headers,
      @Query('page') page: number,
      @Query('page_size') page_size: number,
    ): Promise<OrderEntity[]> {
      this.logger.log(`inside get Orders.`);
      const pagination = {
        page: page,
        page_size: page_size,
      };
      try {
        await PaginationValidation.validateAsync(pagination);
      } catch (e) {
        this.logger.error(`Inside ${this.getOrders.name}:${e}`);
        throw HttpError(HttpStatus.BAD_REQUEST, `Invalid Pagination values`);
      }
      return await this.orderService.getAllOrders(headers, pagination);
    }
  
    @Version('1')
    @Delete()
    @Roles(Role.PLATFORM_USER)
    @ApiOperation({
      summary: 'Delete Order with order id.',
      description: 'Delete order with the order id.',
    })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Order deleted successfully.',
    })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Order not found.',
    })
    @ApiQuery({
      type: String,
      name: 'id',
      description: 'id is required for deleting order.',
    })
    @ApiHeader({
      name: 'Authorization',
      description: 'Authorization for access API.',
    })
    async deleteOrder(@Headers() headers, @Query('id') id: string) {
      if (!id) {
        this.logger.error(
          `Inside ${this.deleteOrder.name}: query params is invalid`,
        );
        throw HttpError(HttpStatus.BAD_REQUEST, `Invalid query params`);
      }
      await this.orderService.deleteOrder(headers, id);
    }
  }