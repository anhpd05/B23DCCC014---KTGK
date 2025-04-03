export interface IProduct {
  _id: string;
  productCode: string;
  productName: string;
  price: number;
  description?: string;
}

export const fakeProducts: IProduct[] = [
  {
    _id: 'p1',
    productCode: 'IP14PM',
    productName: 'iPhone 14 Pro Max',
    price: 28990000,
    description: 'Điện thoại iPhone 14 Pro Max 128GB'
  },
  {
    _id: 'p2',
    productCode: 'IP14P',
    productName: 'iPhone 14 Pro',
    price: 25990000,
    description: 'Điện thoại iPhone 14 Pro 128GB'
  },
  {
    _id: 'p3',
    productCode: 'APP2',
    productName: 'AirPods Pro 2',
    price: 4990000,
    description: 'Tai nghe Apple AirPods Pro 2'
  },
  {
    _id: 'p4',
    productCode: 'IPAD10',
    productName: 'iPad Gen 10',
    price: 9990000,
    description: 'Máy tính bảng iPad Gen 10 WiFi 64GB'
  },
  {
    _id: 'p5',
    productCode: 'APWU',
    productName: 'Apple Watch Ultra',
    price: 19990000,
    description: 'Đồng hồ thông minh Apple Watch Ultra GPS + Cellular 49mm'
  },
  {
    _id: 'p6',
    productCode: 'USBC20W',
    productName: 'Adapter sạc Apple 20W',
    price: 590000,
    description: 'Adapter sạc Apple Type C 20W'
  },
  {
    _id: 'p7',
    productCode: 'LTCABLE',
    productName: 'Cáp sạc Lightning',
    price: 490000,
    description: 'Cáp sạc Lightning to USB-C 1m'
  },
  {
    _id: 'p8',
    productCode: 'MGCASE',
    productName: 'Ốp lưng MagSafe',
    price: 790000,
    description: 'Ốp lưng MagSafe cho iPhone 14 Pro Max'
  }
];

export interface ICustomer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
}

export const fakeCustomers: ICustomer[] = [
  {
    _id: 'c1',
    name: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an.nguyen@example.com',
    address: 'Quận 1, TP.HCM'
  },
  {
    _id: 'c2',
    name: 'Trần Thị Bình',
    phone: '0912345678',
    email: 'binh.tran@example.com',
    address: 'Quận 2, TP.HCM'
  },
  {
    _id: 'c3',
    name: 'Lê Văn Cường',
    phone: '0923456789',
    email: 'cuong.le@example.com',
    address: 'Quận 3, TP.HCM'
  },
  {
    _id: 'c4',
    name: 'Phạm Thị Dung',
    phone: '0934567890',
    email: 'dung.pham@example.com',
    address: 'Quận 4, TP.HCM'
  },
  {
    _id: 'c5',
    name: 'Hoàng Văn Em',
    phone: '0945678901',
    email: 'em.hoang@example.com',
    address: 'Quận 5, TP.HCM'
  },
  {
    _id: 'c6',
    name: 'Ngô Thị Phương',
    phone: '0956789012',
    email: 'phuong.ngo@example.com',
    address: 'Quận 6, TP.HCM'
  },
  {
    _id: 'c7',
    name: 'Đỗ Văn Giang',
    phone: '0967890123',
    email: 'giang.do@example.com',
    address: 'Quận 7, TP.HCM'
  },
  {
    _id: 'c8',
    name: 'Vũ Thị Hương',
    phone: '0978901234',
    email: 'huong.vu@example.com',
    address: 'Quận 8, TP.HCM'
  }
]; 