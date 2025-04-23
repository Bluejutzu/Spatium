import "../styles/components/HelpModal.css";

import { type FC } from "react";

import { Button } from "./ui/Button";

// Add QuestionMarkCircle icon component
const QuestionMarkCircle: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
);

interface ExampleItem {
    location: string;
    transport: string;
    time: string;
    description: string;
}

const examples: ExampleItem[] = [
    {
        location: "London Bridge",
        transport: "walking",
        time: "15m",
        description: "See how far you can walk from London Bridge in 15 minutes"
    },
    {
        location: "Central Park, New York",
        transport: "cycling",
        time: "30m",
        description: "Explore cycling distances around Central Park in 30 minutes"
    },
    {
        location: "Eiffel Tower",
        transport: "driving",
        time: "1h",
        description: "Check driving distances around Paris in 1 hour"
    }
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onExampleSelect: (example: ExampleItem) => void;
}

export const HelpButton: FC<{ onClick: () => void }> = ({ onClick }) => (
    <Button onClick={onClick} variant="ghost" size="icon" className="help-button" title="Help">
        <QuestionMarkCircle />
    </Button>
);

export const HelpModal: FC<Props> = ({ isOpen, onClose, onExampleSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-backdrop" onClick={onClose} />
            <div className="modal-container">
                <div className="modal-header">
                    <h2 className="modal-title">How to Use</h2>
                    <Button onClick={onClose} variant="ghost" size="icon" className="modal-close">
                        ✕
                    </Button>
                </div>
                <div className="modal-content">
                    <p className="help-description">
                        Enter a location, choose your transport mode, and specify a time to see how far you can travel.
                        Time format examples: 10m (minutes), 1.5h (hours), 30s (seconds).
                    </p>
                    <div className="examples-container">
                        <h3 className="examples-title">Try these examples:</h3>
                        {examples.map((example, index) => (
                            <div key={index} className="example-item">
                                <p className="example-description">{example.description}</p>
                                <div className="example-footer">
                                    <div className="example-details">
                                        {example.location} • {example.transport} • {example.time}
                                    </div>
                                    <Button
                                        onClick={() => {
                                            onExampleSelect(example);
                                            onClose();
                                        }}
                                        variant="default"
                                        size="sm"
                                    >
                                        Use this example
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
