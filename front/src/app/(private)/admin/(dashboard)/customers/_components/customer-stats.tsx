import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, TrendingUp } from "lucide-react";

interface StatsData {
  totalCustomers: number;
  customersChange: string;
  activeCustomers: number;
  activeChange: string;
  avgCompletion: number;
  completionChange: string;
  newThisWeek: number;
  newChange: string;
}

interface CustomerStatsProps {
  stats: StatsData;
}

export function CustomerStats({ stats }: CustomerStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-md font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-green-600 font-medium">{stats.customersChange}</span> today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-md font-medium">Active Customers</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCustomers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-green-600 font-medium">{stats.activeChange}</span> actively completing forms
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-md font-medium">Avg. Completion</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgCompletion}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-green-600 font-medium">{stats.completionChange}</span> from last week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-md font-medium">New Recent</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newThisWeek}</div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-green-600 font-medium">{stats.newChange}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
