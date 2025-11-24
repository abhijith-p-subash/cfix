import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

const ToastProvider = ToastPrimitive.Provider;
const ToastViewport = ToastPrimitive.Viewport;

const Toast = ({ className, variant = 'default', ...props }) => {
    return (
        <ToastPrimitive.Root
            className={cn(
                'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
                'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
                {
                    'border-border bg-background text-foreground': variant === 'default',
                    'destructive group border-destructive bg-destructive text-destructive-foreground': variant === 'error',
                    'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400': variant === 'success',
                    'border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400': variant === 'warning',
                    'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400': variant === 'info'
                },
                className
            )}
            {...props}
        />
    );
};

const ToastAction = ({ className, ...props }) => {
    return (
        <ToastPrimitive.Action
            className={cn(
                'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                'group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
                className
            )}
            {...props}
        />
    );
};

const ToastClose = ({ className, ...props }) => {
    return (
        <ToastPrimitive.Close
            className={cn(
                'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
                'group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
                className
            )}
            toast-close=""
            {...props}
        >
            <X className="h-4 w-4" />
        </ToastPrimitive.Close>
    );
};

const ToastTitle = ({ className, ...props }) => {
    return (
        <ToastPrimitive.Title
            className={cn('text-sm font-semibold', className)}
            {...props}
        />
    );
};

const ToastDescription = ({ className, ...props }) => {
    return (
        <ToastPrimitive.Description
            className={cn('text-sm opacity-90', className)}
            {...props}
        />
    );
};

export {
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastAction
};
