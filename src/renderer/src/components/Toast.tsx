import "../styles/components/Toast.css";

import { type JSX, useEffect, useState } from "react";

interface ToastAction {
    label: string;
    onClick: () => void;
}

interface ToastProps {
    message: string;
    title?: string;
    duration?: number;
    action?: ToastAction;
    onClose: () => void;
}

export function Toast({ message, title, duration = 3000, action, onClose }: ToastProps): JSX.Element {
    const [isVisible, setIsVisible] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isVisible && !isPaused && !isExiting) {
            timeoutId = setTimeout(() => {
                setIsExiting(true);
            }, duration);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [duration, isVisible, isPaused, isExiting]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (isExiting) {
            timeoutId = setTimeout(() => {
                setIsVisible(false);
                onClose();
            }, 200); // Match the fadeOut animation duration
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isExiting, onClose]);

    if (!isVisible) return <></>;

    const handleToastClick = (): void => {
        if (!action) {
            setIsExiting(true);
        }
    };

    return (
        <div
            className={`toast-container ${isExiting ? "toast-animate-out" : "toast-animate-in"}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="toast-content toast-success" onClick={handleToastClick}>
                {title && <div className="toast-title">{title}</div>}
                <div className="toast-message">{message}</div>
                {action && (
                    <button
                        className="toast-action-button"
                        onClick={e => {
                            e.stopPropagation();
                            action.onClick();
                            setIsExiting(true);
                        }}
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
}
