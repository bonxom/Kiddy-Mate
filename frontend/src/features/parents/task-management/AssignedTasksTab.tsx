import { useState, useMemo } from 'react';
import { Search, Trash2, ArrowUpDown } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import type { AssignedTask, TaskStatus } from '../../../types/task.types';

// Mock data
const mockAssignedTasks: AssignedTask[] = [
  {
    id: '1',
    child: 'Minh An',
    task: 'Dọn phòng ngủ',
    date: '2025-11-10',
    status: 'completed',
    reward: 10,
  },
  {
    id: '2',
    child: 'Minh An',
    task: 'Làm bài tập toán',
    date: '2025-11-12',
    status: 'in-progress',
    reward: 15,
  },
  {
    id: '3',
    child: 'Thu Hà',
    task: 'Đọc sách 15 phút',
    date: '2025-11-13',
    status: 'assigned',
    reward: 8,
  },
  {
    id: '4',
    child: 'Minh An',
    task: 'Tưới cây',
    date: '2025-11-09',
    status: 'missed',
    reward: 5,
  },
];

const AssignedTasksTab = () => {
  const [tasks, setTasks] = useState<AssignedTask[]>(mockAssignedTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof AssignedTask | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Filter and sort
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(
      (task) =>
        task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.child.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue === undefined || bValue === undefined) return 0;
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [tasks, searchQuery, sortColumn, sortDirection]);

  const handleSort = (column: keyof AssignedTask) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter((task) => task.id !== taskToDelete));
      setTaskToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    const statusConfig = {
      assigned: { variant: 'info' as const, label: 'Mới giao' },
      'in-progress': { variant: 'warning' as const, label: 'Đang làm' },
      completed: { variant: 'success' as const, label: 'Hoàn thành' },
      missed: { variant: 'danger' as const, label: 'Bỏ lỡ' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm nhiệm vụ hoặc tên bé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            fullWidth
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-2">
                  ID
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('child')}
              >
                <div className="flex items-center gap-2">
                  Tên bé
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('task')}
              >
                <div className="flex items-center gap-2">
                  Nhiệm vụ
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Ngày giao
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Trạng thái
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{task.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {task.child}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{task.task}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{task.date}</td>
                <td className="px-4 py-3">{getStatusBadge(task.status)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa nhiệm vụ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy nhiệm vụ nào
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Xác nhận xóa"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa nhiệm vụ này không?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AssignedTasksTab;
