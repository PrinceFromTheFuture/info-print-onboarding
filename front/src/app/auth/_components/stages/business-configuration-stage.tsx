"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import type { AccountSetupForm } from "../account-set-up";

export function BusinessConfigurationStage({ form }: { form: AccountSetupForm }) {
  const specializationOptions = [
    "Digital Printing",
    "Offset Printing",
    "Screen Printing",
    "Embroidery",
    "Signage & Wide Format",
    "Promotional Products",
    "Labels & Stickers",
    "Commercial Printing",
    "Print Brokering",
  ];

  const [localSpecializations, setLocalSpecializations] = useState<string[]>(
    form.getValues("printingShopSpecializations") || []
  );

  const toggleSpecialization = (specialization: string) => {
    const current = form.getValues("printingShopSpecializations") || [];
    let updated: string[];

    if (current.includes(specialization)) {
      updated = current.filter((s: string) => s !== specialization);
    } else {
      updated = [...current, specialization];
    }
    form.setValue("printingShopSpecializations", updated, { shouldValidate: true });

    setLocalSpecializations(updated);
  };

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Printing Shop Specializations *</FieldLabel>
        <FieldDescription className="mb-4">
          Select all areas your printing shop specializes in
        </FieldDescription>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {specializationOptions.map((option) => (
            <div

              key={option}
              className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <Checkbox
                id={`spec-${option}`}
                onCheckedChange={() => toggleSpecialization(option)}
                checked={localSpecializations.includes(option)}
              />
              <label
                htmlFor={`spec-${option}`}
                className="text-xs sm:text-sm font-medium leading-none cursor-pointer flex-1"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
        {localSpecializations.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">{localSpecializations.length}</span>{" "}
              specialization(s) selected
            </p>
          </div>
        )}
        {form.formState.errors.printingShopSpecializations && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.printingShopSpecializations.message as string}
          </p>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="currentSalesTax">Current Sales Tax (%) *</FieldLabel>
        <Input
          id="currentSalesTax"
          type="number"
          step="0.01"
          placeholder="8.5"
          {...form.register("currentSalesTax")}
        />
        {form.formState.errors.currentSalesTax && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.currentSalesTax.message as string}
          </p>
        )}
        <FieldDescription>Your local sales tax percentage</FieldDescription>
      </Field>
    </FieldGroup>
  );
}
