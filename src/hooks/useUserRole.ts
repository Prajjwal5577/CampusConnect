import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "faculty" | "student";

export const useUserRole = (user: User | null) => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryRole, setPrimaryRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching roles:", error);
        setLoading(false);
        return;
      }

      const userRoles = data?.map((r) => r.role as UserRole) || [];
      setRoles(userRoles);
      
      // Set primary role priority: admin > faculty > student
      if (userRoles.includes("admin")) {
        setPrimaryRole("admin");
      } else if (userRoles.includes("faculty")) {
        setPrimaryRole("faculty");
      } else if (userRoles.includes("student")) {
        setPrimaryRole("student");
      }
      
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = hasRole("admin");
  const isFaculty = hasRole("faculty");
  const isStudent = hasRole("student");

  return { 
    roles, 
    primaryRole, 
    loading, 
    hasRole, 
    isAdmin, 
    isFaculty, 
    isStudent 
  };
};
