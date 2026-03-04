import { useState } from 'react'
import { TrendingUp, AlertCircle } from 'lucide-react'

function SensitivityAnalysis({ formData, currentSharePrice }) {
  const [sensitivityData, setSensitivityData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const calculateSensitivity = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sensitivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      setSensitivityData(data)
      setShowAnalysis(true)
    } catch (error) {
      console.error('Error calculating sensitivity:', error)
      alert('Fehler bei der Sensitivitätsanalyse')
    } finally {
      setLoading(false)
    }
  }

  const getCellColor = (sharePrice, basePrice) => {
    if (!currentSharePrice) {
      // Ohne Marktpreis: Vergleich mit Base Case
      const diff = ((sharePrice / basePrice) - 1) * 100
      if (diff > 10) return 'bg-green-200 text-green-900'
      if (diff > 5) return 'bg-green-100 text-green-800'
      if (diff < -10) return 'bg-red-200 text-red-900'
      if (diff < -5) return 'bg-red-100 text-red-800'
      return 'bg-gray-100 text-gray-800'
    } else {
      // Mit Marktpreis: Vergleich mit Markt
      const diff = ((sharePrice / currentSharePrice) - 1) * 100
      if (diff > 0) return 'bg-green-100 text-green-800'
      if (diff < 0) return 'bg-red-100 text-red-800'
      return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (!showAnalysis) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={24} />
          Sensitivitätsanalyse
        </h3>
        <p className="text-gray-600 mb-4">
          Analysieren Sie, wie sensitiv die Bewertung auf Änderungen der Schlüsselparameter reagiert.
        </p>
        <button
          onClick={calculateSensitivity}
          disabled={loading}
          className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
        >
          {loading ? 'Berechne...' : 'Sensitivitätsanalyse starten'}
        </button>
      </div>
    )
  }

  if (!sensitivityData) return null

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp size={24} />
            Sensitivitätsanalyse: WACC vs. Terminal Growth
          </h3>
          <button
            onClick={() => setShowAnalysis(false)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Schließen
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Base Case Aktienkurs</p>
            <p className="text-2xl font-bold text-blue-700">
              €{sensitivityData.base_share_price.toFixed(2)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-gray-600">Base WACC</p>
            <p className="text-2xl font-bold text-purple-700">
              {(sensitivityData.base_wacc * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-purple-600 mt-1">Range: ±2.0%</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Base Terminal Growth</p>
            <p className="text-2xl font-bold text-green-700">
              {(sensitivityData.base_terminal_growth * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-green-600 mt-1">Range: ±1.0%</p>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <TrendingUp size={20} className="text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-800">
              <p className="font-semibold mb-2">Sensitivitäts-Parameter:</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-medium">WACC:</span> {((sensitivityData.base_wacc - 0.02) * 100).toFixed(2)}% bis {((sensitivityData.base_wacc + 0.02) * 100).toFixed(2)}%
                  <span className="text-xs ml-1">(9 Schritte à 0.5%)</span>
                </div>
                <div>
                  <span className="font-medium">Terminal Growth:</span> {((sensitivityData.base_terminal_growth - 0.01) * 100).toFixed(2)}% bis {((sensitivityData.base_terminal_growth + 0.01) * 100).toFixed(2)}%
                  <span className="text-xs ml-1">(9 Schritte à 0.25%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 flex items-start gap-2">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Hinweis:</strong> Die Heatmap zeigt den Aktienkurs bei verschiedenen WACC- und Terminal Growth-Kombinationen.
              {currentSharePrice ? ' Grün = über Marktpreis, Rot = unter Marktpreis.' : ' Grün = deutlich über Base Case, Rot = deutlich unter Base Case.'}
            </div>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 p-2 text-sm font-semibold">
                  WACC ↓ / Growth →
                </th>
                {sensitivityData.growth_range.map((growth, idx) => (
                  <th key={idx} className="border border-gray-300 bg-gray-100 p-2 text-xs">
                    {((sensitivityData.base_terminal_growth + growth) * 100).toFixed(2)}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensitivityData.sensitivity_matrix.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="border border-gray-300 bg-gray-100 p-2 text-xs font-semibold text-center">
                    {((sensitivityData.base_wacc + sensitivityData.wacc_range[rowIdx]) * 100).toFixed(2)}%
                  </td>
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className={`border border-gray-300 p-2 text-center text-sm font-medium ${getCellColor(cell.share_price, sensitivityData.base_share_price)}`}
                    >
                      €{cell.share_price.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-semibold text-gray-800 mb-2">Interpretation</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>WACC-Sensitivität:</strong> Vertikale Bewegung zeigt Einfluss der Kapitalkosten</li>
              <li>• <strong>Growth-Sensitivität:</strong> Horizontale Bewegung zeigt Einfluss des Wachstums</li>
              <li>• Je größer die Farbunterschiede, desto sensitiver die Bewertung</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-semibold text-gray-800 mb-2">Bewertungsspanne</h4>
            {(() => {
              const allPrices = sensitivityData.sensitivity_matrix.flat().map(c => c.share_price)
              const minPrice = Math.min(...allPrices)
              const maxPrice = Math.max(...allPrices)
              return (
                <div className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Minimum:</strong> €{minPrice.toFixed(2)}</li>
                  <li>• <strong>Maximum:</strong> €{maxPrice.toFixed(2)}</li>
                  <li>• <strong>Spanne:</strong> €{(maxPrice - minPrice).toFixed(2)} ({(((maxPrice / minPrice) - 1) * 100).toFixed(1)}%)</li>
                  {currentSharePrice && (
                    <li>• <strong>Marktpreis:</strong> €{currentSharePrice.toFixed(2)}</li>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SensitivityAnalysis
