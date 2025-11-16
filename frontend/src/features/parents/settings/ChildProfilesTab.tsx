import { useState } from 'react';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import type { ChildProfile } from '../../../types/user.types';

// Mock data
const mockChildren: ChildProfile[] = [
  {
    id: '1',
    nickname: 'Bé Bắp',
    fullName: 'Nguyễn Minh An',
    dateOfBirth: '2018-01-01',
    age: 7,
    gender: 'male',
    personality: ['Hoạt bát', 'Tò mò'],
    interests: ['Vẽ', 'Lego'],
    strengths: ['Sáng tạo', 'Logic'],
    challenges: ['Tập trung'],
  },
  {
    id: '2',
    nickname: 'Bé Hà',
    fullName: 'Nguyễn Thu Hà',
    dateOfBirth: '2016-05-15',
    age: 9,
    gender: 'female',
    personality: ['Điềm đạm', 'Chu đáo'],
    interests: ['Đọc sách', 'Piano'],
    strengths: ['Học tập', 'Trách nhiệm'],
    challenges: ['Tự tin'],
  },
];

const ChildProfilesTab = () => {
  const [children, setChildren] = useState<ChildProfile[]>(mockChildren);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);

  const handleEditClick = (child: ChildProfile) => {
    setSelectedChild(child);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (child: ChildProfile) => {
    setSelectedChild(child);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedChild) {
      setChildren(children.filter((c) => c.id !== selectedChild.id));
      setIsDeleteModalOpen(false);
      setSelectedChild(null);
    }
  };

  const formatDate = (dateString: string, age: number) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} (${age} tuổi)`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Manage and Update Children's Profiles
          </h2>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
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
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
            style={{ animation: `fadeIn 0.3s ease-in-out ${index * 0.1}s both` }}
          >
            {/* Avatar */}
            <div className="p-8 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              {child.avatar ? (
                <img
                  src={child.avatar}
                  alt={child.nickname}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">
                  {child.nickname}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{child.gender === 'male' ? '👦' : '👧'}</span>
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                    {child.age} yrs
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {child.fullName}
              </p>
              <p className="text-xs text-gray-400">
                Birthday: {formatDate(child.dateOfBirth, child.age).split(' (')[0]}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditClick(child)}
                  className="flex-1 flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteClick(child)}
                  className="flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {children.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No child profiles yet</p>
          <p className="text-sm mt-2">
            Click "Add Child Profile" to create a new profile
          </p>
        </div>
      )}

      {/* Add Child Modal - Full Screen Questionnaire */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Child Profile"
        size="xl"
      >
        <div className="space-y-6">
          <div className="p-6 bg-blue-50 rounded-lg text-center">
            <p className="text-gray-700">
              📋 This is where the complete <strong>REGISTRATION QUESTIONNAIRE</strong> (SECTION A, B, C, D) will be displayed
              <br />
              for parents to fill in information for a new child.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              (Detailed component will be integrated from registration section)
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement save logic
                alert('New child profile added');
                setIsAddModalOpen(false);
              }}
            >
              Save Profile
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Child Modal - Full Screen Questionnaire */}
      {selectedChild && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedChild(null);
          }}
          title={`Edit Profile - ${selectedChild.nickname}`}
          size="xl"
        >
          <div className="space-y-6">
            <div className="p-6 bg-blue-50 rounded-lg text-center">
              <p className="text-gray-700">
                📋 This is where the complete <strong>REGISTRATION QUESTIONNAIRE</strong> (SECTION A, B, C, D) will be displayed
                <br />
                with <strong>{selectedChild.nickname}</strong>'s data pre-filled.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Parents can update information as the child grows or their personality changes.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedChild(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement update logic
                  alert('Profile updated');
                  setIsEditModalOpen(false);
                  setSelectedChild(null);
                }}
              >
                Update Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
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
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{selectedChild.nickname}</strong>'s profile?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedChild(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ChildProfilesTab;
