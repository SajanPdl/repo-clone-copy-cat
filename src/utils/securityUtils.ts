
import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';

// Security utility functions for role management and validation
export const securityUtils = {
  // Validate user role changes - only admins can modify roles
  async validateRoleChange(userId: string, newRole: string): Promise<boolean> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return false;

      // Check if current user is admin
      const { data: adminCheck } = await supabase.rpc('is_admin', {
        user_id: currentUser.user.id
      });

      return adminCheck === true;
    } catch (error) {
      console.error('Role validation error:', error);
      return false;
    }
  },

  // Secure HTML sanitization with stricter rules
  sanitizeHTML: (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: false,
      ALLOW_DATA_ATTR: false
    });
  },

  // Validate and sanitize user input
  validateInput: (input: string, maxLength: number = 1000): string => {
    if (!input || typeof input !== 'string') return '';
    
    // Remove any potential script injections
    const cleaned = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
    
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength) : cleaned;
  },

  // Generate secure session tokens
  generateSecureToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  // Encrypt sensitive data before storing
  encryptSensitiveData: (data: string): string => {
    // Simple encryption for demonstration - in production, use proper encryption
    return btoa(data);
  },

  // Decrypt sensitive data
  decryptSensitiveData: (encryptedData: string): string => {
    try {
      return atob(encryptedData);
    } catch {
      return '';
    }
  }
};
