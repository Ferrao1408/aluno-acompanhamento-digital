
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatCPF, getCPFValidationMessage, checkCPFDuplicate } from '@/utils/cpfValidator';
import { cn } from '@/lib/utils';

interface CPFInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  students?: any[];
  currentStudentId?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  label?: string;
}

export const CPFInput: React.FC<CPFInputProps> = ({
  value,
  onChange,
  placeholder = "000.000.000-00",
  disabled = false,
  students = [],
  currentStudentId,
  className,
  id,
  name,
  required = false,
  label
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatCPF(inputValue);
    
    // Limit to 14 characters (formatted CPF length)
    if (formatted.length <= 14) {
      setLocalValue(formatted);
      onChange(formatted);
      
      // Validate CPF
      const validationError = getCPFValidationMessage(formatted);
      const duplicateError = checkCPFDuplicate(formatted, students, currentStudentId);
      
      const errorMessage = validationError || duplicateError;
      setValidationMessage(errorMessage);
      setIsValid(!errorMessage);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <Input
        id={id}
        name={name}
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={cn(
          className,
          !isValid && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
      />
      
      {validationMessage && (
        <p className="text-sm text-red-600 mt-1 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {validationMessage}
        </p>
      )}
      
      {isValid && localValue && (
        <p className="text-sm text-green-600 mt-1 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          CPF válido
        </p>
      )}
    </div>
  );
};
