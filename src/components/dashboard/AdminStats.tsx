import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "./StatCard";
import { Users, BookOpen, Calendar, Activity } from "lucide-react";

export const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeEvents: 0,
    systemHealth: "healthy",
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, coursesRes, eventsRes, analyticsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id").gte("event_date", new Date().toISOString()),
        supabase.from("system_analytics").select("metric_value").eq("metric_name", "server_uptime").single(),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalCourses: coursesRes.count || 0,
        activeEvents: eventsRes.data?.length || 0,
        systemHealth: "healthy",
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon={Users}
        description="All registered users"
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
        value={stats.systemHealth}
        icon={Activity}
        description="Server status"
      />
    </div>
  );
};
