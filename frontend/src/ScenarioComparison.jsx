import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function ScenarioComparison({ formData }) {
  const [scenarioData, setScenarioData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showScenarios, setShowScenarios] = useState(false)

  const calculateScenarios = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      setScenarioData(data)
      setShowScenarios(true)
    } catch (error) {
      console.error('Error calculating scenarios:', error)
      alert('Fehler bei der Szenario-Analyse')
    } finally {
      setLoading(false)
    }
  }

  if (!showScenarios) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={24} />
          Szenario-Analyse
        </h3>
        <p className="text-gray-600 mb-4">
          Vergleichen Sie Best Case, Base Case und Worst Case Szenarien parallel.
        </p>
        <button
          onClick={calculateScenarios}
          disabled={loading}
          className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
        >
          {loading ? 'Berechne...' : 'Szenario-Analyse starten'}
        </button>
      </div>
    )
  }

  if (!scenarioData) return null

  const chartData = [
    {
      name: 'Worst Case',
      aktienkurs: scenarioData.worst_case.share_price,
      fill: '#ef4444'
    },
    {
      name: 'Base Case',
      aktienkurs: scenarioData.base_case.share_price,
      fill: '#3b82f6'
    },
    {
      name: 'Best Case',
      aktienkurs: scenarioData.best_case.share_price,
      fill: '#10b981'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp size={24} />
          Szenario-Analyse: Best / Base / Worst Case
        </h3>
        <button
          onClick={() => setShowScenarios(false)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Schließen
        </button>
      </div>

      {/* Vergleichstabelle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Worst Case */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="text-red-600" size={24} />
            <h4 className="text-lg font-semibold text-gray-800">Worst Case</h4>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Aktienkurs</p>
              <p className="text-2xl font-bold text-red-700">
                €{scenarioData.worst_case.share_price.toFixed(2)}
              </p>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Umsatzwachstum: {(scenarioData.worst_case.revenue_growth * 100).toFixed(2)}%</p>
              <p>Terminal Growth: {(scenarioData.worst_case.terminal_growth * 100).toFixed(2)}%</p>
              <p>WACC: {(scenarioData.worst_case.wacc * 100).toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Base Case */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Minus className="text-blue-600" size={24} />
            <h4 className="text-lg font-semibold text-gray-800">Base Case</h4>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Aktienkurs</p>
              <p className="text-2xl font-bold text-blue-700">
                €{scenarioData.base_case.share_price.toFixed(2)}
              </p>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Umsatzwachstum: {(scenarioData.base_case.revenue_growth * 100).toFixed(2)}%</p>
              <p>Terminal Growth: {(scenarioData.base_case.terminal_growth * 100).toFixed(2)}%</p>
              <p>WACC: {(scenarioData.base_case.wacc * 100).toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Best Case */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="text-green-600" size={24} />
            <h4 className="text-lg font-semibold text-gray-800">Best Case</h4>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Aktienkurs</p>
              <p className="text-2xl font-bold text-green-700">
                €{scenarioData.best_case.share_price.toFixed(2)}
              </p>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Umsatzwachstum: {(scenarioData.best_case.revenue_growth * 100).toFixed(2)}%</p>
              <p>Terminal Growth: {(scenarioData.best_case.terminal_growth * 100).toFixed(2)}%</p>
              <p>WACC: {(scenarioData.best_case.wacc * 100).toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualisierung */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Aktienkurs-Vergleich</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              label={{ value: 'Aktienkurs (€)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `€${value.toFixed(0)}`}
            />
            <Tooltip 
              formatter={(value) => `€${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
            />
            <Bar dataKey="aktienkurs" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <rect key={`bar-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Bewertungsspanne</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• <strong>Minimum:</strong> €{scenarioData.worst_case.share_price.toFixed(2)}</p>
            <p>• <strong>Maximum:</strong> €{scenarioData.best_case.share_price.toFixed(2)}</p>
            <p>• <strong>Spanne:</strong> €{(scenarioData.best_case.share_price - scenarioData.worst_case.share_price).toFixed(2)}</p>
            <p>• <strong>Volatilität:</strong> {(((scenarioData.best_case.share_price / scenarioData.worst_case.share_price) - 1) * 100).toFixed(1)}%</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Szenario-Annahmen</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• <strong>Best Case:</strong> +20% Wachstum, -0.5% WACC</p>
            <p>• <strong>Base Case:</strong> Aktuelle Eingabewerte</p>
            <p>• <strong>Worst Case:</strong> -20% Wachstum, +0.5% WACC</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScenarioComparison
