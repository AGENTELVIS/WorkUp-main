// components/ScreeningQuestions.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState } from "react";

export type ScreeningQuestion = {
  question: string;
};

type Props = {
  value: ScreeningQuestion[];
  onChange: (value: ScreeningQuestion[]) => void;
};

export default function ScreeningQuestions({ value, onChange }: Props) {
  const addQuestion = () => {
    if (value.length >= 3) return;
    onChange([...value, { question: "" }]);
  };

  const updateQuestion = (index: number, question: string) => {
    const updated = [...value];
    updated[index].question = question;
    onChange(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <label className="font-medium text-sm"></label>
      {value.map((q, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={q.question}
            onChange={(e) => updateQuestion(i, e.target.value)}
            placeholder={`Question ${i + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeQuestion(i)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      {value.length < 3 && (
        <Button type="button" variant="outline" onClick={addQuestion}>
          + Add Question
        </Button>
      )}
    </div>
  );
}
