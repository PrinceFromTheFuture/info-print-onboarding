"use client";
import { useState } from "react";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AccountSetupForm } from "../account-set-up";

export function QuickBooksIntegrationStage({ form }: { form: AccountSetupForm }) {
  const [quickBooksSyncing, setQuickBooksSyncing] = useState<boolean>(
    form.getValues("quickBooksSyncing") || false
  );
  const [quickBooksVersion, setQuickBooksVersion] = useState<string>(
    form.getValues("quickBooksSyncingOptions") || ""
  );

  return (
    <FieldGroup>
      <Field orientation="horizontal">
        <div className="flex items-center gap-3">
          <Checkbox
            id="quickBooksSyncing"
            checked={quickBooksSyncing}
            onCheckedChange={(checked) => {
              const booleanValue = checked === true;
              form.setValue("quickBooksSyncing", booleanValue, { shouldValidate: true });
              setQuickBooksSyncing(booleanValue);
            }}
          />
          <div className="flex-1">
            <FieldLabel htmlFor="quickBooksSyncing" className="cursor-pointer">
              Enable QuickBooks Syncing
            </FieldLabel>
            <FieldDescription>Sync your data with QuickBooks accounting software</FieldDescription>
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
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.quickBooksSyncingOptions.message as string}
            </p>
          )}
          <FieldDescription>Choose your QuickBooks version for integration</FieldDescription>
        </Field>
      )}
    </FieldGroup>
  );
}
