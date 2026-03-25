import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export function Loader() {
    return (
        <div className="flex items-center justify-center p-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary"
            />
        </div>
    );
}

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className}`}
            {...props}
        />
    );
}
