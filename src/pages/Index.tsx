import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, Calendar, Users, FileText, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-secondary py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="p-4 bg-white rounded-full shadow-xl">
              <GraduationCap className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Campus Connect
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
              Smart Campus Management System for Modern Education
            </p>
            <div className="flex gap-4 mt-8">
              <Button size="lg" onClick={() => navigate("/auth")} className="bg-white text-primary hover:bg-white/90">
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-white border-white hover:bg-white/10">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive tools for students, faculty, and administrators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-lg border bg-card card-hover">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Attendance</h3>
              <p className="text-muted-foreground">
                Track and manage attendance with ease. Real-time updates and analytics.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card card-hover">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Assignment Management</h3>
              <p className="text-muted-foreground">
                Create, submit, and grade assignments all in one place.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card card-hover">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Events & Notices</h3>
              <p className="text-muted-foreground">
                Stay updated with campus events and important announcements.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card card-hover">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
              <p className="text-muted-foreground">
                Comprehensive insights into academic performance and activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-secondary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Campus?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join thousands of students and faculty using Campus Connect
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="bg-white text-primary hover:bg-white/90">
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
