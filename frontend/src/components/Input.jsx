import { useState } from 'react';

const Input = ({ label, id, className = '', error, type = 'text', ...props }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                    {label}
                </label>
            )}
            {error && (
                <div className="text-error text-xs font-semibold mb-2 ml-1 flex items-center gap-1 animate-fade-in">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                    {error}
                </div>
            )}
            <div className="relative">
                <input
                    id={id}
                    name={id}
                    type={type === 'password' && showPassword ? 'text' : type}
                    className={`input-field ${error ? 'border-error/50' : ''}`}
                    {...props}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-4 flex items-center text-white"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Input;
