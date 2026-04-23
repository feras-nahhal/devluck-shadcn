
import { DimensionScore, EvaluationResult, Question } from '@/hooks/companyapihandler/questions-mock-api'
import ScoreCard from './ScoreCard'
import { AlertCircle, Dna, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'


interface DimensionReportProps {
  dimension: string
  data: DimensionScore
  questions: Question[]
}

const DIMENSION_COLORS: Record<string, string> = {
  technical_execution: '#7C3AED',
  communication: '#059669',
  personality: '#D97706',
  work_ethic: '#DC2626',
  motivation: '#2563EB',
}

export default function DimensionReport({ dimension, data, questions }: DimensionReportProps) {
  const color = DIMENSION_COLORS[dimension] || '#6B7280'
  const percentage = Math.round((data.score / 10) * 100)

  const formatDim = (d: string) =>
    d.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

   return (
    <Card className="border border-border shadow-sm">

      {/* HEADER */}
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold" style={{ color }}>
          {formatDim(dimension)}
        </CardTitle>

        <Badge variant="secondary" className="font-semibold">
          {data.score}/10
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* PROGRESS */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Score</span>
            <span>{percentage}%</span>
          </div>

          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="space-y-3 text-sm">

          <div className="flex gap-2">
            <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
            <div>
              <span className="font-medium">Top Signal: </span>
              <span className="text-muted-foreground">
                {data.top_signal}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
            <div>
              <span className="font-medium">Watch Out: </span>
              <span className="text-muted-foreground">
                {data.concern}
              </span>
            </div>
          </div>

          {data.archetype && (
            <div className="flex gap-2">
              <Dna className="w-4 h-4 text-purple-500 mt-0.5" />
              <div>
                <span className="font-medium">Archetype: </span>
                <span className="text-muted-foreground">
                  {data.archetype}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* EVALUATIONS */}
        {data.evaluations?.length > 0 && (
          <div className="pt-3 border-t space-y-2">

            <div className="text-xs uppercase text-muted-foreground font-semibold">
              {data.questions_count} Questions Evaluated
            </div>

            <div className="space-y-2">
              {data.evaluations.map((evalData: any) => {
                const q = questions.find(
                  (q) => q.id === evalData.question_id
                );

                if (!q) return null;

                return (
                  <ScoreCard
                    key={evalData.question_id}
                    evaluation={evalData}
                    question={q}
                  />
                );
              })}
            </div>

          </div>
        )}

      </CardContent>
    </Card>
  );
}