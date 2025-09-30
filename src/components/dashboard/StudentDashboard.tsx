import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "./DashboardLayout";
import StatCard from "./StatCard";
import { BookOpen, Calendar, Bell, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface StudentDashboardProps {
  user: User;
}

const StudentDashboard = ({ user }: StudentDashboardProps) => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    upcomingEvents: 0,
    pendingAssignments: 0,
    attendancePercentage: 0,
  });
  const [notices, setNotices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch notices
    const { data: noticesData } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (noticesData) setNotices(noticesData);

    // Fetch upcoming events
    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(5);

    if (eventsData) {
      setEvents(eventsData);
      setStats(prev => ({ ...prev, upcomingEvents: eventsData.length }));
    }

    // Fetch assignments
    const { data: assignmentsData } = await supabase
      .from("assignments")
      .select("*, courses(name)")
      .gte("due_date", new Date().toISOString())
      .order("due_date", { ascending: true })
      .limit(5);

    if (assignmentsData) {
      setAssignments(assignmentsData);
      setStats(prev => ({ ...prev, pendingAssignments: assignmentsData.length }));
    }

    // Calculate attendance (mock for now)
    setStats(prev => ({ ...prev, attendancePercentage: 85, totalCourses: 6 }));
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your courses today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            description="Enrolled this semester"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon={Calendar}
            description="Next 7 days"
          />
          <StatCard
            title="Pending Assignments"
            value={stats.pendingAssignments}
            icon={Bell}
            description="Due soon"
          />
          <StatCard
            title="Attendance"
            value={`${stats.attendancePercentage}%`}
            icon={CheckCircle}
            description="This semester"
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Notices */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notices</CardTitle>
              <CardDescription>Important announcements and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notices.length > 0 ? (
                notices.map((notice) => (
                  <div key={notice.id} className="border-l-2 border-primary pl-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{notice.title}</h4>
                      <Badge variant={
                        notice.priority === "urgent" ? "destructive" :
                        notice.priority === "high" ? "default" : "secondary"
                      }>
                        {notice.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No notices available</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Assignments due soon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <div key={assignment.id} className="border-l-2 border-secondary pl-4 space-y-1">
                    <h4 className="font-semibold">{assignment.title}</h4>
                    <p className="text-sm text-muted-foreground">{assignment.courses?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No pending assignments</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Campus events and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg border card-hover">
                    <div className="flex-shrink-0">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        {event.location && <span>📍 {event.location}</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
