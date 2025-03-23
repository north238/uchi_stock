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
                `relative inline-flex justify-center w-full p-2 h-10 hover:opacity-90 bg-LINE01 text-white font-bold rounded-md ${
                    disabled && "opacity-25"
                } ` + className
            }
            disabled={disabled}
            id="lineLoginBtn"
        >
            <img
                className="absolute left-0 top-0 w-10 h-10"
                src="/icon/icons8-line.svg"
                alt="LINE LOGO"
            />
            {children}
        </button>
    );
}
