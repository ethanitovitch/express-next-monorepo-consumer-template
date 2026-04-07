"use client";

import { useState } from "react";
import { Page } from "@/components/dashboard/Page";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useHasPasswordAuth, useUserCreditBalance } from "@/hooks/api/useUser";
import { useChangePassword } from "@/hooks/api/useAuth";
import {
  useCreateCheckoutSession,
  useUserSubscription,
  useCreatePortalSession,
} from "@/hooks/api/useStripe";
import { STRIPE_PLANS } from "@shared/types/src";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const hasPasswordAuth = useHasPasswordAuth();
  const userId = user?.id;

  const changePasswordMutation = useChangePassword();
  const createCheckoutSession = useCreateCheckoutSession();
  const createPortalSession = useCreatePortalSession();
  const { data: subscription, isLoading: subscriptionLoading } = useUserSubscription(userId);
  const { data: creditBalance, isLoading: creditBalanceLoading } =
    useUserCreditBalance(userId);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill in all password fields");
    }

    if (newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    changePasswordMutation.mutate(
      { currentPassword: oldPassword, newPassword },
      {
        onSuccess: (result) => {
          const response = result as { error?: { message?: string } };
          if (response.error) {
            toast.error(response.error.message || "Failed to change password");
            return;
          }
          toast.success("Password changed successfully!");
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: () => {
          toast.error("An error occurred. Please try again.");
        },
      },
    );
  };

  const handleUpgrade = async () => {
    if (!userId) return;
    const proPlan = STRIPE_PLANS[0];
    createCheckoutSession.mutate(
      { planName: proPlan.name, userId },
      {
        onSuccess: (result) => {
          const data = result as unknown as { error?: { message?: string }; data?: { url?: string } };
          if (data.error) {
            toast.error(data.error.message || "Failed to create checkout session");
          } else if (data.data?.url) {
            window.location.href = data.data.url;
          }
        },
        onError: () => toast.error("Failed to start checkout"),
      },
    );
  };

  const handleManageBilling = async () => {
    if (!userId) return;
    createPortalSession.mutate(
      { userId },
      {
        onSuccess: (result) => {
          const data = result as unknown as { error?: { message?: string }; data?: { url?: string } };
          if (data.error) {
            toast.error(data.error.message || "Failed to open billing portal");
          } else if (data.data?.url) {
            window.location.href = data.data.url;
          }
        },
        onError: () => toast.error("Failed to open billing portal"),
      },
    );
  };

  return (
    <Page title="Settings" subtitle="Manage your account and billing settings">
      <div className="space-y-6">
        <Card title="Account">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                  <p className="text-foreground">{user?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <p className="text-foreground">{user?.email || "N/A"}</p>
                </div>
              </div>
            </div>

            {hasPasswordAuth && (
              <>
                <div className="border-t border-border" />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Current Password"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                      />
                      <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={changePasswordMutation.isPending}>
                        Update Password
                      </Button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card title="Billing">
          {subscriptionLoading ? (
            <div className="text-sm text-muted-foreground">Loading subscription...</div>
          ) : subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-primary)]/10 rounded-lg border border-[var(--color-primary)]/20">
                <div>
                  <p className="font-semibold text-foreground">
                    {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.status === "active" ? "Active" : subscription.status}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleManageBilling}
                  disabled={createPortalSession.isPending}
                >
                  Manage Billing
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg border border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Interview Credits</p>
                  <p className="text-sm text-muted-foreground">
                    Available credits on your account
                  </p>
                </div>
                <div className="text-right">
                  {creditBalanceLoading ? (
                    <p className="text-2xl font-bold text-muted-foreground">...</p>
                  ) : (
                    <p className="text-2xl font-bold text-green-600">{creditBalance ?? 0}</p>
                  )}
                  <p className="text-xs text-muted-foreground">credits remaining</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg border border-border flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Currently on: Free Plan</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro to unlock premium features
                </p>
              </div>
              <Button onClick={handleUpgrade} disabled={createCheckoutSession.isPending || !userId}>
                Upgrade to Pro
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}
