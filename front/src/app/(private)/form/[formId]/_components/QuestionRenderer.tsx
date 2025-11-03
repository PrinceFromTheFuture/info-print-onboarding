"use client";

import React from "react";
import TextInput from "./TextInput";
import NumberInput from "./NumberInput";
import SelectInput from "./SelectInput";
import DateInput from "./DateInput";
import CheckboxInput from "./CheckboxInput";
import ImageInput from "./ImageInput";
import AttachmentInput from "./AttachmentInput";
import type { Question } from "./types";

interface QuestionRendererProps {
  question: Question;
  value?: any;
  onChange?: (value: any) => void;
  isInvalid?: boolean;
}

export default function QuestionRenderer({ question, value, onChange, isInvalid = false }: QuestionRendererProps) {
  const props = { question, value, onChange, isInvalid };
  switch (question.type) {
    case "text":
      return <TextInput {...props} />;
    case "number":
      return <NumberInput {...props} />;
    case "select":
      return <SelectInput {...props} />;
    case "date":
      return <DateInput {...props} />;
    case "checkbox":
      return <CheckboxInput {...props} />;
    case "image":
      return <ImageInput {...props} />;
    case "attachment":
      return <AttachmentInput {...props} />;
  }
}
