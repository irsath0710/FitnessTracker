/**
 * ============================================
 * ERROR BOUNDARY COMPONENT
 * ============================================
 * 
 * Catches JavaScript errors in child components and displays
 * a fallback UI instead of crashing the entire app.
 * 
 * React Error Boundaries must be class components.
 */

import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
                    <div className="max-w-md text-center space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                            <p className="text-zinc-400 text-sm">
                                An unexpected error occurred. Please try refreshing the page.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 text-left">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Error Details</p>
                                <p className="text-red-400 text-sm font-mono break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-3 rounded-2xl bg-zinc-800 text-white hover:bg-zinc-700 transition-all font-medium"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-500 transition-all font-medium"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
