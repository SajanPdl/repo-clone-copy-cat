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
                      <p className="text-gray-600 dark:text-gray-400">+977-1-234-5678</p>
                      <p className="text-gray-600 dark:text-gray-400">+977-9876-543-210</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-edu-orange/10 rounded-lg">
                      <MapPin className="h-6 w-6 text-edu-orange" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-1">Visit Us</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Kathmandu, Nepal<br />
                        Educational District, Building 123
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-edu-purple/10 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-edu-purple" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-1">Live Chat</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Available Monday - Friday<br />
                        9:00 AM - 6:00 PM (NPT)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-edu-purple/10 to-edu-blue/10 rounded-lg">
                  <h4 className="text-lg font-medium mb-2">Quick Response Guarantee</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We typically respond to all inquiries within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="order-1 lg:order-2">
              <div className="glass-card p-8">
                <h3 className="text-2xl font-semibold mb-6">Send us a Message</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-edu-purple"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-edu-purple"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-edu-purple"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="materials">Study Materials Request</option>
                      <option value="technical">Technical Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback & Suggestions</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-edu-purple resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-edu-purple to-edu-blue text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
                  >
                    <Send className="h-5 w-5 mr-2" />
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