
import { Link } from 'react-router-dom';
import { Mail, Phone, GraduationCap, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="h-7 w-7 text-edu-purple" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-edu-purple to-edu-blue">
                EduSanskriti
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your comprehensive educational resource platform for study materials, past papers, notes, and academic guidance.
            </p>
            
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-500 hover:text-edu-purple transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-edu-purple transition-colors duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-edu-purple transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-edu-purple transition-colors duration-300">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-edu-purple transition-colors duration-300">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple dark:hover:text-edu-purple transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="#study-materials" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple dark:hover:text-edu-purple transition-colors duration-300">
                  Study Materials
                </Link>
              </li>
              <li>
                <Link to="#past-papers" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple dark:hover:text-edu-purple transition-colors duration-300">
                  Past Papers
                </Link>
              </li>
              <li>
                <Link to="#blog" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple dark:hover:text-edu-purple transition-colors duration-300">
                  Blog Articles
                </Link>
              </li>
              <li>
                <Link to="#contact" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple dark:hover:text-edu-purple transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Study Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple dark:hover:text-edu-purple transition-colors duration-300">
                  School Resources
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple dark:hover:text-edu-purple transition-colors duration-300">
                  College Resources
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple dark:hover:text-edu-purple transition-colors duration-300">
                  Engineering
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple dark:hover:text-edu-purple transition-colors duration-300">
                  Medical
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple dark:hover:text-edu-purple transition-colors duration-300">
                  Competitive Exams
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-edu-purple mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  contact@edusanskriti.com
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-edu-purple mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">
                  +91 98765 43210
                </span>
              </li>
              <li className="flex">
                <div className="p-3 bg-edu-purple/10 rounded-lg mr-4">
                  <GraduationCap className="h-6 w-6 text-edu-purple" />
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  <p>123 Education Street,</p>
                  <p>Knowledge Park, New Delhi,</p>
                  <p>India - 110001</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Newsletter */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 pb-8">
          <div className="max-w-xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-center">Subscribe to Our Newsletter</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Get the latest educational resources, exam updates, and study tips delivered to your inbox.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-edu-purple focus:ring-1 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                required
              />
              <button
                type="submit"
                className="bg-edu-purple hover:bg-edu-indigo text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} EduSanskriti. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
