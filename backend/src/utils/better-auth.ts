export const extractSubscriptionIdFromInvoice = (invoice: any) => {
  return invoice.data.object.parent.subscription_details.subscription
}
