export {};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions,
    ) => RazorpayInstance;
  }

  interface RazorpayInstance {
    open(): void;
    on(
      event: string,
      handler: (response: unknown) => void,
    ): void;
  }

  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    prefill?: {
      email?: string;
    };
    theme?: {
      color?: string;
    };
    modal?: {
      ondismiss?: () => void;
    };
    handler?: (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => void;
  }
}