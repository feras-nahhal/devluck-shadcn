"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useContractTemplateHandler, ContractTemplate } from "@/hooks/companyapihandler/useContractTemplateHandler";

interface ContractTemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ContractTemplate) => void;
}

export default function ContractTemplatePickerModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: ContractTemplatePickerModalProps) {
  const { contractTemplates, loading, listContractTemplates } = useContractTemplateHandler();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    listContractTemplates(1, 1000).catch(() => undefined);
  }, [isOpen, listContractTemplates]);

  if (!isOpen) return null;

  const selectedTemplate = contractTemplates.find((template) => template.id === selectedTemplateId) || null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/35" onClick={onClose} />
      <div
        className="relative w-full max-w-xl rounded-xl border bg-background p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">Choose contract template</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a template to prefill contract details.
        </p>

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading templates...</p>
          ) : contractTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No templates available.</p>
          ) : (
            contractTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-full rounded-md border p-3 text-left ${
                  selectedTemplateId === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <p className="font-medium">{template.name}</p>
                <p className="text-sm text-muted-foreground">{template.contractTitle}</p>
              </button>
            ))
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            disabled={!selectedTemplate}
            onClick={() => {
              if (!selectedTemplate) return;
              onSelectTemplate(selectedTemplate);
            }}
          >
            Continue
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
