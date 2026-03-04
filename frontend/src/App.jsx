import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, TrendingUp, DollarSign, BarChart3, Database, Calculator, Users } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import MultiplierSection from './MultiplierSection'
import WaterfallChart from './WaterfallChart'
import NotesSection from './NotesSection'
import SensitivityAnalysis from './SensitivityAnalysis'
import ScenarioComparison from './ScenarioComparison'
import ExportButtons from './ExportButtons'

function App() {
  const [analyses, setAnalyses] = useState([])
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [formData, setFormData] = useState({
    company_name: '',
    historical_start_year: 2020,
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
    revenue_growth_rate: 0.03,
    risk_free_rate: 0.025,
    beta: 1.0,
    market_return: 0.08,
    cost_of_debt: 0.03,
    debt_capital: 0,
    tax_rate: 0.30,
    terminal_growth: 0.02,
    shares_outstanding: 100,
    net_debt: 0,
    current_share_price: null
  })
  const [results, setResults] = useState(null)
  const [notes, setNotes] = useState({
    general_notes: '',
    assumptions: [],
    sources: [],
    risks: []
  })

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
      alert('Fehler bei der Berechnung: ' + error.message)
    }
  }

  const loadAnalysis = (analysis) => {
    setCurrentAnalysis(analysis)
    setFormData(analysis.inputs)
    // Extrahiere nur die Results-Felder (ohne id, created_at, updated_at, inputs)
    const { id, company_name, inputs, created_at, updated_at, ...results } = analysis
    setResults(results)
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
      historical_start_year: new Date().getFullYear() - 3,
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
      revenue_growth_rate: 0.03,
      risk_free_rate: 0.025,
      beta: 1.0,
      market_return: 0.08,
      cost_of_debt: 0.03,
      debt_capital: 0,
      tax_rate: 0.30,
      terminal_growth: 0.02,
      shares_outstanding: 100,
      net_debt: 0,
      current_share_price: null
    })
  }

  const loadAllianzExample = () => {
    setFormData({
      company_name: 'Allianz (Beispiel)',
      historical_start_year: 2020,
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
  }

  const chartData = (results && results.forecast_revenues) ? results.forecast_revenues.map((rev, i) => ({
    year: `Jahr ${i + 1}`,
    revenue: rev,
    fcf: results.free_cash_flows?.[i] || 0,
    fcfe: results.fcfe?.[i] || 0
  })) : []

  // Berechne historische Jahre basierend auf Startjahr und Anzahl der Datenpunkte
  const historicalDataCount = formData.historical_data?.revenue?.length || 3
  const startYear = formData.historical_start_year || new Date().getFullYear() - historicalDataCount + 1
  const historicalYears = Array.from(
    { length: historicalDataCount }, 
    (_, i) => String(startYear + i)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <TrendingUp className="text-indigo-600" size={40} />
            DCF Finanzanalyse - Universell
          </h1>
          <p className="text-gray-600 mt-2">Für jedes Unternehmen: DCF mit CAPM, WACC-Iteration & Tax Shield</p>
          <p className="text-sm text-gray-500 mt-1">💡 Tipp: Klicken Sie auf "Allianz Beispiel laden" für eine Demo-Analyse</p>
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
            <button
              onClick={loadAllianzExample}
              className="w-full mb-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              📊 Allianz Beispiel laden
            </button>
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Database size={28} />
                Unternehmensparameter
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2">
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
                    Startjahr Historie
                  </label>
                  <input
                    type="number"
                    value={formData.historical_start_year}
                    onChange={(e) => handleInputChange('historical_start_year', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="z.B. 2020"
                    min="1900"
                    max="2100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anzahl Aktien (Mio.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aktueller Aktienkurs (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_share_price || ''}
                    onChange={(e) => handleInputChange('current_share_price', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6">Historische Daten (3 Jahre)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Kennzahl</th>
                      {historicalYears.map(year => (
                        <th key={year} className="px-3 py-2 text-center font-medium text-gray-700">{year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-2 font-medium text-gray-700">Umsatz (Mio. €)</td>
                      {formData.historical_data.revenue.map((val, i) => (
                        <td key={i} className="px-3 py-2">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => handleHistoricalChange('revenue', i, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-600"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-700">EBIT (Mio. €)</td>
                      {formData.historical_data.ebit.map((val, i) => (
                        <td key={i} className="px-3 py-2">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => handleHistoricalChange('ebit', i, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-600"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2 font-medium text-gray-700">D&A (Mio. €)</td>
                      {formData.historical_data.depreciation.map((val, i) => (
                        <td key={i} className="px-3 py-2">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => handleHistoricalChange('depreciation', i, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-600"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-700">Δ NWC (Mio. €)</td>
                      {formData.historical_data.nwc_change.map((val, i) => (
                        <td key={i} className="px-3 py-2">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => handleHistoricalChange('nwc_change', i, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-600"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2 font-medium text-gray-700">CapEx (Mio. €)</td>
                      {formData.historical_data.capex.map((val, i) => (
                        <td key={i} className="px-3 py-2">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => handleHistoricalChange('capex', i, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-600"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-700">Zinsen (Mio. €)</td>
                      {formData.historical_data.interest.map((val, i) => (
                        <td key={i} className="px-3 py-2">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => handleHistoricalChange('interest', i, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-600"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-2 font-medium text-gray-700">Leverage/Tilgung (Mio. €)</td>
                      {formData.historical_data.leverage_repayment.map((val, i) => (
                        <td key={i} className="px-3 py-2">
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => handleHistoricalChange('leverage_repayment', i, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-600"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-6 flex items-center gap-2">
                <Calculator size={24} />
                CAPM & WACC Parameter
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risikofreier Zins (rf) %
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={(formData.risk_free_rate * 100).toFixed(2)}
                    onChange={(e) => handleInputChange('risk_free_rate', parseFloat(e.target.value) / 100)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beta (β)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.beta}
                    onChange={(e) => handleInputChange('beta', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marktrendite (rm) %
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={(formData.market_return * 100).toFixed(2)}
                    onChange={(e) => handleInputChange('market_return', parseFloat(e.target.value) / 100)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fremdkapitalkosten %
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={(formData.cost_of_debt * 100).toFixed(4)}
                    onChange={(e) => handleInputChange('cost_of_debt', parseFloat(e.target.value) / 100)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fremdkapital (Mio. €)
                  </label>
                  <input
                    type="number"
                    value={formData.debt_capital}
                    onChange={(e) => handleInputChange('debt_capital', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Steuersatz %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={(formData.tax_rate * 100).toFixed(0)}
                    onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) / 100)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Umsatzwachstum %
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={(formData.revenue_growth_rate * 100).toFixed(3)}
                    onChange={(e) => handleInputChange('revenue_growth_rate', parseFloat(e.target.value) / 100)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terminal Wachstum %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={(formData.terminal_growth * 100).toFixed(0)}
                    onChange={(e) => handleInputChange('terminal_growth', parseFloat(e.target.value) / 100)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prognosejahre
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.forecast_years}
                    onChange={(e) => handleInputChange('forecast_years', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <button
                onClick={calculateDCF}
                className="mt-6 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Save size={20} />
                DCF Berechnen & Speichern
              </button>
            </div>

            <MultiplierSection formData={formData} setFormData={setFormData} />

            <NotesSection notes={notes} onNotesChange={setNotes} />

            {results && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <h3 className="text-sm font-medium text-gray-600">Aktienkurs (Entity)</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      €{results.share_price.toFixed(2)}
                    </p>
                    {formData.current_share_price && (
                      <p className="text-xs text-gray-500 mt-1">
                        Markt: €{formData.current_share_price.toFixed(2)} 
                        ({((results.share_price / formData.current_share_price - 1) * 100).toFixed(1)}%)
                      </p>
                    )}
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="text-purple-600" size={24} />
                      <h3 className="text-sm font-medium text-gray-600">Aktienkurs (Equity)</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      €{results.share_price_equity_approach?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-lg p-4">
                    <h3 className="text-xs font-medium text-gray-600 mb-1">WACC (berechnet)</h3>
                    <p className="text-lg font-bold text-gray-800">{((results.wacc || 0) * 100).toFixed(2)}%</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-4">
                    <h3 className="text-xs font-medium text-gray-600 mb-1">Cost of Equity (CAPM)</h3>
                    <p className="text-lg font-bold text-gray-800">{((results.cost_of_equity || 0) * 100).toFixed(2)}%</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-4">
                    <h3 className="text-xs font-medium text-gray-600 mb-1">EBIT Marge Ø</h3>
                    <p className="text-lg font-bold text-gray-800">{((results.ebit_margin || 0) * 100).toFixed(2)}%</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-4">
                    <h3 className="text-xs font-medium text-gray-600 mb-1">Terminal Value</h3>
                    <p className="text-lg font-bold text-gray-800">€{(results.terminal_value || 0).toLocaleString()}M</p>
                  </div>
                </div>

                {/* Wasserfall-Diagramm */}
                <WaterfallChart results={results} formData={formData} />

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Cash Flow Entwicklung</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="fcf" fill="#3b82f6" name="Free Cash Flow" />
                      <Bar dataKey="fcfe" fill="#10b981" name="FCFE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Umsatz & Cash Flow Prognose</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#6366f1" name="Umsatz" strokeWidth={2} />
                      <Line type="monotone" dataKey="fcf" stroke="#3b82f6" name="FCF" strokeWidth={2} />
                      <Line type="monotone" dataKey="fcfe" stroke="#10b981" name="FCFE" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {results.multiplier_analysis && (
                  <>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="text-indigo-600" size={28} />
                        Multiplier-Analyse Ergebnisse
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">EV/Sales</h4>
                          <p className="text-2xl font-bold text-blue-700">
                            €{results.multiplier_analysis.share_prices.ev_sales.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Multiple: {results.multiplier_analysis.multiples_stats.ev_sales.median.toFixed(2)}x
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">EV/EBIT</h4>
                          <p className="text-2xl font-bold text-green-700">
                            €{results.multiplier_analysis.share_prices.ev_ebit.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Multiple: {results.multiplier_analysis.multiples_stats.ev_ebit.median.toFixed(2)}x
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">EV/EBITDA</h4>
                          <p className="text-2xl font-bold text-purple-700">
                            €{results.multiplier_analysis.share_prices.ev_ebitda.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Multiple: {results.multiplier_analysis.multiples_stats.ev_ebitda.median.toFixed(2)}x
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">P/E (KGV)</h4>
                          <p className="text-2xl font-bold text-orange-700">
                            €{results.multiplier_analysis.share_prices.per.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Multiple: {results.multiplier_analysis.multiples_stats.per.median.toFixed(2)}x
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">P/B (KBV)</h4>
                          <p className="text-2xl font-bold text-pink-700">
                            €{results.multiplier_analysis.share_prices.pbr.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Multiple: {results.multiplier_analysis.multiples_stats.pbr.median.toFixed(2)}x
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">Durchschnitt (Mean)</h4>
                          <p className="text-3xl font-bold text-indigo-700">
                            €{results.multiplier_analysis.share_prices.mean.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4 border-2 border-indigo-200">
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">Median</h4>
                          <p className="text-3xl font-bold text-indigo-700">
                            €{results.multiplier_analysis.share_prices.median.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Bewertungsvergleich: DCF vs. Multiplier</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">DCF (Entity)</h4>
                          <p className="text-2xl font-bold text-blue-700">€{results.share_price.toFixed(2)}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">DCF (Equity)</h4>
                          <p className="text-2xl font-bold text-green-700">€{results.share_price_equity_approach?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Multiplier (Median)</h4>
                          <p className="text-2xl font-bold text-purple-700">€{results.multiplier_analysis.share_prices.median.toFixed(2)}</p>
                        </div>
                      </div>
                      {formData.current_share_price && (
                        <div className="mt-4 bg-yellow-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Aktueller Marktpreis</h4>
                          <p className="text-2xl font-bold text-yellow-700">€{formData.current_share_price.toFixed(2)}</p>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Abweichung DCF: {((results.share_price / formData.current_share_price - 1) * 100).toFixed(1)}%</p>
                            <p>Abweichung Multiplier: {((results.multiplier_analysis.share_prices.median / formData.current_share_price - 1) * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sensitivitätsanalyse */}
                    <SensitivityAnalysis 
                      formData={formData} 
                      currentSharePrice={formData.current_share_price}
                    />

                    {/* Szenario-Analyse */}
                    <ScenarioComparison formData={formData} />

                    {/* Export-Funktionen */}
                    <ExportButtons formData={formData} results={results} notes={notes} />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
