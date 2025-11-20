import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Sparkles, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ChildFormModal from '../../parents/settings/ChildFormModal';
import type { ChildProfile } from '../../../types/user.types';
import {
  getChildren,
  createChild,
  updateChild,
  deleteChild,
} from '../../../api/services/childService';

const ChildProfilesTab = () => {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });
  
  // State quản lý Form Modal (Add/Edit dùng chung)
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // State quản lý Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch children on mount
  useEffect(() => {
    fetchChildren();
  }, []);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getChildren();
      
      // Map backend response to frontend format
      const mappedChildren: ChildProfile[] = response.map(child => ({
        id: child.id,
        nickname: child.nickname || child.name,
        fullName: child.name,
        dateOfBirth: child.birth_date,
        age: calculateAge(child.birth_date),
        gender: (child.gender as 'male' | 'female' | 'other') || 'other',
        avatar: child.avatar_url,
        personality: child.personality || [],
        interests: child.interests || [],
        strengths: child.strengths || [],
        challenges: child.challenges || [],
      }));
      
      setChildren(mappedChildren);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load children';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Mở form để THÊM MỚI
  const handleAddClick = () => {
    setSelectedChild(null); // null = chế độ Add
    setIsFormOpen(true);
  };

  // Mở form để CHỈNH SỬA
  const handleEditClick = (child: ChildProfile) => {
    setSelectedChild(child); // có data = chế độ Edit
    setIsFormOpen(true);
  };

  // Xử lý LƯU (được gọi từ ChildFormModal khi ấn Save)
  const handleSaveChild = async (childData: ChildProfile) => {
    try {
      setSaving(true);
      setError(null);
      
      // Map frontend format to backend format
      const backendData = {
        name: childData.fullName,
        birth_date: childData.dateOfBirth,
        nickname: childData.nickname,
        gender: childData.gender,
        avatar_url: childData.avatar,
        personality: childData.personality,
        interests: childData.interests,
        strengths: childData.strengths,
        challenges: childData.challenges,
        initial_traits: {},
      };
      
      if (selectedChild) {
        // Update existing child
        await updateChild(selectedChild.id, backendData);
        showToast(`${childData.nickname} updated successfully!`, 'success');
      } else {
        // Create new child
        await createChild(backendData);
        showToast(`${childData.nickname} added successfully!`, 'success');
      }
      
      // Refresh list
      await fetchChildren();
      setIsFormOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save child';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Mở modal XÓA
  const handleDeleteClick = (child: ChildProfile) => {
    setSelectedChild(child);
    setIsDeleteModalOpen(true);
  };

  // Xử lý XÁC NHẬN XÓA
  const handleConfirmDelete = async () => {
    if (!selectedChild) return;
    
    try {
      setSaving(true);
      setError(null);
      
      await deleteChild(selectedChild.id);
      
      showToast(`${selectedChild.nickname} deleted successfully`, 'success');
      
      // Refresh list
      await fetchChildren();
      setIsDeleteModalOpen(false);
      setSelectedChild(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete child';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string, age: number) => {
    const date = new Date(dateString);
    // Fallback nếu ngày sai định dạng
    if (isNaN(date.getTime())) return `Unknown (${age} tuổi)`; 
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} (${age} tuổi)`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Manage and Update Children's Profiles
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Update personality & interests as they grow
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Child Profile
        </Button>
      </div>

      {/* Children Grid */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child, index) => (
          <div
            key={child.id}
            className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-strong hover:-translate-y-1 transition-all duration-300 border border-gray-100 group"
            style={{ animation: `fadeIn 0.3s ease-in-out ${index * 0.1}s both` }}
          >
            {/* Avatar Section with Gradient */}
            <div className="p-8 flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
               {/* Decorative circles */}
               <div className="absolute top-2 right-2 w-16 h-16 bg-white opacity-10 rounded-full blur-xl"></div>
               <div className="absolute bottom-2 left-2 w-10 h-10 bg-pink-400 opacity-20 rounded-full blur-lg"></div>

              {child.avatar ? (
                <img
                  src={child.avatar}
                  alt={child.nickname}
                  className="w-24 h-24 rounded-full border-4 border-white/30 shadow-xl object-cover relative z-10"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl relative z-10">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors">
                  {child.nickname}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg" title={child.gender}>
                    {child.gender === 'male' ? '👦' : child.gender === 'female' ? '👧' : '🌟'}
                  </span>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                    {child.age} yrs
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  {child.fullName}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  🎂 Birthday: {formatDate(child.dateOfBirth, child.age).split(' (')[0]}
                </p>
              </div>

              {/* Interests Tags (Optional display) */}
              {child.interests && child.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {child.interests.slice(0, 2).map((interest, i) => (
                     <span key={i} className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full border border-purple-100">
                       {interest.replace(/^[^\s]+\s/, '')} {/* Remove emoji if exists for cleaner look */}
                     </span>
                  ))}
                  {child.interests.length > 2 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-gray-400">+{child.interests.length - 2}</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditClick(child)}
                  className="flex-1 flex items-center justify-center gap-1 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteClick(child)}
                  className="flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add New Card (Empty State Placeholder Style) */}
        <button 
          onClick={handleAddClick}
          className="min-h-[300px] rounded-2xl border-2 border-dashed border-gray-300 shadow-soft flex flex-col items-center justify-center p-6 hover:border-purple-400 hover:bg-purple-50/30 hover:shadow-medium transition-all duration-300 group cursor-pointer active:scale-95"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center mb-4 transition-colors">
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-600" />
          </div>
          <p className="font-semibold text-gray-600 group-hover:text-purple-700">Add Another Child</p>
          <p className="text-xs text-gray-400 mt-1">Create a new learning path</p>
        </button>
      </div>

      {children.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No child profiles yet</p>
          <p className="text-sm mt-2">
            Click "Add Child Profile" to start the journey!
          </p>
        </div>
      )}

      {/* === UNIFIED ADD/EDIT MODAL === */}
      <ChildFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={selectedChild} // Truyền data nếu là Edit, null nếu là Add
        onSave={handleSaveChild}
      />

      {/* === DELETE CONFIRMATION MODAL === */}
      {selectedChild && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedChild(null);
          }}
          title="Confirm Deletion"
          size="sm"
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-soft">
              <p className="text-gray-900 font-semibold text-center">
                Are you sure you want to delete <strong className="text-red-600">{selectedChild.nickname}</strong>'s profile?
              </p>
              <p className="text-sm text-red-600 text-center mt-2 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                This action cannot be undone and all progress will be lost.
              </p>
            </div>
            <div className="flex gap-3 justify-center mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedChild(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete Profile'}
              </Button>
            </div>
          </div>
        </Modal>
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
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildProfilesTab;