import { HTMLAttributes } from "react";

export default function InputError({
    message,
    className = "",
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return (
        <p
            {...props}
            className={
                "text-sm text-red-500 dark:text-red-400 visible h-4 " +
                className
            }
        >
            {message}
        </p>
    );
}
