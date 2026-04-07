"use client";
import { useEffect, useState } from "react";
import AuthCard from "@/components/AuthCard";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyEmail, useSendVerificationEmail } from "@/hooks/api/useAuth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verified, setVerified] = useState(false);
  
  const verifyMutation = useVerifyEmail();
  const resendMutation = useSendVerificationEmail();

  const token = searchParams.get("token");

  useEffect(() => {
    if (token && !verified && !verifyMutation.isPending) {
      verifyMutation.mutate(token, {
        onSuccess: (result) => {
          if (result.error) {
            toast.error(result.error.message || "Verification failed");
          } else {
            localStorage.removeItem("pendingVerificationEmail");
            setVerified(true);
            toast.success("Email verified successfully!");

            setTimeout(() => router.push("/dashboard"), 2000);
          }
        },
        onError: () => {
          toast.error("An error occurred during verification.");
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, verified, verifyMutation.isPending]);

  async function handleResend() {
    const email = localStorage.getItem("pendingVerificationEmail");
    
    if (!email) {
      toast.error("Email not found. Please sign up again.");
      router.push("/signup");
      return;
    }

    const callbackURL = `${process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}/verify`;

    resendMutation.mutate(
      {
        email,
        callbackURL,
      },
      {
        onSuccess: (result) => {
          if (result.error) {
            toast.error(result.error.message || "Failed to resend verification email");
          } else {
            toast.success("Verification email sent! Please check your inbox.");
          }
        },
        onError: () => {
          toast.error("An error occurred. Please try again.");
        },
      }
    );
  }

  if (verifyMutation.isPending) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <AuthCard title="Verifying...">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-4">Verifying your email...</p>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <AuthCard title="Email Verified!">
          <div className="text-center py-8">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-sm text-muted-foreground">
              Your email has been verified. Redirecting to dashboard...
            </p>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <AuthCard title="Check your email">
        <div className="space-y-4 py-4">
          <div className="text-center text-muted-foreground space-y-3">
            <svg
              className="mx-auto h-16 w-16 text-[var(--color-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-base">
              We&apos;ve sent a verification link to your email address.
            </p>
            <p className="text-sm">
              Please check your inbox and click the link to verify your account.
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Didn&apos;t receive the email?{" "}
              <button
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="text-[var(--color-primary)] underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendMutation.isPending ? "Sending..." : "Resend"}
              </button>
            </p>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}
