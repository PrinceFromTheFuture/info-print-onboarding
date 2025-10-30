"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  FileText,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Calendar,
  Mail,
  FileIcon,
  File,
  Loader2,
  AlertCircle,
  Shield,
  ShieldCheck,
  Building2,
  Phone,
  Globe,
  Settings,
  CheckCircle,
} from "lucide-react";
import { useTRPC } from "@/trpc/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import Link from "next/link";

type Template = {
  id: string;
  name: string;
};

type MediaFile = {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
};

type AppUserConfig = {
  id: string;
  companyName: string;
  administratorFullName: string;
  administratorEmail: string;
  administratorPhone: string;
  companyWebsiteUrl: string;
  printingShopSpecializations: Array<{ specialization: string }>;
  currentSalesTax: number;
  quickBooksSyncing: boolean;
  quickBooksSyncingOptions?: string;
  requestedDomain: string;
  logo: MediaFile | null;
  contactAndCompanyList: MediaFile | null;
  inventoryList: MediaFile | null;
  machineInformation: MediaFile | null;
  additionalProductPricingInformation: MediaFile | null;
  currentMISWorkflow: string;
  otherFeatures: Array<{ feature: string }>;
};

type Submission = {
  id: string;
  template: string;
  templateId: string;
  progress: number;
  completedAt: string | null;
  totalQuestions: number;
  answeredQuestions: number;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  assignedTemplates: Template[];
  onboardingProgress: number;
  submissions: Submission[];
  media: MediaFile[];
  appUserConfig: AppUserConfig | null;
  isApproved: boolean;
};

interface CustomerDetailDialogProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableTemplates: Template[];
}

