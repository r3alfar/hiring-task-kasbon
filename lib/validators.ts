import { z } from "zod/v4";

export const DebtSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(["owed_to_me", "i_owe"]),
  counterpart_name: z.string().min(1, "Nama wajib diisi"),
  amount: z.number().int().positive("Jumlah harus lebih dari 0"),
  note: z.string().nullable(),
  due_date: z.string().date().nullable(),
  settled_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateDebtSchema = z.object({
  type: z.enum(["owed_to_me", "i_owe"], "Tipe transaksi wajib dipilih"),
  counterpart_name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(100, "Maksimal 100 karakter"),
  amount: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .pipe(z.number().int().positive("Jumlah harus lebih dari 0")),
  due_date: z.string().date().optional().nullable(),
  note: z.string().max(200, "Catatan maksimal 200 karakter").optional().nullable(),
});

export const UpdateDebtSchema = z.object({
  type: z.enum(["owed_to_me", "i_owe"]).optional(),
  counterpart_name: z.string().min(1, "Nama wajib diisi").max(100).optional(),
  amount: z.number().int().positive("Jumlah harus lebih dari 0").optional(),
  due_date: z.string().date().optional().nullable(),
  note: z.string().max(200, "Catatan maksimal 200 karakter").optional().nullable(),
  settled_at: z.string().datetime().optional().nullable(),
});

export type Debt = z.infer<typeof DebtSchema>;
export type CreateDebtInput = z.input<typeof CreateDebtSchema>;
export type UpdateDebtInput = z.input<typeof UpdateDebtSchema>;
