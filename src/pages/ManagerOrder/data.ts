import { faker } from '@faker-js/faker';
import { fakeProducts } from './productData';

export enum EOrderStatus {
  PENDING = 'Chờ xác nhận',
  SHIPPING = 'Đang giao',
  COMPLETED = 'Hoàn thành',
  CANCELLED = 'Hủy',
}

export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IOrder {
  _id: string;
  orderCode: string; // Mã đơn hàng
  customerName: string; // Khách hàng 
  customerId: string; // ID khách hàng
  orderDate: string; // Ngày đặt hàng
  totalAmount: number; // Tổng số tiền
  status: EOrderStatus; // Trạng thái đơn hàng
  items: IOrderItem[]; // Chi tiết đơn hàng
}

// data fake mẫu
export const fakeOrders: IOrder[] = [
  {
    _id: '1',
    orderCode: 'ORD-ABCD1234',
    customerName: 'Nguyễn Văn An',
    customerId: 'c1',
    orderDate: '2023-11-15T08:30:00.000Z',
    status: EOrderStatus.PENDING,
    items: [
      {
        productId: 'p1',
        quantity: 1,
        price: 28990000, // Giá từ productData.ts
        subtotal: 28990000
      },
      {
        productId: 'p3',
        quantity: 2,
        price: 4990000, // Giá từ productData.ts
        subtotal: 9980000
      }
    ],
    get totalAmount() { 
      return this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }
  },
  {
    _id: '2',
    orderCode: 'ORD-EFGH5678',
    customerName: 'Trần Thị Bình',
    customerId: 'c2',
    orderDate: '2023-11-14T10:15:00.000Z',
    status: EOrderStatus.SHIPPING,
    items: [
      {
        productId: 'p2',
        quantity: 1,
        price: 25990000, // Giá từ productData.ts
        subtotal: 25990000
      },
      {
        productId: 'p5',
        quantity: 1,
        price: 19990000, // Giá từ productData.ts
        subtotal: 19990000
      }
    ],
    get totalAmount() { 
      return this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }
  },
  {
    _id: '3',
    orderCode: 'ORD-IJKL9012',
    customerName: 'Lê Văn Cường',
    customerId: 'c3',
    orderDate: '2023-11-12T14:20:00.000Z',
    status: EOrderStatus.COMPLETED,
    items: [
      {
        productId: 'p4',
        quantity: 1,
        price: 9990000, // Giá từ productData.ts
        subtotal: 9990000
      }
    ],
    get totalAmount() { 
      return this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }
  },
  {
    _id: '4',
    orderCode: 'ORD-MNOP3456',
    customerName: 'Phạm Thị Dung',
    customerId: 'c4',
    orderDate: '2023-11-10T09:45:00.000Z',
    status: EOrderStatus.CANCELLED,
    items: [
      {
        productId: 'p6',
        quantity: 3,
        price: 590000, // Giá từ productData.ts
        subtotal: 1770000
      },
      {
        productId: 'p7',
        quantity: 2,
        price: 490000, // Giá từ productData.ts
        subtotal: 980000
      },
      {
        productId: 'p8',
        quantity: 4,
        price: 790000, // Giá từ productData.ts
        subtotal: 3160000
      }
    ],
    get totalAmount() { 
      return this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }
  },
  {
    _id: '5',
    orderCode: 'ORD-QRST7890',
    customerName: 'Hoàng Văn Em',
    customerId: 'c5',
    orderDate: '2023-11-08T16:30:00.000Z',
    status: EOrderStatus.COMPLETED,
    items: [
      {
        productId: 'p5',
        quantity: 1,
        price: 19990000, // Giá từ productData.ts
        subtotal: 19990000
      }
    ],
    get totalAmount() { 
      return this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }
  },
  {
    _id: '6',
    orderCode: 'ORD-UVWX1234',
    customerName: 'Ngô Thị Phương',
    customerId: 'c6',
    orderDate: '2023-11-05T11:20:00.000Z',
    status: EOrderStatus.SHIPPING,
    items: [
      {
        productId: 'p3',
        quantity: 2,
        price: 4990000, // Giá từ productData.ts
        subtotal: 9980000
      },
      {
        productId: 'p8',
        quantity: 3,
        price: 790000, // Giá từ productData.ts
        subtotal: 2370000
      }
    ],
    get totalAmount() { 
      return this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }
  },
  {
    _id: '7',
    orderCode: 'ORD-YZAB5678',
    customerName: 'Đỗ Văn Giang',
    customerId: 'c7',
    orderDate: '2023-11-03T13:10:00.000Z',
    status: EOrderStatus.PENDING,
    items: [
      {
        productId: 'p2',
        quantity: 1,
        price: 25990000, // Giá từ productData.ts
        subtotal: 25990000
      },
      {
        productId: 'p4',
        quantity: 1,
        price: 9990000, // Giá từ productData.ts
        subtotal: 9990000
      }
    ],
    get totalAmount() { 
      return this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }
  },
  {
    _id: '8',
    orderCode: 'ORD-CDEF9012',
    customerName: 'Vũ Thị Hương',
    customerId: 'c8',
    orderDate: '2023-11-01T15:45:00.000Z',
    status: EOrderStatus.COMPLETED,
    items: [
      {
        productId: 'p7',
        quantity: 2,
        price: 490000, // Giá từ productData.ts
        subtotal: 980000
      }
    ],
    get totalAmount() { 
      return this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }
  }
];
