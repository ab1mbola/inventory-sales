import { useDashboard } from '../hooks/useDashboard';
import Chart from 'react-apexcharts';
import { motion } from 'framer-motion';
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

import FullPageLoader from '../components/FullPageLoader';
import AnimatedPage from '../components/AnimatedPage';


export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <FullPageLoader message="Loading Dashboard..." />;
  }


  const chartOptions: any = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
            enabled: true,
            delay: 150
        },
        dynamicAnimation: {
            enabled: true,
            speed: 350
        }
      }
    },
    stroke: { curve: 'smooth', width: 2, colors: ['#E91E63'] },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.1,
        opacityTo: 0.01,
        stops: [0, 90, 100]
      },
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
      y: { formatter: (val: any) => `₦${val.toLocaleString()}` }
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ease: [0.23, 1, 0.32, 1] as const, duration: 0.8 } }
  };

  return (
    <AnimatedPage className="p-4 lg:p-8 space-y-12 max-w-[1600px] mx-auto bg-white">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black pb-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold tracking-tighter uppercase leading-none italic">Overview</h1>
          <p className="text-[10px] text-muted mt-4 uppercase tracking-[0.4em] font-bold opacity-60">Dashboard — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/pos"
            className="craft-btn flex items-center gap-3 px-8"
          >
            <Plus size={16} />
            New Sale
          </Link>
          <Link 
            to="/products"
            className="h-12 border border-primary text-primary hover:text-accent hover:border-accent transition-all text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-3 px-8"
          >
            <Package size={16} />
            Inventory
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-black divide-x divide-y md:divide-y-0 divide-black overflow-hidden"
      >
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
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Chart */}
        <motion.div variants={item} className="lg:col-span-2 craft-card p-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-serif font-bold italic tracking-tight">Sales Revenue</h2>
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] bg-accent-soft px-3 py-1">Last 7 Days</span>
          </div>
          <div className="h-[350px]">
            <Chart 
              options={chartOptions} 
              series={chartSeries} 
              type="area" 
              height="100%" 
            />
          </div>
        </motion.div>

        {/* Top Selling Products */}
        <motion.div variants={item} className="craft-card p-8 bg-surface/30">
          <h2 className="text-xl font-serif font-bold italic tracking-tight mb-10">Top Products</h2>
          <div className="space-y-8">
            {data?.topProducts.map((product, i) => (
              <motion.div 
                key={i} 
                whileHover={{ x: 5 }}
                className="flex items-center gap-6 group cursor-default"
              >
                <div className="font-serif text-3xl font-bold text-muted/10 group-hover:text-accent transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest leading-none">{product.name}</h4>
                  <p className="text-[9px] text-muted mt-2 font-bold opacity-60 uppercase">{product.quantity} sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-serif italic">₦{product.revenue.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Recent Sales Table */}
        <motion.div variants={item} className="craft-card overflow-hidden">
          <div className="p-8 border-b border-border flex items-center justify-between bg-surface/50">
            <h2 className="text-xl font-serif font-bold italic tracking-tight">Latest Transactions</h2>
            <Link to="/sales" className="text-[10px] text-accent hover:text-primary transition-colors flex items-center gap-2 font-bold uppercase tracking-[0.2em]">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface/30">
                  <th className="px-8 py-4 text-left text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Sale ID</th>
                  <th className="px-8 py-4 text-left text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Customer</th>
                  <th className="px-8 py-4 text-right text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Total</th>
                  <th className="px-8 py-4 text-center text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-surface/50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap text-[10px] font-mono text-muted/60 uppercase">
                      #{sale.id.slice(0, 8)}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-[11px] font-bold uppercase tracking-tight">{sale.customerName || 'Guest'}</div>
                      <div className="text-[9px] text-accent mt-1 font-bold uppercase tracking-[0.2em] opacity-80">{sale.paymentMethod}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-xs font-serif font-bold italic">
                      ₦{Number(sale.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <div className={`inline-block w-1.5 h-1.5 rounded-full ${
                        sale.paymentMethod === 'CREDIT' ? 'bg-accent' : 'bg-primary'
                      }`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Alerts / Activity */}
        <motion.div variants={item} className="space-y-12">
          <div className="craft-card p-10 bg-white">
            <h2 className="text-2xl font-serif font-bold italic tracking-tight mb-12">Alerts</h2>
            <div className="space-y-8">
              {Number(data?.lowStockCount) > 0 && (
                <motion.div initial={{ x: -10 }} animate={{ x: 0 }} className="flex items-start gap-8 p-8 border-l-4 border-accent bg-accent-soft/30">
                  <AlertTriangle size={24} className="text-accent shrink-0" />
                  <div>
                    <h4 className="text-[12px] font-bold uppercase tracking-widest text-accent">Low Stock</h4>
                    <p className="text-[10px] text-accent/80 mt-3 leading-relaxed uppercase tracking-widest font-bold">
                      {data?.lowStockCount} Products low on stock
                    </p>
                  </div>
                </motion.div>
              )}
              {Number(data?.totalOutstandingCredit) > 0 && (
                <motion.div initial={{ x: -10 }} animate={{ x: 0 }} transition={{ delay: 0.1 }} className="flex items-start gap-8 p-8 border-l-4 border-primary bg-surface">
                  <CreditCard size={24} className="text-primary shrink-0" />
                  <div>
                    <h4 className="text-[12px] font-bold uppercase tracking-widest">Outstanding Credit</h4>
                    <p className="text-[10px] text-muted mt-3 leading-relaxed uppercase tracking-widest font-bold">
                      ₦{data?.totalOutstandingCredit.toLocaleString()} total receivable
                    </p>
                  </div>
                </motion.div>
              )}
              {Number(data?.lowStockCount) === 0 && Number(data?.totalOutstandingCredit) === 0 && (
                 <div className="flex flex-col items-center justify-center py-16 text-muted space-y-6">
                    <ShoppingCart size={40} strokeWidth={0.5} className="opacity-20" />
                    <p className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30 italic">No alerts</p>
                 </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  icon: any;
  alert?: boolean;
}

function KpiCard({ title, value, icon: Icon, alert }: KpiCardProps) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ease: [0.23, 1, 0.32, 1] as const, duration: 0.8 } }
  };

  return (
    <motion.div 
      variants={item}
      whileHover={{ backgroundColor: 'hsl(0, 0%, 96%)' }}
      className="p-8 group cursor-default h-48 flex flex-col justify-between"
    >
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.4em] group-hover:text-accent transition-colors duration-500">{title}</p>
        <Icon size={18} className={alert ? 'text-accent' : 'text-primary'} strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-3xl font-serif font-bold italic tracking-tighter leading-none">{value}</h3>
        <div className="h-0.5 w-0 group-hover:w-full bg-accent transition-all duration-700 mt-4" />
      </div>
    </motion.div>
  );
}

