import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "./DashboardLayout";
import StatCard from "./StatCard";
import { Users, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeEvents: 0,
    systemHealth: 100,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: courseCount } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });

    const { count: eventCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("event_date", new Date().toISOString());

    setStats({
      totalUsers: userCount || 0,
      totalCourses: courseCount || 0,
      activeEvents: eventCount || 0,
      systemHealth: 100,
    });
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            description="Students, Faculty & Staff"
          />
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            description="Active courses"
          />
          <StatCard
            title="Active Events"
            value={stats.activeEvents}
            icon={Calendar}
            description="Upcoming events"
          />
          <StatCard
            title="System Health"
            value={`${stats.systemHealth}%`}
            icon={TrendingUp}
            description="All systems operational"
          />
        </div>

        {/* Management Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Total registered users: {stats.totalUsers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>Manage courses and curriculum</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Active courses: {stats.totalCourses}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
              <CardDescription>Manage campus events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upcoming events: {stats.activeEvents}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>Performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                System running smoothly
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
