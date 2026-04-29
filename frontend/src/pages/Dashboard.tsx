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
import FullPageLoader from '../components/FullPageLoader';


export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <FullPageLoader message="Compiling Analytics..." />;
  }


  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      background: 'transparent',
    },
    stroke: { curve: 'smooth', width: 2, colors: ['#E91E63'] },
    fill: {
      type: 'solid',
      opacity: 0.03,
      colors: ['#E91E63']
    },
    colors: ['#E91E63'],
    grid: { 
      show: true,
      borderColor: '#f1f1f1',
      strokeDashArray: 5,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: data?.salesTrend.map(t => new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' })) || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#666', fontSize: '10px' } }
    },
    yaxis: { 
      labels: { style: { colors: '#666', fontSize: '10px' } }
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => `₦${val.toLocaleString()}` }
    },
    markers: {
      size: 4,
      colors: ['#000'],
      strokeColors: '#E91E63',
      strokeWidth: 2,
      hover: { size: 6 }
    }
  };

  const chartSeries = [{
    name: 'Revenue',
    data: data?.salesTrend.map(t => t.amount) || []
  }];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black pb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold tracking-tighter uppercase leading-none">Dashboard</h1>
          <p className="text-[10px] text-muted mt-3 uppercase tracking-[0.3em] font-bold">Performance Overview — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/pos"
            className="craft-btn flex items-center gap-2 text-[10px] h-10 px-6"
          >
            <Plus size={16} />
            EXECUTE SALE
          </Link>
          <Link 
            to="/products"
            className="h-10 border border-primary text-primary hover:text-accent hover:border-accent transition-all text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 px-6"
          >
            <Package size={16} />
            Inventory
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-black divide-x divide-y md:divide-y-0 divide-black">
        <KpiCard 
          title="Revenue" 
          value={`₦${data?.todayRevenue.toLocaleString()}`} 
          icon={TrendingUp}
        />
        <KpiCard 
          title="Profit" 
          value={`₦${data?.todayProfit.toLocaleString()}`} 
          icon={DollarSign}
        />
        <KpiCard 
          title="Low Stock" 
          value={data?.lowStockCount.toString() || '0'} 
          icon={AlertTriangle}
          alert={Number(data?.lowStockCount) > 0}
        />
        <KpiCard 
          title="Credit" 
          value={`₦${data?.totalOutstandingCredit.toLocaleString()}`} 
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Chart */}
        <div className="lg:col-span-2 craft-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-serif font-bold italic">Revenue Flow</h2>
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">7 Day Analysis</span>
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
        <div className="craft-card p-6">
          <h2 className="text-lg font-serif font-bold italic mb-8">Best Sellers</h2>
          <div className="space-y-6">
            {data?.topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-6 group cursor-default">
                <div className="font-serif text-2xl font-bold text-muted/20 group-hover:text-accent transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider">{product.name}</h4>
                  <p className="text-[10px] text-muted mt-1">{product.quantity} units</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold font-serif">₦{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Recent Sales Table */}
        <div className="craft-card overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold italic">Recent Sales</h2>
            <Link to="/sales" className="text-[10px] text-accent hover:text-primary transition-colors flex items-center gap-2 font-bold uppercase tracking-widest">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-[9px] font-bold text-muted uppercase tracking-[0.2em]">ID</th>
                  <th className="px-6 py-3 text-left text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Customer</th>
                  <th className="px-6 py-3 text-right text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Total</th>
                  <th className="px-6 py-3 text-center text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-surface transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-[10px] font-mono text-muted uppercase">
                      {sale.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[11px] font-bold uppercase tracking-tight">{sale.customerName || 'Walk-in'}</div>
                      <div className="text-[9px] text-accent mt-0.5 font-bold uppercase tracking-widest">{sale.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-serif font-bold italic">
                      ₦{Number(sale.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`inline-block w-2 h-2 rounded-full ${
                        sale.paymentMethod === 'CREDIT' ? 'bg-accent' : 'bg-primary'
                      }`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts / Activity */}
        <div className="space-y-12">
          <div className="craft-card p-8">
            <h2 className="text-xl font-serif font-bold italic mb-10">Alerts</h2>
            <div className="space-y-6">
              {Number(data?.lowStockCount) > 0 && (
                <div className="flex items-start gap-6 p-6 border border-accent bg-accent/5">
                  <AlertTriangle size={20} className="text-accent shrink-0" />
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-accent">Low Stock Alert</h4>
                    <p className="text-[10px] text-accent/80 mt-2 leading-relaxed uppercase tracking-tight font-medium">
                      {data?.lowStockCount} items are running low on stock.
                    </p>
                  </div>
                </div>
              )}
              {Number(data?.totalOutstandingCredit) > 0 && (
                <div className="flex items-start gap-6 p-6 border border-primary bg-primary/5">
                  <CreditCard size={20} className="text-primary shrink-0" />
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider">Total Credit</h4>
                    <p className="text-[10px] text-muted mt-2 leading-relaxed uppercase tracking-tight font-medium">
                      ₦{data?.totalOutstandingCredit.toLocaleString()} outstanding payments from customers.
                    </p>
                  </div>
                </div>
              )}
              {Number(data?.lowStockCount) === 0 && Number(data?.totalOutstandingCredit) === 0 && (
                 <div className="flex flex-col items-center justify-center py-12 text-muted space-y-4">
                    <ShoppingCart size={32} strokeWidth={1} className="opacity-30" />
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 italic">System Optimal</p>
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
  alert?: boolean;
}

function KpiCard({ title, value, icon: Icon, alert }: KpiCardProps) {
  return (
    <div className="p-6 group hover:bg-surface transition-all cursor-default">
      <div className="flex flex-col h-full justify-between gap-6">
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] group-hover:text-accent transition-colors">{title}</p>
          <Icon size={16} className={alert ? 'text-accent' : 'text-primary'} />
        </div>
        <h3 className="text-2xl font-serif font-bold italic tracking-tighter leading-none">{value}</h3>
      </div>
    </div>
  );
}
