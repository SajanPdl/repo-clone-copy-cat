
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, LogIn, EyeOff, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      console.log('Login attempt:', formData);
      
      // Mock authentication - in a real app, this would verify credentials with a backend
      if (formData.email === 'admin@edusanskriti.com' && formData.password === 'password') {
        toast({
          title: "Login Successful!",
          description: "Welcome to EduSanskriti.",
        });
        
        // Store user info in localStorage (in a real app, you'd store a token)
        localStorage.setItem('eduUser', JSON.stringify({
          email: formData.email,
          name: 'Admin User',
          role: 'admin'
        }));
        
        // Redirect to admin panel
        navigate('/admin');
      } else if (formData.email === 'student@edusanskriti.com' && formData.password === 'password') {
        toast({
          title: "Login Successful!",
          description: "Welcome back, Student!",
        });
        
        // Store user info in localStorage
        localStorage.setItem('eduUser', JSON.stringify({
          email: formData.email,
          name: 'Student User',
          role: 'student'
        }));
        
        // Redirect to home page
        navigate('/');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-edu-lightgray to-white dark:from-gray-900 dark:to-gray-800 flex-1 flex items-center">
        <div className="container mx-auto max-w-md">
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold gradient-text">Welcome Back</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Sign in to access your account
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm text-edu-purple hover:text-edu-indigo">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="pl-10 pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-edu-purple focus:ring-edu-purple border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary mt-6 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Don't have an account?{' '}
                <a href="#" className="text-edu-purple hover:text-edu-indigo font-medium">
                  Sign up
                </a>
              </p>
            </div>
            
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Test credentials:
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div>
                  <p className="font-bold">Admin:</p>
                  <p>admin@edusanskriti.com</p>
                  <p>password</p>
                </div>
                <div>
                  <p className="font-bold">Student:</p>
                  <p>student@edusanskriti.com</p>
                  <p>password</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
