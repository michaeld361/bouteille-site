'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

// ───────────────────── Types ─────────────────────
interface SchemaField {
  name: string
  title: string
  type: string
  description?: string
  options?: { list?: { title: string; value: string }[] | string[] }
  fields?: SchemaField[]
}

interface SchemaType {
  name: string
  title: string
  singleton: boolean
  titleField: string
  fields: SchemaField[]
}

interface SchemaConfig {
  types: SchemaType[]
}

interface I18nEntry {
  _key: string
  value: string
}

interface Toast {
  id: string
  type: 'success' | 'error'
  message: string
}

// ───────────────────── API helpers ─────────────────────
const API = '/api/admin'

async function apiFetch<T>(params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${API}?${qs}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function apiPost<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// ───────────────────── SVG Icons ─────────────────────
function IconDoc() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9 1Z" />
      <path d="M9 1v4h4" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2" />
      <path d="M13.7 9.8a1.2 1.2 0 0 0 .2-1.3l-.6-1a1.2 1.2 0 0 0-1.1-.5h-.3a5 5 0 0 0-.5-.8l.2-.3a1.2 1.2 0 0 0-.2-1.3l-.8-.8a1.2 1.2 0 0 0-1.3-.2l-.3.2a5 5 0 0 0-.8-.5V3.1a1.2 1.2 0 0 0-.5-1.1l-1-.6a1.2 1.2 0 0 0-1.3.2l-.2.3a5 5 0 0 0-.8.5l-.3-.2a1.2 1.2 0 0 0-1.3.2l-.8.8a1.2 1.2 0 0 0-.2 1.3l.2.3a5 5 0 0 0-.5.8h-.3a1.2 1.2 0 0 0-1.1.5l-.6 1a1.2 1.2 0 0 0 .2 1.3l.2.2a5 5 0 0 0 .5.8l-.2.3a1.2 1.2 0 0 0 .2 1.3l.8.8a1.2 1.2 0 0 0 1.3.2l.3-.2a5 5 0 0 0 .8.5v.3a1.2 1.2 0 0 0 .5 1.1l1 .6a1.2 1.2 0 0 0 1.3-.2l.2-.3a5 5 0 0 0 .8-.5l.3.2a1.2 1.2 0 0 0 1.3-.2l.8-.8a1.2 1.2 0 0 0 .2-1.3l-.2-.3a5 5 0 0 0 .5-.8h.3a1.2 1.2 0 0 0 1.1-.5l.6-1Z" />
    </svg>
  )
}

function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l6-4 6 4v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6Z" />
      <path d="M6 14V8h4v6" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="4" x2="14" y2="4" />
      <line x1="2" y1="8" x2="14" y2="8" />
      <line x1="2" y1="12" x2="14" y2="12" />
    </svg>
  )
}

function IconWine() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 1h8l-1 5a3 3 0 0 1-6 0L4 1Z" />
      <line x1="8" y1="10" x2="8" y2="15" />
      <line x1="5" y1="15" x2="11" y2="15" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="11" rx="1" />
      <line x1="2" y1="7" x2="14" y2="7" />
      <line x1="5" y1="1" x2="5" y2="4" />
      <line x1="11" y1="1" x2="11" y2="4" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14a6 6 0 0 1 12 0" />
    </svg>
  )
}

function IconPage() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L9 1Z" />
      <path d="M5 10h6M5 7h6" />
    </svg>
  )
}

function IconUtensils() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 1v5a2 2 0 0 0 4 0V1M5 1v10M11 1c0 0-2 2-2 5s2 3 2 3v6" />
    </svg>
  )
}

function IconArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 7H4M7 3L3 7l4 4" />
    </svg>
  )
}

function IconSave() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 13H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h6l3 3v7a1 1 0 0 1-1 1Z" />
      <path d="M9 13V8H5v5M5 1v3h4" />
    </svg>
  )
}

const TYPE_ICONS: Record<string, () => React.ReactNode> = {
  siteSettings: IconSettings,
  navigation: IconMenu,
  homePage: IconHome,
  wine: IconWine,
  menuCategory: IconUtensils,
  menuItem: IconUtensils,
  event: IconCalendar,
  teamMember: IconUser,
  page: IconPage,
}

function getTypeIcon(typeName: string) {
  const Icon = TYPE_ICONS[typeName] || IconDoc
  return <Icon />
}

// ───────────────────── i18n helper ─────────────────────
const LANGUAGES = [
  { key: 'en', label: 'English' },
  { key: 'fr', label: 'French' },
  { key: 'nl', label: 'Dutch' },
]

