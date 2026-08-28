import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shadow-xs font-semibold",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60",
      outline: "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-2xs",
      danger: "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 shadow-xs font-semibold",
      ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
      link: "text-slate-900 dark:text-slate-100 underline-offset-4 hover:underline p-0 h-auto",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-9 px-4 text-sm",
      lg: "h-10 px-5 text-sm",
      icon: "h-8 w-8 p-0",
    };

    return (
      <button
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current fill-none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
