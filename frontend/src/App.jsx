import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import { useHotkeys } from 'react-hotkeys-hook'
import { 
  Save, Plus, Trash2, TrendingUp, DollarSign, BarChart3, 
  Database, Calculator, Users, FileText, Download, 
  Activity, Settings, HelpCircle, Upload
} from 'lucide-react'

import Tabs from './components/ui/Tabs'
import KPICard from './components/ui/KPICard'
import Accordion from './components/ui/Accordion'
import { KPICardSkeleton } from './components/ui/LoadingSkeleton'
import ExcelUpload from './components/ui/ExcelUpload'

import WaterfallChart from './WaterfallChart'
import NotesSection from './NotesSection'
import SensitivityAnalysis from './SensitivityAnalysis'
import ScenarioComparison from './ScenarioComparison'
import ExportButtons from './ExportButtons'
import MultiplierSection from './MultiplierSection'
import FairValueChart from './FairValueChart'

function AppImproved() {
  const [analyses, setAnalyses] = useState([])
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [activeTab, setActiveTab] = useState('input')
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    company_name: '',
    historical_start_year: 2020,
    historical_data: {
      revenue: [0, 0, 0, 0],
      ebit: [0, 0, 0, 0],
      depreciation: [0, 0, 0, 0],
      nwc_change: [0, 0, 0, 0],
      capex: [0, 0, 0, 0],
      interest: [0, 0, 0, 0],
      leverage_repayment: [0, 0, 0, 0]
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
    current_share_price: null,
    target_revenue: 0,
    target_ebitda: 0,
    target_ebit: 0,
    target_eps: 0,
    target_book_value_per_share: 0,
    market_value_debt: 0
  })
  
  const [results, setResults] = useState(null)
  const [notes, setNotes] = useState({
    general_notes: '',
    assumptions: [],
    sources: [],
    risks: []
  })

  // Keyboard Shortcuts
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault()
    calculateDCF()
  })
  
  useHotkeys('ctrl+n, cmd+n', (e) => {
    e.preventDefault()
    newAnalysis()
  })
  
  useHotkeys('ctrl+e, cmd+e', (e) => {
    e.preventDefault()
    setActiveTab('export')
  })

  useEffect(() => {
    loadAnalyses()
  }, [])

  // Auto-Save mit Debouncing
  useEffect(() => {
    if (!currentAnalysis) return // Nur bei bestehenden Analysen auto-saven
    
    const timeoutId = setTimeout(() => {
      if (formData.company_name) {
        calculateDCF(true)
      }
    }, 2000) // 2 Sekunden Debounce

    return () => clearTimeout(timeoutId)
  }, [formData])

  const loadAnalyses = async () => {
    try {
      const response = await fetch('/api/analyses')
      const data = await response.json()
      setAnalyses(data)
    } catch (error) {
      console.error('Error loading analyses:', error)
      toast.error('Fehler beim Laden der Analysen')
    }
  }

  const calculateDCF = async (autoSave = true) => {
    if (!formData.company_name) {
      toast.error('Bitte Unternehmensnamen eingeben')
      return
    }

    setLoading(true)
    try {
      const endpoint = currentAnalysis 
        ? `/api/analyses/${currentAnalysis.id}`
        : '/api/analyses'
      
      const method = currentAnalysis ? 'PUT' : 'POST'
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      setResults(data)
      setCurrentAnalysis(data)
      setActiveTab('results')
      loadAnalyses()
      
      if (autoSave) {
        toast.success(currentAnalysis ? '✓ Automatisch gespeichert' : '✓ Analyse gespeichert', {
          duration: 2000,
          icon: '✓'
        })
      }
    } catch (error) {
      console.error('Error calculating DCF:', error)
      toast.error('Fehler bei der Berechnung')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalysis = (analysis) => {
    setCurrentAnalysis(analysis)
    setFormData(analysis.inputs)
    const { id, company_name, inputs, created_at, updated_at, ...results } = analysis
    setResults(results)
    setActiveTab('results')
    toast.success(`${analysis.company_name} geladen`)
  }

  const deleteAnalysis = async (id) => {
    if (!confirm('Analyse wirklich löschen?')) return
    
    try {
      await fetch(`/api/analyses/${id}`, { method: 'DELETE' })
      loadAnalyses()
      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(null)
        setResults(null)
      }
      toast.success('Analyse gelöscht')
    } catch (error) {
      console.error('Error deleting analysis:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const newAnalysis = () => {
    setCurrentAnalysis(null)
    setResults(null)
    setFormData({
      company_name: '',
      historical_start_year: new Date().getFullYear() - 4,
      historical_data: {
        revenue: [0, 0, 0, 0],
        ebit: [0, 0, 0, 0],
        depreciation: [0, 0, 0, 0],
        nwc_change: [0, 0, 0, 0],
        capex: [0, 0, 0, 0],
        interest: [0, 0, 0, 0],
        leverage_repayment: [0, 0, 0, 0]
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
      current_share_price: null,
      target_revenue: 0,
      target_ebitda: 0,
      target_ebit: 0,
      target_eps: 0,
      target_book_value_per_share: 0,
      market_value_debt: 0
    })
    setActiveTab('input')
    toast.success('Neue Analyse erstellt')
  }

  const loadAllianzExample = () => {
    setFormData({
      company_name: 'Allianz (Beispiel)',
      historical_start_year: 2020,
      historical_data: {
        revenue: [140500, 148500, 152671, 160000],
        ebit: [10751, 13400, 14164, 15200],
        depreciation: [260, 307, 353, 380],
        nwc_change: [-2318, -1385, -187, -150],
        capex: [1501, 1400, 1444, 1500],
        interest: [999, 1160, 1438, 1500],
        leverage_repayment: [-2967, -201, 1057, 800]
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
      current_share_price: 220.00,
      target_revenue: 27634,
      target_ebitda: 10083,
      target_ebit: 8211,
      target_eps: 1.58,
      target_book_value_per_share: 25.8,
      market_value_debt: 8286,
      multiplier_data: {
        peer_companies: [
          {
            name: 'IBM',
            revenue: 77147,
            ebitda: 18246,
            ebit: 12187,
            eps: 10.6,
            enterprise_value: 172601,
            current_price: 132.8,
            book_value_per_share: 23.5
          },
          {
            name: 'Bechtle',
            revenue: 5374,
            ebitda: 326,
            ebit: 241,
            eps: 4.06,
            enterprise_value: 5258,
            current_price: 126.2,
            book_value_per_share: 24.2
          },
          {
            name: 'PSI Software',
            revenue: 255,
            ebitda: 22.9,
            ebit: 17.2,
            eps: 0.91,
            enterprise_value: 325,
            current_price: 21,
            book_value_per_share: 6.03
          },
          {
            name: 'Microsoft',
            revenue: 143015,
            ebitda: 65755,
            ebit: 52959,
            eps: 5.76,
            enterprise_value: 1470106,
            current_price: 157.7,
            book_value_per_share: 15.6
          },
          {
            name: 'Adobe',
            revenue: 11171,
            ebitda: 5086,
            ebit: 4461,
            eps: 6,
            enterprise_value: 146649,
            current_price: 329.81,
            book_value_per_share: 21.4
          },
          {
            name: 'Oracle',
            revenue: 39072,
            ebitda: 18764,
            ebit: 17382,
            eps: 3.08,
            enterprise_value: 198108,
            current_price: 52.98,
            book_value_per_share: 4.15
          },
          {
            name: 'HP',
            revenue: 29135,
            ebitda: 5286,
            ebit: 2751,
            eps: 0.77,
            enterprise_value: 31492,
            current_price: 20.55,
            book_value_per_share: 13.2
          },
          {
            name: 'Salesforce',
            revenue: 17098,
            ebitda: 5009,
            ebit: 2874,
            eps: 0.15,
            enterprise_value: 156435,
            current_price: 162.64,
            book_value_per_share: 39.9
          }
        ]
      }
    })
    toast.success('Allianz Beispiel geladen')
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleHistoricalDataChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      historical_data: {
        ...prev.historical_data,
        [field]: prev.historical_data[field].map((v, i) => i === index ? parseFloat(value) || 0 : v)
      }
    }))
  }

  const tabs = [
    { id: 'input', label: 'Eingabe', icon: Database },
    { id: 'results', label: 'Ergebnisse', icon: BarChart3, badge: results ? '✓' : null },
    { 
      id: 'analysis', 
      label: 'Analysen', 
      icon: Activity,
      badge: (results?.sensitivity_analysis && results?.scenario_analysis) ? '✓' : null
    },
    { id: 'notes', label: 'Notizen', icon: FileText },
    { id: 'export', label: 'Export', icon: Download }
  ]

  const historicalDataCount = formData.historical_data?.revenue?.length || 4
  const startYear = formData.historical_start_year || new Date().getFullYear() - historicalDataCount + 1
  const historicalYears = Array.from(
    { length: historicalDataCount }, 
    (_, i) => String(startYear + i)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <TrendingUp className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DCF Finanzanalyse</h1>
                <p className="text-sm text-gray-600">Professionelle Unternehmensbewertung</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {currentAnalysis && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                  <Save size={16} />
                  Auto-Save aktiv
                </div>
              )}
              <button
                onClick={newAnalysis}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus size={18} />
                Neu
              </button>
              <button
                onClick={() => calculateDCF(true)}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                <Calculator size={18} />
                {loading ? 'Berechne...' : 'Berechnen'}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Gespeicherte Analysen</h2>
              
              <button
                onClick={loadAllianzExample}
                className="w-full mb-4 bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition text-sm font-medium shadow-sm"
              >
                📊 Allianz Beispiel
              </button>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {analyses.map((analysis, index) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition group ${
                        currentAnalysis?.id === analysis.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <div onClick={() => loadAnalysis(analysis)} className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800">{analysis.company_name}</p>
                          {analysis.sensitivity_analysis && analysis.scenario_analysis && (
                            <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded">
                              ✓ Komplett
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          €{analysis.share_price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteAnalysis(analysis.id)
                        }}
                        className="mt-2 p-1.5 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="px-6 pt-4" />
              
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'input' && (
                      <InputTab 
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleHistoricalDataChange={handleHistoricalDataChange}
                        historicalYears={historicalYears}
                        setFormData={setFormData}
                      />
                    )}
                    
                    {activeTab === 'results' && (
                      <ResultsTab results={results} formData={formData} loading={loading} />
                    )}
                    
                    {activeTab === 'analysis' && (
                      <AnalysisTab formData={formData} results={results} />
                    )}
                    
                    {activeTab === 'notes' && (
                      <NotesSection notes={notes} onNotesChange={setNotes} />
                    )}
                    
                    {activeTab === 'export' && (
                      <ExportButtons formData={formData} results={results} notes={notes} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Input Tab Component
function InputTab({ formData, handleInputChange, handleHistoricalDataChange, historicalYears, setFormData }) {
  const handleExcelDataLoaded = (data) => {
    setFormData(data)
  }

  return (
    <div className="space-y-6">
      <Accordion title="Excel-Import" defaultOpen={false} icon={Upload}>
        <ExcelUpload onDataLoaded={handleExcelDataLoaded} />
      </Accordion>
      
      <Accordion title="Unternehmensparameter" defaultOpen={true} icon={Database}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unternehmensname
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              min="1900"
              max="2100"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aktien (Mio.)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.shares_outstanding}
              onChange={(e) => handleInputChange('shares_outstanding', parseFloat(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Net Debt (Mio. €)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.net_debt}
              onChange={(e) => handleInputChange('net_debt', parseFloat(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aktueller Marktpreis (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.current_share_price || ''}
              onChange={(e) => handleInputChange('current_share_price', parseFloat(e.target.value) || null)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Aktuelle Finanzkennzahlen (für Multiplier-Bewertung)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umsatz (Mio. €)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.target_revenue || 0}
                onChange={(e) => handleInputChange('target_revenue', parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EBITDA (Mio. €)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.target_ebitda || 0}
                onChange={(e) => handleInputChange('target_ebitda', parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EBIT (Mio. €)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.target_ebit || 0}
                onChange={(e) => handleInputChange('target_ebit', parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EPS (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.target_eps || 0}
                onChange={(e) => handleInputChange('target_eps', parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buchwert/Aktie (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.target_book_value_per_share || 0}
                onChange={(e) => handleInputChange('target_book_value_per_share', parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marktwert Schulden (Mio. €)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.market_value_debt || 0}
                onChange={(e) => handleInputChange('market_value_debt', parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Historische Daten" icon={BarChart3}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left font-medium text-gray-700">Kennzahl</th>
                {historicalYears.map(year => (
                  <th key={year} className="px-3 py-2 text-center font-medium text-gray-700">{year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(formData.historical_data).map(field => (
                <tr key={field} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-700 capitalize">
                    {field.replace(/_/g, ' ')}
                  </td>
                  {formData.historical_data[field].map((value, index) => (
                    <td key={index} className="px-3 py-2">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleHistoricalDataChange(field, index, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-center"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Accordion>

      <Accordion title="CAPM & Bewertungsparameter" icon={Calculator}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { field: 'risk_free_rate', label: 'Risikofreier Zinssatz', step: 0.001, format: '%' },
            { field: 'beta', label: 'Beta', step: 0.01 },
            { field: 'market_return', label: 'Marktrendite', step: 0.001, format: '%' },
            { field: 'cost_of_debt', label: 'FK-Kosten', step: 0.001, format: '%' },
            { field: 'debt_capital', label: 'Fremdkapital (Mio.)', step: 1 },
            { field: 'tax_rate', label: 'Steuersatz', step: 0.01, format: '%' },
            { field: 'revenue_growth_rate', label: 'Umsatzwachstum', step: 0.001, format: '%' },
            { field: 'terminal_growth', label: 'Terminal Growth', step: 0.001, format: '%' },
            { field: 'forecast_years', label: 'Prognosejahre', step: 1 }
          ].map(({ field, label, step, format }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {format && <span className="text-gray-500">({format})</span>}
              </label>
              <input
                type="number"
                step={step}
                value={formData[field]}
                onChange={(e) => handleInputChange(field, parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
              />
            </div>
          ))}
        </div>
      </Accordion>

      <MultiplierSection formData={formData} setFormData={setFormData} />
    </div>
  )
}

// Results Tab Component
function ResultsTab({ results, formData, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <KPICardSkeleton key={i} />)}
      </div>
    )
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <BarChart3 size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Keine Ergebnisse</h3>
        <p className="text-gray-600">Führen Sie eine DCF-Berechnung durch, um Ergebnisse zu sehen</p>
      </div>
    )
  }

  const trend = formData.current_share_price 
    ? results.share_price > formData.current_share_price ? 'up' : 'down'
    : null
    
  const trendValue = formData.current_share_price
    ? `${((results.share_price / formData.current_share_price - 1) * 100).toFixed(1)}%`
    : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Unternehmenswert"
          value={results.enterprise_value}
          icon={DollarSign}
          color="green"
          format="number"
          subtitle={`${results.enterprise_value.toLocaleString()} Mio. €`}
        />
        <KPICard
          title="Eigenkapitalwert"
          value={results.equity_value}
          icon={DollarSign}
          color="blue"
          format="number"
          subtitle={`${results.equity_value.toLocaleString()} Mio. €`}
        />
        <KPICard
          title="Aktienkurs (Entity)"
          value={results.share_price}
          icon={TrendingUp}
          color="indigo"
          trend={trend}
          trendValue={trendValue}
          subtitle={formData.current_share_price ? `Markt: €${formData.current_share_price.toFixed(2)}` : null}
        />
        <KPICard
          title="Aktienkurs (Equity)"
          value={results.share_price_equity_approach || 0}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">WACC</h3>
          <p className="text-2xl font-bold text-indigo-700">{((results.wacc || 0) * 100).toFixed(2)}%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Cost of Equity</h3>
          <p className="text-2xl font-bold text-purple-700">{((results.cost_of_equity || 0) * 100).toFixed(2)}%</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">EBIT Marge</h3>
          <p className="text-2xl font-bold text-blue-700">{((results.ebit_margin || 0) * 100).toFixed(2)}%</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <h3 className="text-xs font-medium text-gray-600 mb-1">Terminal Value</h3>
          <p className="text-2xl font-bold text-green-700">€{(results.terminal_value || 0).toLocaleString()}M</p>
        </div>
      </div>

      <FairValueChart results={results} formData={formData} />
      
      <WaterfallChart results={results} formData={formData} />
      
      {results.multiplier_analysis && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 size={20} />
            Multiplier-Analyse (Peer Group Bewertung)
          </h3>
          
          {/* Fair Value Summary - Hauptergebnis zuerst */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 mb-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm opacity-90 mb-2">Fair Value (Median)</p>
                <p className="text-4xl font-bold">€{results.multiplier_analysis.share_prices.median.toFixed(2)}</p>
                <p className="text-xs opacity-75 mt-1">Basierend auf 5 Multiples</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90 mb-2">Fair Value (Mean)</p>
                <p className="text-4xl font-bold">€{results.multiplier_analysis.share_prices.mean.toFixed(2)}</p>
                <p className="text-xs opacity-75 mt-1">Durchschnitt aller Methoden</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90 mb-2">DCF Bewertung</p>
                <p className="text-4xl font-bold">€{results.share_price.toFixed(2)}</p>
                <p className="text-xs opacity-75 mt-1">Zum Vergleich</p>
              </div>
            </div>
          </div>

          {/* Peer Group Multiples - Kompakte Cards */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Peer Group Multiples (Median verwendet)</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'EV/Sales', key: 'ev_sales', value: results.multiplier_analysis.multiples_stats.ev_sales.median, color: 'blue' },
                { label: 'EV/EBIT', key: 'ev_ebit', value: results.multiplier_analysis.multiples_stats.ev_ebit.median, color: 'green' },
                { label: 'EV/EBITDA', key: 'ev_ebitda', value: results.multiplier_analysis.multiples_stats.ev_ebitda.median, color: 'purple' },
                { label: 'P/E', key: 'per', value: results.multiplier_analysis.multiples_stats.per.median, color: 'orange' },
                { label: 'P/B', key: 'pbr', value: results.multiplier_analysis.multiples_stats.pbr.median, color: 'pink' }
              ].map(({ label, key, value, color }) => {
                const targetValue = results.multiplier_analysis.target_multiples?.[key];
                const meanValue = results.multiplier_analysis.multiples_stats[key].mean;
                const isBetter = targetValue && targetValue < meanValue;
                
                return (
                  <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-lg p-3 text-center`}>
                    <p className="text-xs text-gray-600 mb-1">{label}</p>
                    <p className={`text-2xl font-bold text-${color}-700`}>{value.toFixed(2)}x</p>
                    {targetValue && (
                      <p className={`text-xs mt-1 font-semibold ${isBetter ? 'text-green-600' : 'text-red-600'}`}>
                        Target: {targetValue.toFixed(2)}x {isBetter ? '↓' : '↑'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fair Value Breakdown - Kompakt */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'EV/Sales', value: results.multiplier_analysis.share_prices.ev_sales, color: 'blue' },
              { label: 'EV/EBIT', value: results.multiplier_analysis.share_prices.ev_ebit, color: 'green' },
              { label: 'EV/EBITDA', value: results.multiplier_analysis.share_prices.ev_ebitda, color: 'purple' },
              { label: 'P/E', value: results.multiplier_analysis.share_prices.per, color: 'orange' },
              { label: 'P/B', value: results.multiplier_analysis.share_prices.pbr, color: 'pink' }
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-${color}-100 border border-${color}-300 rounded-lg p-3 text-center`}>
                <p className="text-xs text-gray-600 mb-1">{label}</p>
                <p className={`text-xl font-bold text-${color}-800`}>€{value.toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Details Accordion */}
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <span className="text-sm font-medium text-gray-700">📊 Detaillierte Statistiken & Berechnungen</span>
                <svg className="w-5 h-5 text-gray-500 transition group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </summary>
            
            <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Statistik Tabelle */}
              <div>
                <h5 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Peer Group Statistiken</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-1 px-2 text-gray-600">Statistik</th>
                        <th className="text-right py-1 px-2 text-blue-600">EV/Sales</th>
                        <th className="text-right py-1 px-2 text-green-600">EV/EBIT</th>
                        <th className="text-right py-1 px-2 text-purple-600">EV/EBITDA</th>
                        <th className="text-right py-1 px-2 text-orange-600">P/E</th>
                        <th className="text-right py-1 px-2 text-pink-600">P/B</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {results.multiplier_analysis.target_multiples && (
                        <tr className="border-b-2 border-gray-300 bg-amber-50">
                          <td className="py-1 px-2 font-bold">Target</td>
                          <td className="text-right py-1 px-2 font-bold">
                            <span className={results.multiplier_analysis.target_multiples.ev_sales < results.multiplier_analysis.multiples_stats.ev_sales.mean ? 'text-green-600' : 'text-red-600'}>
                              {results.multiplier_analysis.target_multiples.ev_sales.toFixed(2)}x {results.multiplier_analysis.target_multiples.ev_sales < results.multiplier_analysis.multiples_stats.ev_sales.mean ? '↓' : '↑'}
                            </span>
                          </td>
                          <td className="text-right py-1 px-2 font-bold">
                            <span className={results.multiplier_analysis.target_multiples.ev_ebit < results.multiplier_analysis.multiples_stats.ev_ebit.mean ? 'text-green-600' : 'text-red-600'}>
                              {results.multiplier_analysis.target_multiples.ev_ebit.toFixed(2)}x {results.multiplier_analysis.target_multiples.ev_ebit < results.multiplier_analysis.multiples_stats.ev_ebit.mean ? '↓' : '↑'}
                            </span>
                          </td>
                          <td className="text-right py-1 px-2 font-bold">
                            <span className={results.multiplier_analysis.target_multiples.ev_ebitda < results.multiplier_analysis.multiples_stats.ev_ebitda.mean ? 'text-green-600' : 'text-red-600'}>
                              {results.multiplier_analysis.target_multiples.ev_ebitda.toFixed(2)}x {results.multiplier_analysis.target_multiples.ev_ebitda < results.multiplier_analysis.multiples_stats.ev_ebitda.mean ? '↓' : '↑'}
                            </span>
                          </td>
                          <td className="text-right py-1 px-2 font-bold">
                            <span className={results.multiplier_analysis.target_multiples.per < results.multiplier_analysis.multiples_stats.per.mean ? 'text-green-600' : 'text-red-600'}>
                              {results.multiplier_analysis.target_multiples.per.toFixed(2)}x {results.multiplier_analysis.target_multiples.per < results.multiplier_analysis.multiples_stats.per.mean ? '↓' : '↑'}
                            </span>
                          </td>
                          <td className="text-right py-1 px-2 font-bold">
                            <span className={results.multiplier_analysis.target_multiples.pbr < results.multiplier_analysis.multiples_stats.pbr.mean ? 'text-green-600' : 'text-red-600'}>
                              {results.multiplier_analysis.target_multiples.pbr.toFixed(2)}x {results.multiplier_analysis.target_multiples.pbr < results.multiplier_analysis.multiples_stats.pbr.mean ? '↓' : '↑'}
                            </span>
                          </td>
                        </tr>
                      )}
                      <tr className="border-b border-gray-200">
                        <td className="py-1 px-2">Min</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.ev_sales.min.toFixed(2)}x</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.ev_ebit.min.toFixed(2)}x</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.ev_ebitda.min.toFixed(2)}x</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.per.min.toFixed(2)}x</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.pbr.min.toFixed(2)}x</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-1 px-2">Mean</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.ev_sales.mean.toFixed(2)}x</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.ev_ebit.mean.toFixed(2)}x</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.ev_ebitda.mean.toFixed(2)}x</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.per.mean.toFixed(2)}x</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.pbr.mean.toFixed(2)}x</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-1 px-2">Max</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.ev_sales.max.toFixed(2)}x</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.ev_ebit.max.toFixed(2)}x</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.ev_ebitda.max.toFixed(2)}x</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.per.max.toFixed(2)}x</td>
                        <td className="text-right py-1 px-2">{results.multiplier_analysis.multiples_stats.pbr.max.toFixed(2)}x</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Enterprise & Equity Values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h5 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Enterprise Value (Mio. €)</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span>EV/Sales:</span><span className="font-mono">€{results.multiplier_analysis.valuations.ev_sales.toLocaleString()}M</span></div>
                    <div className="flex justify-between"><span>EV/EBIT:</span><span className="font-mono">€{results.multiplier_analysis.valuations.ev_ebit.toLocaleString()}M</span></div>
                    <div className="flex justify-between"><span>EV/EBITDA:</span><span className="font-mono">€{results.multiplier_analysis.valuations.ev_ebitda.toLocaleString()}M</span></div>
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Equity Value (Mio. €)</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span>EV/Sales:</span><span className="font-mono">€{results.multiplier_analysis.valuations.ev_sales_equity.toLocaleString()}M</span></div>
                    <div className="flex justify-between"><span>EV/EBIT:</span><span className="font-mono">€{results.multiplier_analysis.valuations.ev_ebit_equity.toLocaleString()}M</span></div>
                    <div className="flex justify-between"><span>EV/EBITDA:</span><span className="font-mono">€{results.multiplier_analysis.valuations.ev_ebitda_equity.toLocaleString()}M</span></div>
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

// Analysis Tab Component
function AnalysisTab({ formData, results }) {
  if (!results) {
    return (
      <div className="text-center py-12">
        <Activity size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Keine Analysen verfügbar</h3>
        <p className="text-gray-600">Führen Sie zuerst eine DCF-Berechnung durch</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Zeige gespeicherte Sensitivitätsanalyse wenn vorhanden */}
      {results.sensitivity_analysis ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={24} />
            Sensitivitätsanalyse (Gespeichert)
          </h3>
          <SensitivityDisplay data={results.sensitivity_analysis} currentSharePrice={formData.current_share_price} />
        </div>
      ) : (
        <SensitivityAnalysis 
          formData={formData} 
          currentSharePrice={formData.current_share_price}
        />
      )}

      {/* Zeige gespeicherte Szenarioanalyse wenn vorhanden */}
      {results.scenario_analysis ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={24} />
            Szenario-Analyse (Gespeichert)
          </h3>
          <ScenarioDisplay data={results.scenario_analysis} />
        </div>
      ) : (
        <ScenarioComparison formData={formData} />
      )}
    </div>
  )
}

// Komponente zur Anzeige gespeicherter Sensitivitätsanalyse
function SensitivityDisplay({ data, currentSharePrice }) {
  const getCellColor = (sharePrice, basePrice) => {
    if (!currentSharePrice) {
      const diff = ((sharePrice / basePrice) - 1) * 100
      if (diff > 10) return 'bg-green-200 text-green-900'
      if (diff > 5) return 'bg-green-100 text-green-800'
      if (diff < -10) return 'bg-red-200 text-red-900'
      if (diff < -5) return 'bg-red-100 text-red-800'
      return 'bg-gray-100 text-gray-800'
    } else {
      const diff = ((sharePrice / currentSharePrice) - 1) * 100
      if (diff > 0) return 'bg-green-100 text-green-800'
      if (diff < 0) return 'bg-red-100 text-red-800'
      return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">Base Case Aktienkurs</p>
          <p className="text-2xl font-bold text-blue-700">€{data.base_share_price.toFixed(2)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded">
          <p className="text-sm text-gray-600">Base WACC</p>
          <p className="text-2xl font-bold text-purple-700">{(data.base_wacc * 100).toFixed(2)}%</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm text-gray-600">Base Terminal Growth</p>
          <p className="text-2xl font-bold text-green-700">{(data.base_terminal_growth * 100).toFixed(2)}%</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 p-2 text-sm font-semibold">WACC ↓ / Growth →</th>
              {data.growth_range.map((growth, idx) => (
                <th key={idx} className="border border-gray-300 bg-gray-100 p-2 text-xs">
                  {((data.base_terminal_growth + growth) * 100).toFixed(2)}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.sensitivity_matrix.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="border border-gray-300 bg-gray-100 p-2 text-xs font-semibold text-center">
                  {((data.base_wacc + data.wacc_range[rowIdx]) * 100).toFixed(2)}%
                </td>
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className={`border border-gray-300 p-2 text-center text-sm font-medium ${getCellColor(cell.share_price, data.base_share_price)}`}
                  >
                    €{cell.share_price.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Komponente zur Anzeige gespeicherter Szenarioanalyse
function ScenarioDisplay({ data }) {
  const chartData = [
    { name: 'Worst Case', aktienkurs: data.worst_case.share_price, fill: '#ef4444' },
    { name: 'Base Case', aktienkurs: data.base_case.share_price, fill: '#3b82f6' },
    { name: 'Best Case', aktienkurs: data.best_case.share_price, fill: '#10b981' }
  ]

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Worst Case</h4>
          <p className="text-2xl font-bold text-red-700">€{data.worst_case.share_price.toFixed(2)}</p>
          <div className="text-xs text-gray-600 mt-2">
            <p>Wachstum: {(data.worst_case.revenue_growth * 100).toFixed(2)}%</p>
            <p>WACC: {(data.worst_case.wacc * 100).toFixed(2)}%</p>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Base Case</h4>
          <p className="text-2xl font-bold text-blue-700">€{data.base_case.share_price.toFixed(2)}</p>
          <div className="text-xs text-gray-600 mt-2">
            <p>Wachstum: {(data.base_case.revenue_growth * 100).toFixed(2)}%</p>
            <p>WACC: {(data.base_case.wacc * 100).toFixed(2)}%</p>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Best Case</h4>
          <p className="text-2xl font-bold text-green-700">€{data.best_case.share_price.toFixed(2)}</p>
          <div className="text-xs text-gray-600 mt-2">
            <p>Wachstum: {(data.best_case.revenue_growth * 100).toFixed(2)}%</p>
            <p>WACC: {(data.best_case.wacc * 100).toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Bewertungsspanne</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p>• <strong>Minimum:</strong> €{data.worst_case.share_price.toFixed(2)}</p>
          <p>• <strong>Maximum:</strong> €{data.best_case.share_price.toFixed(2)}</p>
          <p>• <strong>Spanne:</strong> €{(data.best_case.share_price - data.worst_case.share_price).toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

export default AppImproved
