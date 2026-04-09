import ProtectedRoute from "@/components/ProtectedRoute";

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["volunteer", "admin"]}>
      <div className="min-h-screen bg-background text-on-background">{children}</div>
    </ProtectedRoute>
  );
}
