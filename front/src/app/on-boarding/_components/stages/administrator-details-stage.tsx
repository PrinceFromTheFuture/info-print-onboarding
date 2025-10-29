"use client";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import type { AccountSetupForm } from "../account-set-up";

export function AdministratorDetailsStage({ form }: { form: AccountSetupForm }) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="administratorFullName">Administrator Full Name *</FieldLabel>
        <Input
          id="administratorFullName"
          placeholder="John Doe"
          {...form.register("administratorFullName")}
        />
        {form.formState.errors.administratorFullName && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.administratorFullName.message as string}
          </p>
        )}
        <FieldDescription>Primary administrator's full name</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="administratorEmail">Administrator Email *</FieldLabel>
        <Input
          id="administratorEmail"
          type="email"
          placeholder="admin@yourcompany.com"
          {...form.register("administratorEmail")}
        />
        {form.formState.errors.administratorEmail && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.administratorEmail.message as string}
          </p>
        )}
        <FieldDescription>Primary contact email for system notifications</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="administratorPhone">Administrator Phone *</FieldLabel>
        <Input
          id="administratorPhone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          {...form.register("administratorPhone")}
        />
        {form.formState.errors.administratorPhone && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.administratorPhone.message as string}
          </p>
        )}
        <FieldDescription>Contact phone number for urgent matters</FieldDescription>
      </Field>
    </FieldGroup>
  );
}
