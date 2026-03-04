import { useState } from 'react'
import { FileText, Plus, Trash2, Link as LinkIcon, AlertTriangle } from 'lucide-react'

function NotesSection({ notes, onNotesChange }) {
  const [activeTab, setActiveTab] = useState('notes')

  const handleNotesChange = (field, value) => {
    onNotesChange({
      ...notes,
      [field]: value
    })
  }

  const handleArrayAdd = (field, value) => {
    if (!value.trim()) return
    const currentArray = notes[field] || []
    handleNotesChange(field, [...currentArray, value.trim()])
  }

  const handleArrayRemove = (field, index) => {
    const currentArray = notes[field] || []
    handleNotesChange(field, currentArray.filter((_, i) => i !== index))
  }

  const tabs = [
    { id: 'notes', label: 'Notizen', icon: FileText },
    { id: 'assumptions', label: 'Annahmen', icon: FileText },
    { id: 'sources', label: 'Quellen', icon: LinkIcon },
    { id: 'risks', label: 'Risiken', icon: AlertTriangle }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FileText size={24} />
        Research-Dokumentation
      </h3>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notizen Tab */}
      {activeTab === 'notes' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allgemeine Notizen
          </label>
          <textarea
            value={notes.general_notes || ''}
            onChange={(e) => handleNotesChange('general_notes', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            rows="8"
            placeholder="Dokumentieren Sie hier Ihre Research-Erkenntnisse, wichtige Beobachtungen und Gedanken zur Analyse..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Markdown wird unterstützt. Speichern Sie regelmäßig Ihre Arbeit.
          </p>
        </div>
      )}

      {/* Annahmen Tab */}
      {activeTab === 'assumptions' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wichtige Annahmen
          </label>
          <div className="space-y-2 mb-3">
            {(notes.assumptions || []).map((assumption, index) => (
              <div key={index} className="flex items-start gap-2 bg-gray-50 p-3 rounded">
                <span className="text-sm flex-1">{assumption}</span>
                <button
                  onClick={() => handleArrayRemove('assumptions', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              id="new-assumption"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              placeholder="z.B. WACC basierend auf 10-jährigen Staatsanleihen..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleArrayAdd('assumptions', e.target.value)
                  e.target.value = ''
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById('new-assumption')
                handleArrayAdd('assumptions', input.value)
                input.value = ''
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Quellen Tab */}
      {activeTab === 'sources' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Datenquellen & Referenzen
          </label>
          <div className="space-y-2 mb-3">
            {(notes.sources || []).map((source, index) => (
              <div key={index} className="flex items-start gap-2 bg-gray-50 p-3 rounded">
                <LinkIcon size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                <span className="text-sm flex-1 break-all">{source}</span>
                <button
                  onClick={() => handleArrayRemove('sources', index)}
                  className="text-red-600 hover:text-red-800 flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              id="new-source"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              placeholder="URL oder Referenz eingeben..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleArrayAdd('sources', e.target.value)
                  e.target.value = ''
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById('new-source')
                handleArrayAdd('sources', input.value)
                input.value = ''
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Risiken Tab */}
      {activeTab === 'risks' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Identifizierte Risiken
          </label>
          <div className="space-y-2 mb-3">
            {(notes.risks || []).map((risk, index) => (
              <div key={index} className="flex items-start gap-2 bg-red-50 p-3 rounded border border-red-200">
                <AlertTriangle size={16} className="text-red-600 mt-1 flex-shrink-0" />
                <span className="text-sm flex-1">{risk}</span>
                <button
                  onClick={() => handleArrayRemove('risks', index)}
                  className="text-red-600 hover:text-red-800 flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              id="new-risk"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              placeholder="z.B. Konjunkturrisiko, Regulatorisches Risiko..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleArrayAdd('risks', e.target.value)
                  e.target.value = ''
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById('new-risk')
                handleArrayAdd('risks', input.value)
                input.value = ''
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotesSection
