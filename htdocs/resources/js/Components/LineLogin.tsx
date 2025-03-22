import { ButtonHTMLAttributes } from "react";

export default function LineLogin({
    className = "",
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex justify-center gap-1 w-full p-2 bg-LINE01 text-white font-bold rounded-md ${
                    disabled && "opacity-25"
                } ` + className
            }
            disabled={disabled}
            id="lineLoginBtn"
        >
            <img src="/icon/icons8-line.svg" alt="LINE LOGO" />
            {children}
        </button>
    );
}
