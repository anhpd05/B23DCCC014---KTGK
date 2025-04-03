import { useState, useCallback, useEffect } from 'react';
import { fakeOrders, type IOrder, EOrderStatus } from '@/pages/ManagerOrder/data';
import type { TFilter } from '@/components/Table/typing';

export default function useManagerOrder() {
  // Khởi tạo state với dữ liệu từ localStorage hoặc dữ liệu mẫu
  const [danhSach, setDanhSach] = useState<IOrder[]>(() => {
    const savedData = localStorage.getItem('managerOrderData');
    return savedData ? JSON.parse(savedData) : fakeOrders;
  });
  
  const [record, setRecord] = useState<IOrder | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [formSubmiting, setFormSubmiting] = useState<boolean>(false);
  const [filters, setFilters] = useState<TFilter<IOrder>[]>([]);
  const [sort, setSort] = useState<{ [k in keyof IOrder]?: 1 | -1 } | undefined>({ orderDate: -1 });
  const [edit, setEdit] = useState<boolean>(false);
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Lưu dữ liệu vào localStorage mỗi khi danhSach thay đổi
  useEffect(() => {
    localStorage.setItem('managerOrderData', JSON.stringify(danhSach));
  }, [danhSach]);

  // Lấy danh sách đơn hàng với bộ lọc, sắp xếp và phân trang
  const getModel = async () => {
    setLoading(true);
    try {
      // Lấy dữ liệu từ localStorage hoặc sử dụng fakeOrders nếu không có
      const savedData = localStorage.getItem('managerOrderData');
      const sourceData = savedData ? JSON.parse(savedData) : fakeOrders;
      
      // Áp dụng bộ lọc
      let filteredData = [...sourceData];
      
      if (filters && filters.length > 0) {
        filteredData = filteredData.filter(order => {
          return filters.every(filter => {
            if (!filter.active) return true;
            
            const field = Array.isArray(filter.field) ? filter.field[0] : filter.field;
            const value = order[field as keyof IOrder];
            
            if (filter.operator === 'in' && Array.isArray(filter.values)) {
              return filter.values.includes(value as string);
            }
            
            if (filter.operator === 'contain' && typeof value === 'string') {
              return value.toLowerCase().includes((filter.values[0] as string).toLowerCase());
            }
            
            return true;
          });
        });
      }
      
      // Áp dụng sắp xếp
      if (sort) {
        const sortField = Object.keys(sort)[0] as keyof IOrder;
        const sortDirection = sort[sortField];
        
        filteredData.sort((a, b) => {
          if (sortField === 'totalAmount') {
            return sortDirection === 1 
              ? a.totalAmount - b.totalAmount 
              : b.totalAmount - a.totalAmount;
          }
          
          if (sortField === 'orderDate') {
            return sortDirection === 1 
              ? new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime() 
              : new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
          }
          
          return 0;
        });
      }
      
      // Tính tổng số bản ghi sau khi lọc
      setTotal(filteredData.length);
      
      // Áp dụng phân trang
      const startIndex = (page - 1) * limit;
      const paginatedData = filteredData.slice(startIndex, startIndex + limit);
      
      setDanhSach(paginatedData);
      return paginatedData;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thêm mới
  const handleCreate = useCallback(() => {
    setRecord(undefined);
    setEdit(false);
    setVisibleForm(true);
  }, []);

  // Xử lý chỉnh sửa
  const handleEdit = useCallback((record: IOrder) => {
    setRecord(record);
    setEdit(true);
    setVisibleForm(true);
  }, []);

  // Xử lý xóa
  const deleteModel = useCallback(
    (id: string) => {
      // Lấy dữ liệu hiện tại từ localStorage
      const savedData = localStorage.getItem('managerOrderData');
      const currentData = savedData ? JSON.parse(savedData) : fakeOrders;
      
      // Xóa đơn hàng
      const newData = currentData.filter((item: IOrder) => item._id !== id);
      
      // Cập nhật localStorage và state
      localStorage.setItem('managerOrderData', JSON.stringify(newData));
      
      // Cập nhật state hiện tại
      setDanhSach(prev => prev.filter(item => item._id !== id));
    },
    []
  );

  // Xử lý xóa nhiều
  const deleteMany = useCallback(
    (ids: string[]) => {
      // Lấy dữ liệu hiện tại từ localStorage
      const savedData = localStorage.getItem('managerOrderData');
      const currentData = savedData ? JSON.parse(savedData) : fakeOrders;
      
      // Xóa các đơn hàng
      const newData = currentData.filter((item: IOrder) => !ids.includes(item._id));
      
      // Cập nhật localStorage và state
      localStorage.setItem('managerOrderData', JSON.stringify(newData));
      
      // Cập nhật state hiện tại
      setDanhSach(prev => prev.filter(item => !ids.includes(item._id)));
    },
    []
  );

  // Xử lý thêm mới đơn hàng
  const addOrder = useCallback(
    (order: IOrder) => {
      // Lấy dữ liệu hiện tại từ localStorage
      const savedData = localStorage.getItem('managerOrderData');
      const currentData = savedData ? JSON.parse(savedData) : fakeOrders;
      
      // Thêm đơn hàng mới
      const newData = [order, ...currentData];
      
      // Cập nhật localStorage
      localStorage.setItem('managerOrderData', JSON.stringify(newData));
      
      // Cập nhật state
      setDanhSach(prev => [order, ...prev]);
    },
    []
  );

  // Xử lý cập nhật đơn hàng
  const updateOrder = useCallback(
    (updatedOrder: IOrder) => {
      // Lấy dữ liệu hiện tại từ localStorage
      const savedData = localStorage.getItem('managerOrderData');
      const currentData = savedData ? JSON.parse(savedData) : fakeOrders;
      
      // Cập nhật đơn hàng
      const updatedData = currentData.map((item: IOrder) => 
        item._id === updatedOrder._id ? updatedOrder : item
      );
      
      // Cập nhật localStorage
      localStorage.setItem('managerOrderData', JSON.stringify(updatedData));
      
      // Cập nhật state
      setDanhSach(prev => prev.map(item => 
        item._id === updatedOrder._id ? updatedOrder : item
      ));
    },
    []
  );

  // Xử lý hủy đơn hàng
  const cancelOrder = useCallback(
    (orderId: string) => {
      // Lấy dữ liệu hiện tại từ localStorage
      const savedData = localStorage.getItem('managerOrderData');
      const currentData = savedData ? JSON.parse(savedData) : fakeOrders;
      
      // Tìm đơn hàng cần hủy
      const orderToCancel = currentData.find((order: IOrder) => order._id === orderId);
      
      if (orderToCancel) {
        // Cập nhật trạng thái đơn hàng
        const updatedOrder = {
          ...orderToCancel,
          status: EOrderStatus.CANCELLED
        };
        
        // Cập nhật danh sách đơn hàng
        const updatedData = currentData.map((order: IOrder) => 
          order._id === orderId ? updatedOrder : order
        );
        
        // Cập nhật localStorage
        localStorage.setItem('managerOrderData', JSON.stringify(updatedData));
        
        // Cập nhật state
        setDanhSach(prev => prev.map(order => 
          order._id === orderId ? {...order, status: EOrderStatus.CANCELLED} : order
        ));
      }
    },
    []
  );

  return {
    danhSach,
    setDanhSach,
    record,
    setRecord,
    page,
    setPage,
    limit,
    setLimit,
    loading,
    filters,
    setFilters,
    sort,
    setSort,
    edit,
    setEdit,
    visibleForm,
    setVisibleForm,
    total,
    selectedIds,
    setSelectedIds,
    formSubmiting,
    setFormSubmiting,
    getModel,
    deleteModel,
    deleteMany,
    handleEdit,
    handleCreate,
    addOrder,
    updateOrder,
    cancelOrder
  };
} 