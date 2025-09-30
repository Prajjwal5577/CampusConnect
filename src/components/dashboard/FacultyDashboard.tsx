import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "./DashboardLayout";
import StatCard from "./StatCard";
import { Users, FileText, Calendar, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FacultyDashboardProps {
  user: User;
}

const FacultyDashboard = ({ user }: FacultyDashboardProps) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    pendingGrading: 0,
    upcomingClasses: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data for demonstration
    setStats({
      totalStudents: 120,
      totalCourses: 4,
      pendingGrading: 15,
      upcomingClasses: 3,
    });
  };

  return (
    <DashboardLayout userRole="faculty">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and students</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            description="Across all courses"
          />
          <StatCard
            title="Active Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            description="This semester"
          />
          <StatCard
            title="Pending Grading"
            value={stats.pendingGrading}
            icon={FileText}
            description="Assignments to review"
          />
          <StatCard
            title="Classes Today"
            value={stats.upcomingClasses}
            icon={Calendar}
            description="Scheduled lectures"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
            <Button className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
            <Button className="w-full" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Post Notice
            </Button>
            <Button className="w-full" variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              View Courses
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest assignment submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Classes</CardTitle>
              <CardDescription>Your schedule for today</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No classes scheduled</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
