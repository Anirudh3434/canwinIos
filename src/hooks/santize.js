// Remove extra spaces and trim the string
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ');
};

// Remove unwanted special characters but allow safe ones
const removeSpecialChars = (str) => {
  if (!str || typeof str !== 'string') return '';
  // Allows alphanumeric, space, common punctuation, and a few symbols often used in job texts
  return str.replace(/[^\w\s.,@\-&+()/]/g, '');
};

// Combines string sanitization and special character removal
const sanitizeData = (str) => {
  if (!str || typeof str !== 'string') return '';
  return removeSpecialChars(sanitizeString(str));
};

// Format array data into comma-separated values, cleaned and unique
const formatCSV = (arr) => {
  if (!arr || !Array.isArray(arr)) return '';

  const cleanedArr = arr
    .flat() // Flattens nested arrays if any
    .map((item) => sanitizeString(item))
    .filter((item) => item.length > 0);

  return [...new Set(cleanedArr)].join(',');
};

// Sanitize the entire job payload object
const sanitizeJobPayload = (payload) => {
  const sanitized = { ...payload };

  // List of string fields to sanitize
  const stringFields = [
    'job_title',
    'job_description',
    'workplace_type',
    'department',
    'employment_type',
    'receive_applicants_by',
    'email',
  ];

  stringFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = sanitizeData(sanitized[field]);
    }
  });

  // Format and sanitize array fields to comma-separated strings
  if (Array.isArray(payload.locations)) {
    sanitized.job_location = formatCSV(payload.locations);
  }

  if (Array.isArray(payload.skills)) {
    sanitized.job_skills = formatCSV(payload.skills);
  }

  if (Array.isArray(payload.requirements)) {
    sanitized.job_requirements = formatCSV(payload.requirements); // ✅ Fixed typo here
  }

  if (Array.isArray(payload.selectedEducations)) {
    sanitized.education = formatCSV(payload.selectedEducations);
  }

  return sanitized;
};

// Export functions
export { sanitizeString, removeSpecialChars, sanitizeData, formatCSV, sanitizeJobPayload };
