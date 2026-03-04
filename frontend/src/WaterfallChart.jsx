import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

function WaterfallChart({ results, formData }) {
  if (!results) return null

  // Berechne Wasserfall-Daten
  const waterfallData = [
    {
      name: 'Enterprise Value',
      value: results.enterprise_value,
      cumulative: results.enterprise_value,
      color: '#3b82f6'
    },
    {
      name: 'Net Debt',
      value: -formData.net_debt,
      cumulative: results.equity_value,
      color: formData.net_debt > 0 ? '#ef4444' : '#10b981'
    },
    {
      name: 'Equity Value',
      value: results.equity_value,
      cumulative: results.equity_value,
      color: '#8b5cf6',
      isTotal: true
    }
  ]

  // Berechne Share Price Wasserfall
  const shareWaterfallData = [
    {
      name: 'Equity Value',
      value: results.equity_value,
      cumulative: results.equity_value,
      color: '#8b5cf6'
    },
    {
      name: `÷ ${formData.shares_outstanding}M Aktien`,
      value: results.share_price,
      cumulative: results.share_price,
      color: '#10b981',
      isTotal: true
    }
  ]

  // Vergleichsdaten: DCF vs Multiplier vs Market
  const comparisonData = [
    {
      name: 'DCF (Entity)',
      value: results.share_price,
      color: '#3b82f6'
    },
    {
      name: 'DCF (Equity)',
      value: results.share_price_equity_approach || 0,
      color: '#10b981'
    }
  ]

  if (results.multiplier_analysis) {
    comparisonData.push({
      name: 'Multiplier (Median)',
      value: results.multiplier_analysis.share_prices.median,
      color: '#8b5cf6'
    })
  }

  if (formData.current_share_price) {
    comparisonData.push({
      name: 'Marktpreis',
      value: formData.current_share_price,
      color: '#f59e0b'
    })
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-sm">
            Wert: €{payload[0].value?.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M
          </p>
          {payload[0].payload.cumulative && (
            <p className="text-sm text-gray-600">
              Kumuliert: €{payload[0].payload.cumulative?.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Value Bridge: Enterprise Value → Equity Value */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Value Bridge: Enterprise Value → Equity Value
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={waterfallData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              label={{ value: 'Wert (€M)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `€${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {waterfallData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-gray-600">Enterprise Value</p>
            <p className="text-lg font-bold text-blue-700">
              €{results.enterprise_value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}M
            </p>
          </div>
          <div className={`p-3 rounded ${formData.net_debt > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-sm text-gray-600">Net Debt</p>
            <p className={`text-lg font-bold ${formData.net_debt > 0 ? 'text-red-700' : 'text-green-700'}`}>
              €{formData.net_debt.toLocaleString('de-DE', { minimumFractionDigits: 2 })}M
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <p className="text-sm text-gray-600">Equity Value</p>
            <p className="text-lg font-bold text-purple-700">
              €{results.equity_value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}M
            </p>
          </div>
        </div>
      </div>

      {/* Bewertungsvergleich */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Bewertungsvergleich: Aktienkurs
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
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
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {comparisonData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {comparisonData.map((item, index) => (
            <div key={index} className="p-3 rounded" style={{ backgroundColor: `${item.color}15` }}>
              <p className="text-xs text-gray-600">{item.name}</p>
              <p className="text-lg font-bold" style={{ color: item.color }}>
                €{item.value.toFixed(2)}
              </p>
              {formData.current_share_price && item.name !== 'Marktpreis' && (
                <p className="text-xs text-gray-500">
                  {((item.value / formData.current_share_price - 1) * 100).toFixed(1)}% vs. Markt
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WaterfallChart