export function CustomerDetailDialog({ customerId, open, onOpenChange, availableTemplates }: CustomerDetailDialogProps) {
  if (!customerId) return null;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    data: customer,
    isLoading,
    error,
  } = useQuery(trpc.adminDataRouter.getCustomerDetailsById.queryOptions(customerId)) as {
    data: Customer | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  // Future approval functionality (placeholder for now)
  const { mutateAsync: approveUser, isPending: isApproving } = useMutation(trpc.customerRouter.approveUser.mutationOptions()) as unknown as {
    mutateAsync: (input: string) => Promise<{ success: boolean }>;
    isPending: boolean;
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId);
      toast.success("User approved successfully");
      await invalidateCustomerData();
    } catch (error: any) {
      toast.error("Failed to approve user", {
        description: error.message,
      });
    }
  };

  // Function to invalidate all related queries
  const invalidateCustomerData = async () => {
    // Invalidate the specific customer query
    await queryClient.invalidateQueries();
  };

  const { mutate: assignTemplateToUser, isPending: isAssigning } = useMutation({
    ...trpc.templatesRouter.assignTempalteToUser.mutationOptions(),
    onSuccess: async () => {
      toast.success("Template assigned successfully");
      await invalidateCustomerData();
    },
    onError: (error) => {
      toast.error("Failed to assign template", {
        description: error.message,
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    } else if (type === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-600" />;
    }
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const generateUnsecurePassword = ({ userName }: { userName: string }) => {
    return `${userName.toLowerCase()}1234567`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] p-0 gap-0">
        {isLoading ? (
          // Loading State
          <>
            <DialogHeader className="p-6 pb-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-96" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </DialogHeader>
            <Separator />
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Separator />
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-8 w-36" />
                </div>
              </div>
            </div>
          </>
        ) : error ? (
          // Error State
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Customer Details</AlertTitle>
              <AlertDescription>{error instanceof Error ? error.message : "Failed to load customer information. Please try again."}</AlertDescription>
            </Alert>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : customer ? (
          // Success State
          <>
            <DialogHeader className="p-6 pb-4">
              <div className="flex items-end justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1.5">
                    <DialogTitle className="text-2xl">{customer.name}</DialogTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4" />
                        {customer.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Joined {formatDate(customer.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="w-fit capitalize">
                        {customer.role}
                      </Badge>
                      <Badge variant={customer.isApproved ? "default" : "destructive"} className="w-fit gap-1">
                        {customer.isApproved ? (
                          <>
                            <ShieldCheck className="h-3 w-3" />
                            Approved
                          </>
                        ) : (
                          <>
                            <Shield className="h-3 w-3" />
                            Pending Approval
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
                {!customer.isApproved && (
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => handleApproveUser(customer.id)} disabled={isApproving} className="gap-2">
                      {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      {isApproving ? "Approving..." : "Approve User"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">Approve this user to grant full access</p>
                  </div>
                )}
              </div>
            </DialogHeader>

            <Separator />

            <div className="flex flex-1 overflow-hidden">
              {/* Main Content */}
              <ScrollArea className="flex-1 max-h-[calc(90vh-180px)]">
                <div className="p-6 space-y-6">
                  {/* Overall Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Onboarding Progress</h3>
                      <span className="text-2xl font-bold text-primary">{customer.onboardingProgress}%</span>
                    </div>
                    <Progress value={customer.onboardingProgress} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {customer.onboardingProgress === 100
                        ? "All onboarding tasks completed!"
                        : `${customer.assignedTemplates.length - customer.submissions.filter((s) => s.progress === 100).length} templates remaining`}
                    </p>
                  </div>

                  {/* User Credentials */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">User Credentials</h3>
                    </div>
                    <div className="grid bg-foreground/4 p-4 rounded-sm grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm font-medium">{customer.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Temporary Password</label>
                        <p className="text-sm font-medium font-mono">{generateUnsecurePassword({ userName: customer.email.split("@")[0] })}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Share these with the customer to sign in.</p>
                  </div>

                  <Separator />

                  {/* User Configuration */}
                  {customer.appUserConfig ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">Company Configuration</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                              <p className="text-sm font-medium">{customer.appUserConfig.companyName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Administrator</label>
                              <p className="text-sm font-medium">{customer.appUserConfig.administratorFullName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Email</label>
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customer.appUserConfig.administratorEmail}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Phone</label>
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.appUserConfig.administratorPhone}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Website</label>
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                <a
                                  href={customer.appUserConfig.companyWebsiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {customer.appUserConfig.companyWebsiteUrl}
                                </a>
                              </p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Requested Domain</label>
                              <p className="text-sm font-medium">{customer.appUserConfig.requestedDomain}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Sales Tax Rate</label>
                              <p className="text-sm font-medium">{customer.appUserConfig.currentSalesTax}%</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">QuickBooks Integration</label>
                              <div className="flex items-center gap-2">
                                <Badge variant={customer.appUserConfig.quickBooksSyncing ? "default" : "secondary"}>
                                  {customer.appUserConfig.quickBooksSyncing ? "Enabled" : "Disabled"}
                                </Badge>
                                {customer.appUserConfig.quickBooksSyncingOptions && (
                                  <span className="text-xs text-muted-foreground">({customer.appUserConfig.quickBooksSyncingOptions})</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Specializations</label>
                              <div className="flex flex-wrap gap-1">
                                {customer.appUserConfig.printingShopSpecializations.map((spec, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {spec.specialization}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        {customer.appUserConfig.otherFeatures && customer.appUserConfig.otherFeatures.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Additional Features</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {customer.appUserConfig.otherFeatures.map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {feature.feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Company Documents & Media */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-muted-foreground">Company Documents & Media</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Logo */}
                            {customer.appUserConfig.logo && (
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Company Logo</label>
                                <div className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                  <Link
                                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${customer.appUserConfig.logo.url}`}
                                    target="_blank"
                                    className="flex items-center gap-2"
                                  >
                                    <div className="shrink-0">{getFileIcon(customer.appUserConfig.logo.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">{customer.appUserConfig.logo.name}</p>
                                      <p className="text-xs text-muted-foreground">Logo</p>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            )}

                            {/* Contact and Company List */}
                            {customer.appUserConfig.contactAndCompanyList && (
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Contact & Company List</label>
                                <div className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                  <Link
                                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${customer.appUserConfig.contactAndCompanyList.url}`}
                                    target="_blank"
                                    className="flex items-center gap-2"
                                  >
                                    <div className="shrink-0">{getFileIcon(customer.appUserConfig.contactAndCompanyList.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">{customer.appUserConfig.contactAndCompanyList.name}</p>
                                      <p className="text-xs text-muted-foreground">Contact List</p>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            )}

                            {/* Inventory List */}
                            {customer.appUserConfig.inventoryList && (
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Inventory List</label>
                                <div className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                  <Link
                                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${customer.appUserConfig.inventoryList.url}`}
                                    target="_blank"
                                    className="flex items-center gap-2"
                                  >
                                    <div className="shrink-0">{getFileIcon(customer.appUserConfig.inventoryList.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">{customer.appUserConfig.inventoryList.name}</p>
                                      <p className="text-xs text-muted-foreground">Inventory</p>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            )}

                            {/* Machine Information */}
                            {customer.appUserConfig.machineInformation && (
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Machine Information</label>
                                <div className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                  <Link
                                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${customer.appUserConfig.machineInformation.url}`}
                                    target="_blank"
                                    className="flex items-center gap-2"
                                  >
                                    <div className="shrink-0">{getFileIcon(customer.appUserConfig.machineInformation.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">{customer.appUserConfig.machineInformation.name}</p>
                                      <p className="text-xs text-muted-foreground">Machines</p>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            )}

                            {/* Additional Product Pricing Information */}
                            {customer.appUserConfig.additionalProductPricingInformation && (
                              <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-medium text-muted-foreground">Additional Product Pricing Information</label>
                                <div className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                                  <Link
                                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${customer.appUserConfig.additionalProductPricingInformation.url}`}
                                    target="_blank"
                                    className="flex items-center gap-2"
                                  >
                                    <div className="shrink-0">{getFileIcon(customer.appUserConfig.additionalProductPricingInformation.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">
                                        {customer.appUserConfig.additionalProductPricingInformation.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">Pricing Information</p>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">Company Configuration</h3>
                        </div>
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>No Configuration Available</AlertTitle>
                          <AlertDescription>
                            This user has not yet completed their company configuration setup. The configuration data will appear here once they
                            submit their onboarding information.
                          </AlertDescription>
                        </Alert>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Assigned Templates Management */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold">Assigned Templates ({customer.assignedTemplates.length})</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-2 h-8" disabled={isAssigning}>
                            {isAssigning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                            Assign
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Available Templates</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {availableTemplates
                            .filter((t) => !customer.assignedTemplates.find((at) => at.id === t.id))
                            .map((template) => (
                              <DropdownMenuItem
                                key={template.id}
                                className="cursor-pointer"
                                onClick={() => {
                                  assignTemplateToUser({
                                    userId: customerId,
                                    templateId: template.id,
                                  });
                                }}
                                disabled={isAssigning}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                {template.name}
                              </DropdownMenuItem>
                            ))}
                          {availableTemplates.filter((t) => !customer.assignedTemplates.find((at) => at.id === t.id)).length === 0 && (
                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">No templates available</div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {customer.assignedTemplates.map((template) => (
                        <Badge key={template.id} variant="secondary" className="gap-1.5 py-1.5 px-3 font-normal">
                          <FileText className="h-3.5 w-3.5" />
                          {template.name}
                          <button className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Submissions Progress */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold">Form Submissions ({customer.submissions.length})</h3>
                    <div className=" flex flex-col gap-3">
                      {customer.submissions.map((submission) => (
                        <Link className="" target="_blank" key={submission.id} href={`/viewForm/${submission.templateId}/${customerId}`}>
                          <div className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm truncate">{submission.template}</p>
                                  {submission.progress === 100 && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={submission.progress} className="h-1.5 flex-1" />
                                  <span className="text-xs font-medium text-muted-foreground min-w-[35px]">{submission.progress}%</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs text-muted-foreground">
                                  {submission.answeredQuestions}/{submission.totalQuestions}
                                </p>
                                {submission.completedAt && <p className="text-xs text-muted-foreground">{formatDate(submission.completedAt)}</p>}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Sidebar for Media */}
              <div className="w-80 border-l bg-muted/20 flex flex-col">
                <div className="p-4 border-b bg-background">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Uploaded Files</h3>
                    <Badge variant="secondary">{customer.media.length}</Badge>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-1">
                    {customer.media.length > 0 ? (
                      customer.media.map((file) => (
                        <Link key={file.id} className="cursor-pointer" href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${file.url}`} target="_blank">
                          <Button
                            variant="ghost"
                            className="w-full cursor-pointer justify-start h-auto py-2 px-2 hover:bg-background"
                            title={`${file.name} - Uploaded ${getRelativeTime(file.uploadedAt)}`}
                          >
                            <div className="flex items-center gap-2 w-full min-w-0">
                              <div className="shrink-0">{getFileIcon(file.type)}</div>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-xs font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{getRelativeTime(file.uploadedAt)}</p>
                              </div>
                            </div>
                          </Button>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="text-xs">No files uploaded</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
