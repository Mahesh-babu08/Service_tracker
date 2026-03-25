import React from 'react';
import { cn } from '../../utils/cn';

const badgeVariants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    success: "bg-success text-success-foreground hover:bg-success/80",
    warning: "bg-warning text-warning-foreground hover:bg-warning/80",
    outline: "text-foreground border border-border hover:bg-background/50",
};

export function Badge({ className, variant = "default", children, ...props }) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
                badgeVariants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
