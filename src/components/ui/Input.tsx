import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-secondary-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'flex h-10 w-full rounded-lg border bg-secondary-800 px-3 py-2 text-sm text-secondary-50 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-error-500 focus:ring-error-500'
              : 'border-secondary-600 focus:ring-primary-500 focus:border-transparent',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-error-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-secondary-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input' 