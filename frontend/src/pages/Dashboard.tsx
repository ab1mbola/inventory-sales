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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
      theme: 'dark',
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-100">Overview</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back. Here's what's happening today.</p>
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
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-xl text-sm font-medium transition-all active:scale-95 border border-gray-700"
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
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-100">Revenue Trend (7 Days)</h2>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md uppercase tracking-wider">Weekly Performance</span>
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
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-gray-100 mb-6">Top Products</h2>
          <div className="space-y-6">
            {data?.topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-blue-400 font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-100">{product.name}</h4>
                  <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-100">₦{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales Table */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-100">Recent Sales</h2>
            <Link to="/sales" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold uppercase tracking-wider">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sale ID</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-400">
                      #{sale.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-200">{sale.customerName || 'Walk-in'}</div>
                      <div className="text-[10px] text-gray-500 uppercase">{sale.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-100">
                      ₦{Number(sale.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        sale.paymentMethod === 'CREDIT' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
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
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-sm">
             <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-100">Critical Alerts</h2>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </div>
            <div className="space-y-4">
              {Number(data?.lowStockCount) > 0 && (
                <div className="flex items-start gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-200">Stock Running Low</h4>
                    <p className="text-xs text-amber-500/80 mt-1">{data?.lowStockCount} products have reached their minimum stock level. Consider restocking soon.</p>
                  </div>
                </div>
              )}
              {Number(data?.totalOutstandingCredit) > 0 && (
                <div className="flex items-start gap-4 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                  <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-200">Pending Credits</h4>
                    <p className="text-xs text-rose-500/80 mt-1">There is ₦{data?.totalOutstandingCredit.toLocaleString()} in outstanding customer credit. Check the sales log for details.</p>
                  </div>
                </div>
              )}
              {Number(data?.lowStockCount) === 0 && Number(data?.totalOutstandingCredit) === 0 && (
                 <div className="flex flex-col items-center justify-center py-8 text-gray-500 space-y-2 opacity-50">
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
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400',
  };

  return (
    <div className={`relative overflow-hidden p-6 rounded-3xl border bg-gradient-to-br ${colors[color]} backdrop-blur-sm group hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-gray-100">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl bg-gray-900/50 border border-gray-800 ${alert ? 'animate-bounce' : ''}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
