"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import DashboardLayout from "@/components/Company/DashboardLayout";
import { useQuestionHandler } from "@/hooks/companyapihandler/useQuestionHandler";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type QuestionType = "text" | "select" | "checkbox" | "rating";

interface NewQuestion {
  id?: string;
  question: string;
  type: QuestionType;
  options?: string[];
  isRequired?: boolean;
}

export default function AddQuestionsPage() {
  const { jobId } = useParams();
  const router = useRouter();
  const opportunityId = jobId as string;

  const {
    questions: savedQuestions,
    loading,
    error,
    getQuestions,
    deleteQuestion,
    bulkUpdateQuestions,
    clearError,
  } = useQuestionHandler();

  const [questions, setQuestions] = useState<NewQuestion[]>([]);
  const [questionInput, setQuestionInput] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("text");
  const [optionsInput, setOptionsInput] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (error) {
      setToast({ message: error, type: "error" });
      clearError();
    }
  }, [error]);

  useEffect(() => {
    if (opportunityId) loadQuestions();
  }, [opportunityId]);

  const loadQuestions = async () => {
    const loaded = await getQuestions(opportunityId);
    setQuestions(
      loaded.map((q) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options || [],
        isRequired: q.isRequired,
      }))
    );
  };

  const addQuestion = () => {
    if (!questionInput.trim()) return;

    const newQ: NewQuestion = {
      question: questionInput,
      type: questionType,
      options:
        questionType === "select" || questionType === "checkbox"
          ? optionsInput.split(",").map((o) => o.trim())
          : [],
      isRequired,
    };

    setQuestions((prev) => [...prev, newQ]);
    setQuestionInput("");
    setOptionsInput("");
    setIsRequired(false);
    setQuestionType("text");
  };

  const deleteOption = (qIndex: number, opt: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options?.filter((o) => o !== opt) }
          : q
      )
    );
  };

  const handleDeleteQuestion = async (id?: string, idx?: number) => {
    if (id) await deleteQuestion(opportunityId, id);
    setQuestions((prev) =>
      prev.filter((q, i) => (id ? q.id !== id : i !== idx))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await bulkUpdateQuestions(
        opportunityId,
        questions.map((q, i) => ({
          ...q,
          order: i,
        }))
      );

      setToast({ message: "Saved successfully", type: "success" });
      await loadQuestions();
    } catch {
      setToast({ message: "Failed to save", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* BACK */}
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>

        <h1 className="text-2xl font-bold text-center">
          Create Opportunity Questions
        </h1>

        {/* ADD QUESTION */}
        <Card>
          <CardHeader>
            <CardTitle>Add Question</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <Input
              placeholder="Question..."
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
            />

            {/* TYPE */}
            <Select
              value={questionType}
              onValueChange={(v) => setQuestionType(v as QuestionType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>

            {(questionType === "select" || questionType === "checkbox") && (
              <Input
                placeholder="Option1, Option2, Option3"
                value={optionsInput}
                onChange={(e) => setOptionsInput(e.target.value)}
              />
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                checked={isRequired}
                onCheckedChange={(v) => setIsRequired(!!v)}
              />
              <span>Required</span>
            </div>

            <Button onClick={addQuestion} className="w-full">
              Add Question
            </Button>
          </CardContent>
        </Card>

        {/* LIST */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save All"}
            </Button>

            {questions.map((q, i) => (
              <Card key={q.id || i}>
                <CardContent className="p-4 space-y-3">

                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {q.question}
                      </div>

                      <div className="flex gap-2">
                        <Badge>{q.type}</Badge>
                        {q.isRequired && <Badge variant="destructive">Required</Badge>}
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteQuestion(q.id, i)}
                    >
                      Delete
                    </Button>
                  </div>

                  {/* OPTIONS */}
                  {(q.type === "select" || q.type === "checkbox") && (
                    <div className="space-y-2">
                      {q.options?.map((opt) => (
                        <div
                          key={opt}
                          className="flex justify-between items-center border p-2 rounded"
                        >
                          <span>{opt}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteOption(i, opt)}
                          >
                            x
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* RATING */}
                  {q.type === "rating" && (
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {questions.length === 0 && (
          <p className="text-center text-muted-foreground">
            No questions yet
          </p>
        )}


      </div>
    </DashboardLayout>
  );
}