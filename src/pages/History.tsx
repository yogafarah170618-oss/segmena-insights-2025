import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Calendar, FileText, Loader2, Users, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UploadHistory {
  id: string;
  file_name: string;
  uploaded_at: string;
  customers_count: number;
  transactions_count: number;
}

const History = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [hasOrphanedData, setHasOrphanedData] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [location.key]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      await loadUploadHistory();
      await checkOrphanedData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUploadHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("upload_history")
        .select("*")
        .eq("user_id", session.user.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setUploadHistory(data || []);
    } catch (error: any) {
      toast({
        title: "Gagal memuat riwayat",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const checkOrphanedData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("id")
        .eq("user_id", session.user.id)
        .is("upload_id", null)
        .limit(1);

      if (error) throw error;
      setHasOrphanedData((data || []).length > 0);
    } catch (error: any) {
      console.error("Error checking orphaned data:", error);
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error: transError } = await supabase
        .from("transactions")
        .delete()
        .eq("upload_id", historyId)
        .eq("user_id", session.user.id);

      if (transError) throw transError;

      const { error: segError } = await supabase
        .from("customer_segments")
        .delete()
        .eq("upload_id", historyId)
        .eq("user_id", session.user.id);

      if (segError) throw segError;

      const { error: histError } = await supabase
        .from("upload_history")
        .delete()
        .eq("id", historyId)
        .eq("user_id", session.user.id);

      if (histError) throw histError;

      toast({
        title: "Berhasil!",
        description: "Data berhasil dihapus.",
      });

      await loadUploadHistory();
      await checkOrphanedData();
    } catch (error: any) {
      toast({
        title: "Gagal menghapus",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteAllData = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error: transError } = await supabase
        .from("transactions")
        .delete()
        .eq("user_id", session.user.id);

      if (transError) throw transError;

      const { error: segError } = await supabase
        .from("customer_segments")
        .delete()
        .eq("user_id", session.user.id);

      if (segError) throw segError;

      const { error: histError } = await supabase
        .from("upload_history")
        .delete()
        .eq("user_id", session.user.id);

      if (histError) throw histError;

      toast({
        title: "Berhasil!",
        description: "Semua data berhasil dihapus.",
      });

      await loadUploadHistory();
      await checkOrphanedData();
    } catch (error: any) {
      toast({
        title: "Gagal menghapus",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteAllDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="blur-orb blur-orb-primary w-96 h-96 top-20 -left-48" />
        <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 relative">
      {/* Background Decorations */}
      <div className="blur-orb blur-orb-primary w-96 h-96 top-20 -left-48" />
      <div className="blur-orb blur-orb-accent w-80 h-80 bottom-20 -right-40" />

      {/* Header */}
      <div className="glass-card p-4 sm:p-6 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2 gradient-text">Riwayat Upload</h1>
          <p className="text-sm text-muted-foreground">Kelola riwayat upload data Anda</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="glass-card relative z-10">
        {/* Card Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold">Riwayat Upload Data</h2>
            <p className="text-sm text-muted-foreground">Daftar file yang pernah Anda upload</p>
          </div>
          {(uploadHistory.length > 0 || hasOrphanedData) && (
            <Button
              variant="destructive"
              onClick={() => setDeleteAllDialogOpen(true)}
              disabled={deleting}
              className="w-full sm:w-auto"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus Semua
            </Button>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-6">
          {uploadHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              {hasOrphanedData ? (
                <div className="space-y-2">
                  <p className="font-display font-semibold">Tidak Ada Riwayat Upload</p>
                  <p className="text-sm text-muted-foreground">
                    Ada data lama di sistem. Gunakan "Hapus Semua" untuk menghapus.
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Belum ada riwayat upload</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {uploadHistory.map((history) => (
                <div
                  key={history.id}
                  className="glass-card glass-hover p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* File Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-sm sm:text-base truncate">{history.file_name}</h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          {format(new Date(history.uploaded_at), "dd MMM yyyy", { locale: idLocale })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          {history.customers_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                          {history.transactions_count}
                        </span>
                      </div>
                    </div>
                    
                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedHistoryId(history.id);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={deleting}
                      className="self-end sm:self-center flex-shrink-0 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Single Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-white/20 mx-4 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold">Hapus Riwayat Upload?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Tindakan ini akan menghapus semua data yang terkait dengan upload ini, termasuk transaksi dan segmentasi customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={deleting} className="w-full sm:w-auto">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedHistoryId && handleDeleteHistory(selectedHistoryId)}
              disabled={deleting}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Dialog */}
      <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <AlertDialogContent className="glass-card border-white/20 mx-4 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold">Hapus Semua Data?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Tindakan ini akan menghapus SEMUA data Anda termasuk transaksi, segmentasi customer, dan riwayat upload.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={deleting} className="w-full sm:w-auto">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllData}
              disabled={deleting}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;