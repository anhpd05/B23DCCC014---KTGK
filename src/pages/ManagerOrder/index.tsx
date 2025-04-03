import { Card, Tag, Button, Tooltip, Popconfirm, message, Modal } from 'antd';
import { DeleteOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import TableBase from '@/components/Table';
import { inputFormat } from '@/utils/utils';
import { EOrderStatus } from './data';
import type { IColumn } from '@/components/Table/typing';
import Form from './components/Form';

const ManagerOrder = () => {
  const { handleEdit, deleteModel, visibleForm, setVisibleForm, record, danhSach, setDanhSach, cancelOrder } = useModel('managerorder.managerorder');

  // Hàm xử lý hủy đơn hàng
  const handleCancelOrder = (orderId: string) => {
    // Tìm đơn hàng cần hủy
    const orderToCancel = danhSach.find(order => order._id === orderId);
    
    if (orderToCancel) {
      // Kiểm tra xem đơn hàng có ở trạng thái "Chờ xác nhận" không
      if (orderToCancel.status !== EOrderStatus.PENDING) {
        message.error('Chỉ có thể hủy đơn hàng ở trạng thái Chờ xác nhận');
        return;
      }
      
      // Hiển thị cảnh báo trước khi hủy
      Modal.confirm({
        title: 'Xác nhận hủy đơn hàng',
        content: 'Bạn có chắc chắn muốn hủy đơn hàng này? Đơn hàng sẽ được chuyển sang trạng thái Hủy và không thể hoàn tác.',
        okText: 'Hủy đơn hàng',
        cancelText: 'Không',
        okButtonProps: { danger: true },
        onOk: () => {
          // Sử dụng hàm cancelOrder từ model
          cancelOrder(orderId);
          message.success('Đơn hàng đã được hủy thành công');
        }
      });
    }
  };

  // Define columns for the table
  const columns: IColumn<any>[] = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      width: 150,
      filterType: 'string',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      width: 200,
      filterType: 'string',
    },
    {
      title: 'Ngày đặt hàng',
      dataIndex: 'orderDate',
      width: 150,
      sortable: true,
      render: (val) => moment(val).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      width: 150,
      sortable: true,
      align: 'right',
      render: (val) => inputFormat(val) + ' đ',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      filterType: 'select',
      filterData: Object.values(EOrderStatus),
      render: (val) => {
        let color = '';
        switch (val) {
          case EOrderStatus.PENDING:
            color = 'gold';
            break;
          case EOrderStatus.SHIPPING:
            color = 'blue';
            break;
          case EOrderStatus.COMPLETED:
            color = 'green';
            break;
          case EOrderStatus.CANCELLED:
            color = 'red';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{val}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      width: 150, 
      align: 'center',
      render: (_, record) => (
        <>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)} 
            />
          </Tooltip>
          
          {/* Chỉ hiển thị nút hủy khi đơn hàng ở trạng thái "Chờ xác nhận" */}
          {record.status === EOrderStatus.PENDING && (
            <Tooltip title="Hủy đơn hàng">
              <Button 
                type="link" 
                icon={<StopOutlined />} 
                style={{ color: 'orange' }}
                onClick={() => handleCancelOrder(record._id)}
              />
            </Tooltip>
          )}
          
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa đơn hàng này?"
              onConfirm={() => deleteModel(record._id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button danger type="link" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <>
      <Card title="Quản lý đơn hàng" bordered={false}>
        <TableBase
          modelName="managerorder.managerorder"
          columns={columns}
          title="Danh sách đơn hàng"
          rowSelection
          deleteMany
          buttons={{
            reload: true,
            filter: true,
            export: true,
            create: true,
          }}
        />
      </Card>
      
      <Form 
        record={record} 
        onCancel={() => setVisibleForm(false)}
        visible={visibleForm}
      />
    </>
  );
};

export default ManagerOrder;
