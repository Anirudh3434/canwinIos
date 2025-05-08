/**
 * Utility functions to sanitize data before sending to database
 */

// Trim excess whitespace and normalize spaces
const sanitizeString = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' ');
  };
  
  // Remove special characters that might cause SQL issues
  const removeSpecialChars = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[^\w\s.,@-]/g, '');
  };
  
  // Full sanitization function that combines both approaches
  const sanitizeData = (str) => {
    if (!str || typeof str !== 'string') return '';
    return removeSpecialChars(sanitizeString(str));
  };
  
  // Format comma-separated values correctly (removes extra spaces, duplicate commas)
  const formatCSV = (arr) => {
    if (!arr || !Array.isArray(arr)) return '';
    
    // Filter out empty strings and sanitize each item
    const cleanedArr = arr.flat()
      .map(item => sanitizeString(item))
      .filter(item => item.length > 0);
    
    // Return unique values as comma-separated string
    return [...new Set(cleanedArr)].join(',');
  };
  
  // Sanitize entire job posting payload
  const sanitizeJobPayload = (payload) => {
    const sanitized = { ...payload };
    
    // Sanitize string fields
    const stringFields = [
      'job_title', 
      'job_description', 
      'workplace_type', 
      'department',
      'employment_type',
      'receive_applicants_by',
      'email'
    ];
    
    stringFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = sanitizeData(sanitized[field]);
      }
    });
    
    // Handle CSV fields properly
    if (Array.isArray(payload.locations)) {
      sanitized.job_location = formatCSV(payload.locations);
    }
    
    if (Array.isArray(payload.skills)) {
      sanitized.job_skills = formatCSV(payload.skills);
    }
    
    if (Array.isArray(payload.requirements)) {
      sanitized.job_requirments = formatCSV(payload.requirements);
    }
    
    if (Array.isArray(payload.selectedEducations)) {
      sanitized.education = formatCSV(payload.selectedEducations);
    }
    
    return sanitized;
  };
  
  export {
    sanitizeString,
    removeSpecialChars,
    sanitizeData,
    formatCSV,
    sanitizeJobPayload
  };