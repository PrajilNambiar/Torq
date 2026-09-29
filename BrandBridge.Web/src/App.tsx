import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { AppShell } from './components/AppShell'
import { RequireAuth } from './components/RequireAuth'
import { UserRole } from './api/types'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { RequirementsPage } from './pages/business/RequirementsPage'
import { RequirementFormPage } from './pages/business/RequirementFormPage'
import { RequirementDetailPage } from './pages/business/RequirementDetailPage'
import { BusinessProfilePage } from './pages/business/BusinessProfilePage'
import { CampaignsPage } from './pages/shared/CampaignsPage'
import { CampaignDetailPage } from './pages/shared/CampaignDetailPage'
import { OpportunitiesPage } from './pages/provider/OpportunitiesPage'
import { ProposalFormPage } from './pages/provider/ProposalFormPage'
import { ProviderProfilePage } from './pages/provider/ProviderProfilePage'
import { AdminHomePage } from './pages/admin/AdminHomePage'
import { AdminCampaignsPage } from './pages/admin/AdminCampaignsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Landing />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route
              path="business"
              element={
                <RequireAuth roles={[UserRole.Business]}>
                  <RequirementsPage />
                </RequireAuth>
              }
            />
            <Route
              path="business/requirements/new"
              element={
                <RequireAuth roles={[UserRole.Business]}>
                  <RequirementFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="business/requirements/:id"
              element={
                <RequireAuth roles={[UserRole.Business]}>
                  <RequirementDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="business/campaigns"
              element={
                <RequireAuth roles={[UserRole.Business]}>
                  <CampaignsPage />
                </RequireAuth>
              }
            />
            <Route
              path="business/campaigns/:id"
              element={
                <RequireAuth roles={[UserRole.Business]}>
                  <CampaignDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="business/profile"
              element={
                <RequireAuth roles={[UserRole.Business]}>
                  <BusinessProfilePage />
                </RequireAuth>
              }
            />

            <Route
              path="provider"
              element={
                <RequireAuth roles={[UserRole.Provider]}>
                  <OpportunitiesPage />
                </RequireAuth>
              }
            />
            <Route
              path="provider/opportunities/:id/propose"
              element={
                <RequireAuth roles={[UserRole.Provider]}>
                  <ProposalFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="provider/campaigns"
              element={
                <RequireAuth roles={[UserRole.Provider]}>
                  <CampaignsPage />
                </RequireAuth>
              }
            />
            <Route
              path="provider/campaigns/:id"
              element={
                <RequireAuth roles={[UserRole.Provider]}>
                  <CampaignDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="provider/profile"
              element={
                <RequireAuth roles={[UserRole.Provider]}>
                  <ProviderProfilePage />
                </RequireAuth>
              }
            />

            <Route
              path="admin"
              element={
                <RequireAuth roles={[UserRole.Admin]}>
                  <AdminHomePage />
                </RequireAuth>
              }
            />
            <Route
              path="admin/campaigns"
              element={
                <RequireAuth roles={[UserRole.Admin]}>
                  <AdminCampaignsPage />
                </RequireAuth>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
