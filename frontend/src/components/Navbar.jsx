import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, MapPin, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-indigo-600">
            <MapPin className="h-6 w-6" />
            <span>PetFinder</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-indigo-600">Home</Link>
            
            {user ? (
              <>
                <Link 
                  to="/create-post" 
                  className="flex items-center space-x-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create post</span>
                </Link>
                <Link to="/notifications" className="text-gray-600 hover:text-indigo-600">
                  <Bell className="h-5 w-5" />
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">Hi, {user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600">Login</Link>
                <Link 
                  to="/register" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
