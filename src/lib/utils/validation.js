export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRequired(obj, fields) {
  const errors = [];
  
  for (const field of fields) {
    if (!obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')) {
      errors.push(`${field} é obrigatório`);
    }
  }
  
  return errors;
}

export function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '');
}

