import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({ className, type, label, icon: Icon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    return (
        <div className={cn("relative w-full", className)}>
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <Icon size={18} />
                </div>
            )}
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-xl border border-input dark:border-slate-700 bg-background/50 dark:bg-slate-900/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all",
                    Icon ? "pl-10" : "",
                    (isFocused || hasValue || props.value) ? "pt-5 pb-1" : ""
                )}
                ref={ref}
                onFocus={() => setIsFocused(true)}
                onBlur={(e) => {
                    setIsFocused(false);
                    setHasValue(!!e.target.value);
                }}
                onChange={(e) => {
                    setHasValue(!!e.target.value);
                    if (props.onChange) props.onChange(e);
                }}
                {...props}
            />
            {label && (
                <label
                    className={cn(
                        "absolute left-3 transition-all duration-200 pointer-events-none text-gray-500 dark:text-gray-400",
                        Icon ? "left-10" : "",
                        (isFocused || hasValue || props.value || props.defaultValue)
                            ? "text-[10px] top-1.5 font-medium text-primary"
                            : "text-sm top-1/2 -translate-y-1/2"
                    )}
                >
                    {label}
                </label>
            )}
        </div>
    );
});
Input.displayName = "Input";
