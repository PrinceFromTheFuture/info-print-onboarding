"use client";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import type { AccountSetupForm } from "../account-set-up";

export function CompanyInformationStage({ form }: { form: AccountSetupForm }) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="companyName">Company Name *</FieldLabel>
        <Input id="companyName" placeholder="Your Company Inc." {...form.register("companyName")} />
        {form.formState.errors.companyName && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.companyName.message as string}</p>
        )}
        <FieldDescription>The official name of your printing company</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="companyWebsiteUrl">Company Website URL *</FieldLabel>
        <Input
          id="companyWebsiteUrl"
          placeholder="https://yourcompany.com"
          {...form.register("companyWebsiteUrl")}
        />
        {form.formState.errors.companyWebsiteUrl && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.companyWebsiteUrl.message as string}
          </p>
        )}
        <FieldDescription>Your company's primary website address</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="requestedDomain">Requested Domain *</FieldLabel>
        <Input id="requestedDomain" placeholder="yourcompany" {...form.register("requestedDomain")} />
        {form.formState.errors.requestedDomain && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.requestedDomain.message as string}
          </p>
        )}
        <FieldDescription>Choose your custom subdomain (e.g., yourcompany.infoprint.com)</FieldDescription>
      </Field>
    </FieldGroup>
  );
}
