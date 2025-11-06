"use client"

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import type { PriceHistory } from '@/types/property'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type PriceChartProps = {
  priceHistory: PriceHistory[]
}

export function PriceChart({ priceHistory }: PriceChartProps) {
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        가격 이력이 없습니다. 가격 이력을 추가해주세요.
      </div>
    )
  }

  // 거래 유형별로 데이터 분리
  const saleData = priceHistory.filter(h => h.transaction_type === 'sale')
  const jeonseData = priceHistory.filter(h => h.transaction_type === 'jeonse')
  const monthlyData = priceHistory.filter(h => h.transaction_type === 'monthly')

  // 모든 날짜 수집 및 정렬
  const allDates = [...new Set(priceHistory.map(h => h.date))].sort()

  const data = {
    labels: allDates.map(date => new Date(date).toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    })),
    datasets: [
      ...(saleData.length > 0 ? [{
        label: '매매',
        data: allDates.map(date => {
          const item = saleData.find(h => h.date === date)
          return item ? item.price / 100000000 : null
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
        spanGaps: true,
      }] : []),
      ...(jeonseData.length > 0 ? [{
        label: '전세',
        data: allDates.map(date => {
          const item = jeonseData.find(h => h.date === date)
          return item ? item.price / 100000000 : null
        }),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.3,
        spanGaps: true,
      }] : []),
      ...(monthlyData.length > 0 ? [{
        label: '월세',
        data: allDates.map(date => {
          const item = monthlyData.find(h => h.date === date)
          return item ? item.price / 100000000 : null
        }),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.5)',
        tension: 0.3,
        spanGaps: true,
      }] : []),
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1) + '억원'
            }
            return label
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return value + '억'
          }
        },
        title: {
          display: true,
          text: '가격 (억원)'
        }
      },
      x: {
        title: {
          display: true,
          text: '날짜'
        }
      }
    },
  }

  return (
    <div className="h-[400px] w-full">
      <Line data={data} options={options} />
    </div>
  )
}
