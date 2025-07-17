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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <a href="#study-materials" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                  Study Materials
                </a>
              </li>
              <li>
                <a href="#past-papers" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                  Past Papers
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                  Blog
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/grade/grade10" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                  Grade 10
                </Link>
              </li>
              <li>
                <Link to="/grade/grade11" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                  Grade 11
                </Link>
              </li>
              <li>
                <Link to="/grade/grade12" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                  Grade 12
                </Link>
              </li>
              <li>
                <Link to="/bachelor" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                  Bachelor's Level
                </Link>
              </li>
              <li>
                <Link to="/app" className="text-gray-600 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                  Mobile App
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-edu-purple mt-0.5" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400">contact@edusanskriti.com</p>
                  <p className="text-gray-600 dark:text-gray-400">support@edusanskriti.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-edu-blue mt-0.5" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400">+977-1-234-5678</p>
                  <p className="text-gray-600 dark:text-gray-400">+977-9876-543-210</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-edu-purple/10 to-edu-blue/10 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Newsletter</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Subscribe for educational updates and new materials.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <button className="px-4 py-2 bg-edu-purple text-white text-sm rounded hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-0">
              © 2023 EduSanskriti. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-500 dark:text-gray-400 hover:text-edu-purple transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;