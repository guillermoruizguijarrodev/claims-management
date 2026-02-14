export function getErrorMessage(err: any): string {
    if (err?.error?.message) {
        return err.error.message;
    }
    
    if (typeof err?.error === 'string') {
        return err.error;
    }

    if (err?.message) {
        return err.message;
    }

    return 'An unexpected error occurred. Please try again.';
}