"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import { useTRPC } from "@/trpc/trpc";
import { useMutation } from "@tanstack/react-query";

const schema = z.object({
  email: z.string("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type FormData = z.infer<typeof schema>;

interface LoginFormProps extends React.ComponentProps<"div"> {
  setModeHandler: (mode: "auth" | "pendingVerification") => void;
}

export function LoginForm({ className, setModeHandler, ...props }: LoginFormProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isPending: isSubmitting } = useMutation({
    // @ts-ignore - Types will be regenerated when backend restarts
    ...trpc.authRouter.login.mutationOptions(),
    onSuccess: (data: any) => {
      toast.success("Login successful! Welcome back.");
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      }).then(() => {
        window.location.reload();
      });
    },
    onError: (error: any) => {
      console.error(error);
      const errorMessage = error.message || "Invalid email or password. Please try again.";
      toast.error("Login Failed", {
        description: errorMessage,
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    // @ts-ignore - Types will be regenerated when backend restarts
    login({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password && <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>}
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
