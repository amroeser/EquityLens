import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, TrendingUp, DollarSign, BarChart3, Database } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function App() {
  const [analyses, setAnalyses] = useState([])
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [formData, setFormData] = useState({
    company_name: 'Allianz',
    historical_data: {
      revenue: [140500, 148500, 152671],
      ebit: [10751, 13400, 14164],
      depreciation: [260, 307, 353],
      nwc_change: [-2318, -1385, -187],
      capex: [1501, 1400, 1444],
      interest: [999, 1160, 1438],
      leverage_repayment: [-2967, -201, 1057]
    },
    forecast_years: 4,
    revenue_growth_rate: 0.02397,
    risk_free_rate: 0.0235,
    beta: 0.85,
    market_return: 0.0932,
    cost_of_debt: 0.000931,
    debt_capital: 16490,
    tax_rate: 0.30,
    terminal_growth: 0.01,
    shares_outstanding: 403.3,
    net_debt: 16490,
    current_share_price: 209.15
  })
  const [results, setResults] = useState(null)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      const response = await fetch('/api/analyses')
      const data = await response.json()
      setAnalyses(data)
    } catch (error) {
      console.error('Error loading analyses:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleHistoricalChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      historical_data: {
        ...prev.historical_data,
        [field]: prev.historical_data[field].map((item, i) => i === index ? parseFloat(value) : item)
      }
    }))
  }

  const calculateDCF = async () => {
    try {
      const response = await fetch('/api/analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      setResults(data)
      setCurrentAnalysis(data)
      loadAnalyses()
    } catch (error) {
      console.error('Error calculating DCF:', error)
    }
  }

  const loadAnalysis = (analysis) => {
    setCurrentAnalysis(analysis)
    setFormData(analysis.inputs)
    setResults(analysis)
  }

  const deleteAnalysis = async (id) => {
    try {
      await fetch(`/api/analyses/${id}`, {
        method: 'DELETE',
      })
      loadAnalyses()
      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(null)
        setResults(null)
      }
    } catch (error) {
      console.error('Error deleting analysis:', error)
    }
  }

  const newAnalysis = () => {
    setCurrentAnalysis(null)
    setResults(null)
    setFormData({
      company_name: '',
      historical_data: {
        revenue: [0, 0, 0],
        ebit: [0, 0, 0],
        depreciation: [0, 0, 0],
        nwc_change: [0, 0, 0],
        capex: [0, 0, 0],
        interest: [0, 0, 0],
        leverage_repayment: [0, 0, 0]
      },
      forecast_years: 4,
      revenue_growth_rate: 0.024,
      risk_free_rate: 0.0235,
      beta: 0.85,
      market_return: 0.0932,
      cost_of_debt: 0.001,
      debt_capital: 0,
      tax_rate: 0.30,
      terminal_growth: 0.01,
      shares_outstanding: 100,
      net_debt: 0,
      current_share_price: null
    })
  }

  const chartData = results ? results.forecast_revenues.map((rev, i) => ({
    year: `Jahr ${i + 1}`,
    revenue: rev,
    fcf: results.free_cash_flows[i],
    fcfe: results.fcfe[i]
  })) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <TrendingUp className="text-indigo-600" size={40} />
            DCF Finanzanalyse
          </h1>
          <p className="text-gray-600 mt-2">Discounted Cash Flow Bewertung</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Gespeicherte Analysen</h2>
              <button
                onClick={newAnalysis}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {analyses.map(analysis => (
                <div
                  key={analysis.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                    currentAnalysis?.id === analysis.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div onClick={() => loadAnalysis(analysis)} className="flex-1">
                    <p className="font-semibold text-gray-800">{analysis.company_name}</p>
                    <p className="text-sm text-gray-600">
                      Aktienkurs: €{analysis.share_price.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteAnalysis(analysis.id)
                    }}
                    className="mt-2 p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Eingabeparameter</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unternehmensname
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="z.B. Allianz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WACC (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.wacc * 100}
                    onChange={(e) => handleInputChange('wacc', parseFloat(e.target.value) / 100)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Steuersatz (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tax_rate * 100}
                    onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) / 100)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terminal Wachstum (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.terminal_growth * 100}
                    onChange={(e) => handleInputChange('terminal_growth', parseFloat(e.target.value) / 100)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CapEx (% vom Umsatz)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.capex_percent * 100}
                    onChange={(e) => handleInputChange('capex_percent', parseFloat(e.target.value) / 100)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NWC (% vom Umsatz)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.nwc_percent * 100}
                    onChange={(e) => handleInputChange('nwc_percent', parseFloat(e.target.value) / 100)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anzahl Aktien (Mio.)
                  </label>
                  <input
                    type="number"
                    value={formData.shares_outstanding}
                    onChange={(e) => handleInputChange('shares_outstanding', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nettoverschuldung (Mio. €)
                  </label>
                  <input
                    type="number"
                    value={formData.net_debt}
                    onChange={(e) => handleInputChange('net_debt', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">5-Jahres Prognose</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Jahr</th>
                        {[1, 2, 3, 4, 5].map(year => (
                          <th key={year} className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                            {year}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-2 text-sm font-medium text-gray-700">Umsatz (Mio. €)</td>
                        {formData.revenue.map((val, i) => (
                          <td key={i} className="px-4 py-2">
                            <input
                              type="number"
                              value={val}
                              onChange={(e) => handleArrayChange('revenue', i, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            />
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-2 text-sm font-medium text-gray-700">EBIT Marge (%)</td>
                        {formData.ebit_margin.map((val, i) => (
                          <td key={i} className="px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={val * 100}
                              onChange={(e) => handleArrayChange('ebit_margin', i, parseFloat(e.target.value) / 100)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={calculateDCF}
                className="mt-6 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Berechnen & Speichern
              </button>
            </div>

            {results && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="text-green-600" size={24} />
                      <h3 className="text-sm font-medium text-gray-600">Unternehmenswert</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      €{results.enterprise_value.toLocaleString()}M
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="text-blue-600" size={24} />
                      <h3 className="text-sm font-medium text-gray-600">Eigenkapitalwert</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      €{results.equity_value.toLocaleString()}M
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="text-indigo-600" size={24} />
                      <h3 className="text-sm font-medium text-gray-600">Aktienkurs</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      €{results.share_price.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="text-purple-600" size={24} />
                      <h3 className="text-sm font-medium text-gray-600">Terminal Value</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      €{results.terminal_value.toLocaleString()}M
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Free Cash Flow Entwicklung</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Umsatz" strokeWidth={2} />
                      <Line type="monotone" dataKey="fcf" stroke="#10b981" name="Free Cash Flow" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
