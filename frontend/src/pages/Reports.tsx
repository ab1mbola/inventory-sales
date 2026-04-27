import { useReports } from '../hooks/useReports';
import Chart from 'react-apexcharts';
import { 
  BarChart, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Package, 
  CreditCard,
  Download
} from 'lucide-react';
import type { ApexOptions } from 'apexcharts';

export default function Reports() {
  const { data, isLoading } = useReports();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Monthly Performance Chart Options
  const monthlyOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
      stacked: false,
    },
    colors: ['#3b82f6', '#10b981'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100]
      }
    },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: data?.monthlyPerformance.map(m => m.month) || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: {
      labels: { 
        style: { colors: '#64748b' },
        formatter: (val) => `₦${(val / 1000).toFixed(0)}k`
      }
    },
    grid: { borderColor: '#1e293b', strokeDashArray: 4 },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#f1f5f9' }
    },
    tooltip: { theme: 'dark' }
  };

  const monthlySeries = [
    {
      name: 'Revenue',
      data: data?.monthlyPerformance.map(m => m.revenue) || []
    },
    {
      name: 'Profit',
      data: data?.monthlyPerformance.map(m => m.profit) || []
    }
  ];

  // Category Distribution Chart
  const categoryOptions: ApexOptions = {
    chart: { type: 'donut' },
    labels: data?.categoryDistribution.map(c => c.name) || [],
    colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    stroke: { show: false },
    legend: {
      position: 'bottom',
      labels: { colors: '#f1f5f9' }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { color: '#64748b' },
            value: { 
              color: '#f1f5f9',
              formatter: (val) => `₦${Number(val).toLocaleString()}`
            },
            total: {
              show: true,
              label: 'Total Sales',
              color: '#64748b',
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return `₦${total.toLocaleString()}`;
              }
            }
          }
        }
      }
    },
    tooltip: { theme: 'dark' }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-100">Analytics & Reports</h1>
          <p className="text-sm text-gray-400 mt-1">Deep dive into your business performance.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-xl text-sm font-medium transition-all border border-gray-700 print:hidden"
        >
          <Download size={18} />
          Export PDF
        </button>
      </div>

      {/* Inventory Valuation Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package size={80} />
          </div>
          <p className="text-sm text-gray-400 font-medium">Inventory Count</p>
          <h3 className="text-2xl font-bold text-gray-100 mt-2">{data?.inventoryStats.totalItems.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">Total items currently in stock</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={80} />
          </div>
          <p className="text-sm text-gray-400 font-medium">Inventory Value (Retail)</p>
          <h3 className="text-2xl font-bold text-blue-400 mt-2">₦{data?.inventoryStats.totalValue.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">Total potential revenue from stock</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={80} />
          </div>
          <p className="text-sm text-gray-400 font-medium">Estimated Equity</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-2">₦{(data?.inventoryStats.totalValue! - data?.inventoryStats.totalCost!).toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">Total projected profit from stock</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <BarChart size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-100">Performance Trend</h3>
            </div>
          </div>
          <Chart options={monthlyOptions} series={monthlySeries} type="area" height={350} />
        </div>

        {/* Category Distribution */}
        <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <PieChart size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-100">Sales by Category</h3>
          </div>
          <div className="h-[350px] flex items-center justify-center">
            <Chart options={categoryOptions} series={data?.categoryDistribution.map(c => c.value) || []} type="donut" width="100%" />
          </div>
        </div>
      </div>

      {/* Payment Method Analysis */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
            <CreditCard size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-100">Payment Method Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-800/30 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4 text-center">Transactions</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-right">Avg. Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data?.paymentDistribution.map((pm) => (
                <tr key={pm.method} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        pm.method === 'CASH' ? 'bg-emerald-500' : 
                        pm.method === 'CREDIT' ? 'bg-amber-500' : 
                        'bg-blue-500'
                      }`} />
                      <span className="font-medium text-gray-200">{pm.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400 font-mono">{pm.count}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-100">₦{pm.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-400">₦{(pm.amount / pm.count).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
