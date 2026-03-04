import { Plus, Trash2, Users } from 'lucide-react'
import Accordion from './components/ui/Accordion'

function MultiplierSection({ formData, setFormData }) {
  const initializeMultiplierData = () => {
    setFormData(prev => ({
      ...prev,
      multiplier_data: {
        peer_companies: []
      }
    }))
  }

  const addPeerCompany = () => {
    console.log('addPeerCompany called, current multiplier_data:', formData.multiplier_data)
    
    const newPeer = {
      name: '',
      revenue: 0,
      ebitda: 0,
      ebit: 0,
      eps: 0,
      enterprise_value: 0,
      current_price: 0,
      book_value_per_share: 0
    }
    
    setFormData(prev => {
      console.log('setFormData callback, prev.multiplier_data:', prev.multiplier_data)
      
      // Wenn multiplier_data nicht existiert, initialisiere es erst
      if (!prev.multiplier_data) {
        console.log('Initializing multiplier_data with first peer')
        return {
          ...prev,
          multiplier_data: {
            peer_companies: [newPeer]
          }
        }
      }
      
      // Ansonsten füge Peer hinzu
      console.log('Adding peer to existing multiplier_data, current peers:', prev.multiplier_data.peer_companies.length)
      return {
        ...prev,
        multiplier_data: {
          ...prev.multiplier_data,
          peer_companies: [...prev.multiplier_data.peer_companies, newPeer]
        }
      }
    })
  }

  const removePeerCompany = (index) => {
    setFormData(prev => ({
      ...prev,
      multiplier_data: {
        ...(prev.multiplier_data || {}),
        peer_companies: (prev.multiplier_data?.peer_companies || []).filter((_, i) => i !== index)
      }
    }))
  }

  const updatePeerCompany = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      multiplier_data: {
        ...(prev.multiplier_data || {}),
        peer_companies: (prev.multiplier_data?.peer_companies || []).map((peer, i) => 
          i === index ? { ...peer, [field]: field === 'name' ? value : parseFloat(value) || 0 } : peer
        )
      }
    }))
  }

  const handleAccordionChange = (isOpen) => {
    // Wenn Accordion geöffnet wird und noch keine Daten vorhanden, initialisiere
    if (isOpen && !formData.multiplier_data) {
      initializeMultiplierData()
    }
  }

  // Stelle sicher dass multiplier_data existiert wenn wir die Felder anzeigen
  const multiplierData = formData.multiplier_data || {
    peer_companies: []
  }

  return (
    <Accordion 
      title="Peer Group Analyse (Optional)" 
      defaultOpen={false} 
      icon={Users}
      onToggle={handleAccordionChange}
    >
      <p className="text-sm text-gray-600 mb-4">
        Fügen Sie vergleichbare Unternehmen (Peers) hinzu für eine Multiplier-basierte Bewertung.
      </p>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Peer Companies</h4>
          <button
            onClick={addPeerCompany}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Peer hinzufügen
          </button>
        </div>

        {multiplierData.peer_companies.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Noch keine Peer Companies hinzugefügt</p>
        ) : (
          <div className="space-y-4">
            {multiplierData.peer_companies.map((peer, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-semibold text-gray-700">Peer #{index + 1}</h5>
                  <button
                    onClick={() => removePeerCompany(index)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={peer.name}
                      onChange={(e) => updatePeerCompany(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600"
                      placeholder="z.B. Microsoft"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Umsatz (Mio.)</label>
                    <input
                      type="number"
                      value={peer.revenue}
                      onChange={(e) => updatePeerCompany(index, 'revenue', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">EBITDA (Mio.)</label>
                    <input
                      type="number"
                      value={peer.ebitda}
                      onChange={(e) => updatePeerCompany(index, 'ebitda', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">EBIT (Mio.)</label>
                    <input
                      type="number"
                      value={peer.ebit}
                      onChange={(e) => updatePeerCompany(index, 'ebit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">EPS (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={peer.eps}
                      onChange={(e) => updatePeerCompany(index, 'eps', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">EV (Mio.)</label>
                    <input
                      type="number"
                      value={peer.enterprise_value}
                      onChange={(e) => updatePeerCompany(index, 'enterprise_value', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Aktienkurs (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={peer.current_price}
                      onChange={(e) => updatePeerCompany(index, 'current_price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Buchwert/Aktie (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={peer.book_value_per_share}
                      onChange={(e) => updatePeerCompany(index, 'book_value_per_share', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Accordion>
  )
}

export default MultiplierSection
