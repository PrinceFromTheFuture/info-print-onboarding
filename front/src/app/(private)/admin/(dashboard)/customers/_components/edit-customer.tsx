"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useTRPC } from "@/trpc/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const updateUserSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  name: z.string().min(1, "Name is required."),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface EditCustomerProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditCustomer({ customerId, open, onOpenChange }: EditCustomerProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Fetch customer data
  const { data: customer, isLoading, error } = useQuery(trpc.adminDataRouter.getCustomerDetailsById.queryOptions(customerId));

  // Update user mutation
  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    ...trpc.authRouter.updateUser.mutationOptions(),
    onSuccess: () => {
      toast.success("User updated successfully", {
        description: "The user's information has been updated.",
      });
      queryClient.invalidateQueries({
        queryKey: trpc.adminDataRouter.getCustomerDetailsById.queryKey(customerId),
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update user", {
        description: error.message || "An error occurred while updating the user.",
      });
    },
  });

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  // Update form when customer data loads
  useEffect(() => {
    if (customer && open) {
      form.reset({
        email: customer.email || "",
        name: customer.name || "",
      });
    }
  }, [customer, open, form]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({
        email: "",
        name: "",
      });
    }
  }, [open, form]);

  const onSubmit = (data: UpdateUserFormData) => {
    updateUser({
      email: data.email,
      name: data.name,
      id: customerId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>Update the customer's email and name information.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Customer</AlertTitle>
            <AlertDescription>{error instanceof Error ? error.message : "Failed to load customer information. Please try again."}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Customer name"
                  {...form.register("name")}
                  aria-invalid={form.formState.errors.name ? "true" : "false"}
                />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  {...form.register("email")}
                  aria-invalid={form.formState.errors.email ? "true" : "false"}
                />
                {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
              </Field>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating || isLoading}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update User"
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EditCustomer;
