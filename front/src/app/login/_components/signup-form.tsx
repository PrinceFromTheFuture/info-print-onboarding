"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

interface SignupFormProps extends React.ComponentProps<"div"> {
  onSwitchToLogin: () => void;
}

export function SignupForm({ className, onSwitchToLogin, ...props }: SignupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trpc = useTRPC();
  const { mutateAsync: dbSignUp } = useMutation(trpc.authRouter.clientSignUp.mutationOptions());
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await authClient.signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.name,
        },
        { redirect: "manual" }
      );
      await dbSignUp({ email: data.email, name: data.name });

      if (res.data) {
        // Auto login after signup
        router.push("/customer");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Enter your information to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input id="name" type="text" placeholder="John Doe" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password && <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Creating account..." : "Sign Up"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <button type="button" onClick={onSwitchToLogin} className="text-primary underline underline-offset-4 hover:text-primary/80">
              Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
