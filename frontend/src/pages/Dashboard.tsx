import { useDashboard } from '../hooks/useDashboard';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  CreditCard, 
  DollarSign,
  Plus,
  ArrowRight,
  ShoppingCart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ApexOptions } from 'apexcharts';

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      sparkline: { enabled: false },
      background: 'transparent',
    },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100]
      }
    },
    colors: ['#3b82f6'],
    grid: { show: false },
    xaxis: {
      categories: data?.salesTrend.map(t => new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' })) || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b' } }
    },
    yaxis: { show: false },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => `₦${val.toLocaleString()}` }
    }
  };

  const chartSeries = [{
    name: 'Revenue',
    data: data?.salesTrend.map(t => t.amount) || []
  }];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link 
            to="/pos"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus size={18} />
            New Sale
          </Link>
          <Link 
            to="/products"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-all active:scale-95 border border-slate-200 shadow-sm"
          >
            <Package size={18} />
            Add Product
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Today's Sales" 
          value={`₦${data?.todayRevenue.toLocaleString()}`} 
          icon={TrendingUp}
          color="blue"
        />
        <KpiCard 
          title="Today's Profit" 
          value={`₦${data?.todayProfit.toLocaleString()}`} 
          icon={DollarSign}
          color="emerald"
        />
        <KpiCard 
          title="Low Stock" 
          value={data?.lowStockCount.toString() || '0'} 
          icon={AlertTriangle}
          color="amber"
          alert={Number(data?.lowStockCount) > 0}
        />
        <KpiCard 
          title="Total Credit" 
          value={`₦${data?.totalOutstandingCredit.toLocaleString()}`} 
          icon={CreditCard}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Revenue Trend (7 Days)</h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">Weekly Performance</span>
          </div>
          <div className="h-[300px]">
            <Chart 
              options={chartOptions} 
              series={chartSeries} 
              type="area" 
              height="100%" 
            />
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Top Products</h2>
          <div className="space-y-6">
            {data?.topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 font-bold border border-slate-100">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-slate-900">{product.name}</h4>
                  <p className="text-xs text-slate-500">{product.quantity} units sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">₦{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Sales</h2>
            <Link to="/sales" className="text-xs text-blue-600 hover:text-blue-500 flex items-center gap-1 font-bold uppercase tracking-wider">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sale ID</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">
                      #{sale.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{sale.customerName || 'Walk-in'}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{sale.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                      ₦{Number(sale.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        sale.paymentMethod === 'CREDIT' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {sale.paymentMethod === 'CREDIT' ? 'Pending' : 'Success'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts / Tasks */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Critical Alerts</h2>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </div>
            <div className="space-y-4">
              {Number(data?.lowStockCount) > 0 && (
                <div className="flex items-start gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-800">Stock Running Low</h4>
                    <p className="text-xs text-amber-600 mt-1">{data?.lowStockCount} products have reached their minimum stock level. Consider restocking soon.</p>
                  </div>
                </div>
              )}
              {Number(data?.totalOutstandingCredit) > 0 && (
                <div className="flex items-start gap-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                  <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-800">Pending Credits</h4>
                    <p className="text-xs text-rose-600 mt-1">There is ₦{data?.totalOutstandingCredit.toLocaleString()} in outstanding customer credit. Check the sales log for details.</p>
                  </div>
                </div>
              )}
              {Number(data?.lowStockCount) === 0 && Number(data?.totalOutstandingCredit) === 0 && (
                 <div className="flex flex-col items-center justify-center py-8 text-slate-400 space-y-2 opacity-50">
                    <ShoppingCart size={40} strokeWidth={1} />
                    <p className="text-sm">Everything looks good today!</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  icon: any;
  color: 'blue' | 'emerald' | 'amber' | 'rose';
  alert?: boolean;
}

function KpiCard({ title, value, icon: Icon, color, alert }: KpiCardProps) {
  const colors = {
    blue: 'from-blue-50 to-white border-blue-100 text-blue-600',
    emerald: 'from-emerald-50 to-white border-emerald-100 text-emerald-600',
    amber: 'from-amber-50 to-white border-amber-100 text-amber-600',
    rose: 'from-rose-50 to-white border-rose-100 text-rose-600',
  };

  return (
    <div className={`relative overflow-hidden p-6 rounded-3xl border bg-gradient-to-br ${colors[color]} backdrop-blur-sm group hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl bg-white/50 border border-current/10 ${alert ? 'animate-bounce' : ''}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
