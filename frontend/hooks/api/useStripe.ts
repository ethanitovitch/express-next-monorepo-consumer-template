import { useMutation, useQuery } from "@tanstack/react-query";
import { subscription } from "@/lib/auth-client";

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: async ({ 
      planName, 
      userId
    }: { 
      planName: string; 
      userId: string;
    }) => {
      return await subscription.upgrade({
        plan: planName,
        referenceId: userId,
        successUrl: `${window.location.origin}/dashboard/settings?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/settings?canceled=true`
      });
    },
  });
};

export const useUserSubscription = (userId?: string) => {
  return useQuery({
    queryKey: ["user-subscription", userId],
    queryFn: async () => {
      if (!userId) return null;
      const subscriptions = await subscription.list({
        query: {
          referenceId: userId,
        },
      });
      return subscriptions.data?.[0] || null;
    },
    enabled: !!userId,
  });
};

export const useCreatePortalSession = () => {
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      return await subscription.billingPortal({
        referenceId: userId,
        returnUrl: `${window.location.origin}/dashboard/settings`,
      });
    },
  });
};

