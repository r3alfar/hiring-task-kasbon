"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Debt, type CreateDebtInput } from "@/hooks/use-debts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { formatRupiahNoSymbol } from "@/lib/format";

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editDebt?: Debt | null;
}

export function DebtFormModal({ isOpen, onClose, editDebt }: DebtFormModalProps) {
  const router = useRouter();
  const [type, setType] = useState<"owed_to_me" | "i_owe">("owed_to_me");
  const [counterpart_name, setCounterpart_name] = useState("");
  const [amount, setAmount] = useState("");
  const [due_date, setDue_date] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track which debt we've synced state with so we can adjust state when
  // the `editDebt` prop changes (React-recommended render-time adjustment).
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [syncedKey, setSyncedKey] = useState<string | null>(null);
  const currentKey = isOpen ? (editDebt ? editDebt.id : "new") : null;
  if (syncedKey !== currentKey) {
    setSyncedKey(currentKey);
    if (editDebt && isOpen) {
      setType(editDebt.type);
      setCounterpart_name(editDebt.counterpart_name);
      setAmount(formatRupiahNoSymbol(editDebt.amount));
      setDue_date(editDebt.due_date ? new Date(editDebt.due_date).toISOString().split("T")[0] : "");
      setNote(editDebt.note || "");
    } else if (isOpen) {
      setType("owed_to_me");
      setCounterpart_name("");
      setAmount("");
      setDue_date(new Date().toISOString().split("T")[0]);
      setNote("");
      setError(null);
    }
  }

  const resetForm = () => {
    setType("owed_to_me");
    setCounterpart_name("");
    setAmount("");
    setDue_date(new Date().toISOString().split("T")[0]);
    setNote("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: CreateDebtInput = {
        type,
        counterpart_name,
        amount: parseInt(amount.replace(/\./g, ""), 10),
        due_date: due_date || undefined,
        note: note || null,
      };

      const res = await fetch("/api/debts", {
        method: editDebt ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menyimpan data");
      }

      resetForm();
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>{editDebt ? "Edit Catatan" : "Catat Baru"}</CardTitle>
            <CardDescription className="mt-1">
              {editDebt ? "Ubah data catatan utang" : "Tambahkan catatan utang baru"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 py-4">
            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    checked={type === "owed_to_me"}
                    onChange={() => setType("owed_to_me")}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Dihutang ke saya</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    checked={type === "i_owe"}
                    onChange={() => setType("i_owe")}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Saya hutang</span>
                </label>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="counterpart_name" className="text-sm font-medium">
                Nama orang
              </label>
              <Input
                id="counterpart_name"
                value={counterpart_name}
                onChange={(e) => setCounterpart_name(e.target.value)}
                placeholder="Contoh: Budi"
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Jumlah (Rp)
              </label>
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setAmount(value);
                }}
                placeholder="1000000"
                required
              />
              <p className="text-xs text-muted-foreground">Gunakan angka tanpa titik/koma</p>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label htmlFor="due_date" className="text-sm font-medium">
                Tanggal
              </label>
              <Input
                id="due_date"
                type="date"
                value={due_date}
                onChange={(e) => setDue_date(e.target.value)}
                required
              />
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">
                Catatan
              </label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 200))}
                placeholder="Catatan opsional (maksimal 200 karakter)"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{note.length}/200 karakter</p>
            </div>

            {error && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : editDebt ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
