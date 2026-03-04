import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts'
import { BarChart3 } from 'lucide-react'

function FairValueChart({ results, formData }) {
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'fcf', 'noplat'])
  
  if (!results) return null

  // Erstelle Daten für historische + Prognosejahre
  const generateChartData = () => {
    const data = []
    const historicalData = formData.historical_data
    const historicalCount = historicalData.revenue.length
    const startYear = formData.historical_start_year || new Date().getFullYear() - historicalCount
    
    // Historische Jahre
    for (let i = 0; i < historicalCount; i++) {
      data.push({
        year: `${startYear + i}`,
        type: 'Historisch',
        revenue: historicalData.revenue[i],
        ebit: historicalData.ebit[i],
        fcf: null, // Historische FCF nicht verfügbar
        noplat: null,
        taxShield: null
      })
    }
    
    // Prognosejahre
    for (let i = 0; i < results.forecast_revenues.length; i++) {
      data.push({
        year: `${startYear + historicalCount + i}`,
        type: 'Prognose',
        revenue: results.forecast_revenues[i],
        ebit: results.forecast_revenues[i] * results.ebit_margin,
        fcf: results.free_cash_flows[i],
        noplat: results.noplat[i],
        taxShield: results.tax_shield[i]
      })
    }
    
    return data
  }

  const chartData = generateChartData()
  
  const metrics = [
    { id: 'revenue', label: 'Umsatz', color: '#3b82f6', unit: 'Mio. €' },
    { id: 'ebit', label: 'EBIT', color: '#8b5cf6', unit: 'Mio. €' },
    { id: 'fcf', label: 'Free Cash Flow', color: '#10b981', unit: 'Mio. €' },
    { id: 'noplat', label: 'NOPLAT', color: '#f59e0b', unit: 'Mio. €' },
    { id: 'taxShield', label: 'Tax Shield', color: '#ec4899', unit: 'Mio. €' }
  ]
  
  const toggleMetric = (metricId) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(m => m !== metricId)
        : [...prev, metricId]
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <BarChart3 size={28} />
            {formData.company_name || 'Unternehmen'} - Kennzahlen-Entwicklung
          </h3>
          <p className="text-sm text-gray-600">Historische Daten und DCF-Prognose</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {metrics.map(metric => (
            <button
              key={metric.id}
              onClick={() => toggleMetric(metric.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition flex items-center gap-2 ${
                selectedMetrics.includes(metric.id)
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedMetrics.includes(metric.id) ? { backgroundColor: metric.color } : {}}
            >
              <span className={`w-3 h-3 rounded-full ${selectedMetrics.includes(metric.id) ? 'bg-white' : ''}`} 
                    style={!selectedMetrics.includes(metric.id) ? { backgroundColor: metric.color } : {}} />
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hauptchart */}
      <ResponsiveContainer width="100%" height={450}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="historicalGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e0e7ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#e0e7ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 12 }}
            label={{ value: 'Jahr', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `${value.toLocaleString()}`}
            label={{ value: 'Mio. €', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px'
            }}
            formatter={(value, name) => {
              if (value === null) return ['N/A', name]
              const metric = metrics.find(m => m.id === name)
              return [`${value.toLocaleString()} Mio. €`, metric?.label || name]
            }}
            labelFormatter={(label) => {
              const item = chartData.find(d => d.year === label)
              return `${label} (${item?.type || ''})`
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const metric = metrics.find(m => m.id === value)
              return metric?.label || value
            }}
          />
          
          {/* Trennlinie zwischen Historie und Prognose */}
          {chartData.length > 0 && (
            <line
              x1={`${(formData.historical_data.revenue.length / chartData.length) * 100}%`}
              y1="0"
              x2={`${(formData.historical_data.revenue.length / chartData.length) * 100}%`}
              y2="100%"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
          
          {/* Kennzahlen-Linien */}
          {selectedMetrics.map(metricId => {
            const metric = metrics.find(m => m.id === metricId)
            return (
              <Line
                key={metricId}
                type="monotone"
                dataKey={metricId}
                stroke={metric.color}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            )
          })}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Metriken-Übersicht */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map(metric => {
          const latestValue = chartData[chartData.length - 1]?.[metric.id]
          const historicalAvg = chartData
            .filter(d => d.type === 'Historisch' && d[metric.id] !== null)
            .reduce((sum, d) => sum + d[metric.id], 0) / 
            chartData.filter(d => d.type === 'Historisch' && d[metric.id] !== null).length
          
          return (
            <div 
              key={metric.id}
              className={`p-4 rounded-lg border-2 transition ${
                selectedMetrics.includes(metric.id)
                  ? 'border-current shadow-md'
                  : 'border-gray-200 opacity-50'
              }`}
              style={{ borderColor: selectedMetrics.includes(metric.id) ? metric.color : undefined }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }} />
                <h4 className="font-semibold text-gray-800 text-sm">{metric.label}</h4>
              </div>
              {latestValue !== null && latestValue !== undefined ? (
                <>
                  <p className="text-2xl font-bold" style={{ color: metric.color }}>
                    {latestValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Mio. € (Prognose)</p>
                  {!isNaN(historicalAvg) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Ø Historisch: {historicalAvg.toLocaleString()}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">Nur in Prognose</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Legende */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gray-400" style={{ borderTop: '2px dashed #94a3b8' }} />
              <span className="text-gray-700">Trennlinie: Historie/Prognose</span>
            </div>
          </div>
          <div className="text-gray-600">
            <strong>Historisch:</strong> {formData.historical_data.revenue.length} Jahre | 
            <strong className="ml-2">Prognose:</strong> {results.forecast_revenues.length} Jahre
          </div>
        </div>
      </div>
    </div>
  )
}

export default FairValueChart
