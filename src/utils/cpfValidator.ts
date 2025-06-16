
/**
 * Utilities for CPF validation and formatting
 */

// Remove all non-numeric characters from CPF
export const cleanCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

// Format CPF with dots and dash (000.000.000-00)
export const formatCPF = (cpf: string): string => {
  const cleaned = cleanCPF(cpf);
  
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

// Validate CPF mathematically
export const isValidCPF = (cpf: string): boolean => {
  const cleaned = cleanCPF(cpf);
  
  // Check if CPF has 11 digits
  if (cleaned.length !== 11) return false;
  
  // Check if all digits are the same (invalid CPFs like 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleaned[9]) !== firstDigit) return false;
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cleaned[10]) === secondDigit;
};

// Get CPF validation message
export const getCPFValidationMessage = (cpf: string): string | null => {
  if (!cpf || cpf.trim() === '') return null;
  
  const cleaned = cleanCPF(cpf);
  
  if (cleaned.length === 0) return null;
  if (cleaned.length < 11) return 'CPF deve ter 11 dígitos';
  if (cleaned.length > 11) return 'CPF não pode ter mais de 11 dígitos';
  if (!isValidCPF(cpf)) return 'CPF inválido';
  
  return null;
};

// Check if CPF already exists in a list of students
export const checkCPFDuplicate = (cpf: string, students: any[], currentStudentId?: string): string | null => {
  if (!cpf || !isValidCPF(cpf)) return null;
  
  const cleaned = cleanCPF(cpf);
  const duplicate = students.find(student => {
    if (currentStudentId && student.id === currentStudentId) return false;
    return cleanCPF(student.cpf) === cleaned || cleanCPF(student.cpfResponsavel) === cleaned;
  });
  
  if (duplicate) {
    return `Este CPF já está cadastrado para o aluno: ${duplicate.nome}`;
  }
  
  return null;
};
