import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import StatCard from "./StatCard";
import { BookOpen, FileText, Calendar, Users } from "lucide-react";

interface FacultyStatsProps {
  user: User;
}

export const FacultyStats = ({ user }: FacultyStatsProps) => {
  const [stats, setStats] = useState({
    assignedCourses: 0,
    pendingGrading: 0,
    upcomingEvents: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [coursesRes, submissionsRes, eventsRes, enrollmentsRes] = await Promise.all([
        supabase.from("course_faculty").select("id", { count: "exact" }).eq("faculty_id", user.id),
        supabase.from("submissions").select("id", { count: "exact" }).is("grade", null),
        supabase.from("event_registrations").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase
          .from("course_enrollments")
          .select("student_id")
          .in(
            "course_id",
            (await supabase.from("course_faculty").select("course_id").eq("faculty_id", user.id)).data?.map((c) => c.course_id) || []
          ),
      ]);

      setStats({
        assignedCourses: coursesRes.count || 0,
        pendingGrading: submissionsRes.count || 0,
        upcomingEvents: eventsRes.count || 0,
        totalStudents: enrollmentsRes.data?.length || 0,
      });
    };

    fetchStats();
  }, [user.id]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Assigned Courses"
        value={stats.assignedCourses}
        icon={BookOpen}
        description="Your courses"
      />
      <StatCard
        title="Pending Grading"
        value={stats.pendingGrading}
        icon={FileText}
        description="Submissions to grade"
      />
      <StatCard
        title="Event Participation"
        value={stats.upcomingEvents}
        icon={Calendar}
        description="Registered events"
      />
      <StatCard
        title="Total Students"
        value={stats.totalStudents}
        icon={Users}
        description="In your courses"
      />
    </div>
  );
};
