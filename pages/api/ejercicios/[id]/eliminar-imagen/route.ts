import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);

  try {
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error al eliminar imagen:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
