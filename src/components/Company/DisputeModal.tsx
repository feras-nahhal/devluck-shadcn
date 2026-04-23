"use client";

import { useEffect, useState } from "react";
import { Loader2, File } from "lucide-react";
import { CircleLoader } from "react-spinners";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useDisputeHandler } from "@/hooks/companyapihandler/useDisputeHandler";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "../common/LoadingState";

interface DisputeModalProps {
  contractId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ActionType = "view" | "accept" | "reject";

export default function DisputeModal({
  contractId,
  open,
  onClose,
  onSuccess,
}: DisputeModalProps) {
  const {
    dispute,
    loading,
    error,
    getDisputeByContractId,
    resolveDispute,
    rejectDispute,
  } = useDisputeHandler();

  const [actionType, setActionType] = useState<ActionType>("view");
  const [resolution, setResolution] = useState("");
  const [newContractStatus, setNewContractStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !contractId) return;

    setActionType("view");
    setResolution("");
    setNewContractStatus("");
    setSubmitError(null);

    getDisputeByContractId(contractId).catch(console.error);
  }, [open, contractId]);

  const handleAccept = () => {
    setActionType("accept");
    setResolution("");
    setNewContractStatus("Running");
  };

  const handleReject = () => {
    setActionType("reject");
    setResolution("");
  };

  const handleBack = () => {
    setActionType("view");
    setResolution("");
    setNewContractStatus("");
    setSubmitError(null);
  };

  const handleSubmitAccept = async () => {
    if (!dispute) return;

    if (!resolution.trim()) {
      setSubmitError("Resolution message is required");
      return;
    }

    if (!newContractStatus) {
      setSubmitError("Please select a contract status");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await resolveDispute(dispute.id, resolution, newContractStatus);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReject = async () => {
    if (!dispute) return;

    if (!resolution.trim()) {
      setSubmitError("Rejection reason is required");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await rejectDispute(dispute.id, resolution);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>
            {actionType === "view"
              ? "Dispute Details"
              : actionType === "accept"
              ? "Accept Dispute"
              : "Reject Dispute"}
          </DialogTitle>

          <DialogDescription>
            {actionType === "view"
              ? "Review dispute information and status."
              : actionType === "accept"
              ? "Provide a resolution and select the contract outcome."
              : "Explain why you are rejecting this dispute."}
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <div className="space-y-4 py-2">
          {loading ? (
              <LoadingState label="Fetching contracts ..." />
          ) : error ? (
            <EmptyState
              icon={<File className="text-red-500" />}
              title="Error"
              description={error}
            />
          ) : !dispute ? (
            <ErrorState
              icon={<File />}
              title="No dispute found"
              description="No active dispute for this contract."
            />
          ) : (
            <>
              {/* VIEW */}
              {actionType === "view" && (
             
                  <CardContent className="space-y-4 p-4">

                    {/* Reason */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Reason</p>
                      <p className="text-sm text-muted-foreground">
                        {dispute.reason}
                      </p>
                    </div>

                    <Separator />

                    {/* Note */}
                    {dispute.note && (
                      <>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Note</p>
                          <p className="text-sm text-muted-foreground">
                            {dispute.note}
                          </p>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Status */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Status</p>

                      <Badge
                        variant="secondary"
                        className="w-fit"
                      >
                        {dispute.status}
                      </Badge>
                    </div>

                  </CardContent>
      
              )}

              {/* ACCEPT */}
              {actionType === "accept" && (
                <div className="space-y-3">
                  <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      You are accepting this dispute. Provide resolution and contract outcome.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col gap-2 w-full">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Resolution Message
                    </Label>

                    <Textarea
                      rows={4}
                      placeholder="Resolution message..."
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Contract Status
                    </Label>

                    <Select value={newContractStatus} onValueChange={setNewContractStatus}>
                      <SelectTrigger className="w-full border rounded-md h-10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Running">Running</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {submitError && (
                    <Alert variant="destructive">
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* REJECT */}
              {actionType === "reject" && (
                <div className="space-y-3">
                <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    Rejecting dispute will restore contract automatically.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Resolution Message *</Label>

                  <Textarea
                    placeholder="Resolution message..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={4}
                  />
                </div>

                  {submitError && (
                    <Alert variant="destructive">
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <DialogFooter className="flex gap-2">
          {actionType === "view" ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>

              {dispute && (
                <>
                  <Button variant="destructive" onClick={handleReject}>
                    Reject
                  </Button>

                  <Button onClick={handleAccept}>
                    Accept
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>

              <Button
                disabled={submitting}
                variant={actionType === "accept" ? "default" : "destructive"}
                onClick={
                  actionType === "accept"
                    ? handleSubmitAccept
                    : handleSubmitReject
                }
              >
                {submitting ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : actionType === "accept" ? (
                  "Confirm Accept"
                ) : (
                  "Confirm Reject"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}