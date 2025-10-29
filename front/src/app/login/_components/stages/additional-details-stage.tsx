"use client";
import { useState } from "react";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { AccountSetupForm } from "../account-set-up";

export function AdditionalDetailsStage({ form }: { form: AccountSetupForm }) {
  const featureOptions = [
    "Web-To-Print",
    "B2B & B2C PORTALS",
    "Inventory Management",
    "Notifications",
    "Kanban View",
    "4Over",
    "Apparel Integrations (Sanmar, S&S)",
    "Shipping Integration (e.g., Shippo)",
  ];

  const [localFeatures, setLocalFeatures] = useState<string[]>(form.getValues("otherFeatures") || []);

  const toggleFeature = (feature: string) => {
    const current = form.getValues("otherFeatures") || [];
    let updated: string[];

    if (current.includes(feature)) {
      updated = current.filter((f: string) => f !== feature);
    } else {
      updated = [...current, feature];
    }

    form.setValue("otherFeatures", updated, { shouldValidate: true });
    setLocalFeatures(updated);
  };

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="currentMISWorkflow">Current MIS Workflow *</FieldLabel>
        <Textarea
          id="currentMISWorkflow"
          placeholder="Describe your current Management Information System workflow..."
          {...form.register("currentMISWorkflow")}
          className="min-h-[120px]"
        />
        {form.formState.errors.currentMISWorkflow && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.currentMISWorkflow.message as string}
          </p>
        )}
        <FieldDescription>
          Describe how you currently manage orders, inventory, and customer data
        </FieldDescription>
      </Field>

      <Field>
        <FieldLabel>Other Features & Requirements *</FieldLabel>
        <FieldDescription className="mb-4">Select all features and integrations you need</FieldDescription>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {featureOptions.map((option) => (
            <div
              key={option}
              className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <Checkbox
                id={`feature-${option}`}
                onCheckedChange={() => toggleFeature(option)}
                checked={localFeatures.includes(option)}
              />
              <label
                htmlFor={`feature-${option}`}
                className="text-xs sm:text-sm font-medium leading-none cursor-pointer flex-1"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
        {localFeatures.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">{localFeatures.length}</span> feature(s) selected
            </p>
          </div>
        )}
        {form.formState.errors.otherFeatures && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.otherFeatures.message as string}</p>
        )}
      </Field>
    </FieldGroup>
  );
}
