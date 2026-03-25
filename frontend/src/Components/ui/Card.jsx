import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, glass = false, children, ...props }) {
    return (
        <div
            className={cn(
                "bg-card text-card-foreground rounded-2xl shadow-soft",
                glass ? "glass-card hover:shadow-lg transition-all duration-300" : "border border-border",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }) {
    return (
        <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }) {
    return (
        <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props}>
            {children}
        </h3>
    );
}

export function CardDescription({ className, children, ...props }) {
    return (
        <p className={cn("text-sm text-foreground/70", className)} {...props}>
            {children}
        </p>
    );
}

export function CardContent({ className, children, ...props }) {
    return (
        <div className={cn("p-6 pt-0", className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ className, children, ...props }) {
    return (
        <div className={cn("flex items-center p-6 pt-0", className)} {...props}>
            {children}
        </div>
    );
}
