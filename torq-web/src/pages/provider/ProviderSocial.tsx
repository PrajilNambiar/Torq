import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../../api'
import { Card, EmptyState, ErrorBox, Field, PageHeader, Spinner } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { SocialPlatform, labels, optionsOf } from '../../types/enums'
import { blank, num } from '../../lib/format'

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
          ) : !data?.length ? (
            <EmptyState>No accounts linked yet.</EmptyState>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Handle</th>
                  <th>Followers</th>
                  <th>Ownership</th>
                </tr>
              </thead>
              <tbody>
                {data.map((s) => (
                  <tr key={s.id}>
                    <td>{labels.socialPlatform[s.platform]}</td>
                    <td>
                      {s.profileUrl ? (
                        <a href={s.profileUrl} target="_blank" rel="noreferrer">
                          {s.handle}
                        </a>
                      ) : (
                        s.handle
                      )}
                    </td>
                    <td>{s.followerCount?.toLocaleString() ?? '—'}</td>
                    <td>
                      <span className={`badge ${s.isOwnershipVerified ? 'success' : 'neutral'}`}>
                        {s.isOwnershipVerified ? 'Verified' : 'Not verified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <Field label="Platform">
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: Number(e.target.value) as SocialPlatform })}
              >
                {optionsOf(SocialPlatform).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Handle">
              <input required value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} placeholder="@yourhandle" />
            </Field>
            <Field label="Profile URL">
              <input type="url" value={form.profileUrl} onChange={(e) => setForm({ ...form, profileUrl: e.target.value })} />
            </Field>
            <Field label="Followers / subscribers">
              <input type="number" min={0} value={form.followerCount} onChange={(e) => setForm({ ...form, followerCount: e.target.value })} />
            </Field>
            <button className="btn primary" disabled={add.isPending}>
              Link account
            </button>
          </form>
        </Card>
      </div>
    </>
  )
}
