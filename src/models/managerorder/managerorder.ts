import { useState, useCallback, useEffect } from 'react';
import { fakeOrders, type IOrder, EOrderStatus } from '@/pages/ManagerOrder/data';
import type { TFilter } from '@/components/Table/typing';

export default function useManagerOrder() {
  // Lưu trữ toàn bộ dữ liệu gốc
  const [allOrders, setAllOrders] = useState<IOrder[]>(() => {
    const savedData = localStorage.getItem('managerOrderData');
    return savedData ? JSON.parse(savedData) : fakeOrders;
  });
  
  // Dữ liệu hiển thị sau khi lọc và phân trang
  const [danhSach, setDanhSach] = useState<IOrder[]>([]);
  
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

  // Lưu dữ liệu vào localStorage mỗi khi allOrders thay đổi
  useEffect(() => {
    localStorage.setItem('managerOrderData', JSON.stringify(allOrders));
  }, [allOrders]);

  // Lấy danh sách đơn hàng với bộ lọc, sắp xếp và phân trang
  const getModel = async () => {
    setLoading(true);
    try {
      // Sử dụng dữ liệu từ allOrders
      let filteredData = [...allOrders];
      
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
      
      // Chỉ cập nhật danhSach, không ảnh hưởng đến allOrders
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
      // Cập nhật allOrders
      const newData = allOrders.filter((item: IOrder) => item._id !== id);
      setAllOrders(newData);
      
      // Cập nhật danhSach để UI cập nhật ngay lập tức
      setDanhSach(prev => prev.filter(item => item._id !== id));
    },
    [allOrders]
  );

  // Xử lý xóa nhiều
  const deleteMany = useCallback(
    (ids: string[]) => {
      // Cập nhật allOrders
      const newData = allOrders.filter((item: IOrder) => !ids.includes(item._id));
      setAllOrders(newData);
      
      // Cập nhật danhSach để UI cập nhật ngay lập tức
      setDanhSach(prev => prev.filter(item => !ids.includes(item._id)));
    },
    [allOrders]
  );

  // Xử lý thêm mới đơn hàng
  const addOrder = useCallback(
    (order: IOrder) => {
      // Cập nhật allOrders
      setAllOrders(prev => [order, ...prev]);
      
      // Cập nhật danhSach nếu đang ở trang đầu tiên
      if (page === 1) {
        setDanhSach(prev => {
          const newList = [order, ...prev];
          if (newList.length > limit) {
            return newList.slice(0, limit);
          }
          return newList;
        });
      }
      
      // Cập nhật tổng số bản ghi
      setTotal(prev => prev + 1);
    },
    [page, limit]
  );

  // Xử lý cập nhật đơn hàng
  const updateOrder = useCallback(
    (updatedOrder: IOrder) => {
      // Cập nhật allOrders
      setAllOrders(prev => 
        prev.map(item => item._id === updatedOrder._id ? updatedOrder : item)
      );
      
      // Cập nhật danhSach để UI cập nhật ngay lập tức
      setDanhSach(prev => 
        prev.map(item => item._id === updatedOrder._id ? updatedOrder : item)
      );
    },
    []
  );

  // Xử lý hủy đơn hàng
  const cancelOrder = useCallback(
    (orderId: string) => {
      // Tìm đơn hàng cần hủy trong allOrders
      const orderToCancel = allOrders.find((order: IOrder) => order._id === orderId);
      
      if (orderToCancel) {
        // Cập nhật trạng thái đơn hàng
        const updatedOrder = {
          ...orderToCancel,
          status: EOrderStatus.CANCELLED
        };
        
        // Cập nhật allOrders
        setAllOrders(prev => 
          prev.map(order => order._id === orderId ? updatedOrder : order)
        );
        
        // Cập nhật danhSach để UI cập nhật ngay lập tức
        setDanhSach(prev => 
          prev.map(order => order._id === orderId ? {...order, status: EOrderStatus.CANCELLED} : order)
        );
      }
    },
    [allOrders]
  );

  return {
    danhSach,
    setDanhSach,
    allOrders,
    setAllOrders,
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