import { type JSX, useState } from "react";

import { clearHistory, deleteHistoryItem, type HistoryItem } from "../lib/utils";

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

    if (!isOpen) return <></>;

    const handleDeleteAll = (): void => {
        clearHistory();
        onHistoryChange();
        setShowConfirmation(false);
    };

    const handleDelete = (timestamp: number): void => {
        deleteHistoryItem(timestamp);
        onHistoryChange();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-backdrop" onClick={onClose} />
            <div className="modal-container">
                {showConfirmation && (
                    <div className="confirmation-dialog">
                        <p className="text-sm">Are you sure you want to delete all history items?</p>
                        <div className="confirmation-buttons">
                            <button onClick={handleDeleteAll} className="confirm-button">
                                Delete All
                            </button>
                            <button onClick={() => setShowConfirmation(false)} className="cancel-button">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                <div className="modal-header">
                    <h2 className="heading-2xl font-semibold">Search History</h2>
                    <div>
                        {history.length > 0 && (
                            <button onClick={() => setShowConfirmation(true)} className="delete-all-button">
                                Delete All
                            </button>
                        )}
                        <button onClick={onClose} className="modal-close">
                            ✕
                        </button>
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
                                <button
                                    onClick={() => handleDelete(item.timestamp)}
                                    className="delete-button"
                                    title="Delete"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
