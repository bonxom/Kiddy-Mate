import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { useChild } from '../../providers/ChildProvider';

const ChildSelector = () => {
  const { selectedChildId, children, setSelectedChildId } = useChild();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedChild = children.find(child => child.id === selectedChildId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId);
    setIsOpen(false);
  };

  const getChildAge = (birthDate: string | undefined) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? `${age} tuổi` : '';
  };

  const getAvatarDisplay = (child: typeof children[0]) => {
    if (child.avatar_url) {
      return (
        <img 
          src={child.avatar_url} 
          alt={child.name}
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-400 to-primary-600 text-gray-900 font-bold text-lg">
        {child.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (children.length === 0) {
    return null;
  }

  // Single child - no selector needed
  if (children.length === 1) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="w-8 h-8 rounded-full overflow-hidden">
          {getAvatarDisplay(children[0])}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">{children[0].name}</span>
          {children[0].birth_date && (
            <span className="text-xs text-gray-500">{getChildAge(children[0].birth_date)}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200 group"
      >
        {selectedChild ? (
          <>
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {getAvatarDisplay(selectedChild)}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {selectedChild.name}
              </span>
              {selectedChild.birth_date && (
                <span className="text-xs text-gray-500">
                  {getChildAge(selectedChild.birth_date)}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-500">Select child</span>
          </>
        )}
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-slide-up">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Select Child
            </p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {children.map((child) => {
              const isSelected = child.id === selectedChildId;
              
              return (
                <button
                  key={child.id}
                  onClick={() => handleSelectChild(child.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    {getAvatarDisplay(child)}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        isSelected ? 'text-primary-700' : 'text-gray-900'
                      }`}>
                        {child.name}
                      </span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}  
                    </div>
                    
                    {child.birth_date && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getChildAge(child.birth_date)}
                      </p>
                    )}                    {child.nickname && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        "{child.nickname}"
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildSelector;
