import React from 'react';
import { cn } from '../../utils/cn';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const buttonVariants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    outline: "border border-input bg-background dark:border-slate-700 dark:bg-slate-800 hover:bg-accent hover:text-accent-foreground dark:hover:bg-slate-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-100 dark:hover:bg-slate-700",
    ghost: "hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-foreground",
    link: "text-primary underline-offset-4 hover:underline",
};

const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-lg px-3",
    lg: "h-11 rounded-xl px-8",
    icon: "h-10 w-10",
};

export const Button = React.forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                buttonVariants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
});
Button.displayName = "Button";
