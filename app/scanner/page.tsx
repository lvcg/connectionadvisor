import { AppShell } from "@/components/layout/app-shell";
import { ClientDocumentScanner } from "@/components/ocr/client-document-scanner";
import { PremiumLock } from "@/components/ui/premium-lock";

export default function ScannerPage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <PremiumLock title="OCR scan extraction and document vault" description="Preview OCR on this page, then upgrade to DomiVault Plus to save scanned receipts, warranties, service records, and extracted text to your secure vault." />
        <ClientDocumentScanner />
      </div>
    </AppShell>
  );
}
