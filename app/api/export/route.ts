import { getCurrentUser } from "@/lib/auth/dal";
import { exportLibraryData } from "@/lib/data/transfer";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await exportLibraryData(user.id);
  const date = new Date().toISOString().slice(0, 10);

  return new Response(`${JSON.stringify(payload, null, 2)}\n`, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="mangashelf-library-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}