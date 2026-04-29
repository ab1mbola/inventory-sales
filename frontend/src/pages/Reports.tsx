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

import FullPageLoader from '../components/FullPageLoader';

export default function Reports() {
  const { data, isLoading } = useReports();

  if (isLoading) {
    return <FullPageLoader message="Analyzing Records..." />;
  }


  // Monthly Performance Chart Options
  const monthlyOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
      stacked: false,
    },
    colors: ['#000000', '#E91E63'],
    fill: {
      type: 'solid',
      opacity: 0.05
    },
    stroke: { curve: 'straight', width: 2 },
    xaxis: {
      categories: data?.monthlyPerformance.map(m => m.month) || [],
      axisBorder: { color: '#000000', height: 1 },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 'bold' } }
    },
    yaxis: {
      labels: { 
        style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 'bold' },
        formatter: (val) => `₦${(val / 1000).toFixed(0)}k`
      }
    },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 0 },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'Inter',
      fontWeight: 'bold',
      labels: { colors: '#000000' }
    },
    tooltip: { theme: 'light', style: { fontSize: '12px', fontFamily: 'Inter' } }
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
    labels: data?.categoryDistribution.map(c => c.name.toUpperCase()) || [],
    colors: ['#000000', '#E91E63', '#334155', '#94a3b8', '#f1f5f9'],
    stroke: { show: true, width: 2, colors: ['#ffffff'] },
    legend: {
      position: 'bottom',
      fontFamily: 'Inter',
      fontWeight: 'bold',
      labels: { colors: '#94a3b8' }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          labels: {
            show: true,
            name: { color: '#94a3b8', fontWeight: 'bold', fontSize: '10px' },
            value: { 
              color: '#000000',
              fontWeight: 'bold',
              fontFamily: 'Fraunces',
              fontSize: '20px',
              formatter: (val) => `₦${Number(val).toLocaleString()}`
            },
            total: {
              show: true,
              label: 'TOTAL',
              color: '#94a3b8',
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return `₦${total.toLocaleString()}`;
              }
            }
          }
        }
      }
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8 bg-white font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-black pb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold tracking-tighter uppercase leading-none italic">Reports</h1>
          <p className="text-[10px] text-muted mt-3 uppercase tracking-[0.4em] font-bold italic">Business performance overview</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="craft-btn h-12 px-8 flex items-center gap-3 text-[10px] print:hidden"
        >
          <Download size={18} />
          EXECUTE EXPORT
        </button>
      </div>

      {/* Inventory Valuation Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="craft-card p-6 bg-surface/30 group">
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Total Items</p>
          <h3 className="text-2xl font-serif font-bold italic text-primary mt-4 tracking-tight leading-none">
            {data?.inventoryStats.totalItems.toLocaleString()}
          </h3>
          <div className="mt-6 pt-6 border-t border-border flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <p className="text-[9px] text-muted font-bold uppercase tracking-widest">Items in stock</p>
          </div>
        </div>
        
        <div className="craft-card p-6 bg-surface/30 group border-l-4 border-l-primary">
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Total Value</p>
          <h3 className="text-2xl font-serif font-bold italic text-primary mt-4 tracking-tight leading-none">
            ₦{data?.inventoryStats.totalValue.toLocaleString()}
          </h3>
          <div className="mt-6 pt-6 border-t border-border flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <p className="text-[9px] text-muted font-bold uppercase tracking-widest">Potential revenue</p>
          </div>
        </div>

        <div className="craft-card p-6 bg-primary group">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Total Profit</p>
          <h3 className="text-2xl font-serif font-bold italic text-white mt-4 tracking-tight leading-none">
            ₦{(data?.inventoryStats.totalValue! - data?.inventoryStats.totalCost!).toLocaleString()}
          </h3>
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-3">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Estimated profit</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 craft-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-4">
              <TrendingUp size={16} />
              Monthly Trend
            </h3>
            <div className="h-px bg-border flex-1 mx-8" />
          </div>
          <Chart options={monthlyOptions} series={monthlySeries} type="area" height={320} />
        </div>

        {/* Category Distribution */}
        <div className="craft-card p-6 bg-surface/10">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Categories</h3>
          </div>
          <div className="h-[320px] flex items-center justify-center">
            <Chart options={categoryOptions} series={data?.categoryDistribution.map(c => c.value) || []} type="donut" width="100%" />
          </div>
        </div>
      </div>

      {/* Payment Method Analysis */}
      <div className="craft-card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface/50">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-4">
            <CreditCard size={18} strokeWidth={1} />
            Payment Methods
          </h3>
          <div className="h-px bg-border flex-1 mx-8" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white border-b border-border text-left">
                <th className="px-10 py-6 text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Method</th>
                <th className="px-10 py-6 text-[10px] font-bold text-muted uppercase tracking-[0.3em] text-center">Sales</th>
                <th className="px-10 py-8 text-[10px] font-bold text-muted uppercase tracking-[0.3em] text-right">Total Amount</th>
                <th className="px-10 py-8 text-[10px] font-bold text-muted uppercase tracking-[0.3em] text-right">Average Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.paymentDistribution.map((pm) => (
                <tr key={pm.method} className="hover:bg-surface/30 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-6">
                      <div className={`w-1.5 h-6 ${
                        pm.method === 'CASH' ? 'bg-primary' : 
                        pm.method === 'CREDIT' ? 'bg-accent' : 
                        'bg-slate-400'
                      }`} />
                      <span className="font-bold text-primary text-xs uppercase tracking-widest">{pm.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-[10px] font-bold text-muted uppercase tracking-widest">{pm.count} UNITS</td>
                  <td className="px-6 py-4 text-right font-serif font-bold italic text-primary text-base">₦{pm.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-[10px] font-bold text-muted uppercase tracking-widest opacity-40">
                    ₦{(pm.amount / pm.count).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
