import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Sparkles, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ChildFormModal from '../../parents/settings/ChildFormModal';
import type { ChildProfile } from '../../../types/user.types';
import { useChild } from '../../../providers/ChildProvider';
import {
  getChildren,
  createChild,
  updateChild,
  deleteChild,
} from '../../../api/services/childService';
import { assessmentQuestionsPrimary, assessmentQuestionsSecondary } from '../../../data/assessmentQuestions';

const ChildProfilesTab = () => {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshChildren } = useChild(); // Get refresh function from ChildProvider
  
  // State quản lý Form Modal (Add/Edit dùng chung)
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // State quản lý Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);

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
      toast.error(errorMsg);
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
  const handleSaveChild = async (childData: ChildProfile | Partial<ChildProfile>) => {
    try {
      setSaving(true);
      setError(null);
      
      if (selectedChild) {
        // EDIT MODE - Only update provided fields (partial update)
        const backendData: any = {};
        
        // Map only the fields that exist in childData
        if ('fullName' in childData && childData.fullName) {
          backendData.name = childData.fullName;
        }
        if ('nickname' in childData && childData.nickname) {
          backendData.nickname = childData.nickname;
        }
        if ('interests' in childData && childData.interests) {
          backendData.interests = childData.interests;
        }
        
        // Handle credential updates (username/password)
        if ('username' in childData && childData.username) {
          backendData.username = childData.username;
        }
        if ('password' in childData && childData.password) {
          backendData.password = childData.password;
        }
        
        // Update existing child
        await updateChild(selectedChild.id, backendData);
        toast.success(`${childData.nickname || selectedChild.nickname} updated successfully!`);
      } else {
        // ADD MODE - Full child creation with assessment
        const fullChildData = childData as ChildProfile;
        
        // Map frontend format to backend format
        const backendData: any = {
          name: fullChildData.fullName,
          birth_date: fullChildData.dateOfBirth,
          nickname: fullChildData.nickname,
          gender: fullChildData.gender,
          avatar_url: fullChildData.avatar,
          personality: fullChildData.personality || [],
          interests: fullChildData.interests || [],
          strengths: fullChildData.strengths || [],
          challenges: fullChildData.challenges || [],
          initial_traits: {},
        };
        
        // If has assessment data, include it for LLM analysis
        if (fullChildData.assessment && fullChildData.assessment.answers.length > 0) {
          // Combine all assessment questions (same as onboarding)
          const allQuestions = [...assessmentQuestionsPrimary, ...assessmentQuestionsSecondary];
          
          // Convert assessment answers to backend format (same as onboarding)
          const getCategoryAnswers = (category: string) => {
            const answers = fullChildData.assessment!.answers
              .filter(a => {
                const question = allQuestions.find(q => q.id === a.questionId);
                return question?.category === category;
              })
              .reduce((acc, a) => {
                if (a.rating != null) {
                  acc[a.questionId] = String(a.rating);
                }
                return acc;
              }, {} as Record<string, string>);
            return answers;
          };
          
          backendData.assessment = {
            discipline_autonomy: getCategoryAnswers('discipline'),
            emotional_intelligence: getCategoryAnswers('emotional'),
            social_interaction: getCategoryAnswers('social'),
          };
        }
        
        // Include username and password if provided (for child account creation)
        if (fullChildData.username) {
          backendData.username = fullChildData.username;
        }
        if (fullChildData.password) {
          backendData.password = fullChildData.password;
        }
        
        // Create new child
        await createChild(backendData);
        toast.success(`${fullChildData.nickname} added successfully!`);
      }
      
      // Refresh local list
      await fetchChildren();
      // Refresh children in ChildProvider (for dashboard and other components)
      await refreshChildren();
      setIsFormOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save child';
      setError(errorMsg);
      toast.error(errorMsg);
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
      
      toast.success(`${selectedChild.nickname} deleted successfully`);
      
      // Refresh list
      await fetchChildren();
      // Refresh children in ChildProvider (for dashboard and other components)
      await refreshChildren();
      setIsDeleteModalOpen(false);
      setSelectedChild(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete child';
      setError(errorMsg);
      toast.error(errorMsg);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading children profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow-soft">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Manage Children's Profiles
          </h2>
          <p className="text-gray-600 text-sm">
            Update personality & interests as they grow
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          icon={<Plus className="w-5 h-5" />}
          size="md"
          className="whitespace-nowrap shadow-md hover:shadow-lg"
        >
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
            className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-strong hover:-translate-y-1 transition-all duration-300 border border-gray-100 group cursor-pointer"
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(child);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl border-2 border-purple-300 text-purple-600 bg-white hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition-all duration-200 active:scale-95 shadow-soft hover:shadow-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(child);
                  }}
                  className="flex items-center justify-center px-3 py-1.5 text-sm font-semibold rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 active:scale-95 border border-transparent hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add New Card (Empty State Placeholder Style) */}
        <button 
          onClick={handleAddClick}
          className="min-h-[300px] rounded-2xl border-2 border-dashed border-gray-300 shadow-soft flex flex-col items-center justify-center p-6 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 hover:shadow-medium transition-all duration-300 group cursor-pointer active:scale-95"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-purple-100 group-hover:to-blue-100 flex items-center justify-center mb-4 transition-all duration-300 shadow-soft group-hover:shadow-md">
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <p className="font-semibold text-gray-600 group-hover:text-purple-700 transition-colors">Add Another Child</p>
          <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-500 transition-colors">Create a new learning path</p>
        </button>
      </div>

      {children.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
            <Sparkles className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-1">No child profiles yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Click "Add Child Profile" to start the journey!
          </p>
          <Button
            onClick={handleAddClick}
            icon={<Plus className="w-5 h-5" />}
            size="sm"
          >
            Add Your First Child
          </Button>
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
    </div>
  );
};

export default ChildProfilesTab;