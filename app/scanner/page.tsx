import { AppShell } from "@/components/layout/app-shell";
import { ClientDocumentScanner } from "@/components/ocr/client-document-scanner";

export default function ScannerPage() {
  return (
    <AppShell>
      <ClientDocumentScanner />
    </AppShell>
  );
}
