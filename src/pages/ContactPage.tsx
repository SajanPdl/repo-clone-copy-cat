
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    requestType: 'general'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    // Show success message
    toast({
      title: "Message Sent!",
      description: "Thank you for your message. We'll get back to you shortly.",
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      requestType: 'general'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-edu-lightgray to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 gradient-text">Contact Us</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Have questions, suggestions, or need specific study materials? Reach out to us and we'll be happy to help you.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-edu-purple/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-edu-purple" />
              </div>
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our team is here to help you with any questions.
              </p>
              <a href="mailto:info@edusanskriti.com" className="text-edu-purple hover:text-edu-indigo transition-colors">
                info@edusanskriti.com
              </a>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-edu-purple/10 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-edu-purple" />
              </div>
              <h3 className="text-xl font-bold mb-2">Call Us</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Monday to Friday, 9am to 6pm IST
              </p>
              <a href="tel:+919876543210" className="text-edu-purple hover:text-edu-indigo transition-colors">
                +91 98765 43210
              </a>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-edu-purple/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-edu-purple" />
              </div>
              <h3 className="text-xl font-bold mb-2">Visit Us</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Come and visit our office headquarters.
              </p>
              <address className="not-italic text-edu-purple">
                123 Education Lane, Knowledge City, India
              </address>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-edu-purple" />
                Send Us a Message
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your email address"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Your phone number (optional)"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="requestType">Request Type</Label>
                    <select
                      id="requestType"
                      name="requestType"
                      value={formData.requestType}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      required
                    >
                      <option value="general">General Inquiry</option>
                      <option value="material">Request Study Material</option>
                      <option value="feedback">Feedback</option>
                      <option value="technical">Technical Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Subject of your message"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message..."
                      required
                      rows={6}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    ></textarea>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="btn-primary flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContactPage;
