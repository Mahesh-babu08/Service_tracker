import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';

export function useNotification() {
    const { addNotification } = useNotifications();

    const showNotification = (message, type = 'info', title = null) => {
        // Add to persistent notifications
        addNotification(message, type, title);

        // Show toast notification
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'warning':
                toast(message, {
                    icon: '⚠️',
                    duration: 4000,
                });
                break;
            case 'info':
            default:
                toast(message, {
                    icon: 'ℹ️',
                    duration: 3000,
                });
                break;
        }
    };

    return { showNotification };
}