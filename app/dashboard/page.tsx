"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user, loading, resendVerification } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      toast({
        title: "Success",
        description: "Verification email has been sent.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send verification email.",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <main className="flex-1">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <div className="grid gap-6">
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Welcome back, {user.name}!</h2>
              {!user.email_verified_at && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                  <p className="text-yellow-800 mb-2">Please verify your email address.</p>
                  <Button
                    variant="outline"
                    onClick={handleResendVerification}
                  >
                    Resend Verification Email
                  </Button>
                </div>
              )}
              <p className="text-muted-foreground">
                You are now signed in to your account.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}