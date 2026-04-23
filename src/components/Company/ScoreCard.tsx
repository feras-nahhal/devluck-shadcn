"use client"

import { useState } from "react"
import { EvaluationResult, Question } from "@/hooks/companyapihandler/questions-mock-api"
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ScoreCardProps {
  evaluation: EvaluationResult
  question: Question
}

export default function ScoreCard({ evaluation, question }: ScoreCardProps) {
  const [expanded, setExpanded] = useState(false)

  const scoreColor =
    evaluation.score >= 7 ? "bg-emerald-500" :
    evaluation.score >= 4 ? "bg-amber-500" :
    "bg-red-500"

  const truncated =
    question.question_text.length > 110
      ? question.question_text.slice(0, 110) + "..."
      : question.question_text

  return (
    <Card className="border border-border/60 shadow-sm overflow-hidden">

      {/* HEADER */}
      <CardHeader
        onClick={() => setExpanded(!expanded)}
        className="flex flex-row items-center justify-between py-3 cursor-pointer hover:bg-muted/40 transition"
      >
        <div className="flex items-center gap-3 min-w-0">

          {/* Score */}
          <Badge className={`${scoreColor} text-white font-bold`}>
            {evaluation.score}/{evaluation.max_score}
          </Badge>

          {/* Question */}
          <p className="text-sm text-muted-foreground truncate">
            {truncated}
          </p>
        </div>

        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </CardHeader>

      {/* SUMMARY */}
      <div className="px-4 pb-2 text-xs text-muted-foreground">
        {evaluation.one_line_summary}
      </div>

      {/* DETAILS */}
      {expanded && (
        <CardContent className="pt-3 border-t space-y-4 bg-muted/20">

          {/* FEEDBACK */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">
              Feedback
            </p>
            <p className="text-sm text-foreground">
              {evaluation.feedback}
            </p>
          </div>

          {/* SIGNALS */}
          <div className="flex flex-wrap gap-3 text-xs">

            <Badge variant={evaluation.signals.understood_concept ? "default" : "destructive"}>
              Understood Concept
            </Badge>

            <Badge variant={evaluation.signals.correct_approach ? "default" : "destructive"}>
              Correct Approach
            </Badge>

            <Badge
              variant={
                evaluation.signals.depth_of_answer === "high"
                  ? "default"
                  : evaluation.signals.depth_of_answer === "medium"
                  ? "secondary"
                  : "destructive"
              }
            >
              Depth: {evaluation.signals.depth_of_answer}
            </Badge>

          </div>

          {/* RED FLAGS */}
          {evaluation.signals.red_flags.length > 0 && (
            <div className="pt-3 border-t space-y-2">

              <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Red Flags
              </div>

              <ul className="space-y-1 pl-5 list-disc text-sm text-destructive/90">
                {evaluation.signals.red_flags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>

            </div>
          )}

        </CardContent>
      )}

    </Card>
  )
}