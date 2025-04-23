import "../styles/components/HistoryModal.css";

import { type JSX, useEffect, useState } from "react";

import { clearHistory, deleteHistoryItem } from "../lib/utils";
import { Button } from "./ui/Button";

interface HistoryItem {
    location: string;
    transport: string;
    time: string;
    timestamp: number;
    type?: string;
}

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    onItemSelect: (item: HistoryItem) => void;
    onHistoryChange: () => void;
    showToast: (message: string, title?: string) => void;
}

export function HistoryModal({
    isOpen,
    onClose,
    history,
    onItemSelect,
    onHistoryChange,
    showToast
}: HistoryModalProps): JSX.Element | null {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [copiedField, setCopiedField] = useState<{ id: number; field: string } | null>(null);

    // Add ripple effect handler
    const handleItemClick = (e: React.MouseEvent<HTMLDivElement>, item: HistoryItem): void => {
        const element = e.currentTarget;
        element.classList.add("clicked");

        // Get click coordinates relative to the element
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Position the ripple
        const ripple = element.querySelector("::after") as HTMLElement;
        if (ripple) {
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
        }

        // Remove the class after animation
        setTimeout(() => {
            element.classList.remove("clicked");
        }, 600);

        onItemSelect(item);
    };

    // Add keyboard shortcut handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (isOpen && selectedItems.length > 0 && (e.key === "Delete" || e.key === "Backspace")) {
                setShowConfirmation(true);
            }
            if (isOpen && e.key === "Escape") {
                if (showConfirmation) {
                    setShowConfirmation(false);
                    setSelectedItems([]);
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, selectedItems.length, showConfirmation, onClose]);

    const handleDeleteSelected = (): void => {
        selectedItems.forEach(timestamp => {
            deleteHistoryItem(timestamp);
        });
        onHistoryChange();
        setSelectedItems([]);
        setShowConfirmation(false);
        showToast(`${selectedItems.length} item${selectedItems.length > 1 ? "s" : ""} deleted successfully`, "Success");
    };

    const handleDeleteAll = (): void => {
        clearHistory();
        onHistoryChange();
        setSelectedItems([]);
        setShowConfirmation(false);
        showToast("All history items have been deleted", "Success");
    };

    const handleDelete = (timestamp: number): void => {
        deleteHistoryItem(timestamp);
        onHistoryChange();
        showToast("History item deleted successfully", "Success");
    };

    const toggleSelect = (timestamp: number): void => {
        setSelectedItems(prev => (prev.includes(timestamp) ? prev.filter(t => t !== timestamp) : [...prev, timestamp]));
    };

    const handleCopy = async (text: string, itemId: number, field: string, e: React.MouseEvent): Promise<any> => {
        e.stopPropagation(); // Prevent triggering item selection
        try {
            await navigator.clipboard.writeText(text);
            const element = e.currentTarget;
            element.classList.add("copied");
            setCopiedField({ id: itemId, field });
            setTimeout(() => {
                element.classList.remove("copied");
                setCopiedField(null);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-backdrop" onClick={onClose} />
                <div className="modal-container animate__animated animate__fadeInDown animate__faster">
                    <div className="modal-header">
                        <h2 className="heading-2xl font-semibold">Search History</h2>
                        <div className="modal-actions">
                            {history.length > 0 && selectedItems.length === 0 && (
                                <Button onClick={() => setShowConfirmation(true)} variant="destructive" size="sm">
                                    Delete All
                                </Button>
                            )}
                            {selectedItems.length > 0 && (
                                <Button
                                    onClick={() => setShowConfirmation(true)}
                                    variant="destructive"
                                    size="sm"
                                    className="animate__animated animate__fadeIn"
                                >
                                    Delete Selected ({selectedItems.length})
                                </Button>
                            )}
                            <Button onClick={onClose} variant="ghost" size="icon" className="modal-close">
                                ✕
                            </Button>
                        </div>
                    </div>
                    <div className="modal-content">
                        {history.length === 0 ? (
                            <div className="modal-empty text-sm animate__animated animate__fadeIn">
                                No history items
                            </div>
                        ) : (
                            history.map((item, index) => (
                                <div
                                    key={item.timestamp}
                                    className="history-item animate__animated animate__fadeIn"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="history-item-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.timestamp)}
                                            onChange={() => toggleSelect(item.timestamp)}
                                            className="checkbox"
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="history-item-content" onClick={e => handleItemClick(e, item)}>
                                        <div className="heading-md font-medium">
                                            <span
                                                className="copyable-text"
                                                onClick={e => handleCopy(item.location, item.timestamp, "location", e)}
                                                title="Click to copy"
                                            >
                                                {item.location}
                                                <span className="copy-indicator">
                                                    {copiedField?.id === item.timestamp &&
                                                    copiedField?.field === "location"
                                                        ? "Copied!"
                                                        : "Copy"}
                                                </span>
                                            </span>
                                            {item.type && (
                                                <span className="location-type">{item.type.replace(/_/g, " ")}</span>
                                            )}
                                        </div>
                                        <div className="text-xs">
                                            <span
                                                className="copyable-text"
                                                onClick={e =>
                                                    handleCopy(item.transport, item.timestamp, "transport", e)
                                                }
                                                title="Click to copy"
                                            >
                                                {item.transport}
                                                <span className="copy-indicator">
                                                    {copiedField?.id === item.timestamp &&
                                                    copiedField?.field === "transport"
                                                        ? "Copied!"
                                                        : "Copy"}
                                                </span>
                                            </span>
                                            ,{" "}
                                            <span
                                                className="copyable-text"
                                                onClick={e => handleCopy(item.time, item.timestamp, "time", e)}
                                                title="Click to copy"
                                            >
                                                {item.time}
                                                <span className="copy-indicator">
                                                    {copiedField?.id === item.timestamp && copiedField?.field === "time"
                                                        ? "Copied!"
                                                        : "Copy"}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleDelete(item.timestamp);
                                        }}
                                        variant="ghost"
                                        size="icon"
                                        className="delete-button"
                                        title="Delete"
                                    >
                                        ✕
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {showConfirmation && (
                <div className="delete-confirmation animate__animated animate__fadeIn">
                    <div className="delete-confirmation-content">
                        <h3 className="delete-confirmation-title">
                            Deleting {selectedItems.length > 0 ? selectedItems.length : "all"} items
                        </h3>
                        <p className="delete-confirmation-text">
                            Are you sure you would like to delete {selectedItems.length > 0 ? "these" : "all"} items?
                        </p>
                        <div className="delete-confirmation-actions">
                            <Button
                                onClick={selectedItems.length > 0 ? handleDeleteSelected : handleDeleteAll}
                                variant="destructive"
                                size="sm"
                            >
                                Delete
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowConfirmation(false);
                                    if (selectedItems.length > 0) {
                                        setSelectedItems([]);
                                    }
                                }}
                                variant="outline"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
