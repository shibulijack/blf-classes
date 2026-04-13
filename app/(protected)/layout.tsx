import { BottomNav } from "@/components/layout/BottomNav";
import { AddToHomeScreen } from "@/components/layout/AddToHomeScreen";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh pb-20">
      <AddToHomeScreen />
      <div className="max-w-lg mx-auto">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
