import {
  CampaignStatus,
  DisputeStatus,
  MilestoneStatus,
  ProposalStatus,
  ProviderStatus,
  RequirementStatus,
  labels,
} from '../types/enums'

type Tone = 'neutral' | 'info' | 'warn' | 'success' | 'danger'

const tones: Record<string, Record<number, Tone>> = {
  requirement: {
    [RequirementStatus.Draft]: 'neutral',
    [RequirementStatus.UnderReview]: 'warn',
    [RequirementStatus.Open]: 'info',
    [RequirementStatus.ProposalReview]: 'info',
    [RequirementStatus.ProviderSelected]: 'success',
    [RequirementStatus.Closed]: 'neutral',
    [RequirementStatus.Cancelled]: 'danger',
  },
  proposal: {
    [ProposalStatus.Draft]: 'neutral',
    [ProposalStatus.Submitted]: 'info',
    [ProposalStatus.Shortlisted]: 'warn',
    [ProposalStatus.Accepted]: 'success',
    [ProposalStatus.Rejected]: 'danger',
    [ProposalStatus.Withdrawn]: 'neutral',
    [ProposalStatus.Expired]: 'neutral',
  },
  campaign: {
    [CampaignStatus.PendingFunding]: 'warn',
    [CampaignStatus.Active]: 'info',
    [CampaignStatus.AwaitingApproval]: 'warn',
    [CampaignStatus.Completed]: 'success',
    [CampaignStatus.Cancelled]: 'neutral',
    [CampaignStatus.Disputed]: 'danger',
  },
  milestone: {
    [MilestoneStatus.Planned]: 'neutral',
    [MilestoneStatus.Funded]: 'info',
    [MilestoneStatus.InProgress]: 'info',
    [MilestoneStatus.Submitted]: 'warn',
    [MilestoneStatus.ChangesRequested]: 'danger',
    [MilestoneStatus.Approved]: 'success',
    [MilestoneStatus.Paid]: 'success',
  },
  provider: {
    [ProviderStatus.Unverified]: 'neutral',
    [ProviderStatus.VerificationPending]: 'warn',
    [ProviderStatus.Verified]: 'success',
    [ProviderStatus.Restricted]: 'danger',
    [ProviderStatus.Suspended]: 'danger',
  },
  dispute: {
    [DisputeStatus.Open]: 'danger',
    [DisputeStatus.UnderReview]: 'warn',
    [DisputeStatus.Resolved]: 'success',
    [DisputeStatus.Rejected]: 'neutral',
    [DisputeStatus.Escalated]: 'danger',
  },
}

const labelSets = {
  requirement: labels.requirementStatus,
  proposal: labels.proposalStatus,
  campaign: labels.campaignStatus,
  milestone: labels.milestoneStatus,
  provider: labels.providerStatus,
  dispute: labels.disputeStatus,
}

export function StatusBadge({ kind, status }: { kind: keyof typeof labelSets; status: number }) {
  const tone = tones[kind][status] ?? 'neutral'
  return <span className={`badge ${tone}`}>{labelSets[kind][status] ?? status}</span>
}