function extractI18nValue(arr: I18nEntry[] | undefined | null, lang: string): string {
  if (!Array.isArray(arr)) return ''
  return arr.find((e) => e._key === lang)?.value || ''
}

function getDisplayTitle(doc: Record<string, unknown>, titleField: string): string {
  const val = doc[titleField]
  if (val == null) return doc._id as string || 'Untitled'
  if (Array.isArray(val)) {
    const en = val.find((e: I18nEntry) => e._key === 'en')?.value
    return en || val[0]?.value || 'Untitled'
  }
  return String(val)
}

// ───────────────────── Toast system ─────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="admin-toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`admin-toast admin-toast-${t.type}`}>
          <span className="admin-toast-icon">{t.type === 'success' ? '✓' : '✕'}</span>
          <span>{t.message}</span>
          <button className="admin-toast-dismiss" onClick={() => onDismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  )
}

// ───────────────────── Field Components ─────────────────────
function StringField({ field, value, onChange }: { field: SchemaField; value: string; onChange: (v: string) => void }) {
  return (
    <div className="admin-field">
      <label className="admin-field-label">{field.title}</label>
      {field.description && <div className="admin-field-description">{field.description}</div>}
      <input
        className="admin-field-input"
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${field.title.toLowerCase()}…`}
      />
    </div>
  )
}

function NumberField({ field, value, onChange }: { field: SchemaField; value: number | string; onChange: (v: number) => void }) {
  return (
    <div className="admin-field">
      <label className="admin-field-label">{field.title}</label>
      {field.description && <div className="admin-field-description">{field.description}</div>}
      <input
        className="admin-field-input"
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        placeholder={`Enter ${field.title.toLowerCase()}…`}
      />
    </div>
  )
}

function BooleanField({ field, value, onChange }: { field: SchemaField; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="admin-field">
      <label className="admin-field-label">{field.title}</label>
      {field.description && <div className="admin-field-description">{field.description}</div>}
      <div className="admin-field-toggle-wrapper">
        <label className="admin-field-toggle">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span className="admin-field-toggle-track" />
          <span className="admin-field-toggle-thumb" />
        </label>
        <span className="admin-field-toggle-label">{value ? 'Yes' : 'No'}</span>
      </div>
    </div>
  )
}

function SelectField({
  field,
  value,
  onChange,
}: {
  field: SchemaField
  value: string
  onChange: (v: string) => void
}) {
  const options = field.options?.list || []
  return (
    <div className="admin-field">
      <label className="admin-field-label">{field.title}</label>
      {field.description && <div className="admin-field-description">{field.description}</div>}
      <select className="admin-field-input" value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Select —</option>
        {options.map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value
          const optLabel = typeof opt === 'string' ? opt : opt.title
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          )
        })}
      </select>
    </div>
  )
}

function I18nStringField({
  field,
  value,
  onChange,
}: {
  field: SchemaField
  value: I18nEntry[]
  onChange: (v: I18nEntry[]) => void
}) {
  const [activeLang, setActiveLang] = useState('en')
  const arr: I18nEntry[] = Array.isArray(value) ? value : []

  const handleChange = (text: string) => {
    const updated = [...arr]
    const idx = updated.findIndex((e) => e._key === activeLang)
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], value: text }
    } else {
      updated.push({ _key: activeLang, value: text })
    }
    onChange(updated)
  }

  return (
    <div className="admin-field">
      <label className="admin-field-label">{field.title}</label>
      {field.description && <div className="admin-field-description">{field.description}</div>}
      <div className="admin-i18n-tabs">
        {LANGUAGES.map((lang) => {
          const hasValue = !!extractI18nValue(arr, lang.key)
          return (
            <button
              key={lang.key}
              type="button"
              className={`admin-i18n-tab ${activeLang === lang.key ? 'active' : ''}`}
              onClick={() => setActiveLang(lang.key)}
            >
              {lang.key}
              <span className={`admin-i18n-tab-dot ${hasValue ? '' : 'empty'}`} />
            </button>
          )
        })}
      </div>
      <input
        className="admin-field-input"
        type="text"
        value={extractI18nValue(arr, activeLang)}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`${field.title} (${activeLang.toUpperCase()})…`}
      />
    </div>
  )
}

function I18nTextField({
  field,
  value,
  onChange,
}: {
  field: SchemaField
  value: I18nEntry[]
  onChange: (v: I18nEntry[]) => void
}) {
  const [activeLang, setActiveLang] = useState('en')
  const arr: I18nEntry[] = Array.isArray(value) ? value : []

  const handleChange = (text: string) => {
    const updated = [...arr]
    const idx = updated.findIndex((e) => e._key === activeLang)
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], value: text }
    } else {
      updated.push({ _key: activeLang, value: text })
    }
    onChange(updated)
  }

  return (
    <div className="admin-field">
      <label className="admin-field-label">{field.title}</label>
      {field.description && <div className="admin-field-description">{field.description}</div>}
      <div className="admin-i18n-tabs">
        {LANGUAGES.map((lang) => {
          const hasValue = !!extractI18nValue(arr, lang.key)
          return (
            <button
              key={lang.key}
              type="button"
              className={`admin-i18n-tab ${activeLang === lang.key ? 'active' : ''}`}
              onClick={() => setActiveLang(lang.key)}
            >
              {lang.key}
              <span className={`admin-i18n-tab-dot ${hasValue ? '' : 'empty'}`} />
            </button>
          )
        })}
      </div>
      <textarea
        className="admin-field-input"
        value={extractI18nValue(arr, activeLang)}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`${field.title} (${activeLang.toUpperCase()})…`}
        rows={4}
      />
    </div>
  )
}

function renderField(
  field: SchemaField,
  value: unknown,
  onChange: (name: string, val: unknown) => void
) {
  const key = field.name

  switch (field.type) {
    // ── Visual section divider ──
    case 'section':
      return (
        <div key={key} className="admin-section-divider">
          <span className="admin-section-divider-text">{field.title.replace(/^── /, '').replace(/ ──$/, '')}</span>
        </div>
      )

    // ── Info/hint pointing to another section ──
    case 'info':
      return (
        <div key={key} className="admin-field admin-field-info">
          <label className="admin-field-label">{field.title}</label>
          {field.description && <div className="admin-field-info-text">{field.description}</div>}
        </div>
      )

    case 'string':
      if (field.options?.list) {
        return (
          <SelectField
            key={key}
            field={field}
            value={(value as string) || ''}
            onChange={(v) => onChange(field.name, v)}
          />
        )
      }
      return (
        <StringField
          key={key}
          field={field}
          value={(value as string) || ''}
          onChange={(v) => onChange(field.name, v)}
        />
      )

    case 'number':
      return (
        <NumberField
          key={key}
          field={field}
          value={value as number}
          onChange={(v) => onChange(field.name, v)}
        />
      )

    case 'boolean':
      return (
        <BooleanField
          key={key}
          field={field}
          value={!!value}
          onChange={(v) => onChange(field.name, v)}
        />
      )

    case 'select':
      return (
        <SelectField
          key={key}
          field={field}
          value={(value as string) || ''}
          onChange={(v) => onChange(field.name, v)}
        />
      )

    case 'i18nString':
    case 'internationalizedArrayString':
      return (
        <I18nStringField
          key={key}
          field={field}
          value={(value as I18nEntry[]) || []}
          onChange={(v) => onChange(field.name, v)}
        />
      )

    case 'i18nText':
    case 'internationalizedArrayText':
      return (
        <I18nTextField
          key={key}
          field={field}
          value={(value as I18nEntry[]) || []}
          onChange={(v) => onChange(field.name, v)}
        />
      )

    default:
      // Render unsupported types as a read-only display
      return (
        <div key={key} className="admin-field">
          <label className="admin-field-label">{field.title}</label>
          {field.description && <div className="admin-field-description">{field.description}</div>}
          <input
            className="admin-field-input"
            type="text"
            value={value != null ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : ''}
            disabled
            placeholder={`(${field.type} — not editable)`}
          />
        </div>
      )
  }
}

// ───────────────────── AdminSidebar ─────────────────────
function AdminSidebar({
  schema,
  activeType,
  onSelect,
}: {
  schema: SchemaConfig
  activeType: string | null
  onSelect: (typeName: string) => void
}) {
  const singletons = schema.types.filter((t) => t.singleton)
  const collections = schema.types.filter((t) => !t.singleton)

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">B</div>
          <div>
            <div className="admin-sidebar-title">Bouteille</div>
            <div className="admin-sidebar-subtitle">Content Studio</div>
          </div>
        </div>
      </div>

      {singletons.length > 0 && (
        <div className="admin-sidebar-section">
          <div className="admin-sidebar-section-title">Settings</div>
          {singletons.map((t) => (
            <button
              key={t.name}
              className={`admin-sidebar-item ${activeType === t.name ? 'active' : ''}`}
              onClick={() => onSelect(t.name)}
            >
              <span className="admin-sidebar-item-icon">{getTypeIcon(t.name)}</span>
              {t.title}
            </button>
          ))}
        </div>
      )}

      <div className="admin-sidebar-divider" />

      {collections.length > 0 && (
        <div className="admin-sidebar-section">
          <div className="admin-sidebar-section-title">Content</div>
          {collections.map((t) => (
            <button
              key={t.name}
              className={`admin-sidebar-item ${activeType === t.name ? 'active' : ''}`}
              onClick={() => onSelect(t.name)}
            >
              <span className="admin-sidebar-item-icon">{getTypeIcon(t.name)}</span>
              {t.title}
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}

// ───────────────────── DocumentList ─────────────────────
function DocumentList({
  schemaType,
  onSelectDoc,
}: {
  schemaType: SchemaType
  onSelectDoc: (docId: string) => void
}) {
  const [docs, setDocs] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    apiFetch<{ documents: Record<string, unknown>[]; result?: Record<string, unknown>[] }>({ action: 'list', type: schemaType.name })
      .then((data) => {
        if (!cancelled) setDocs(data.documents || data.result || [])
      })
      .catch(() => {
        if (!cancelled) setDocs([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [schemaType.name])

  if (loading) {
    return (
      <div className="admin-doclist">
        <div className="admin-doclist-header">
          <h2 className="admin-doclist-title">{schemaType.title}</h2>
        </div>
        <div className="admin-loading">
          <div className="admin-spinner" />
          <div className="admin-loading-text">Loading documents…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-doclist">
      <div className="admin-doclist-header">
        <h2 className="admin-doclist-title">{schemaType.title}</h2>
        <span className="admin-doclist-count">{docs.length} document{docs.length !== 1 ? 's' : ''}</span>
      </div>

      {docs.length === 0 ? (
        <div className="admin-doclist-empty">
          <div className="admin-doclist-empty-icon">📄</div>
          <div>No documents found</div>
        </div>
      ) : (
        <ul className="admin-doclist-items">
          {docs.map((doc) => {
            const id = doc._id as string
            const title = getDisplayTitle(doc, schemaType.titleField)
            const updatedAt = doc._updatedAt as string | undefined
            const timeStr = updatedAt ? new Date(updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

            return (
              <li key={id} className="admin-doclist-item" onClick={() => onSelectDoc(id)}>
                <div className="admin-doclist-item-icon">{getTypeIcon(schemaType.name)}</div>
                <div className="admin-doclist-item-content">
                  <div className="admin-doclist-item-title">{title}</div>
                  {timeStr && <div className="admin-doclist-item-subtitle">{timeStr}</div>}
                </div>
                <div className="admin-doclist-item-meta">
                  <span className="admin-badge admin-badge-published">
                    <span className="admin-badge-dot" />
                    Published
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ───────────────────── DocumentEditor ─────────────────────
function DocumentEditor({
  schemaType,
  docId,
  onBack,
  addToast,
}: {
  schemaType: SchemaType
  docId: string
  onBack?: () => void
  addToast: (type: 'success' | 'error', message: string) => void
}) {
  const [doc, setDoc] = useState<Record<string, unknown> | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const originalRef = useRef<string>('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setHasChanges(false)
    apiFetch<{ document: Record<string, unknown>; result?: Record<string, unknown> }>({ action: 'get', id: docId })
      .then((data) => {
        const docData = data.document || data.result
        if (!cancelled && docData) {
          setDoc(docData)
          setFormData({ ...docData })
          originalRef.current = JSON.stringify(docData)
        }
      })
      .catch(() => {
        if (!cancelled) addToast('error', `Failed to load document ${docId}`)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [docId, addToast])

  const handleFieldChange = useCallback(
    (name: string, val: unknown) => {
      setFormData((prev) => {
        const next = { ...prev, [name]: val }
        setHasChanges(JSON.stringify(next) !== originalRef.current)
        return next
      })
    },
    []
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      // Build fields payload (only the editable schema fields)
      const fields: Record<string, unknown> = {}
      for (const f of schemaType.fields) {
        if (formData[f.name] !== undefined) {
          fields[f.name] = formData[f.name]
        }
      }

      await apiPost({ action: 'patch', id: docId, type: schemaType.name, fields })
      originalRef.current = JSON.stringify(formData)
      setHasChanges(false)
      addToast('success', `"${schemaType.title}" saved successfully`)
    } catch {
      addToast('error', 'Save failed — please try again')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-editor">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <div className="admin-loading-text">Loading…</div>
        </div>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="admin-editor">
        <div className="admin-empty-state">
          <div className="admin-empty-state-icon">⚠️</div>
          <div className="admin-empty-state-title">Document not found</div>
          <div className="admin-empty-state-desc">The document "{docId}" could not be loaded.</div>
        </div>
      </div>
    )
  }

  const docTitle = getDisplayTitle(formData, schemaType.titleField)

  return (
    <div className="admin-editor">
      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-breadcrumb">
          {onBack && (
            <>
              <span className="admin-toolbar-breadcrumb-link" onClick={onBack}>
                {schemaType.title}
              </span>
              <span className="admin-toolbar-breadcrumb-sep">›</span>
            </>
          )}
          <span className="admin-toolbar-breadcrumb-current">{docTitle}</span>
          {hasChanges && <span className="admin-unsaved-dot" title="Unsaved changes" />}
        </div>
        <div className="admin-toolbar-actions">
          <span className="admin-editor-id">{docId}</span>
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving || !hasChanges}>
            <IconSave />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="admin-editor-body">
        {onBack && (
          <button className="admin-back-btn" onClick={onBack}>
            <IconArrowLeft />
            Back to {schemaType.title}
          </button>
        )}

        <div className="admin-editor-form">
          {schemaType.fields.map((field) =>
            renderField(field, formData[field.name], handleFieldChange)
          )}
        </div>
      </div>
    </div>
  )
}

// ───────────────────── Main Admin Page ─────────────────────
export default function AdminPage() {
  const [schema, setSchema] = useState<SchemaConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<string | null>(null)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Load schema
  useEffect(() => {
    apiFetch<SchemaConfig>({ action: 'schema' })
      .then((data) => {
        setSchema(data)
        // Auto-select first type
        if (data.types.length > 0) {
          setActiveType(data.types[0].name)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Toast management
  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Navigation handlers
  const handleSelectType = (typeName: string) => {
    setActiveType(typeName)
    setSelectedDocId(null)
  }

  const handleSelectDoc = (docId: string) => {
    setSelectedDocId(docId)
  }

  const handleBackToList = () => {
    setSelectedDocId(null)
  }

  // Loading / error screens
  if (loading) {
    return (
      <div className="admin-shell">
        <div className="admin-loading" style={{ flex: 1 }}>
          <div className="admin-spinner" />
          <div className="admin-loading-text">Loading Bouteille Studio…</div>
        </div>
      </div>
    )
  }

  if (error || !schema) {
    return (
      <div className="admin-shell">
        <div className="admin-empty-state" style={{ flex: 1 }}>
          <div className="admin-empty-state-icon">⚠️</div>
          <div className="admin-empty-state-title">Failed to load studio</div>
          <div className="admin-empty-state-desc">{error || 'Unknown error'}</div>
        </div>
      </div>
    )
  }

  const activeSchemaType = schema.types.find((t) => t.name === activeType) || null

  // Determine what to render in the main area
  let mainContent: React.ReactNode = (
    <div className="admin-empty-state">
      <div className="admin-empty-state-icon">📝</div>
      <div className="admin-empty-state-title">Select a document type</div>
      <div className="admin-empty-state-desc">Choose a content type from the sidebar to start editing.</div>
    </div>
  )

  if (activeSchemaType) {
    if (activeSchemaType.singleton) {
      // Singletons go directly to editor
      mainContent = (
        <DocumentEditor
          key={activeSchemaType.name}
          schemaType={activeSchemaType}
          docId={activeSchemaType.name}
          addToast={addToast}
        />
      )
    } else if (selectedDocId) {
      // Collection with a selected doc
      mainContent = (
        <DocumentEditor
          key={selectedDocId}
          schemaType={activeSchemaType}
          docId={selectedDocId}
          onBack={handleBackToList}
          addToast={addToast}
        />
      )
    } else {
      // Collection list
      mainContent = (
        <DocumentList
          key={activeSchemaType.name}
          schemaType={activeSchemaType}
          onSelectDoc={handleSelectDoc}
        />
      )
    }
  }

  return (
    <div className="admin-shell">
      <AdminSidebar schema={schema} activeType={activeType} onSelect={handleSelectType} />
      <main className="admin-main">{mainContent}</main>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
