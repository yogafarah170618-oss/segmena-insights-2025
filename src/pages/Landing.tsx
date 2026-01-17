import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, TrendingUp, Users, Crown, Heart, AlertTriangle, Sparkles, Upload, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: "1,247",
    activeSegments: "4",
    avgTransaction: "Rp 247K",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Revenue data for chart
  const revenueData = [
    { month: 'Jan', revenue: 58.5, x: 0, y: 60 },
    { month: 'Feb', revenue: 62.0, x: 23, y: 45 },
    { month: 'Mar', revenue: 68.5, x: 47, y: 55 },
    { month: 'Apr', revenue: 71.0, x: 70, y: 30 },
    { month: 'Mei', revenue: 69.5, x: 93, y: 40 },
    { month: 'Jun', revenue: 72.0, x: 117, y: 15 },
    { month: 'Jul', revenue: 74.5, x: 140, y: 25 },
    { month: 'Agu', revenue: 78.0, x: 163, y: 10 },
    { month: 'Sep', revenue: 75.5, x: 187, y: 20 },
    { month: 'Okt', revenue: 79.0, x: 210, y: 5 },
    { month: 'Nov', revenue: 68.5, x: 233, y: 12 },
    { month: 'Des', revenue: 70.5, x: 256, y: 8 },
  ];

  useEffect(() => {
    checkAuthAndLoadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setStats({
          totalCustomers: "1,247",
          activeSegments: "4",
          avgTransaction: "Rp 247K",
        });
      } else if (event === 'SIGNED_IN') {
        checkAuthAndLoadData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id);

      const { data: segments } = await supabase
        .from('customer_segments')
        .select('segment_name')
        .eq('user_id', session.user.id);

      if (transactions && transactions.length > 0) {
        const uniqueCustomers = new Set(transactions.map(t => t.customer_id)).size;
        const uniqueSegments = new Set(segments?.map(s => s.segment_name) || []).size;
        const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.transaction_amount.toString()), 0);
        const avgTransaction = totalRevenue / transactions.length;

        setStats({
          totalCustomers: uniqueCustomers.toLocaleString('id-ID'),
          activeSegments: uniqueSegments.toString(),
          avgTransaction: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(avgTransaction),
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* Hero Section */}
      <section className="min-h-[80vh] sm:min-h-[90vh] flex items-center justify-center py-6 sm:py-20 px-4 sm:px-6">
        <div className="w-full max-w-5xl mx-auto">
          {/* Main Title */}
          <div className="mb-6 sm:mb-12 text-center">
            <h1 className="text-[2.5rem] leading-[0.9] sm:text-7xl md:text-8xl lg:text-[10rem] font-brutal tracking-tight mb-3 sm:mb-6">
              SEGMENA
            </h1>
            <div className="inline-block bg-secondary px-3 sm:px-6 py-1 sm:py-2 border-3 border-border shadow-brutal -rotate-2 mb-4 sm:mb-8">
              <span className="font-brutal text-secondary-foreground text-[10px] sm:text-base md:text-xl">
                CUSTOMER INTELLIGENCE
              </span>
            </div>
            <p className="text-xs sm:text-base md:text-xl font-mono max-w-2xl mx-auto mb-6 sm:mb-12 leading-relaxed">
              Platform Customer Intelligence untuk UMKM. Segmentasi otomatis, insight siap pakai, mudah digunakan.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center mb-6 sm:mb-16">
            <Button
              size="lg"
              onClick={() => navigate("/upload")}
              className="text-xs sm:text-base md:text-lg px-5 sm:px-10 py-3 sm:py-6 w-full sm:w-auto"
            >
              Upload Data
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="text-xs sm:text-base md:text-lg px-5 sm:px-10 py-3 sm:py-6 w-full sm:w-auto"
            >
              Try Demo
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-4xl mx-auto">
            {[
              { label: "CUSTOMERS", value: stats.totalCustomers },
              { label: "SEGMENTS", value: stats.activeSegments },
              { label: "AVG. TRX", value: stats.avgTransaction },
            ].map((stat, i) => (
              <div 
                key={i} 
                className={`border-3 border-border p-2 sm:p-4 md:p-6 bg-card shadow-brutal ${
                  i === 1 ? 'bg-secondary text-secondary-foreground' : ''
                }`}
              >
                <div className="text-[8px] sm:text-[10px] md:text-xs font-mono mb-0.5 sm:mb-2 opacity-70 truncate">{stat.label}</div>
                <div className="text-sm sm:text-xl md:text-3xl font-brutal truncate">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Dashboard Preview - Redesigned for clarity */}
          <div className="mt-6 sm:mt-16 border-3 border-border bg-card shadow-brutal-lg overflow-hidden">
            {/* Window Header */}
            <div className="flex items-center justify-between bg-foreground text-background px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-accent"></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-secondary"></div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="font-mono text-[10px] sm:text-sm font-bold">SEGMENA DASHBOARD</span>
              </div>
              <span className="font-mono text-[8px] sm:text-xs opacity-70">v1.0</span>
            </div>
            
            <div className="p-3 sm:p-6">
              {/* Step indicator - Shows the flow */}
              <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-secondary/20 border-2 border-secondary">
                <div className="flex items-center gap-2 sm:gap-4 justify-center flex-wrap">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-secondary text-secondary-foreground flex items-center justify-center font-brutal text-xs">1</div>
                    <span className="text-[9px] sm:text-xs font-mono">Upload CSV</span>
                  </div>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-50" />
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-secondary text-secondary-foreground flex items-center justify-center font-brutal text-xs">2</div>
                    <span className="text-[9px] sm:text-xs font-mono">Analisis Otomatis</span>
                  </div>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-50" />
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-secondary text-secondary-foreground flex items-center justify-center font-brutal text-xs">3</div>
                    <span className="text-[9px] sm:text-xs font-mono">Lihat Insight</span>
                  </div>
                </div>
              </div>

              {/* Segment Cards with Icons & Descriptions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="border-2 border-border p-2 sm:p-4 bg-background hover:bg-accent/10 transition-colors">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    <span className="text-[9px] sm:text-xs font-brutal">CHAMPIONS</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-brutal text-accent">312</div>
                  <div className="text-[7px] sm:text-[9px] font-mono opacity-60 mt-0.5">Pelanggan terbaik</div>
                </div>
                
                <div className="border-2 border-border p-2 sm:p-4 bg-background hover:bg-secondary/10 transition-colors">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-foreground" />
                    <span className="text-[9px] sm:text-xs font-brutal">LOYAL</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-brutal">428</div>
                  <div className="text-[7px] sm:text-[9px] font-mono opacity-60 mt-0.5">Sering berbelanja</div>
                </div>
                
                <div className="border-2 border-border p-2 sm:p-4 bg-background hover:bg-destructive/10 transition-colors">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                    <span className="text-[9px] sm:text-xs font-brutal">AT RISK</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-brutal text-destructive">156</div>
                  <div className="text-[7px] sm:text-[9px] font-mono opacity-60 mt-0.5">Perlu perhatian</div>
                </div>
                
                <div className="border-2 border-border p-2 sm:p-4 bg-background hover:bg-green-500/10 transition-colors">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    <span className="text-[9px] sm:text-xs font-brutal">NEW</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-brutal text-green-500">351</div>
                  <div className="text-[7px] sm:text-[9px] font-mono opacity-60 mt-0.5">Pelanggan baru</div>
                </div>
              </div>

              {/* Visual Charts Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Revenue Chart with Labels */}
                <div className="border-2 border-border p-3 sm:p-4 bg-background">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-secondary" />
                      <span className="text-[10px] sm:text-xs font-brutal">REVENUE TREND</span>
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-mono text-green-500">↑ 23%</span>
                  </div>
                  {/* SVG Line Chart */}
                  <div className="h-20 sm:h-28 relative" onMouseLeave={() => setHoveredPoint(null)}>
                    <svg viewBox="0 0 280 100" className="w-full h-full" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="25" x2="280" y2="25" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 2" opacity="0.3" />
                      <line x1="0" y1="50" x2="280" y2="50" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 2" opacity="0.3" />
                      <line x1="0" y1="75" x2="280" y2="75" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 2" opacity="0.3" />
                      
                      {/* Area fill under the line */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EAB308" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,60 L23,45 L47,55 L70,30 L93,40 L117,15 L140,25 L163,10 L187,20 L210,5 L233,12 L256,8 L280,100 L0,100 Z"
                        fill="url(#areaGradient)"
                      />
                      
                      {/* Line chart path */}
                      <path
                        d="M0,60 L23,45 L47,55 L70,30 L93,40 L117,15 L140,25 L163,10 L187,20 L210,5 L233,12 L256,8"
                        fill="none"
                        stroke="#EAB308"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Interactive data points */}
                      {revenueData.map((point, i) => (
                        <g key={i}>
                          {/* Larger invisible hit area for easier hovering */}
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="12"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPoint(i)}
                          />
                          {/* Visible point */}
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r={hoveredPoint === i ? 5 : 3}
                            fill="#EAB308"
                            stroke={hoveredPoint === i ? "#fff" : "none"}
                            strokeWidth="2"
                            className="transition-all duration-200 pointer-events-none"
                          />
                        </g>
                      ))}
                    </svg>
                    
                    {/* Tooltip */}
                    {hoveredPoint !== null && (
                      <div 
                        className="absolute z-10 bg-card border-2 border-border shadow-brutal px-2 py-1 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                        style={{
                          left: `${(revenueData[hoveredPoint].x / 280) * 100}%`,
                          top: `${(revenueData[hoveredPoint].y / 100) * 100}%`,
                          marginTop: '-8px'
                        }}
                      >
                        <div className="text-[9px] sm:text-[11px] font-brutal text-foreground">{revenueData[hoveredPoint].month}</div>
                        <div className="text-[8px] sm:text-[10px] font-mono text-secondary">Rp {revenueData[hoveredPoint].revenue} Jt</div>
                      </div>
                    )}
                    
                    {/* Month labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-0">
                      {revenueData.map((data, i) => (
                        <span 
                          key={i} 
                          className={`text-[5px] sm:text-[7px] font-mono transition-all duration-200 ${hoveredPoint === i ? 'opacity-100 text-secondary font-bold' : 'opacity-50'}`}
                        >
                          {data.month}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="text-[8px] sm:text-[10px] font-mono opacity-60">Total Revenue 2024</div>
                    <div className="text-sm sm:text-lg font-brutal">Rp 847.5 Juta</div>
                  </div>
                </div>

                {/* Action Insights */}
                <div className="border-2 border-border p-3 sm:p-4 bg-background">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="text-[10px] sm:text-xs font-brutal">REKOMENDASI</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 bg-accent/10 border border-accent/30">
                      <div className="text-[9px] sm:text-[11px] font-brutal text-accent">🎯 Champions</div>
                      <div className="text-[8px] sm:text-[10px] font-mono opacity-80">Berikan reward eksklusif</div>
                    </div>
                    <div className="p-2 bg-destructive/10 border border-destructive/30">
                      <div className="text-[9px] sm:text-[11px] font-brutal text-destructive">⚠️ At Risk</div>
                      <div className="text-[8px] sm:text-[10px] font-mono opacity-80">Kirim promo win-back</div>
                    </div>
                    <div className="p-2 bg-green-500/10 border border-green-500/30">
                      <div className="text-[9px] sm:text-[11px] font-brutal text-green-500">✨ New Customers</div>
                      <div className="text-[8px] sm:text-[10px] font-mono opacity-80">Onboarding campaign</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA inside dashboard */}
              <div className="mt-4 p-3 bg-secondary/20 border-2 border-secondary text-center">
                <div className="text-[10px] sm:text-sm font-mono mb-1">Upload data transaksi Anda dan dapatkan insight seperti ini!</div>
                <div className="flex items-center justify-center gap-1 text-[9px] sm:text-xs font-brutal text-secondary-foreground">
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Format: CSV dengan kolom customer_id, transaction_date, amount</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-20 border-t-3 border-border">
        <div className="px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-16">
            <h2 className="text-xl sm:text-4xl md:text-6xl font-brutal mb-2 sm:mb-4">
              KEUNGGULAN
            </h2>
            <div className="inline-block bg-accent text-accent-foreground px-2 sm:px-4 py-0.5 sm:py-1 rotate-1 border-3 border-border shadow-brutal">
              <span className="font-mono text-[10px] sm:text-base">PLATFORM KAMI</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-3 max-w-6xl mx-auto">
            {[
              {
                icon: Target,
                title: "SEGMENTASI OTOMATIS",
                description: "Algoritma canggih mengelompokkan pelanggan berdasarkan perilaku transaksi.",
                highlight: "bg-secondary",
              },
              {
                icon: Zap,
                title: "INSIGHT SIAP PAKAI",
                description: "Rekomendasi strategi marketing langsung dari data Anda.",
                highlight: "bg-accent text-accent-foreground",
              },
              {
                icon: TrendingUp,
                title: "MUDAH DIGUNAKAN",
                description: "Upload CSV, lihat hasil. Tidak perlu keahlian data science.",
                highlight: "bg-foreground text-background",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="border-3 border-border p-4 sm:p-8 bg-card shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all group"
              >
                <div className={`w-10 h-10 sm:w-16 sm:h-16 ${feature.highlight} border-3 border-border flex items-center justify-center mb-3 sm:mb-6 group-hover:rotate-6 transition-transform`}>
                  <feature.icon className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-sm sm:text-xl font-brutal mb-2 sm:mb-4">{feature.title}</h3>
                <p className="font-mono text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA - Only show when not logged in */}
      {!isLoggedIn && (
        <section className="py-8 sm:py-20 border-t-3 border-border bg-foreground text-background">
          <div className="px-4 sm:px-6 text-center">
            <h2 className="text-xl sm:text-4xl md:text-6xl font-brutal mb-4 sm:mb-8">
              MULAI SEKARANG
            </h2>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-secondary text-secondary-foreground text-xs sm:text-lg px-6 sm:px-12 py-3 sm:py-6 hover:bg-secondary/90 w-full sm:w-auto max-w-xs"
            >
              DAFTAR GRATIS
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Landing;
