import { createContext, useContext, useState, useCallback } from 'react';
import {
    ToastProvider as RadixToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose
} from '../components/Toast';

const ToastContext = createContext({});

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = {
            id,
            ...toast,
            duration: toast.duration || 5000
        };

        setToasts((prev) => [...prev, newToast]);

        // Auto-dismiss
        if (newToast.duration) {
            setTimeout(() => {
                removeToast(id);
            }, newToast.duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showSuccess = useCallback((title, description, options = {}) => {
        return addToast({
            variant: 'success',
            title,
            description,
            ...options
        });
    }, [addToast]);

    const showError = useCallback((title, description, options = {}) => {
        return addToast({
            variant: 'error',
            title,
            description,
            ...options
        });
    }, [addToast]);

    const showWarning = useCallback((title, description, options = {}) => {
        return addToast({
            variant: 'warning',
            title,
            description,
            ...options
        });
    }, [addToast]);

    const showInfo = useCallback((title, description, options = {}) => {
        return addToast({
            variant: 'info',
            title,
            description,
            ...options
        });
    }, [addToast]);

    const value = {
        toasts,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast
    };

    return (
        <ToastContext.Provider value={value}>
            <RadixToastProvider swipeDirection="right">
                {children}
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        variant={toast.variant}
                        open={true}
                        onOpenChange={(open) => {
                            if (!open) removeToast(toast.id);
                        }}
                    >
                        <div className="grid gap-1">
                            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
                            {toast.description && (
                                <ToastDescription>{toast.description}</ToastDescription>
                            )}
                        </div>
                        <ToastClose />
                    </Toast>
                ))}
                <ToastViewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
            </RadixToastProvider>
        </ToastContext.Provider>
    );
};
