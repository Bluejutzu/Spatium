import "../styles/components/Toast.css";

import { type JSX } from "react";

import { Button } from "./ui/Button";

interface ToastAction {
    label: string;
    onClick: () => void;
}

interface ToastProps {
    message: string;
    title?: string;
    action?: ToastAction;
    onClose: () => void;
}

export function Toast({ message, title, action, onClose }: ToastProps): JSX.Element {
    return (
        <div className="toast-container animate__animated animate__fadeInUp animate__faster">
            <div className="toast">
                {title && <div className="toast-title">{title}</div>}
                <div className="toast-message">{message}</div>
                <div className="toast-actions">
                    {action && (
                        <Button
                            onClick={action.onClick}
                            variant="default"
                            size="sm"
                            className="animate__animated animate__fadeIn"
                        >
                            {action.label}
                        </Button>
                    )}
                    <Button onClick={onClose} variant="ghost" size="sm" className="animate__animated animate__fadeIn">
                        Dismiss
                    </Button>
                </div>
            </div>
        </div>
    );
}
