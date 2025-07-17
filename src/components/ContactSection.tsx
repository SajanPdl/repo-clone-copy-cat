
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to a server
  };

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">Contact Us</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions or need specific study materials? Reach out to us and our team will assist you promptly.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="order-2 lg:order-1">
              <div className="glass-card p-8 h-full">
                <h3 className="text-2xl font-semibold mb-6">Get in Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-edu-purple/10 rounded-lg">
                      <Mail className="h-6 w-6 text-edu-purple" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-1">Email Us</h4>
                      <p className="text-gray-600 dark:text-gray-400">contact@edusanskriti.com</p>
                      <p className="text-gray-600 dark:text-gray-400">support@edusanskriti.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-edu-blue/10 rounded-lg">
                      <Phone className="h-6 w-6 text-edu-blue" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-1">Call Us</h4>
                      <p className="text-gray-600 dark:text-gray-400">+91 98765 43210</p>
                      <p className="text-gray-600 dark:text-gray-400">+91 12345 67890</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-edu-orange/10 rounded-lg">
                      <MapPin className="h-6 w-6 text-edu-orange" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-1">Visit Us</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        123 Education Street, Knowledge Park,<br />
                        New Delhi, India - 110001
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Social Media */}
                <div className="mt-10">
                  <h4 className="text-lg font-medium mb-4">Follow Us</h4>
                  <div className="flex gap-4">
                    {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map(social => (
                      <a 
                        key={social}
                        href="#" 
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-edu-purple hover:text-white transition-colors duration-300"
                      >
                        {/* Simple placeholders for icons */}
                        <span className="text-sm">{social.charAt(0).toUpperCase()}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="order-1 lg:order-2">
              <div className="glass-card p-8">
                <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-edu-purple" />
                  Send a Message
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Your Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-edu-purple focus:ring-1 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                        placeholder="Enter your name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Your Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-edu-purple focus:ring-1 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-edu-purple focus:ring-1 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="materials">Study Materials</option>
                      <option value="papers">Past Papers</option>
                      <option value="app">Mobile App</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-edu-purple focus:ring-1 focus:ring-edu-purple/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                      placeholder="Enter your message"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
