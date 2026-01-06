import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { SWRConfig } from "swr"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Layout } from "@/components/layout/layout"
import { LoginForm } from "@/components/auth/login-form"
import { EmailConfirmation } from "@/components/auth/email-confirmation"
import { DashboardPage } from "@/components/pages/dashboard-page"
import { SiberiaPage } from "@/components/pages/siberia-page"
import { ReportsPage } from "@/components/pages/reports-page"

function App() {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/auth/confirm" element={<EmailConfirmation />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/siberia" element={<SiberiaPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </SWRConfig>
  )
}

export default App
