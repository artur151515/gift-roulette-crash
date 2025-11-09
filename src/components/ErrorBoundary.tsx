import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Uncaught error:', error, errorInfo);
		// TODO: Send to error tracking service (Sentry, etc.)
	}

	public render() {
		if (this.state.hasError) {
			return this.props.fallback || (
				<div className="min-h-screen flex items-center justify-center p-4">
					<div className="text-center space-y-4">
						<div className="text-6xl">💥</div>
						<h1 className="text-2xl font-bold">Что-то пошло не так</h1>
						<p className="text-muted-foreground">Пожалуйста, перезагрузите страницу</p>
						<button
							onClick={() => window.location.reload()}
							className="px-4 py-2 bg-primary text-white rounded-lg"
						>
							Перезагрузить
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}