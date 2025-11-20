import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import type { RedemptionRequest, RedemptionStatus } from '../../../types/reward.types';
import { getRedemptionRequests, approveRedemption, rejectRedemption } from '../../../api/services/rewardService';

const RedemptionRequestsTab = () => {
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  const [filterStatus, setFilterStatus] = useState<'all' | RedemptionStatus>('all');

  // Fetch redemption requests
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRedemptionRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load redemption requests');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveRedemption(requestId);
      await fetchRequests(); // Refresh the list
      showToast('Redemption request approved', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to approve request', 'error');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRedemption(requestId);
      await fetchRequests(); // Refresh the list
      showToast('Redemption request rejected', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reject request', 'error');
    }
  };

  const getStatusBadge = (status: RedemptionStatus) => {
    const statusConfig = {
      pending: { variant: 'warning' as const, label: 'Pending' },
      approved: { variant: 'success' as const, label: 'Approved' },
      rejected: { variant: 'danger' as const, label: 'Rejected' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Filter requests
  const filteredRequests = requests.filter((request) => 
    filterStatus === 'all' ? true : request.status === filterStatus
  );

  return (
    <div>
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-semibold">Error loading redemption requests</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchRequests}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="text-gray-500 mt-2">Loading redemption requests...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Filter */}
          <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        <div className="flex gap-2">
          {[{ value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value as typeof filterStatus)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                filterStatus === filter.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-primary-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500 ml-auto">
          {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <table className="w-full">
          <thead style={{ background: 'linear-gradient(to right, rgb(249 250 251), rgb(243 244 246))' }}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Child Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reward
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request, index) => (
                <tr
                  key={request.id}
                  onMouseEnter={() => setHoveredRow(request.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`transition-all ${
                    request.status !== 'pending' ? 'opacity-50' : ''
                  }`}
                  style={{
                    background: hoveredRow === request.id && request.status === 'pending'
                      ? 'linear-gradient(to right, rgba(239, 246, 255, 0.3), rgba(250, 245, 255, 0.3))'
                      : request.status !== 'pending' ? 'rgb(249 250 251)' : 'transparent',
                    animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`
                  }}
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900">{request.cost}</span>
                      <span className="text-xs text-gray-600">Coins</span>
                    </div>
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
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleReject(request.id)}
                          className="flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Processed</span>
                    )}
                  </td>
                </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && requests.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No requests match your filter
          </div>
        )}
        
        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No redemption requests
          </div>
        )}
      </div>
      </>
      )}

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
