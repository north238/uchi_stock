import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    TextareaHTMLAttributes,
} from "react";

export const TextArea = forwardRef(function TextArea(
    {
        className = "",
        isFocused = false,
        error = false,
        ...props
    }: TextareaHTMLAttributes<HTMLTextAreaElement> & {
        isFocused?: boolean;
        error?: boolean;
    },
    ref
) {
    const localRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, []);

    return (
        <textarea
            {...props}
            className={
                `border ${
                    error ? "border-red-500" : "border-gray-300"
                } dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 rounded-md shadow-sm disabled:bg-gray-200 disabled:text-gray-500 placeholder:text-gray-400 ` +
                className
            }
            ref={localRef}
        />
    );
});
