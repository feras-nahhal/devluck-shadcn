"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/Student/DashboardLayout";
import { useStudentOpportunityHandler } from "@/hooks/studentapihandler/useStudentOpportunityHandler";
import { useStudentApplicationHandler } from "@/hooks/studentapihandler/useStudentApplicationHandler";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";


import { CircleLoader } from "react-spinners";
import { LoadingState } from "@/components/common/LoadingState";
import { toast } from "sonner";
import ConfirmSubmitModal from "@/components/Student/Modal/ConfirmSubmitModal";

interface Question {
  id: string;
  question: string;
  type: "text" | "select" | "checkbox" | "rating";
  options: string[];
  isRequired: boolean;
}

export default function ContractQuestionsPage() {
  const { contractId } = useParams();
  const router = useRouter();
  const opportunityId = contractId as string;

  const { getOpportunityQuestions, loading: questionsLoading } =
    useStudentOpportunityHandler();

  const { createApplication, loading: submitting } =
    useStudentApplicationHandler();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [page, setPage] = useState(0);
  const pageSize = 3;

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!opportunityId) return;
    loadQuestions();
  }, [opportunityId]);

  const loadQuestions = async () => {
    try {
      const data = await getOpportunityQuestions(opportunityId);
      setQuestions(data);

      if (data.length === 0) {
        router.push(`/Student/applied-Opportunity/${opportunityId}`);
      }
    } catch (err: any) {
      toast.error("faild to get opportunity questions");
    }
  };

  const handleChange = (id: string, value: any) => {
    setAnswers((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleCheckbox = (id: string, option: string) => {
    const current = answers[id] || [];
    const updated = current.includes(option)
      ? current.filter((x: string) => x !== option)
      : [...current, option];

    setAnswers((prev: any) => ({ ...prev, [id]: updated }));
  };

  const paginated = questions.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const totalPages = Math.ceil(questions.length / pageSize);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || "",
      }));

      await createApplication(opportunityId, payload);

      toast.success("Submitted successfully");

      router.push("/Student/applied-Opportunity");
    } catch (err: any) {
      toast.error("faild to Submit ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questionsLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <LoadingState label="Fetching Data..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-6 space-y-6">

        {/* HEADER */}
        <Card>
          <CardHeader>
            <CardTitle>Application Questions</CardTitle>
          </CardHeader>
        </Card>

        {/* QUESTIONS */}
        {paginated.map((q) => (
          <Card key={q.id}>
            <CardContent className="space-y-4 pt-6">

              <div className="flex justify-between">
                <p className="font-medium">{q.question}</p>
                {q.isRequired && (
                  <span className="text-xs text-red-500">Required</span>
                )}
              </div>

              {/* TEXT */}
              {q.type === "text" && (
                <Textarea
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  placeholder="Your answer..."
                />
              )}

              {/* CHECKBOX */}
              {q.type === "checkbox" && (
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <Checkbox
                        checked={answers[q.id]?.includes(opt)}
                        onCheckedChange={() =>
                          handleCheckbox(q.id, opt)
                        }
                      />
                      <Label>{opt}</Label>
                    </div>
                  ))}
                </div>
              )}

              {/* SELECT */}
              {q.type === "select" && (
                <RadioGroup
                  value={answers[q.id]}
                  onValueChange={(v) => handleChange(q.id, v)}
                >
                  {q.options.map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <RadioGroupItem value={opt} id={opt} />
                      <Label htmlFor={opt}>{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* RATING */}
              {q.type === "rating" && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Button
                      key={n}
                      size="sm"
                      variant={
                        answers[q.id] >= n ? "default" : "outline"
                      }
                      onClick={() => handleChange(q.id, n)}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              )}

            </CardContent>
          </Card>
        ))}

        {/* PAGINATION */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          {page < totalPages - 1 ? (
            <Button onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          ) : (
            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={submitting || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>

      </div>

      {/* MODAL + TOAST */}
      <ConfirmSubmitModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSubmit}
        isLoading={isSubmitting}
      />


    </DashboardLayout>
  );
}