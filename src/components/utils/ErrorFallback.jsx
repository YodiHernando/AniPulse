import React from 'react';

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div role="alert" className="p-8 bg-slate-900 border border-red-500 rounded text-white m-8">
            <p className="text-xl font-bold text-red-500 mb-4">Something went wrong:</p>
            <pre className="text-sm bg-black/50 p-4 rounded overflow-auto mb-4">{error.message}</pre>
            <button onClick={resetErrorBoundary} className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600">Try again</button>
        </div>
    );
}

export default ErrorFallback;
