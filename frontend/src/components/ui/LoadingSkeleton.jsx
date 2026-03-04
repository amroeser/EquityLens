import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function KPICardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <Skeleton circle width={48} height={48} />
        <Skeleton width={60} height={20} />
      </div>
      <Skeleton width={120} height={16} className="mb-2" />
      <Skeleton width={150} height={32} className="mb-1" />
      <Skeleton width={100} height={12} />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <Skeleton width={200} height={24} className="mb-4" />
      <Skeleton height={300} />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <Skeleton width={200} height={24} className="mb-4" />
      <table className="w-full">
        <thead>
          <tr>
            {Array(cols).fill(0).map((_, i) => (
              <th key={i} className="p-2">
                <Skeleton height={20} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array(rows).fill(0).map((_, i) => (
            <tr key={i}>
              {Array(cols).fill(0).map((_, j) => (
                <td key={j} className="p-2">
                  <Skeleton height={16} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Skeleton
