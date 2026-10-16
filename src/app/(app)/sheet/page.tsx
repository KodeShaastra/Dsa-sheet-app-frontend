import type { Metadata } from "next";
import { SheetView } from "@/components/sheet/SheetView";

export const metadata: Metadata = { title: "Sheet" };

export default function SheetPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <SheetView />
    </div>
  );
}
