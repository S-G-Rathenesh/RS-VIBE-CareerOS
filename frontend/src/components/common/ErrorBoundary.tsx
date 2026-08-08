import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'
import { Card } from './Card'
import { Button } from './Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
          <Card className="max-w-md p-8 border border-red-500/30 glass-panel flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Something Went Wrong</h2>
            <p className="text-xs text-gray-400">
              An unexpected runtime error occurred. Our system caught it gracefully to protect your session.
            </p>
            <Button
              variant="glow"
              size="md"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Reload Page
            </Button>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
