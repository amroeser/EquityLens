import { useState } from 'react'
import { Download, FileText, Table } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

function ExportButtons({ formData, results, notes }) {
  const [exporting, setExporting] = useState(false)

  const exportToPDF = async () => {
    setExporting(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20

      // Deckblatt
      pdf.setFontSize(24)
      pdf.text('DCF Bewertungsanalyse', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15
      
      pdf.setFontSize(16)
      pdf.text(formData.company_name || 'Unternehmen', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10
      
      pdf.setFontSize(10)
      pdf.text(new Date().toLocaleDateString('de-DE'), pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20

      // Executive Summary
      pdf.setFontSize(14)
      pdf.text('Executive Summary', 15, yPosition)
      yPosition += 10
      
      pdf.setFontSize(10)
      pdf.text(`Aktienkurs (Entity Approach): €${results.share_price.toFixed(2)}`, 15, yPosition)
      yPosition += 6
      pdf.text(`Aktienkurs (Equity Approach): €${results.share_price_equity_approach?.toFixed(2) || '0.00'}`, 15, yPosition)
      yPosition += 6
      pdf.text(`Enterprise Value: €${results.enterprise_value.toLocaleString()} Mio.`, 15, yPosition)
      yPosition += 6
      pdf.text(`Equity Value: €${results.equity_value.toLocaleString()} Mio.`, 15, yPosition)
      yPosition += 6
      pdf.text(`WACC: ${(results.wacc * 100).toFixed(2)}%`, 15, yPosition)
      yPosition += 6
      pdf.text(`Cost of Equity: ${(results.cost_of_equity * 100).toFixed(2)}%`, 15, yPosition)
      yPosition += 6
      if (formData.current_share_price) {
        pdf.text(`Aktueller Marktpreis: €${formData.current_share_price.toFixed(2)}`, 15, yPosition)
        yPosition += 6
        const premium = ((results.share_price / formData.current_share_price - 1) * 100).toFixed(1)
        pdf.text(`Bewertungsabweichung: ${premium}%`, 15, yPosition)
      }
      yPosition += 15

      // Multiplier-Analyse
      if (results.multiplier_analysis) {
        if (yPosition > pageHeight - 80) {
          pdf.addPage()
          yPosition = 20
        }
        
        pdf.setFontSize(14)
        pdf.text('Multiplier-Analyse (Peer Group)', 15, yPosition)
        yPosition += 10
        
        pdf.setFontSize(10)
        const ma = results.multiplier_analysis
        pdf.text('Fair Value Schätzungen:', 15, yPosition)
        yPosition += 6
        pdf.text(`  EV/Sales: €${ma.share_prices.ev_sales.toFixed(2)}`, 15, yPosition)
        yPosition += 5
        pdf.text(`  EV/EBIT: €${ma.share_prices.ev_ebit.toFixed(2)}`, 15, yPosition)
        yPosition += 5
        pdf.text(`  EV/EBITDA: €${ma.share_prices.ev_ebitda.toFixed(2)}`, 15, yPosition)
        yPosition += 5
        pdf.text(`  P/E: €${ma.share_prices.per.toFixed(2)}`, 15, yPosition)
        yPosition += 5
        pdf.text(`  P/B: €${ma.share_prices.pbr.toFixed(2)}`, 15, yPosition)
        yPosition += 7
        pdf.text(`Median: €${ma.share_prices.median.toFixed(2)}`, 15, yPosition)
        yPosition += 5
        pdf.text(`Mean: €${ma.share_prices.mean.toFixed(2)}`, 15, yPosition)
        yPosition += 15
      }

      // Sensitivitätsanalyse
      if (results.sensitivity_analysis) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage()
          yPosition = 20
        }
        
        pdf.setFontSize(14)
        pdf.text('Sensitivitätsanalyse', 15, yPosition)
        yPosition += 10
        
        pdf.setFontSize(10)
        const sa = results.sensitivity_analysis
        pdf.text(`Base Case: €${sa.base_share_price.toFixed(2)}`, 15, yPosition)
        yPosition += 6
        pdf.text(`WACC Range: ${((sa.base_wacc - 0.02) * 100).toFixed(2)}% - ${((sa.base_wacc + 0.02) * 100).toFixed(2)}%`, 15, yPosition)
        yPosition += 6
        pdf.text(`Growth Range: ${((sa.base_terminal_growth - 0.01) * 100).toFixed(2)}% - ${((sa.base_terminal_growth + 0.01) * 100).toFixed(2)}%`, 15, yPosition)
        yPosition += 15
      }

      // Szenario-Analyse
      if (results.scenario_analysis) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage()
          yPosition = 20
        }
        
        pdf.setFontSize(14)
        pdf.text('Szenario-Analyse', 15, yPosition)
        yPosition += 10
        
        pdf.setFontSize(10)
        const scenarios = results.scenario_analysis
        pdf.text(`Best Case: €${scenarios.best_case.share_price.toFixed(2)}`, 15, yPosition)
        yPosition += 6
        pdf.text(`Base Case: €${scenarios.base_case.share_price.toFixed(2)}`, 15, yPosition)
        yPosition += 6
        pdf.text(`Worst Case: €${scenarios.worst_case.share_price.toFixed(2)}`, 15, yPosition)
        yPosition += 15
      }

      // Annahmen
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = 20
      }
      
      pdf.setFontSize(14)
      pdf.text('Bewertungsannahmen', 15, yPosition)
      yPosition += 10
      
      pdf.setFontSize(10)
      pdf.text(`Umsatzwachstum: ${(formData.revenue_growth_rate * 100).toFixed(2)}%`, 15, yPosition)
      yPosition += 6
      pdf.text(`Terminal Growth: ${(formData.terminal_growth * 100).toFixed(2)}%`, 15, yPosition)
      yPosition += 6
      pdf.text(`Risikofreier Zinssatz: ${(formData.risk_free_rate * 100).toFixed(2)}%`, 15, yPosition)
      yPosition += 6
      pdf.text(`Beta: ${formData.beta}`, 15, yPosition)
      yPosition += 6
      pdf.text(`Marktrendite: ${(formData.market_return * 100).toFixed(2)}%`, 15, yPosition)
      yPosition += 6
      pdf.text(`Steuersatz: ${(formData.tax_rate * 100).toFixed(2)}%`, 15, yPosition)
      yPosition += 15

      // Notizen
      if (notes.general_notes) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage()
          yPosition = 20
        }
        
        pdf.setFontSize(14)
        pdf.text('Notizen', 15, yPosition)
        yPosition += 10
        
        pdf.setFontSize(9)
        const notesLines = pdf.splitTextToSize(notes.general_notes, pageWidth - 30)
        notesLines.forEach(line => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage()
            yPosition = 20
          }
          pdf.text(line, 15, yPosition)
          yPosition += 5
        })
      }

      // Fußzeile auf allen Seiten
      const pageCount = pdf.internal.getNumberOfPages()
      pdf.setFontSize(8)
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.text(`Seite ${i} von ${pageCount}`, pageWidth - 30, pageHeight - 10)
        pdf.text(`Erstellt: ${new Date().toLocaleDateString('de-DE')}`, 15, pageHeight - 10)
      }

      // Speichern
      pdf.save(`DCF_${formData.company_name}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('PDF Export Error:', error)
      alert('Fehler beim PDF-Export')
    } finally {
      setExporting(false)
    }
  }

  const exportToExcel = () => {
    setExporting(true)
    try {
      const wb = XLSX.utils.book_new()

      // Summary Sheet
      const summaryData = [
        ['DCF Bewertungsanalyse'],
        ['Unternehmen:', formData.company_name],
        ['Datum:', new Date().toLocaleDateString('de-DE')],
        [],
        ['Ergebnisse'],
        ['Aktienkurs (Entity):', results.share_price],
        ['Aktienkurs (Equity):', results.share_price_equity_approach || 0],
        ['Enterprise Value (Mio.):', results.enterprise_value],
        ['Equity Value (Mio.):', results.equity_value],
        ['Terminal Value (Mio.):', results.terminal_value],
        ['WACC:', results.wacc],
        ['Cost of Equity:', results.cost_of_equity],
        ['EBIT Marge:', results.ebit_margin]
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

      // Inputs Sheet
      const inputsData = [
        ['Parameter', 'Wert'],
        ['Umsatzwachstum', formData.revenue_growth_rate],
        ['Terminal Growth', formData.terminal_growth],
        ['Risikofreier Zinssatz', formData.risk_free_rate],
        ['Beta', formData.beta],
        ['Marktrendite', formData.market_return],
        ['FK-Kosten', formData.cost_of_debt],
        ['Fremdkapital', formData.debt_capital],
        ['Steuersatz', formData.tax_rate],
        ['Aktien (Mio.)', formData.shares_outstanding],
        ['Net Debt', formData.net_debt]
      ]
      const inputsSheet = XLSX.utils.aoa_to_sheet(inputsData)
      XLSX.utils.book_append_sheet(wb, inputsSheet, 'Inputs')

      // Forecast Sheet
      const forecastData = [
        ['Jahr', 'Umsatz', 'FCF', 'FCFE', 'NOPLAT', 'Tax Shield']
      ]
      for (let i = 0; i < results.forecast_revenues.length; i++) {
        forecastData.push([
          `Jahr ${i + 1}`,
          results.forecast_revenues[i],
          results.free_cash_flows[i],
          results.fcfe?.[i] || 0,
          results.noplat?.[i] || 0,
          results.tax_shield?.[i] || 0
        ])
      }
      const forecastSheet = XLSX.utils.aoa_to_sheet(forecastData)
      XLSX.utils.book_append_sheet(wb, forecastSheet, 'Forecast')

      // Multiplier-Analyse Sheet
      if (results.multiplier_analysis) {
        const ma = results.multiplier_analysis
        const multiplierData = [
          ['Multiplier-Analyse (Peer Group)'],
          [],
          ['Fair Value Schätzungen'],
          ['Methode', 'Aktienkurs'],
          ['EV/Sales', ma.share_prices.ev_sales],
          ['EV/EBIT', ma.share_prices.ev_ebit],
          ['EV/EBITDA', ma.share_prices.ev_ebitda],
          ['P/E', ma.share_prices.per],
          ['P/B', ma.share_prices.pbr],
          [],
          ['Statistiken'],
          ['Median', ma.share_prices.median],
          ['Mean', ma.share_prices.mean],
          [],
          ['Peer Group Multiples (Median)'],
          ['Multiple', 'Wert'],
          ['EV/Sales', ma.multiples_stats.ev_sales.median],
          ['EV/EBIT', ma.multiples_stats.ev_ebit.median],
          ['EV/EBITDA', ma.multiples_stats.ev_ebitda.median],
          ['P/E', ma.multiples_stats.per.median],
          ['P/B', ma.multiples_stats.pbr.median],
          [],
          ['Enterprise Value Bewertungen (Mio. €)'],
          ['EV/Sales', ma.valuations.ev_sales],
          ['EV/EBIT', ma.valuations.ev_ebit],
          ['EV/EBITDA', ma.valuations.ev_ebitda]
        ]
        const multiplierSheet = XLSX.utils.aoa_to_sheet(multiplierData)
        XLSX.utils.book_append_sheet(wb, multiplierSheet, 'Multiplier')
      }

      // Sensitivitätsanalyse Sheet
      if (results.sensitivity_analysis) {
        const sa = results.sensitivity_analysis
        const sensitivityData = [
          ['Sensitivitätsanalyse'],
          [],
          ['Base Case', sa.base_share_price],
          ['Base WACC', sa.base_wacc],
          ['Base Terminal Growth', sa.base_terminal_growth],
          [],
          ['WACC Range', `${((sa.base_wacc - 0.02) * 100).toFixed(2)}% - ${((sa.base_wacc + 0.02) * 100).toFixed(2)}%`],
          ['Growth Range', `${((sa.base_terminal_growth - 0.01) * 100).toFixed(2)}% - ${((sa.base_terminal_growth + 0.01) * 100).toFixed(2)}%`],
          [],
          ['Sensitivitätsmatrix (9x9)']
        ]
        
        // Header-Zeile mit Growth-Werten
        const headerRow = ['WACC \\ Growth']
        sa.growth_range.forEach(g => {
          headerRow.push(((sa.base_terminal_growth + g) * 100).toFixed(2) + '%')
        })
        sensitivityData.push(headerRow)
        
        // Datenzeilen
        sa.sensitivity_matrix.forEach((row, idx) => {
          const dataRow = [((sa.base_wacc + sa.wacc_range[idx]) * 100).toFixed(2) + '%']
          row.forEach(cell => {
            dataRow.push(cell.share_price)
          })
          sensitivityData.push(dataRow)
        })
        
        const sensitivitySheet = XLSX.utils.aoa_to_sheet(sensitivityData)
        XLSX.utils.book_append_sheet(wb, sensitivitySheet, 'Sensitivity')
      }

      // Szenario-Analyse Sheet
      if (results.scenario_analysis) {
        const scenarios = results.scenario_analysis
        const scenarioData = [
          ['Szenario-Analyse'],
          [],
          ['Szenario', 'Aktienkurs', 'Enterprise Value', 'WACC', 'Wachstum'],
          ['Best Case', scenarios.best_case.share_price, scenarios.best_case.enterprise_value, scenarios.best_case.wacc, scenarios.best_case.revenue_growth_rate],
          ['Base Case', scenarios.base_case.share_price, scenarios.base_case.enterprise_value, scenarios.base_case.wacc, scenarios.base_case.revenue_growth_rate],
          ['Worst Case', scenarios.worst_case.share_price, scenarios.worst_case.enterprise_value, scenarios.worst_case.wacc, scenarios.worst_case.revenue_growth_rate],
          [],
          ['Bewertungsspanne'],
          ['Minimum', scenarios.worst_case.share_price],
          ['Maximum', scenarios.best_case.share_price],
          ['Spanne', scenarios.best_case.share_price - scenarios.worst_case.share_price]
        ]
        const scenarioSheet = XLSX.utils.aoa_to_sheet(scenarioData)
        XLSX.utils.book_append_sheet(wb, scenarioSheet, 'Scenarios')
      }

      // Speichern
      XLSX.writeFile(wb, `DCF_${formData.company_name}_${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Excel Export Error:', error)
      alert('Fehler beim Excel-Export')
    } finally {
      setExporting(false)
    }
  }

  const exportToCSV = () => {
    setExporting(true)
    try {
      const csvData = [
        ['Jahr', 'Umsatz', 'FCF', 'FCFE', 'NOPLAT', 'Tax Shield']
      ]
      
      for (let i = 0; i < results.forecast_revenues.length; i++) {
        csvData.push([
          `Jahr ${i + 1}`,
          results.forecast_revenues[i],
          results.free_cash_flows[i],
          results.fcfe?.[i] || 0,
          results.noplat?.[i] || 0,
          results.tax_shield?.[i] || 0
        ])
      }

      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `DCF_${formData.company_name}_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } catch (error) {
      console.error('CSV Export Error:', error)
      alert('Fehler beim CSV-Export')
    } finally {
      setExporting(false)
    }
  }

  if (!results) return null

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Download size={24} />
        Export-Optionen
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={exportToPDF}
          disabled={exporting}
          className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
        >
          <FileText size={20} />
          PDF-Report
        </button>

        <button
          onClick={exportToExcel}
          disabled={exporting}
          className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
        >
          <Table size={20} />
          Excel-Export
        </button>

        <button
          onClick={exportToCSV}
          disabled={exporting}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          <Download size={20} />
          CSV-Download
        </button>
      </div>

      <p className="text-sm text-gray-600 mt-4">
        Exportieren Sie Ihre Analyse als PDF-Report, Excel-Datei oder CSV für weitere Analysen.
      </p>
    </div>
  )
}

export default ExportButtons
