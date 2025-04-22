import "../styles/components/HistoryModal.css";

import { type JSX, useState } from "react";

import { clearHistory, deleteHistoryItem, type HistoryItem } from "../lib/utils";
import { Toast } from "./Toast";
import { Button } from "./ui/Button";

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    onItemSelect: (item: HistoryItem) => void;
    onHistoryChange: () => void;
}

export function HistoryModal({
    isOpen,
    onClose,
    history,
    onItemSelect,
    onHistoryChange
}: HistoryModalProps): JSX.Element {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        title?: string;
    } | null>(null);

    if (!isOpen) return <></>;

    const handleDeleteAll = (): void => {
        clearHistory();
        onHistoryChange();
        setShowConfirmation(false);
        setToast({
            title: "Success",
            message: "All history items have been deleted"
        });
    };

    const handleDelete = (timestamp: number): void => {
        deleteHistoryItem(timestamp);
        onHistoryChange();
        setToast({
            title: "Success",
            message: "History item deleted successfully"
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-backdrop" onClick={onClose} />
            <div className="modal-container">
                {showConfirmation && (
                    <div className="confirmation-dialog">
                        <p className="text-sm">Are you sure you want to delete all history items?</p>
                        <div className="confirmation-buttons">
                            <Button onClick={handleDeleteAll} variant="destructive" size="sm">
                                Delete All
                            </Button>
                            <Button onClick={() => setShowConfirmation(false)} variant="outline" size="sm">
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
                <div className="modal-header">
                    <h2 className="heading-2xl font-semibold">Search History</h2>
                    <div>
                        {history.length > 0 && (
                            <Button onClick={() => setShowConfirmation(true)} variant="destructive" size="sm">
                                Delete All
                            </Button>
                        )}
                        <Button onClick={onClose} variant="ghost" size="icon" className="modal-close">
                            ✕
                        </Button>
                    </div>
                </div>
                <div className="modal-content">
                    {history.length === 0 ? (
                        <div className="modal-empty text-sm">No history items</div>
                    ) : (
                        history.map(item => (
                            <div key={item.timestamp} className="history-item">
                                <div className="history-item-content" onClick={() => onItemSelect(item)}>
                                    <div className="heading-md font-medium">{item.location}</div>
                                    <div className="text-xs">
                                        {item.transport}, {item.time}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleDelete(item.timestamp)}
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
                {toast && <Toast message={toast.message} title={toast.title} onClose={() => setToast(null)} />}
            </div>
        </div>
    );
}
