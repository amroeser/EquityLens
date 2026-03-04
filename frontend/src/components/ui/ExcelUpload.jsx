import { useState, useRef } from 'react'
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

function ExcelUpload({ onDataLoaded }) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/excel-template')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'DCF_Vorlage.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Excel-Vorlage heruntergeladen')
    } catch (error) {
      console.error('Error downloading template:', error)
      toast.error('Fehler beim Download der Vorlage')
    }
  }

  const processFile = async (file) => {
    if (!file) return

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Bitte nur Excel-Dateien (.xlsx, .xls) hochladen')
      return
    }

    setUploading(true)
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Upload fehlgeschlagen')
      }

      const responseData = await response.json()
      
      // Extrahiere Daten und Metadaten
      const data = responseData.data || responseData
      const warnings = responseData.warnings
      const info = responseData.info
      
      onDataLoaded(data)
      
      // Zeige Erfolg mit Info
      if (info) {
        toast.success(info, { duration: 3000 })
      } else {
        toast.success(`✓ Daten aus ${file.name} geladen!`, { duration: 3000 })
      }
      
      // Zeige Warnungen falls vorhanden
      if (warnings && warnings.length > 0) {
        setTimeout(() => {
          warnings.forEach(warning => {
            toast(warning, { 
              icon: '⚠️',
              duration: 5000,
              style: {
                background: '#fef3c7',
                color: '#92400e'
              }
            })
          })
        }, 500)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error(`Fehler: ${error.message}`)
      setFileName(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    await processFile(file)
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-600 rounded-lg">
          <FileSpreadsheet className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Excel-Import</h3>
          <p className="text-sm text-gray-600">Daten schnell per Excel-Vorlage importieren</p>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? 'border-green-500 bg-green-50 scale-105'
            : 'border-gray-300 bg-white hover:border-green-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
          id="excel-upload"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Upload size={32} className={isDragging ? 'text-green-600' : 'text-gray-600'} />
          </div>
          
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600" />
              <span className="text-gray-700 font-medium">Lade hoch...</span>
            </div>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-800">
                {isDragging ? 'Datei hier ablegen' : 'Excel-Datei hierher ziehen'}
              </p>
              <p className="text-sm text-gray-600">oder</p>
              <label
                htmlFor="excel-upload"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium cursor-pointer"
              >
                Datei auswählen
              </label>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Download Template */}
        <button
          onClick={downloadTemplate}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition font-medium shadow-sm"
        >
          <Download size={20} />
          Vorlage herunterladen
        </button>

        {/* Info */}
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-lg text-sm">
          <FileSpreadsheet size={18} />
          <span>Unterstützt: .xlsx, .xls</span>
        </div>
      </div>

      {fileName && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} className="text-green-600" />
          <span className="text-sm text-green-800 font-medium">{fileName}</span>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
        <strong>💡 Tipp:</strong> Laden Sie zuerst die Vorlage herunter, füllen Sie diese aus und laden Sie sie dann hoch.
      </div>
    </div>
  )
}

export default ExcelUpload
