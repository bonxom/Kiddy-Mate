import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from './Input';

interface PasswordInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  fullWidth?: boolean;
  autoComplete?: string;
  showStrengthIndicator?: boolean;
  className?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label = 'Password',
      value,
      onChange,
      placeholder = '••••••••',
      error,
      fullWidth = true,
      autoComplete = 'current-password',
      showStrengthIndicator = false,
      className = '',
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    // Password strength calculation (5 levels)
    const getPasswordStrength = (password: string): number => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.length >= 12) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[^a-zA-Z\d]/.test(password)) strength++;
      return strength;
    };

    const passwordStrength = getPasswordStrength(value);

    const strengthConfig = [
      { label: 'Very Weak', color: 'bg-danger-500', textColor: 'text-danger-600' },
      { label: 'Weak', color: 'bg-warning-500', textColor: 'text-warning-600' },
      { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
      { label: 'Good', color: 'bg-success-400', textColor: 'text-success-600' },
      { label: 'Strong', color: 'bg-success-600', textColor: 'text-success-700' },
    ];

    const currentStrength = strengthConfig[passwordStrength - 1];

    return (
      <div className={className}>
        <Input
          ref={ref}
          label={label}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          error={error}
          fullWidth={fullWidth}
          autoComplete={autoComplete}
          iconPosition="right"
          icon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          }
        />

        {/* Password Strength Indicator */}
        {showStrengthIndicator && value && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    level <= passwordStrength
                      ? currentStrength?.color || 'bg-gray-200'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {currentStrength && (
              <p className={`text-xs font-medium ${currentStrength.textColor}`}>
                Password strength: {currentStrength.label}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
