import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UpdateDebtSchema } from "@/lib/validators";

// GET /api/debts/[id] - Get single debt (optional convenience endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi. Silakan login." },
        { status: 401 }
      );
    }

    const { data: debt, error } = await supabase
      .from("debts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !debt) {
      return NextResponse.json(
        { error: "Data utang tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(debt);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// PATCH /api/debts/[id] - Update debt (including settle)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi. Silakan login." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = UpdateDebtSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if ("settled_at" in validation.data) {
      if (validation.data.settled_at === null) {
        updateData.settled_at = null;
      } else {
        updateData.settled_at = new Date().toISOString();
      }
    }

    // Merge the remaining fields, excluding `settled_at` which was handled above.
    const otherFields = { ...validation.data };
    delete otherFields.settled_at;
    Object.assign(updateData, otherFields);

    const { data: debt, error } = await supabase
      .from("debts")
      .update(updateData as never)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating debt:", error);
      return NextResponse.json(
        { error: "Gagal memperbarui catatan utang" },
        { status: 500 }
      );
    }

    return NextResponse.json(debt);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// DELETE /api/debts/[id] - Delete debt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi. Silakan login." },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from("debts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting debt:", error);
      return NextResponse.json(
        { error: "Gagal menghapus catatan utang" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
