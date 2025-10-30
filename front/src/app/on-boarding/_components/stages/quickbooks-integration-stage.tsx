"use client";
import { useState } from "react";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AccountSetupForm } from "../account-set-up";

export function QuickBooksIntegrationStage({ form }: { form: AccountSetupForm }) {
  const initialQuickBooksSyncing = Boolean(form.getValues("quickBooksSyncing"));
  const [quickBooksSyncing, setQuickBooksSyncing] = useState<boolean>(initialQuickBooksSyncing);
  const [quickBooksSyncingChoice, setQuickBooksSyncingChoice] = useState<string>(initialQuickBooksSyncing ? "yes" : "no");
  const [quickBooksVersion, setQuickBooksVersion] = useState<string>(form.getValues("quickBooksSyncingOptions") || "");

  // Reset QuickBooks options when syncing is disabled
  const handleQuickBooksSyncingChange = (value: string) => {
    const booleanValue = value === "yes";
    form.setValue("quickBooksSyncing", booleanValue, { shouldValidate: true });
    setQuickBooksSyncing(booleanValue);
    setQuickBooksSyncingChoice(value);

    if (!booleanValue) {
      form.setValue("quickBooksSyncingOptions", "", { shouldValidate: true });
      setQuickBooksVersion("");
      // Clear any validation errors for quickBooksSyncingOptions when disabled
      form.clearErrors("quickBooksSyncingOptions");
    }
  };

  return (
    <FieldGroup>
      <Field orientation="horizontal">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1">
            <FieldLabel htmlFor="quickBooksSyncing" className="cursor-pointer">
              Do you want QuickBooks?
            </FieldLabel>
            <FieldDescription>Choose whether to enable syncing with QuickBooks</FieldDescription>
          </div>
          <div className="min-w-[160px]">
            <Select value={quickBooksSyncingChoice} onValueChange={handleQuickBooksSyncingChange}>
              <SelectTrigger id="quickBooksSyncing" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Field>

      {quickBooksSyncing && (
        <Field>
          <FieldLabel htmlFor="quickBooksSyncingOptions">QuickBooks Version *</FieldLabel>
          <Select
            value={quickBooksVersion}
            onValueChange={(value) => {
              form.setValue("quickBooksSyncingOptions", value, { shouldValidate: true });
              setQuickBooksVersion(value);
            }}
          >
            <SelectTrigger id="quickBooksSyncingOptions" className="w-full">
              <SelectValue placeholder="Select QuickBooks version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quickbooksOnline">QuickBooks Online</SelectItem>
              <SelectItem value="quickbooksDesktop">QuickBooks Desktop</SelectItem>
              <SelectItem value="quickbooksEnterprise">QuickBooks Enterprise</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.quickBooksSyncingOptions && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.quickBooksSyncingOptions.message as string}</p>
          )}
          <FieldDescription>Choose your QuickBooks version for integration</FieldDescription>
        </Field>
      )}
    </FieldGroup>
  );
}
