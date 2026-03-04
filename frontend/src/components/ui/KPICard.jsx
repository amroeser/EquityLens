import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  subtitle,
  color = 'indigo',
  format = 'currency'
}) {
  const colorClasses = {
    indigo: 'text-indigo-600 bg-indigo-50',
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50'
  }

  const formatValue = (val) => {
    if (format === 'currency') return `€${val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    if (format === 'percent') return `${(val * 100).toFixed(2)}%`
    if (format === 'number') return val.toLocaleString('de-DE')
    return val
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {Icon && <Icon size={24} />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {trendValue}
          </div>
        )}
      </div>
      
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      
      <p className="text-3xl font-bold text-gray-900 mb-1">
        {formatValue(value)}
      </p>
      
      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </motion.div>
  )
}

export default KPICard
