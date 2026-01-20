import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, FileText, CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Silakan login terlebih dahulu");
      navigate("/auth");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile);
      toast.success("File uploaded successfully!");
    } else {
      toast.error("Please upload a CSV file");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile);
      toast.success("File uploaded successfully!");
    } else {
      toast.error("Please upload a CSV file");
    }
  };

  const handleProcess = async () => {
    if (!file) {
      toast.error("Please upload a file first");
      return;
    }
    
    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Silakan login terlebih dahulu");
        navigate("/auth");
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      // Use Vercel API route instead of Supabase Edge Function
      const response = await fetch('/api/process-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process CSV');
      }

      toast.success(`Berhasil! ${data.stats?.customers_segmented || 0} customer di-segmentasi`);
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Gagal Memuat data", {
        description: "Data tidak bisa diproses. Pastikan format CSV sesuai dengan ketentuan."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 overflow-x-hidden relative">
      {/* Background Decorations */}
      <div className="blur-orb blur-orb-primary w-96 h-96 top-20 -left-48" />
      <div className="blur-orb blur-orb-accent w-80 h-80 bottom-20 -right-40" />
      <div className="blur-orb blur-orb-secondary w-72 h-72 top-1/2 left-1/3" />

      <div className="max-w-4xl w-full space-y-4 sm:space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center px-2">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold mb-2 sm:mb-4 gradient-text">Upload Data</h1>
          <div className="inline-block soft-badge px-3 sm:px-4 py-1.5 rotate-1">
            <span className="text-xs sm:text-sm font-medium">Customer Transactions</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-6 max-w-xl mx-auto">
            Upload transaksi pelanggan dalam format CSV untuk mendapatkan insight mendalam
          </p>
        </div>

        {/* Upload Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`glass-card p-6 sm:p-12 transition-all mx-1 sm:mx-0 ${
            isDragging ? "scale-[1.02] border-primary/50 shadow-glow" : ""
          }`}
        >
          <div className="text-center">
            {!file ? (
              <>
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <UploadIcon className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                </div>
                <h3 className="text-lg sm:text-2xl font-display font-bold mb-1 sm:mb-2">Drop Your CSV File Here</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8">or tap to browse</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild variant="gradient" className="text-sm sm:text-base">
                    <span>Browse Files</span>
                  </Button>
                </label>
              </>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-500" />
                </div>
                <div className="glass-card p-3 sm:p-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-display font-semibold text-sm sm:text-base truncate">{file.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFile(null)}
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Format Info */}
        <div className="glass-card p-4 sm:p-8 mx-1 sm:mx-0">
          <h3 className="text-base sm:text-xl font-display font-bold mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/10">Format Data yang Diperlukan</h3>
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <div className="flex items-start gap-2 sm:gap-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0">1</div>
              <div className="flex flex-wrap items-center gap-1">
                <strong className="font-semibold">customer_id:</strong>
                <span className="text-muted-foreground">ID unik</span>
                <span className="soft-badge px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-primary/10 text-primary">WAJIB</span>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0">2</div>
              <div className="flex flex-wrap items-center gap-1">
                <strong className="font-semibold">transaction_date:</strong>
                <span className="text-muted-foreground hidden sm:inline">(YYYY-MM-DD)</span>
                <span className="soft-badge px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-primary/10 text-primary">WAJIB</span>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0">3</div>
              <div className="flex flex-wrap items-center gap-1">
                <strong className="font-semibold">transaction_amount:</strong>
                <span className="text-muted-foreground hidden sm:inline">(angka)</span>
                <span className="soft-badge px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-primary/10 text-primary">WAJIB</span>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0">4</div>
              <div className="flex flex-wrap items-center gap-1">
                <strong className="font-semibold">customer_name:</strong>
                <span className="text-muted-foreground">Nama</span>
                <span className="soft-badge px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-muted/50">OPSIONAL</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-x-auto">
            <p className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Contoh Format CSV:</p>
            <code className="text-[10px] sm:text-xs block whitespace-pre leading-relaxed text-muted-foreground">
customer_id,transaction_date,transaction_amount,customer_name{'\n'}
CUST001,2024-01-15,500000,Ahmad Wijaya{'\n'}
CUST002,2024-01-16,750000,{'\n'}
CUST003,2024-01-17,250000,Siti Nurhaliza
            </code>
          </div>
        </div>

        {/* Process Button */}
        {file && (
          <div className="text-center px-1 sm:px-0">
            <Button
              size="lg"
              variant="gradient"
              onClick={handleProcess}
              disabled={isProcessing}
              className="text-sm sm:text-lg px-8 sm:px-12 py-4 sm:py-6 w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Process Data"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;