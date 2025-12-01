import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Check, X, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { handleApiError } from '../../../utils/errorHandler';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Loading from '../../../components/ui/Loading';
import type { RedemptionRequest, RedemptionStatus } from '../../../types/reward.types';
import { getRedemptionRequests, approveRedemption, rejectRedemption } from '../../../api/services/rewardService';

interface RedemptionRequestsTabProps {
  onPendingCountChange?: (count: number) => void;
  onRedemptionProcessed?: () => void; // Callback after approve/reject to refresh shop
}

const RedemptionRequestsTab = ({ onPendingCountChange, onRedemptionProcessed }: RedemptionRequestsTabProps) => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<'all' | RedemptionStatus>('all');

  // Fetch redemption requests using React Query
  const {
    data: requests = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['redemption-requests'],
    queryFn: async () => {
      return await getRedemptionRequests();
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: false, // Don't refetch if data is fresh (component stays mounted)
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary calls
  });

  const error = queryError ? (queryError as Error).message : null;

  // Notify parent when pending count changes
  useEffect(() => {
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    onPendingCountChange?.(pendingCount);
  }, [requests, onPendingCountChange]);

  // Approve mutation with optimistic updates
  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await approveRedemption(requestId);
    },
    onMutate: async (requestId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['redemption-requests'] });
      
      // Snapshot previous value
      const previousRequests = queryClient.getQueryData<RedemptionRequest[]>(['redemption-requests']);
      
      // Optimistically update: change status from 'pending' to 'approved'
      if (previousRequests) {
        queryClient.setQueryData<RedemptionRequest[]>(
          ['redemption-requests'],
          previousRequests.map((request) => {
            if (request.id === requestId) {
              return { ...request, status: 'approved' as const };
            }
            return request;
          })
        );
      }
      
      return { previousRequests };
    },
    onError: (_err, _requestId, context) => {
      // Rollback on error
      if (context?.previousRequests) {
        queryClient.setQueryData(['redemption-requests'], context.previousRequests);
      }
    },
    onSuccess: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['redemption-requests'] });
      onRedemptionProcessed?.(); // Notify parent to refresh shop (stock changed)
    },
  });

  // Reject mutation with optimistic updates
  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await rejectRedemption(requestId);
    },
    onMutate: async (requestId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['redemption-requests'] });
      
      // Snapshot previous value
      const previousRequests = queryClient.getQueryData<RedemptionRequest[]>(['redemption-requests']);
      
      // Optimistically update: change status from 'pending' to 'rejected'
      if (previousRequests) {
        queryClient.setQueryData<RedemptionRequest[]>(
          ['redemption-requests'],
          previousRequests.map((request) => {
            if (request.id === requestId) {
              return { ...request, status: 'rejected' as const };
            }
            return request;
          })
        );
      }
      
      return { previousRequests };
    },
    onError: (_err, _requestId, context) => {
      // Rollback on error
      if (context?.previousRequests) {
        queryClient.setQueryData(['redemption-requests'], context.previousRequests);
      }
    },
    onSuccess: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['redemption-requests'] });
      onRedemptionProcessed?.(); // Notify parent (though stock unchanged, keeps UI consistent)
    },
  });

  const handleApprove = async (requestId: string) => {
    try {
      await approveMutation.mutateAsync(requestId);
      toast.success('Redemption request approved successfully!');
    } catch (err: any) {
      handleApiError(err, 'Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectMutation.mutateAsync(requestId);
      toast.success('Redemption request rejected');
    } catch (err: any) {
      handleApiError(err, 'Failed to reject request');
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
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => 
      filterStatus === 'all' ? true : request.status === filterStatus
    );
  }, [requests, filterStatus]);

  return (
    <div>
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-semibold">Error loading redemption requests</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => queryClient.refetchQueries({ queryKey: ['redemption-requests'] })}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
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
      <div 
        className="overflow-x-auto border border-gray-200 rounded-2xl shadow-soft [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <table className="w-full">
          <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
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
                  className={`transition-all duration-200 ${
                    request.status !== 'pending' ? 'opacity-50' : ''
                  } ${
                    hoveredRow === request.id && request.status === 'pending' ? 'shadow-soft' : ''
                  }`}
                  style={{
                    background: hoveredRow === request.id && request.status === 'pending'
                      ? 'linear-gradient(to right, rgba(239, 246, 255, 0.5), rgba(250, 245, 255, 0.5))'
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
          <div className="text-center py-12 bg-gray-50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Gift className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No requests match your filter</p>
            <p className="text-sm text-gray-400 mt-1">Try changing the filter to see more requests</p>
          </div>
        )}
        
        {requests.length === 0 && (
          <div className="text-center py-12 bg-gray-50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Gift className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No redemption requests yet</p>
            <p className="text-sm text-gray-400 mt-1">Requests will appear here when children redeem rewards</p>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default RedemptionRequestsTab;
