import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma_OnlyForBetterAuth } from '@/lib/db'
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
} from '@/clients/email.client'
import { stripe } from '@better-auth/stripe'
import { stripeClient } from '@/lib/stripe'
import { STRIPE_PLANS } from '@shared/types/src/stripe'
import { config } from '@/config'
import { admin } from 'better-auth/plugins'
import { handleInvoicePaid } from '@/services/subscription.service'

export const auth = betterAuth({
  database: prismaAdapter(prisma_OnlyForBetterAuth, {
    provider: 'postgresql',
  }),
  trustedOrigins: config.trustedOrigins,
  baseURL: config.backendUrl,
  basePath: '/api/auth',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user.email, url)
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url)
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: config.providers.google.clientId,
      clientSecret: config.providers.google.clientSecret,
    },
  },
  plugins: [
    admin(),
    stripe({
      stripeClient,
      stripeWebhookSecret: config.stripe.webhookSecret,
      createCustomerOnSignUp: true,
      onEvent: async (event: any) => {
        // Handle any Stripe event
        switch (event.type) {
          case 'invoice.paid':
            await handleInvoicePaid(event)
            break
        }
      },
      subscription: {
        enabled: true,
        authorizeReference: async ({ user, referenceId }) => {
          return user.id === referenceId || user.role === 'admin'
        },
        getCheckoutSessionParams: async () => {
          return {
            params: {
              allow_promotion_codes: true,
            },
          }
        },
        plans: STRIPE_PLANS,
      },
    }),
  ],
})
