import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../../api'
import { Card, DataGrid, ErrorBox, PageHeader, Select, Spinner, TextBox } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { SocialPlatform, labels, optionsOf } from '../../types/enums'
import { blank, num } from '../../lib/format'
import type { SocialAccountDto } from '../../types/api'

const empty = { platform: SocialPlatform.Instagram as SocialPlatform, handle: '', profileUrl: '', followerCount: '' }

export function ProviderSocial() {
  const toast = useToast()
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({ queryKey: ['social'], queryFn: providersApi.social })
  const [form, setForm] = useState(empty)

  const add = useMutation({
    mutationFn: () =>
      providersApi.addSocial({
        platform: form.platform,
        handle: form.handle.trim(),
        profileUrl: blank(form.profileUrl),
        followerCount: num(form.followerCount),
      }),
    onSuccess: () => {
      setForm(empty)
      qc.invalidateQueries({ queryKey: ['social'] })
      toast.success('Social account added.')
    },
    onError: toast.error,
  })

  return (
    <>
      <PageHeader title="Social accounts" subtitle="Linked accounts are checked by our team before a Social Verified badge is shown." />
      <ErrorBox error={error} />
      <div className="grid-2">
        <Card title="Linked accounts">
          {isLoading ? (
            <Spinner />
          ) : (
            <DataGrid
              rows={data ?? []}
              rowKey={(s) => s.id}
              empty="No accounts linked yet."
              columns={[
                {
                  key: 'platform',
                  header: 'Platform',
                  render: (s: SocialAccountDto) => labels.socialPlatform[s.platform],
                },
                {
                  key: 'handle',
                  header: 'Handle',
                  render: (s: SocialAccountDto) =>
                    s.profileUrl ? (
                      <a href={s.profileUrl} target="_blank" rel="noreferrer">
                        {s.handle}
                      </a>
                    ) : (
                      s.handle
                    ),
                },
                {
                  key: 'followers',
                  header: 'Followers',
                  render: (s: SocialAccountDto) => s.followerCount?.toLocaleString() ?? '—',
                },
                {
                  key: 'ownership',
                  header: 'Ownership',
                  render: (s: SocialAccountDto) => (
                    <span className={`badge ${s.isOwnershipVerified ? 'success' : 'neutral'}`}>
                      {s.isOwnershipVerified ? 'Verified' : 'Not verified'}
                    </span>
                  ),
                },
              ]}
            />
          )}
        </Card>

        <Card title="Link an account">
          <form
            className="stack"
            onSubmit={(e: FormEvent) => {
              e.preventDefault()
              add.mutate()
            }}
          >
            <Select
              label="Platform"
              value={form.platform}
              onChange={(platform) => setForm({ ...form, platform })}
              options={optionsOf(SocialPlatform).map((o) => ({ value: o.value as SocialPlatform, label: o.label }))}
            />
            <TextBox
              label="Handle"
              required
              value={form.handle}
              onChange={(handle) => setForm({ ...form, handle })}
              placeholder="@yourhandle"
            />
            <TextBox
              label="Profile URL"
              type="url"
              value={form.profileUrl}
              onChange={(profileUrl) => setForm({ ...form, profileUrl })}
            />
            <TextBox
              label="Followers / subscribers"
              type="number"
              min={0}
              value={form.followerCount}
              onChange={(followerCount) => setForm({ ...form, followerCount })}
            />
            <button className="btn primary" disabled={add.isPending}>
              Link account
            </button>
          </form>
        </Card>
      </div>
    </>
  )
}
