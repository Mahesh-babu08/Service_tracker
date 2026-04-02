import toast from 'react-hot-toast';

export function useNotification() {
    const showNotification = (message, type = 'info', _title = null) => {
        // Keep action feedback as popups only; bell notifications now come from the backend.
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
