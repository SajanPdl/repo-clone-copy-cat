
import DOMPurify from 'dompurify';
import { securityUtils } from './securityUtils';

// Enhanced sanitization for HTML content with security-first approach
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOWED_URI_REGEXP: /^https?:\/\//,
    KEEP_CONTENT: false,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover', 'style']
  });
};

// Enhanced text sanitization with XSS protection
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
};

// Validate email format with enhanced security
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Additional security checks
  if (email.length > 254) return false;
  if (email.includes('..')) return false;
  if (email.startsWith('.') || email.endsWith('.')) return false;
  
  return emailRegex.test(email);
};

// Enhanced file validation
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  if (!file || !file.type) return false;
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) return false;
  
  // Additional file extension check
  const fileName = file.name.toLowerCase();
  const allowedExtensions = allowedTypes.map(type => {
    switch(type) {
      case 'application/pdf': return '.pdf';
      case 'image/jpeg': return '.jpg';
      case 'image/jpg': return '.jpg';
      case 'image/png': return '.png';
      case 'text/plain': return '.txt';
      default: return '';
    }
  }).filter(ext => ext);
  
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  return hasValidExtension;
};

// Enhanced file size validation
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  if (!file) return false;
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size > 0 && file.size <= maxSizeBytes;
};

// Enhanced LaTeX sanitization with security focus
export const sanitizeLaTeX = (latex: string): string => {
  if (!latex || typeof latex !== 'string') return '';
  
  // Comprehensive list of dangerous LaTeX commands
  const dangerousCommands = [
    '\\input', '\\include', '\\write', '\\read', '\\openin', '\\openout',
    '\\immediate', '\\shell', '\\system', '\\directlua', '\\catcode',
    '\\def', '\\let', '\\futurelet', '\\expandafter', '\\csname',
    '\\endcsname', '\\jobname', '\\special', '\\pdfliteral'
  ];
  
  let sanitized = latex;
  dangerousCommands.forEach(cmd => {
    const regex = new RegExp(`\\${cmd.replace(/\\/g, '\\\\')}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Remove any remaining suspicious patterns
  sanitized = sanitized.replace(/\\[a-zA-Z@]+\s*\{[^}]*\\[a-zA-Z@]+/g, '');
  
  return sanitized.trim();
};

// Enhanced form data validation with security controls
export const validateAndSanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Enhanced string sanitization
      const cleanValue = sanitizeText(value.trim());
      
      // Apply field-specific validation
      if (key.includes('email')) {
        sanitized[key] = validateEmail(cleanValue) ? cleanValue : '';
      } else if (key.includes('url') || key.includes('link')) {
        sanitized[key] = validateUrl(cleanValue) ? cleanValue : '';
      } else {
        sanitized[key] = securityUtils.validateInput(cleanValue);
      }
    } else if (typeof value === 'number') {
      sanitized[key] = isFinite(value) ? value : 0;
    } else if (typeof value === 'boolean') {
      sanitized[key] = Boolean(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// URL validation with security checks
const validateUrl = (url: string): boolean => {
  if (!url) return true; // Empty URLs are allowed
  
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Prevent local network access
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./) ||
        hostname === '0.0.0.0') {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

// Content Security Policy helper
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://ozodujwsonbbbiiuxjaj.supabase.co",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');
};
