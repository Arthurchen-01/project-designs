'use client'

import { useState, useEffect, useCallback } from 'react'

// ── 类型 ──────────────────────────────────────────────
interface Provider {
  id: string
  provider: string
  displayName?: string
  baseUrl: string
  apiProtocol: string
  apiKeyMasked: string
  modelId: string
  modelName: string
  timeoutSeconds: number
  retryCount: number
  defaultTemperature: number
  defaultMaxTokens: number
  allowScoring: boolean
  allowRecommendation: boolean
  allowExplanation: boolean
  isDefault: boolean
  status: string
  createdAt: string
  updatedAt: string
}

interface RoutingRule {
  id: string
  sceneCode: string
  providerId: string
  enabled: boolean
  fallbackEnabled: boolean
  fallbackProviderId?: string
  priority: number
  provider?: { id: string; provider: string; modelName: string; modelId: string }
}

type Tab = 'providers' | 'routing'

// ── 主页面 ────────────────────────────────────────────
export default function AIAdminPage() {
  const [tab, setTab] = useState<Tab>('providers')
  const [providers, setProviders] = useState<Provider[]>([])
  const [rules, setRules] = useState<RoutingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Provider | null>(null)
  const [showForm, setShowForm] = useState(false)

  const loadProviders = useCallback(async () => {
    const res = await fetch('/api/admin/ai/providers')
    if (res.ok) setProviders(await res.json())
  }, [])

  const loadRules = useCallback(async () => {
    const res = await fetch('/api/admin/ai/routing')
    if (res.ok) setRules(await res.json())
  }, [])

  useEffect(() => {
    Promise.all([loadProviders(), loadRules()]).then(() => setLoading(false))
  }, [loadProviders, loadRules])

  const handleTest = async (id: string) => {
    const res = await fetch(`/api/admin/ai/providers/${id}/test`, { method: 'POST' })
    const data = await res.json()
    alert(data.success ? `✅ 连接成功 (${data.latencyMs}ms)` : `❌ ${data.message}`)
  }

  const handleActivate = async (id: string) => {
    await fetch(`/api/admin/ai/providers/${id}/activate`, { method: 'POST' })
    loadProviders()
  }

  const handleDeactivate = async (id: string) => {
    await fetch(`/api/admin/ai/providers/${id}/deactivate`, { method: 'POST' })
    loadProviders()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此 Provider？')) return
    await fetch(`/api/admin/ai/providers/${id}`, { method: 'DELETE' })
    loadProviders()
  }

  if (loading) return <div className="p-8 text-zinc-500">加载中…</div>

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-6">AI 设置 · 模型接入管理</h1>

        {/* Tab 切换 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('providers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'providers' ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            Provider 列表
          </button>
          <button
            onClick={() => setTab('routing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === 'routing' ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            场景路由绑定
          </button>
        </div>

        {tab === 'providers' && (
          <ProvidersTab
            providers={providers}
            onTest={handleTest}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onDelete={handleDelete}
            onNew={() => { setEditing(null); setShowForm(true) }}
            onEdit={(p) => { setEditing(p); setShowForm(true) }}
          />
        )}
        {tab === 'routing' && (
          <RoutingTab rules={rules} providers={providers} onReload={loadRules} />
        )}

        {showForm && (
          <ProviderForm
            provider={editing}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); loadProviders() }}
          />
        )}
      </div>
    </div>
  )
}

// ── Provider 列表 Tab ────────────────────────────────
function ProvidersTab({
  providers, onTest, onActivate, onDeactivate, onDelete, onNew, onEdit,
}: {
  providers: Provider[]
  onTest: (id: string) => void
  onActivate: (id: string) => void
  onDeactivate: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
  onEdit: (p: Provider) => void
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-zinc-800">已配置 Provider</h2>
        <button onClick={onNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + 新增 Provider
        </button>
      </div>

      {providers.length === 0 ? (
        <div className="text-zinc-400 text-center py-12 bg-white rounded-xl border">
          暂无配置，点击「新增 Provider」开始
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 text-zinc-600">
                <th className="text-left p-3">Provider</th>
                <th className="text-left p-3">Model</th>
                <th className="text-left p-3">Protocol</th>
                <th className="text-left p-3">API Key</th>
                <th className="text-left p-3">状态</th>
                <th className="text-left p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-zinc-50">
                  <td className="p-3">
                    <div className="font-medium">{p.displayName || p.provider}</div>
                    <div className="text-zinc-400 text-xs">{p.baseUrl}</div>
                  </td>
                  <td className="p-3">
                    <div>{p.modelName}</div>
                    <div className="text-zinc-400 text-xs">{p.modelId}</div>
                  </td>
                  <td className="p-3 text-xs">{p.apiProtocol}</td>
                  <td className="p-3 font-mono text-xs">{p.apiKeyMasked}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-600'
                    }`}>
                      {p.status === 'active' ? '启用' : '停用'}
                    </span>
                    {p.isDefault && (
                      <span className="ml-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        默认
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => onEdit(p)} className="text-blue-600 hover:underline text-xs">编辑</button>
                      <button onClick={() => onTest(p.id)} className="text-emerald-600 hover:underline text-xs">测试</button>
                      {p.status === 'active' ? (
                        <button onClick={() => onDeactivate(p.id)} className="text-amber-600 hover:underline text-xs">停用</button>
                      ) : (
                        <button onClick={() => onActivate(p.id)} className="text-green-600 hover:underline text-xs">启用</button>
                      )}
                      <button onClick={() => onDelete(p.id)} className="text-red-600 hover:underline text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── 路由绑定 Tab ─────────────────────────────────────
const SCENE_OPTIONS = [
  { code: 'daily_update_analysis', name: '每日更新分析' },
  { code: 'probability_explanation', name: '5 分率解释' },
  { code: 'study_suggestion', name: '学习建议' },
  { code: 'resource_tagging', name: '资源打标签' },
  { code: 'admin_test', name: '管理员测试' },
]

function RoutingTab({ rules, providers, onReload }: {
  rules: RoutingRule[]
  providers: Provider[]
  onReload: () => void
}) {
  const [localRules, setLocalRules] = useState<RoutingRule[]>([])

  useEffect(() => {
    // Merge existing rules with scene options
    const merged = SCENE_OPTIONS.map((scene) => {
      const existing = rules.find((r) => r.sceneCode === scene.code)
      return existing || {
        id: '', sceneCode: scene.code, providerId: '', enabled: true,
        fallbackEnabled: false, fallbackProviderId: '', priority: 0,
      }
    })
    setLocalRules(merged)
  }, [rules])

  const handleSave = async () => {
    const toSave = localRules
      .filter((r) => r.providerId)
      .map((r) => ({
        sceneCode: r.sceneCode,
        providerId: r.providerId,
        enabled: r.enabled,
        fallbackEnabled: r.fallbackEnabled,
        fallbackProviderId: r.fallbackProviderId || undefined,
        priority: r.priority,
      }))

    const res = await fetch('/api/admin/ai/routing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSave),
    })

    if (res.ok) {
      alert('✅ 路由配置已保存')
      onReload()
    } else {
      alert('❌ 保存失败')
    }
  }

  const updateRule = (index: number, field: string, value: any) => {
    setLocalRules((prev) => prev.map((r, i) => i === index ? { ...r, [field]: value } : r))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-zinc-800">场景路由绑定</h2>
        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          保存配置
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-zinc-50 text-zinc-600">
              <th className="text-left p-3">场景</th>
              <th className="text-left p-3">绑定 Provider</th>
              <th className="text-left p-3">启用</th>
              <th className="text-left p-3">失败回退</th>
              <th className="text-left p-3">回退 Provider</th>
            </tr>
          </thead>
          <tbody>
            {localRules.map((rule, i) => (
              <tr key={rule.sceneCode} className="border-b last:border-0">
                <td className="p-3">
                  <div className="font-medium">{SCENE_OPTIONS[i]?.name}</div>
                  <div className="text-zinc-400 text-xs">{rule.sceneCode}</div>
                </td>
                <td className="p-3">
                  <select
                    value={rule.providerId}
                    onChange={(e) => updateRule(i, 'providerId', e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  >
                    <option value="">— 未配置 —</option>
                    {providers.filter((p) => p.status === 'active').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.displayName || p.provider} — {p.modelName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => updateRule(i, 'enabled', e.target.checked)}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={rule.fallbackEnabled}
                    onChange={(e) => updateRule(i, 'fallbackEnabled', e.target.checked)}
                  />
                </td>
                <td className="p-3">
                  <select
                    value={rule.fallbackProviderId || ''}
                    onChange={(e) => updateRule(i, 'fallbackProviderId', e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                    disabled={!rule.fallbackEnabled}
                  >
                    <option value="">— 无 —</option>
                    {providers.filter((p) => p.status === 'active').map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.displayName || p.provider} — {p.modelName}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── 新增 / 编辑表单 ──────────────────────────────────
function ProviderForm({ provider, onClose, onSaved }: {
  provider: Provider | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!provider
  const [form, setForm] = useState({
    provider: provider?.provider || '',
    displayName: provider?.displayName || '',
    baseUrl: provider?.baseUrl || '',
    apiProtocol: provider?.apiProtocol || 'openai_compatible',
    apiKey: '',
    modelId: provider?.modelId || '',
    modelName: provider?.modelName || '',
    timeoutSeconds: provider?.timeoutSeconds || 30,
    retryCount: provider?.retryCount || 2,
    defaultTemperature: provider?.defaultTemperature || 0.3,
    defaultMaxTokens: provider?.defaultMaxTokens || 2000,
    allowScoring: provider?.allowScoring ?? true,
    allowRecommendation: provider?.allowRecommendation ?? true,
    allowExplanation: provider?.allowExplanation ?? true,
    isDefault: provider?.isDefault || false,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const url = isEdit
      ? `/api/admin/ai/providers/${provider!.id}`
      : '/api/admin/ai/providers'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setSaving(false)
    if (res.ok) {
      onSaved()
    } else {
      const data = await res.json().catch(() => ({}))
      alert(`❌ ${data.error || '保存失败'}`)
    }
  }

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{isEdit ? '编辑 Provider' : '新增 Provider'}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基础信息 */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Provider *" value={form.provider} onChange={(v) => set('provider', v)} placeholder="openai / openrouter / custom" />
            <Field label="Display Name" value={form.displayName} onChange={(v) => set('displayName', v)} placeholder="OpenAI Main" />
          </div>

          {/* 接口配置 */}
          <Field label="Base URL *" value={form.baseUrl} onChange={(v) => set('baseUrl', v)} placeholder="https://api.openai.com/v1" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">API Protocol *</label>
              <select value={form.apiProtocol} onChange={(e) => set('apiProtocol', e.target.value)} className="border rounded px-3 py-2 w-full">
                <option value="openai_compatible">OpenAI Compatible</option>
                <option value="anthropic_compatible">Anthropic Compatible</option>
                <option value="custom_rest">Custom REST</option>
              </select>
            </div>
            <Field label="API Key *" type="password" value={form.apiKey} onChange={(v) => set('apiKey', v)} placeholder={isEdit ? '(留空保持不变)' : 'sk-...'} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Model ID *" value={form.modelId} onChange={(v) => set('modelId', v)} placeholder="gpt-4o-mini" />
            <Field label="Model Name *" value={form.modelName} onChange={(v) => set('modelName', v)} placeholder="GPT-4o Mini" />
          </div>

          {/* 高级配置 */}
          <details className="border rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-zinc-600">高级配置</summary>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Field label="Timeout (秒)" type="number" value={String(form.timeoutSeconds)} onChange={(v) => set('timeoutSeconds', Number(v))} />
              <Field label="重试次数" type="number" value={String(form.retryCount)} onChange={(v) => set('retryCount', Number(v))} />
              <Field label="Temperature" type="number" value={String(form.defaultTemperature)} onChange={(v) => set('defaultTemperature', Number(v))} />
              <Field label="Max Tokens" type="number" value={String(form.defaultMaxTokens)} onChange={(v) => set('defaultMaxTokens', Number(v))} />
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <Checkbox label="允许用于评分" checked={form.allowScoring} onChange={(v) => set('allowScoring', v)} />
              <Checkbox label="允许用于推荐" checked={form.allowRecommendation} onChange={(v) => set('allowRecommendation', v)} />
              <Checkbox label="允许用于解释" checked={form.allowExplanation} onChange={(v) => set('allowExplanation', v)} />
              <Checkbox label="设为默认" checked={form.isDefault} onChange={(v) => set('isDefault', v)} />
            </div>
          </details>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm text-zinc-600 hover:bg-zinc-100">
              取消
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
              {saving ? '保存中…' : (isEdit ? '更新' : '创建')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── 表单子组件 ───────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border rounded px-3 py-2 w-full"
        step={type === 'number' ? 'any' : undefined}
      />
    </div>
  )
}

function Checkbox({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-600">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}
