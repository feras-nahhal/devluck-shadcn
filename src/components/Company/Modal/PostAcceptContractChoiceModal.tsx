"use client";

import { Button } from "@/components/ui/button";

interface PostAcceptContractChoiceModalProps {
  isOpen: boolean;
  applicantName?: string;
  onClose: () => void;
  onCreateContract: () => void;
  onUseTemplate: () => void;
}

export default function PostAcceptContractChoiceModal({
  isOpen,
  applicantName,
  onClose,
  onCreateContract,
  onUseTemplate,
}: PostAcceptContractChoiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/35" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-xl border bg-background p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">Applicant accepted</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {applicantName
            ? `${applicantName} is accepted. Ready to create a contract?`
            : "Applicant is accepted. Ready to create a contract?"}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={onCreateContract}>Create Contract</Button>
          <Button variant="outline" onClick={onUseTemplate}>Use Template</Button>
          <Button variant="ghost" onClick={onClose}>Later</Button>
        </div>
      </div>
    </div>
  );
}
