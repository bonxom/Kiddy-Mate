import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './providers/AuthProvider'
import ErrorBoundary from './components/common/ErrorBoundary'
import { Toaster } from 'react-hot-toast'
import './styles/index.css'

// Create QueryClient instance with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry failed queries once
      refetchOnWindowFocus: false, // Don't refetch on window focus
      staleTime: 30000, // Consider data fresh for 30 seconds
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Error Boundary - Catch and handle React errors */}
    <ErrorBoundary>
      {/* React Router - Handle routing */}
      <BrowserRouter>
        {/* React Query - Handle server state */}
        <QueryClientProvider client={queryClient}>
          {/* Auth Provider - Handle authentication */}
          <AuthProvider>
            <App />
            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#1f2937',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 10px 40px 0 rgba(0, 0, 0, 0.15)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                  style: {
                    border: '1px solid #10b981',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                  style: {
                    border: '1px solid #ef4444',
                  },
                },
              }}
            />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)