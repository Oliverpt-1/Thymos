import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthForm } from '@/components/auth/auth-form';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { JournalPage } from '@/pages/journal';
import { PortfolioPage } from '@/pages/portfolio';
import { InsightsPage } from '@/pages/insights';
import { SettingsPage } from '@/pages/settings';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="h-full w-full p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="thymos-ui-theme">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <span className="text-xl font-bold text-white">T</span>
            </div>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
            <p className="text-muted-foreground">Loading Thymos...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="thymos-ui-theme">
      <Router>
        <Routes>
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/journal\" replace /> : <AuthForm />} 
          />
          <Route path="/" element={<Navigate to="/journal\" replace />} />
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <JournalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <PortfolioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <InsightsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;