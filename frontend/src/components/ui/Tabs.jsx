import { motion } from 'framer-motion'

function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative px-6 py-3 text-sm font-medium whitespace-nowrap
              transition-colors duration-200
              ${activeTab === tab.id
                ? 'text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <tab.icon size={18} />}
              {tab.label}
              {tab.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                  {tab.badge}
                </span>
              )}
            </span>
            
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default Tabs
