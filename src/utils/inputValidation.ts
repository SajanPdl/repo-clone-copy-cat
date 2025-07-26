
import DOMPurify from 'dompurify';

// Sanitize HTML content to prevent XSS
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  });
};

// Validate and sanitize text input
export const sanitizeText = (text: string): string => {
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate file type
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

// Validate file size (in MB)
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Sanitize LaTeX input
export const sanitizeLaTeX = (latex: string): string => {
  // Remove dangerous LaTeX commands
  const dangerousCommands = [
    '\\input',
    '\\include',
    '\\write',
    '\\read',
    '\\openin',
    '\\openout',
    '\\immediate',
    '\\shell'
  ];
  
  let sanitized = latex;
  dangerousCommands.forEach(cmd => {
    const regex = new RegExp(`\\${cmd}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized;
};

// Validate form data with proper sanitization
export const validateAndSanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value.trim());
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
