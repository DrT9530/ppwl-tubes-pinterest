import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "./components/Sidebar";
import { SearchHeader } from "./components/SearchHeader";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import PostDetailPage from "./pages/PostDetailPage"; // 👈 Impor halaman detail yang baru dibuat
import { useAuthStore } from "./stores/auth.store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * MainLayout — Sidebar + SearchHeader + Content area (for authenticated users)
 */
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <SearchHeader />
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * RootPage — Shows LandingPage for guests, HomePage for logged-in users
 */
function RootPage() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  );
}

function AppContent() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    // Tangkap token dari URL (dikirim oleh Google OAuth Backend)
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("auth_token", token);
      // Bersihkan URL dari token agar rapi dan aman
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    fetchUser();
  }, [fetchUser]);

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Root — Landing for guests, Home feed for logged-in */}
        <Route path="/" element={<RootPage />} />

        {/* Redirect /login and /register to root (modal-based now) */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />

        {/* Route Detail Post — Dengan Sidebar Layout */}
        <Route path="/post/:id" element={
          <MainLayout>
            <ProtectedRoute><PostDetailPage /></ProtectedRoute>
          </MainLayout>
        } />

        {/* Authenticated routes with navbar */}
        {/* Authenticated routes with sidebar layout */}
        <Route path="/profile/:id" element={
          <MainLayout>
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          </MainLayout>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 500,
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}