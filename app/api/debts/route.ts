import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreateDebtSchema } from "@/lib/validators";

// GET /api/debts - List debts with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi. Silakan login." },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get("status");
    const typeFilter = searchParams.get("type");
    const searchQuery = searchParams.get("q")?.trim();
    // Format: "<column>-<direction>", e.g. "amount-desc", "created_at-asc".
    // Nilai tidak dikenal diabaikan supaya client gak bisa nginject sembarang.
    const sort = searchParams.get("sort");

    let query = supabase
      .from("debts")
      .select("*")
      .eq("user_id", user.id);

    // Sorting (default: created_at desc). Kita whitelist kolom + arah yang
    // diizinkan supaya gak bisa nginject sembarang nama kolom ke query.
    const SORTS: Record<string, { column: string; ascending: boolean }> = {
      "date-desc": { column: "created_at", ascending: false },
      "date-asc": { column: "created_at", ascending: true },
      "amount-desc": { column: "amount", ascending: false },
      "amount-asc": { column: "amount", ascending: true },
    };
    const sortSpec = sort ? SORTS[sort] : undefined;
    const { column, ascending } = sortSpec ?? { column: "created_at", ascending: false };
    query = query.order(column, { ascending });

    if (statusFilter) {
      if (statusFilter === "settled") {
        query = query.not("settled_at", "is", null);
      } else if (statusFilter === "unsettled") {
        query = query.is("settled_at", null);
      }
    }

    if (typeFilter) {
      query = query.eq("type", typeFilter);
    }

    // Search by counterpart_name (case-insensitive). ilike mendukung pattern
    // matching; kita bungkus dengan %...% biar match di mana saja dalam nama.
    if (searchQuery) {
      query = query.ilike("counterpart_name", `%${searchQuery}%`);
    }

    const { data: debts, error } = await query;

    if (error) {
      console.error("Error fetching debts:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data utang" },
        { status: 500 }
      );
    }

    return NextResponse.json(debts || []);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// POST /api/debts - Create new debt
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi. Silakan login." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = CreateDebtSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { counterpart_name, amount, due_date, note } = validation.data;

    const { data: debt, error } = await supabase
      .from("debts")
      .insert({
        user_id: user.id,
        type: validation.data.type,
        counterpart_name,
        amount,
        due_date: due_date || null,
        note: note || null,
      } as never)
      .select()
      .single();

    if (error) {
      console.error("Error creating debt:", error);
      return NextResponse.json(
        { error: "Gagal membuat catatan utang" },
        { status: 500 }
      );
    }

    return NextResponse.json(debt, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
