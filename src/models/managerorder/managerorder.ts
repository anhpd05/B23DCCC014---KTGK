import { useState } from 'react';
import { fakeOrders, type IOrder } from '@/pages/ManagerOrder/data';
import type { TFilter } from '@/components/Table/typing';

export default () => {
  const [danhSach, setDanhSach] = useState<IOrder[]>(fakeOrders);
  const [record, setRecord] = useState<IOrder>();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [formSubmiting, setFormSubmiting] = useState<boolean>(false);
  const [filters, setFilters] = useState<TFilter<IOrder>[]>([]);
  const [condition, setCondition] = useState<{ [k in keyof IOrder]?: any } | any>();
  const [sort, setSort] = useState<{ [k in keyof IOrder]?: 1 | -1 } | undefined>({ orderDate: -1 });
  const [edit, setEdit] = useState<boolean>(false);
  const [isView, setIsView] = useState<boolean>(true);
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(fakeOrders.length);
  const [selectedIds, setSelectedIds] = useState<string[]>();
  const initFilter: TFilter<IOrder>[] = [];

  // Lấy danh sách đơn hàng với bộ lọc, sắp xếp và phân trang
  const getModel = async () => {
    setLoading(true);
    try {
      // Áp dụng bộ lọc
      let filteredData = [...fakeOrders];
      
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

  // Xóa một đơn hàng
  const deleteModel = async (id: string) => {
    setLoading(true);
    try {
      const newData = fakeOrders.filter(item => item._id !== id);
      setDanhSach(newData);
      return true;
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  // Xóa nhiều đơn hàng
  const deleteManyModel = async (ids: string[]) => {
    setLoading(true);
    try {
      const newData = fakeOrders.filter(item => !ids.includes(item._id));
      setDanhSach(newData);
      return true;
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  // Mở form chỉnh sửa đơn hàng
  const handleEdit = (record: IOrder) => {
    setRecord(record);
    setEdit(true);
    setVisibleForm(true);
  };

  // Mở form tạo đơn hàng mới
  const handleCreate = () => {
    setRecord(undefined);
    setEdit(false);
    setVisibleForm(true);
  };

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
    setLoading,
    formSubmiting,
    setFormSubmiting,
    filters,
    setFilters,
    condition,
    setCondition,
    sort,
    setSort,
    edit,
    setEdit,
    isView,
    setIsView,
    visibleForm,
    setVisibleForm,
    total,
    setTotal,
    selectedIds,
    setSelectedIds,
    initFilter,
    getModel,
    deleteModel,
    deleteManyModel,
    handleEdit,
    handleCreate,
  };
}; 