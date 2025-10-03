import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import StatCard from "./StatCard";
import { BookOpen, Calendar, FileText, TrendingUp } from "lucide-react";

interface StudentStatsProps {
  user: User;
}

export const StudentStats = ({ user }: StudentStatsProps) => {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    upcomingEvents: 0,
    pendingAssignments: 0,
    attendancePercent: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [coursesRes, eventsRes, assignmentsRes, attendanceRes] = await Promise.all([
        supabase.from("course_enrollments").select("id", { count: "exact" }).eq("student_id", user.id).eq("status", "active"),
        supabase.from("event_registrations").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "registered"),
        supabase.from("assignments").select("id").gte("due_date", new Date().toISOString()),
        supabase.from("attendance").select("status").eq("student_id", user.id),
      ]);

      const totalAttendance = attendanceRes.data?.length || 0;
      const presentCount = attendanceRes.data?.filter((a) => a.status === "present").length || 0;
      const attendancePercent = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      setStats({
        enrolledCourses: coursesRes.count || 0,
        upcomingEvents: eventsRes.count || 0,
        pendingAssignments: assignmentsRes.data?.length || 0,
        attendancePercent,
      });
    };

    fetchStats();
  }, [user.id]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Enrolled Courses"
        value={stats.enrolledCourses}
        icon={BookOpen}
        description="Active enrollments"
      />
      <StatCard
        title="Upcoming Events"
        value={stats.upcomingEvents}
        icon={Calendar}
        description="Registered events"
      />
      <StatCard
        title="Pending Assignments"
        value={stats.pendingAssignments}
        icon={FileText}
        description="Due assignments"
      />
      <StatCard
        title="Attendance"
        value={`${stats.attendancePercent}%`}
        icon={TrendingUp}
        description="Overall attendance"
      />
    </div>
  );
};
