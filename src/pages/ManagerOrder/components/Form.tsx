import { useEffect, useState } from 'react';
import { Button, Col, DatePicker, Descriptions, Divider, Form as AntForm, Input, InputNumber, Modal, Row, Select, Space, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import { fakeCustomers, fakeProducts, type IProduct } from '../productData';
import { EOrderStatus, type IOrder } from '../data';
import { inputFormat } from '@/utils/utils';

const { Option } = Select;
const { Text } = Typography;

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface FormValues {
  orderCode: string;
  customerId: string;
  orderDate: moment.Moment;
  status: EOrderStatus;
  items: OrderItem[];
}

// Kiểm tra xem prop có phải là một đối tượng IOrder không
const isIOrder = (obj: any): obj is IOrder => {
  return obj && typeof obj === 'object' && '_id' in obj;
};

const OrderForm = (props: { record?: IOrder; onCancel?: () => void; visible?: boolean }) => {
  const { record, onCancel, visible = true } = props;
  const [form] = AntForm.useForm<FormValues>();
  const { danhSach, setDanhSach, setVisibleForm, formSubmiting, setFormSubmiting, edit, updateOrder, addOrder } = useModel('managerorder.managerorder');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  
  // Xác định xem đang ở chế độ chỉnh sửa hay thêm mới
  const isEditMode = isIOrder(record) || edit;

  // Khởi tạo form với dữ liệu từ record nếu đang chỉnh sửa
  useEffect(() => {
    if (isIOrder(record)) {
      form.setFieldsValue({
        orderCode: record.orderCode,
        customerId: record.customerName, 
        orderDate: moment(record.orderDate),
        status: record.status,
      });
      
      // Đặt các mục sản phẩm từ record
      if (record.items && record.items.length > 0) {
        setOrderItems(record.items);
      }
    } else {
      // Đặt giá trị mặc định cho đơn hàng mới
      form.setFieldsValue({
        orderDate: moment(),
        status: EOrderStatus.PENDING,
      });
    }
  }, [record, form]);

  // Tính tổng tiền mỗi khi các mục đơn hàng thay đổi
  useEffect(() => {
    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    setTotalAmount(total);
  }, [orderItems]);

  // Xử lý đóng modal
  const handleClose = () => {
    // Đặt trạng thái visibleForm trong model thành false
    setVisibleForm(false);
    
    // Gọi onCancel nếu nó là một hàm
    if (typeof onCancel === 'function') {
      onCancel();
    }
    
    // Reset form
    form.resetFields();
    
    // Xóa các mục đơn hàng
    setOrderItems([]);
  };

  // Thêm một mục sản phẩm mới vào đơn hàng
  const handleAddItem = () => {
    const newItem: OrderItem = {
      productId: '',
      quantity: 1,
      price: 0,
      subtotal: 0,
    };
    setOrderItems([...orderItems, newItem]);
  };

  // Xóa một mục sản phẩm khỏi đơn hàng
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
    form.setFieldsValue({ items: updatedItems });
  };

  // Xử lý khi thay đổi sản phẩm
  const handleProductChange = (productId: string, index: number) => {
    const product = fakeProducts.find(p => p._id === productId);
    if (product) {
      const updatedItems = [...orderItems];
      updatedItems[index] = {
        ...updatedItems[index],
        productId,
        price: product.price,
        subtotal: product.price * (updatedItems[index].quantity || 1),
      };
      setOrderItems(updatedItems);
      form.setFieldsValue({ items: updatedItems });
    }
  };

  // Xử lý khi thay đổi số lượng
  const handleQuantityChange = (quantity: number, index: number) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity,
      subtotal: (updatedItems[index].price || 0) * quantity,
    };
    setOrderItems(updatedItems);
    form.setFieldsValue({ items: updatedItems });
  };

  // Kiểm tra mã đơn hàng có hợp lệ không
  const validateOrderCode = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập mã đơn hàng'));
    }
    
    // Kiểm tra xem mã đơn hàng đã tồn tại chưa (trừ đơn hàng hiện tại đang chỉnh sửa)
    const isDuplicate = danhSach.some(
      order => order.orderCode === value && (!isIOrder(record) || order._id !== record._id)
    );
    
    if (isDuplicate) {
      return Promise.reject(new Error('Mã đơn hàng đã tồn tại'));
    }
    
    return Promise.resolve();
  };

  // Xử lý khi submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormSubmiting(true);
      
      // Lấy thông tin khách hàng từ ID
      const customer = fakeCustomers.find(c => c._id === values.customerId);
      
      if (isEditMode && isIOrder(record)) {
        // Cập nhật đơn hàng hiện có - giữ lại thông tin cũ và chỉ cập nhật các trường mới
        const updatedOrder: IOrder = {
          ...record,  // Giữ lại tất cả thông tin cũ
          orderCode: values.orderCode,
          customerId: values.customerId,
          customerName: customer?.name || record.customerName, // Giữ lại tên khách hàng cũ nếu không tìm thấy khách hàng mới
          orderDate: values.orderDate.toISOString(),
          status: values.status,
          totalAmount: totalAmount || record.totalAmount, // Giữ lại tổng tiền cũ nếu không có tổng tiền mới
          items: orderItems // Cập nhật các mục sản phẩm
        };
        
        // Sử dụng hàm updateOrder từ model
        updateOrder(updatedOrder);
      } else {
        // Thêm đơn hàng mới
        const newOrder: IOrder = {
          _id: `${Date.now()}`,
          orderCode: values.orderCode,
          customerId: values.customerId,
          customerName: customer?.name || '',
          orderDate: values.orderDate.toISOString(),
          totalAmount: totalAmount,
          status: values.status,
          items: orderItems // Thêm các mục sản phẩm
        };
        
        // Sử dụng hàm addOrder từ model
        addOrder(newOrder);
      }
      
      setVisibleForm(false);
      if (typeof onCancel === 'function') {
        onCancel();
      }
    } catch (error) {
      console.error('Lỗi khi xác thực form:', error);
    } finally {
      setFormSubmiting(false);
    }
  };

  // Định nghĩa các cột cho bảng chi tiết đơn hàng
  const itemsColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productId',
      key: 'productId',
      width: '40%',
      render: (productId: string, _: any, index: number) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn sản phẩm"
          value={productId || undefined}
          onChange={(value) => handleProductChange(value, index)}
        >
          {fakeProducts.map(product => (
            <Option key={product._id} value={product._id}>
              {product.productName} - {inputFormat(product.price)} đ
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '20%',
      render: (quantity: number, _: any, index: number) => (
        <InputNumber
          min={1}
          style={{ width: '100%' }}
          value={quantity}
          onChange={(value) => handleQuantityChange(value as number, index)}
        />
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      width: '20%',
      render: (price: number) => `${inputFormat(price)} đ`,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: '20%',
      render: (subtotal: number) => `${inputFormat(subtotal)} đ`,
    },
    {
      title: '',
      key: 'action',
      width: '5%',
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(index)}
        />
      ),
    },
  ];

  return (
    <Modal
      title={isEditMode ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới'}
      visible={visible}
      onCancel={handleClose}
      width={1000}
      maskClosable={false}
      destroyOnClose={true}
      footer={[
        <Button key="back" onClick={handleClose}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={formSubmiting} 
          onClick={handleSubmit}
        >
          {isEditMode ? 'Cập nhật' : 'Tạo mới'}
        </Button>,
      ]}
      bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
    >
      <AntForm
        form={form}
        layout="vertical"
        initialValues={{ items: [] }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <AntForm.Item
              name="orderCode"
              label="Mã đơn hàng"
              rules={[
                { validator: validateOrderCode }
              ]}
            >
              <Input placeholder="Nhập mã đơn hàng" />
            </AntForm.Item>
          </Col>
          <Col span={8}>
            <AntForm.Item
              name="customerId"
              label="Khách hàng"
              rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
            >
              <Select placeholder="Chọn khách hàng">
                {fakeCustomers.map(customer => (
                  <Option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.phone}
                  </Option>
                ))}
              </Select>
            </AntForm.Item>
          </Col>
          <Col span={8}>
            <AntForm.Item
              name="orderDate"
              label="Ngày đặt hàng"
              rules={[{ required: true, message: 'Vui lòng chọn ngày đặt hàng' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY HH:mm"
                showTime={{ format: 'HH:mm' }}
              />
            </AntForm.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={8}>
            <AntForm.Item
              name="status"
              label="Trạng thái" 
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select placeholder="Chọn trạng thái">
                {Object.values(EOrderStatus).map(status => (
                  <Option key={status} value={status}>
                    {status}
                  </Option>
                ))}
              </Select>
            </AntForm.Item>
          </Col>
        </Row>

        <Divider orientation="left">Chi tiết đơn hàng</Divider>
        
        <Table
          dataSource={orderItems}
          columns={itemsColumns}
          pagination={false}
          rowKey={(_, index) => `item-${index}`}
          scroll={{ x: 800 }}
          footer={() => (
            <Button 
              type="dashed" 
              icon={<PlusOutlined />} 
              onClick={handleAddItem}
              block
            >
              Thêm sản phẩm
            </Button>
          )}
        />
        
        <Descriptions style={{ marginTop: 16 }} bordered>
          <Descriptions.Item label="Tổng tiền" span={3}>
            <Text strong style={{ fontSize: 16 }}>
              {inputFormat(totalAmount)} đ
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </AntForm>
    </Modal>
  );
};

export default OrderForm; 