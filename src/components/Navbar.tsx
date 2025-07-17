
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, GraduationCap, User, LogOut } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<{name: string, email: string, role: string} | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Check for logged in user
    const userStr = localStorage.getItem('eduUser');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('eduUser');
    setUser(null);
    setShowUserMenu(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-edu-purple" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-edu-purple to-edu-blue">
              EduSanskriti
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple dark:hover:text-edu-purple transition-colors">
                Home
              </Link>
              <Link to="/study-materials" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple dark:hover:text-edu-purple transition-colors">
                Study Materials
              </Link>
              <Link to="/past-papers" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple dark:hover:text-edu-purple transition-colors">
                Past Papers
              </Link>
              <Link to="/blog" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple dark:hover:text-edu-purple transition-colors">
                Blog
              </Link>
              <Link to="/contact" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple dark:hover:text-edu-purple transition-colors">
                Contact
              </Link>
            </nav>
            
            <Link to="/study-materials" className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <Search className="h-5 w-5" />
            </Link>
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)} 
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-edu-purple dark:hover:text-edu-purple"
                >
                  <div className="w-8 h-8 rounded-full bg-edu-purple text-white flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-20">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <div className="p-2">
                      {user.role === 'admin' && (
                        <Link 
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary">
                Student Login
              </Link>
            )}
          </div>
          
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-gray-700 dark:text-gray-200"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden bg-white dark:bg-gray-900 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 py-3 space-y-3">
          <Link to="/" className="block text-gray-700 dark:text-gray-200 hover:text-edu-purple dark:hover:text-edu-purple">
            Home
          </Link>
          <Link to="/study-materials" className="block text-gray-700 dark:text-gray-200 hover:text-edu-purple dark:hover:text-edu-purple">
            Study Materials
          </Link>
          <Link to="/past-papers" className="block text-gray-700 dark:text-gray-200 hover:text-edu-purple dark:hover:text-edu-purple">
            Past Papers
          </Link>
          <Link to="/blog" className="block text-gray-700 dark:text-gray-200 hover:text-edu-purple dark:hover:text-edu-purple">
            Blog
          </Link>
          <Link to="/contact" className="block text-gray-700 dark:text-gray-200 hover:text-edu-purple dark:hover:text-edu-purple">
            Contact
          </Link>
          
          {user ? (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-edu-purple text-white flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div className="ml-2">
                  <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              
              {user.role === 'admin' && (
                <Link 
                  to="/admin"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Admin Panel
                </Link>
              )}
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="w-full btn-primary block text-center">
              Student Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
