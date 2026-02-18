import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger' // danger, primary, success
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const variantStyles = {
        danger: 'bg-error hover:bg-error/80 shadow-error/20',
        primary: 'bg-space-light hover:bg-space-light/80 shadow-space-light/20',
        success: 'bg-success hover:bg-success/80 shadow-success/20'
    };

    const iconVariants = {
        danger: '⚠️',
        primary: 'ℹ️',
        success: '✅'
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-space-navy/80 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm glass-panel p-8 animate-scale-in border-white/10">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-6 border border-white/5 shadow-inner">
                        {iconVariants[variant]}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3">
                        {title}
                    </h3>

                    <p className="text-gray-400 text-sm leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex w-full gap-4">
                        <button
                            onClick={onClose}
                            className="btn-secondary flex-1 py-3 text-sm"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-lg active:scale-95 ${variantStyles[variant]}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
