import { Navigate, Route, Routes } from 'react-router-dom'
import { RoleRoute } from './auth/RoleRoute'
import { AppLayout } from './layouts/AppLayout'
import { UserRole } from './types/enums'
import { Landing } from './pages/public/Landing'
import { Login } from './pages/public/Login'
import { Register } from './pages/public/Register'
import { BusinessDashboard } from './pages/business/BusinessDashboard'
import { BusinessProfile } from './pages/business/BusinessProfile'
import { RequirementsList } from './pages/business/RequirementsList'
import { RequirementForm } from './pages/business/RequirementForm'
import { RequirementDetail } from './pages/business/RequirementDetail'
import { ProposalCompare } from './pages/business/ProposalCompare'
import { ProviderDashboard } from './pages/provider/ProviderDashboard'
import { ProviderProfile } from './pages/provider/ProviderProfile'
import { ProviderServices } from './pages/provider/ProviderServices'
import { ProviderPortfolio } from './pages/provider/ProviderPortfolio'
import { ProviderSocial } from './pages/provider/ProviderSocial'
import { Opportunities } from './pages/provider/Opportunities'
import { ProposalBuilder } from './pages/provider/ProposalBuilder'
import { CampaignsList } from './pages/campaign/CampaignsList'
import { CampaignWorkspace } from './pages/campaign/CampaignWorkspace'
import { AdminCampaigns, AdminDisputes, AdminOverview, AdminProviders, AdminRequirements } from './pages/admin/AdminPages'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RoleRoute roles={[UserRole.Business]} />}>
        <Route element={<AppLayout />}>
          <Route path="/business" element={<BusinessDashboard />} />
          <Route path="/business/profile" element={<BusinessProfile />} />
          <Route path="/business/requirements" element={<RequirementsList />} />
          <Route path="/business/requirements/new" element={<RequirementForm />} />
          <Route path="/business/requirements/:id" element={<RequirementDetail />} />
          <Route path="/business/requirements/:id/edit" element={<RequirementForm />} />
          <Route path="/business/requirements/:id/proposals" element={<ProposalCompare />} />
        </Route>
      </Route>

      <Route element={<RoleRoute roles={[UserRole.Provider]} />}>
        <Route element={<AppLayout />}>
          <Route path="/provider" element={<ProviderDashboard />} />
          <Route path="/provider/profile" element={<ProviderProfile />} />
          <Route path="/provider/services" element={<ProviderServices />} />
          <Route path="/provider/portfolio" element={<ProviderPortfolio />} />
          <Route path="/provider/social" element={<ProviderSocial />} />
          <Route path="/provider/opportunities" element={<Opportunities />} />
          <Route path="/provider/opportunities/:id" element={<ProposalBuilder />} />
        </Route>
      </Route>

      <Route element={<RoleRoute roles={[UserRole.Business, UserRole.Provider]} />}>
        <Route element={<AppLayout />}>
          <Route path="/campaigns" element={<CampaignsList />} />
          <Route path="/campaigns/:id" element={<CampaignWorkspace />} />
        </Route>
      </Route>

      <Route element={<RoleRoute roles={[UserRole.Admin]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/requirements" element={<AdminRequirements />} />
          <Route path="/admin/providers" element={<AdminProviders />} />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
          <Route path="/admin/campaigns" element={<AdminCampaigns />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
