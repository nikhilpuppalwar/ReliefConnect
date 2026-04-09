import ProtectedRoute from "@/components/ProtectedRoute";

export default function CivilianLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["civilian", "admin"]}>
      <div className="min-h-screen bg-background text-on-background">{children}</div>
    </ProtectedRoute>
  );
}
