
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search, BookOpen, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            404
          </CardTitle>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Page Not Found
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
          
          <div className="space-y-3 pt-4">
            <Link to="/">
              <Button className="w-full flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
            
            <Link to="/study-materials">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                Browse Study Materials
              </Button>
            </Link>
            
            <Link to="/contact">
              <Button variant="ghost" className="w-full flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Contact Support
              </Button>
            </Link>
          </div>
          
          <div className="pt-4 text-sm text-gray-500 dark:text-gray-400">
            Error Code: 404 | Page Not Found
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
