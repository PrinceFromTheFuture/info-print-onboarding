import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TableCell, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";

interface CustomerTableRowProps {
  customer: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    assignedTemplates: { id: string; name: string }[];
    onboardingProgress: number;
  };
  onClick: () => void;
  getRelativeTime: (date: string) => string;
}

export function CustomerTableRow({ customer, onClick, getRelativeTime }: CustomerTableRowProps) {
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onClick}>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{customer.name}</p>
            <p className="text-sm text-muted-foreground capitalize">{customer.role}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">{customer.email}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="font-normal">
            {customer.assignedTemplates.length} templates
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Progress value={customer.onboardingProgress} className="w-24 h-2" />
          <span className="text-sm font-medium min-w-[40px]">{customer.onboardingProgress}%</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {getRelativeTime(customer.createdAt)}
        </div>
      </TableCell>
    </TableRow>
  );
}
