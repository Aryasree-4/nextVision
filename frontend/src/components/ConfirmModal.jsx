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
        danger: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
        primary: 'bg-space-light hover:bg-space-light/80 shadow-space-light/20',
        success: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
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
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-space-blue/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-scale-up">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-4 border border-white/5 shadow-inner">
                        {iconVariants[variant]}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                        {title}
                    </h3>

                    <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-[280px]">
                        {message}
                    </p>

                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all shadow-lg active:scale-95 ${variantStyles[variant]}`}
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
