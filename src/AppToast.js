import Toast from 'react-bootstrap/Toast';
import { ProgressBar, ToastContainer } from "react-bootstrap";
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp; // Difference in milliseconds

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return new Date(timestamp).toLocaleString(); // Fallback to date and time format
};

const ToastWithProgress = (props) => {
    const { toast, setToasts } = props;
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if(!toast.duration) return;
        const interval = 50; // Update every 50ms
        const totalDuration = toast.duration;
        const startTime = toast.startTime - 350;
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(totalDuration - elapsed, 0);
            setProgress((remaining / totalDuration) * 100);

            if (remaining === 0) clearInterval(timer);
        }, interval);
        
        return () => clearInterval(timer); // Clean up on unmount
    }, [toast.duration, toast.startTime]);

    return (
        <Toast
            animation={true}
            bg={toast.variant.toLowerCase()}
            onClose={() => setToasts(prevToasts => prevToasts.filter(t => t.id !== toast.id))}
        >
            <Toast.Header>
                <strong className="me-auto">Notification</strong>
                <small>{getTimeAgo(toast.id)}</small>
            </Toast.Header>
            <Toast.Body className='text-white'>
                {toast.message}
            </Toast.Body>
            <ProgressBar
                    now={progress}
                    // className="mt-2"
                    variant={toast.variant.toLowerCase()}
                    style={{ height: '5px' }}
                />
        </Toast>
    );
}

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, variant = 'success', duration = 3000, autoClose = true, toastID = null) => {

        const id = Date.now();
        setToasts(prevToasts => {
            let tempToasts = [...prevToasts];
            if (toastID) {
                tempToasts = tempToasts.filter(t => t.id !== toastID)
            }
            return [
                ...tempToasts,
                { id, message, variant, startTime: Date.now(), duration }
            ]
        });

        // Auto-remove toast after {duration} seconds
        if(autoClose){
            setTimeout(() => {
                clearToast(id)
            }, duration);
        }
        return id;
    }, []);

    const clearToast = useCallback((id) => {
        if(id){
            setToasts(prevToasts => prevToasts.filter(toast =>  toast.id !== id))
        }
        return null;
    })

    return (
        <ToastContext.Provider value={{ addToast, clearToast }}>
            {children}
            {/* Toast Container */}
            <ToastContainer position="top-center" className="p-4">
                {toasts.map(toast => (
                    <ToastWithProgress key={toast.id} setToasts={setToasts} toast={toast}/>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
}