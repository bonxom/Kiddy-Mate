import { useState } from 'react';
import { Check, X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import type { RedemptionRequest, RedemptionStatus } from '../../../types/reward.types';

// Mock data
const mockRequests: RedemptionRequest[] = [
  {
    id: '1',
    child: 'Minh An',
    childId: '1',
    rewardName: '30 phút chơi game',
    rewardId: '1',
    dateCreated: '2025-11-10',
    cost: 50,
    status: 'pending',
  },
  {
    id: '2',
    child: 'Thu Hà',
    childId: '2',
    rewardName: 'Sách truyện mới',
    rewardId: '6',
    dateCreated: '2025-11-11',
    cost: 40,
    status: 'pending',
  },
  {
    id: '3',
    child: 'Minh An',
    childId: '1',
    rewardName: 'Pizza tự chọn',
    rewardId: '4',
    dateCreated: '2025-11-12',
    cost: 80,
    status: 'pending',
  },
  {
    id: '4',
    child: 'Thu Hà',
    childId: '2',
    rewardName: 'Đi công viên',
    rewardId: '5',
    dateCreated: '2025-11-13',
    cost: 60,
    status: 'pending',
  },
];

const RedemptionRequestsTab = () => {
  const [requests, setRequests] = useState<RedemptionRequest[]>(mockRequests);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleApprove = (requestId: string) => {
    setRequests(
      requests.map((r) =>
        r.id === requestId ? { ...r, status: 'approved' as RedemptionStatus } : r
      )
    );
    showToast('Đã chấp thuận yêu cầu đổi thưởng', 'success');
  };

  const handleReject = (requestId: string) => {
    setRequests(
      requests.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' as RedemptionStatus } : r
      )
    );
    showToast('Đã từ chối yêu cầu đổi thưởng', 'success');
  };

  const getStatusBadge = (status: RedemptionStatus) => {
    const statusConfig = {
      pending: { variant: 'warning' as const, label: 'Chờ duyệt' },
      approved: { variant: 'success' as const, label: 'Đã chấp thuận' },
      rejected: { variant: 'danger' as const, label: 'Đã từ chối' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div>
      {/* Description */}
      <p className="text-gray-600 mb-4">Các yêu cầu đổi thưởng đang chờ duyệt</p>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên bé
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phần thưởng
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày yêu cầu
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số Sao
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr
                key={request.id}
                className={`${
                  request.status !== 'pending'
                    ? 'opacity-50 bg-gray-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{request.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {request.child}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {request.rewardName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {request.dateCreated}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {request.cost}
                </td>
                <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                <td className="px-4 py-3">
                  {request.status === 'pending' ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Chấp thuận
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(request.id)}
                        className="flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Từ chối
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Đã xử lý</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không có yêu cầu đổi thưởng nào
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedemptionRequestsTab;
