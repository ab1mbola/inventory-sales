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
    grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#64748b' }
    },
    tooltip: { theme: 'light' },
    theme: { mode: 'light' }
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
      labels: { colors: '#64748b' }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { color: '#64748b', fontWeight: 'bold' },
            value: { 
              color: '#0f172a',
              fontWeight: '900',
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
    tooltip: { theme: 'light' },
    theme: { mode: 'light' }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Deep dive into your business performance.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-all border border-slate-200 shadow-sm print:hidden active:scale-95 cursor-pointer"
        >
          <Download size={18} />
          Export PDF
        </button>
      </div>

      {/* Inventory Valuation Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-slate-900">
            <Package size={100} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inventory Count</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">{data?.inventoryStats.totalItems.toLocaleString()}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Total items currently in stock</p>
        </div>
        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-blue-600">
            <DollarSign size={100} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inventory Value</p>
          <h3 className="text-3xl font-black text-blue-600 mt-2">₦{data?.inventoryStats.totalValue.toLocaleString()}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Total potential revenue from stock</p>
        </div>
        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-emerald-600">
            <TrendingUp size={100} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Estimated Equity</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-2">₦{(data?.inventoryStats.totalValue! - data?.inventoryStats.totalCost!).toLocaleString()}</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Total projected profit from stock</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
                <BarChart size={22} />
              </div>
              <h3 className="text-lg font-black text-slate-900">Performance Trend</h3>
            </div>
          </div>
          <Chart options={monthlyOptions} series={monthlySeries} type="area" height={350} />
        </div>

        {/* Category Distribution */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 shadow-inner">
              <PieChart size={22} />
            </div>
            <h3 className="text-lg font-black text-slate-900">Sales by Category</h3>
          </div>
          <div className="h-[350px] flex items-center justify-center">
            <Chart options={categoryOptions} series={data?.categoryDistribution.map(c => c.value) || []} type="donut" width="100%" />
          </div>
        </div>
      </div>

      {/* Payment Method Analysis */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 flex items-center gap-3 bg-slate-50/30">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 shadow-inner">
            <CreditCard size={22} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Payment Method Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-8 py-5">Method</th>
                <th className="px-8 py-5 text-center">Transactions</th>
                <th className="px-8 py-5 text-right">Total Amount</th>
                <th className="px-8 py-5 text-right">Avg. Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.paymentDistribution.map((pm) => (
                <tr key={pm.method} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full shadow-sm ${
                        pm.method === 'CASH' ? 'bg-emerald-500' : 
                        pm.method === 'CREDIT' ? 'bg-amber-500' : 
                        'bg-blue-600'
                      }`} />
                      <span className="font-black text-slate-700 text-sm">{pm.method}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center text-slate-500 font-black font-mono">{pm.count}</td>
                  <td className="px-8 py-5 text-right font-black text-slate-900">₦{pm.amount.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right text-slate-400 font-bold">₦{(pm.amount / pm.count).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
