import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro na aplicação</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p>Ocorreu um erro inesperado:</p>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error?.message}
                </pre>
                {this.state.errorInfo && (
                  <details className="text-xs">
                    <summary>Stack trace</summary>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
                <Button 
                  onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                  variant="outline"
                  size="sm"
                >
                  Tentar novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;