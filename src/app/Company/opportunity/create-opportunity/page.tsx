"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOpportunityHandler } from "@/hooks/companyapihandler/useOpportunityHandler";
import { toast } from "sonner";
import DashboardLayout from "@/components/Company/DashboardLayout";
import { ArrowLeft } from "lucide-react";
import DatePickerField from "@/components/common/DatePickerField";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";
import { ParallelogramSelect } from "@/components/common/ParallelogramSelect";
import { MultiInputList } from "@/components/common/MultiInputList";


type OpportunityData = {
  id?: string;
  title: string;
  type: string;
  timeLength: string;
  currency: string;
  allowance?: string;
  location?: string;
  description: string;
  startDate?: string;
  skills: string[];
  whyYouWillLoveWorkingHere: string[];
  benefits: string[];
  keyResponsibilities: string[];
};

const TIME_LENGTH_UNITS = ["days", "weeks", "months", "years"] as const;
type TimeLengthUnit = (typeof TIME_LENGTH_UNITS)[number];

function parseTimeLength(timeLength: string): { value: string; unit: TimeLengthUnit } {
  const fallback = { value: "", unit: "days" as TimeLengthUnit };
  if (!timeLength) return fallback;
  const match = timeLength.trim().match(/^(\d+)\s+([a-zA-Z]+)$/);
  if (!match) return fallback;
  const parsedUnit = match[2].toLowerCase();
  const normalizedUnit = parsedUnit.endsWith("s") ? parsedUnit : `${parsedUnit}s`;
  if (!TIME_LENGTH_UNITS.includes(normalizedUnit as TimeLengthUnit)) return fallback;
  return { value: match[1], unit: normalizedUnit as TimeLengthUnit };
}

function formatTimeLength(value: string, unit: TimeLengthUnit): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";
  const count = Number(trimmedValue);
  const singularUnit = unit.slice(0, -1);
  const displayUnit = count === 1 ? singularUnit : unit;
  return `${trimmedValue} ${displayUnit}`;
}
function mapOpportunityToForm(data: any): OpportunityData {
  return {
    id: data.id,
    title: data.title ?? "",
    type: data.type ?? "",
    timeLength: data.timeLength ?? "",
    currency: data.currency ?? "",
    allowance: data.allowance ?? "",
    location: data.location ?? "",
    // ✅ FIX: fallback for backend inconsistency
    description: data.description ?? data.details ?? "",

    // ✅ FIX: format date properly for input[type=date]
    startDate: data.startDate
      ? new Date(data.startDate).toISOString().split("T")[0]
      : "",

    skills: data.skills ?? [],
    whyYouWillLoveWorkingHere: data.whyYouWillLoveWorkingHere ?? [],
    benefits: data.benefits ?? [],
    keyResponsibilities: data.keyResponsibilities ?? [],
  };
}

/* ---------------- PAGE ---------------- */

export default function CreateOpportunityPage() {

  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // 👈 EDIT MODE DETECTION
const [formData, setFormData] = useState<OpportunityData>({
  title: "",
  type: "",
  timeLength: "",
  currency: "",
  allowance: "",
  location: "",
  description: "",
  startDate: "",
  skills: [],
  whyYouWillLoveWorkingHere: [],
  benefits: [],
  keyResponsibilities: [],
});
  const [timeLengthValue, setTimeLengthValue] = useState("");
  const [timeLengthUnit, setTimeLengthUnit] = useState<TimeLengthUnit>("days");

    const router = useRouter();
 /* ──────────────────────────────────────────────
     LOAD EDIT DATA
  ────────────────────────────────────────────── */
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await getOpportunityById(id);
        setFormData(mapOpportunityToForm(data));
      } catch (err) {
        toast.error("Failed to load opportunity");
      }
    };

    load();
  }, [id]);

  const handleChange = (key: keyof OpportunityData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTimeLengthChange = (value: string, unit: TimeLengthUnit) => {
    setTimeLengthValue(value);
    setTimeLengthUnit(unit);
    handleChange("timeLength", formatTimeLength(value, unit));
  };

  const {
    loading,
    createOpportunity,
    updateOpportunity,
    getOpportunityById,
  } = useOpportunityHandler();
  useEffect(() => {
    const parsed = parseTimeLength(formData.timeLength);
    setTimeLengthValue(parsed.value);
    setTimeLengthUnit(parsed.unit);
  }, [formData.timeLength]);
  /* ---------------- SUBMIT (CREATE + EDIT) ---------------- */
    const handleSubmit = async () => {
    try {
        console.log("SUBMIT:", formData);

        if (formData.id) {
        await updateOpportunity(formData.id, formData);
        toast.success("Opportunity updated successfully");
        } else {
        await createOpportunity(formData);
        toast.success("Opportunity created successfully");
        }

        router.push("/Company/opportunity");
        router.refresh();
    } catch (err) {
        console.error("SUBMIT ERROR:", err);
        toast.error("Failed to save opportunity");
    }
    };

  return (
      <DashboardLayout>
    <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* BACK */}
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {formData.id ? "Edit Opportunity" : "Create Opportunity"}
        </h1>
        {/* GRID FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <ParallelogramInput
            label="Title"
            placeholder="Opportunity title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />

          <ParallelogramSelect
            label="Type"
            placeholder="Select type"
            value={formData.type}
            options={["Full-time", "Part-time", "Internship"]}
            onChange={(v) => handleChange("type", v)}
          />

          <ParallelogramSelect
            label="Location"
            placeholder="Select location"
            value={formData.location || ""}
            options={["Remote", "Hybrid", "Onsite"]}
            onChange={(v) => handleChange("location", v)}
          />

          <ParallelogramSelect
            label="Currency"
            placeholder="Select currency"
            value={formData.currency}
            options={["USD", "EUR", "SAR"]}
            onChange={(v) => handleChange("currency", v)}
          />

          <ParallelogramInput
            label="Allowance"
            placeholder="Salary / stipend"
            value={formData.allowance || ""}
            onChange={(e) => handleChange("allowance", e.target.value)}
          />

          <DatePickerField
            label="Start Date"
            value={formData.startDate || ""}
            onChange={(v) => handleChange("startDate", v)}
          />

                    {/* Inputs */}
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              placeholder="Time Length"
              value={timeLengthValue}
              onChange={(e) =>
                handleTimeLengthChange(e.target.value, timeLengthUnit)
              }
            />
            <Select
              value={timeLengthUnit}
              onValueChange={(val: TimeLengthUnit) =>
                handleTimeLengthChange(timeLengthValue, val)
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="years">Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
        </div>

        {/* DESCRIPTION FULL WIDTH */}
        <ParallelogramInput
          label="Description"
          placeholder="Opportunity description"
          value={formData.description}
          type="textarea"
          onChange={(e) => handleChange("description", e.target.value)}
        />

        {/* TAGS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <MultiInputList
            label="Skills"
            items={formData.skills}
            setItems={(v) => handleChange("skills", v)}
          />

          <MultiInputList
            label="Benefits"
            items={formData.benefits}
            setItems={(v) => handleChange("benefits", v)}
          />

          <MultiInputList
            label="Why You'll Love Working Here"
            items={formData.whyYouWillLoveWorkingHere}
            setItems={(v) => handleChange("whyYouWillLoveWorkingHere", v)}
          />

          <MultiInputList
            label="Responsibilities"
            items={formData.keyResponsibilities}
            setItems={(v) => handleChange("keyResponsibilities", v)}
          />

        </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading
          ? "Saving..."
          : formData.id
          ? "Update Opportunity"
          : "Create Opportunity"}
      </Button>
    </div>
    </DashboardLayout>
  );
}
