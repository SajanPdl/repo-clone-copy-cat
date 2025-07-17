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
              <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple transition-colors">
                Home
              </Link>
              <a href="#study-materials" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple transition-colors">
                Study Materials
              </a>
              <a href="#past-papers" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple transition-colors">
                Past Papers
              </a>
              <a href="#blog" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple transition-colors">
                Blog
              </a>
              <a href="#contact" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple transition-colors">
                Contact
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-edu-purple transition-colors">
                <Search size={20} />
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User size={20} className="text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{user.name}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-edu-purple transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-edu-purple to-edu-blue text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple transition-colors">
                Home
              </Link>
              <a href="#study-materials" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple transition-colors">
                Study Materials
              </a>
              <a href="#past-papers" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple transition-colors">
                Past Papers
              </a>
              <a href="#blog" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple transition-colors">
                Blog
              </a>
              <a href="#contact" className="text-gray-700 dark:text-gray-200 hover:text-edu-purple transition-colors">
                Contact
              </a>
              
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-center text-gray-700 dark:text-gray-200 hover:text-edu-purple transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-edu-purple to-edu-blue text-white text-center rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;