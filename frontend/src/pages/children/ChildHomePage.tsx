import { useAuth } from '../../providers/AuthProvider';

const ChildHomePage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome, {user?.displayName || 'Child'}! 🎮
        </h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-600">
              The child dashboard is under construction. Check back soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildHomePage;
