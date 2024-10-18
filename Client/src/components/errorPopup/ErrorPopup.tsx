import React from 'react';
import './ErrorPopup.css';

interface ErrorPopupProps {
    message: any;
    onClose: any;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
    return (
        <div className="error-popup">
            <div className="error-content">
                <span className="error-icon">⚠️</span>
                <p>{message}</p>
                <button className="close-btn" onClick={onClose}>✖</button>
            </div>
        </div>
    );
};

export default ErrorPopup;