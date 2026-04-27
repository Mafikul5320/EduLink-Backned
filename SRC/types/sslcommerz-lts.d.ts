declare module "sslcommerz-lts" {
  interface SSLCommerzInitData {
    total_amount: number;
    currency: string;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    ipn_url: string;
    shipping_method: string;
    product_name: string;
    product_category: string;
    product_profile: string;
    cus_name: string;
    cus_email: string;
    cus_add1: string;
    cus_city: string;
    cus_state: string;
    cus_postcode: string;
    cus_country: string;
    cus_phone: string;
    [key: string]: unknown;
  }

  interface SSLCommerzInitResponse {
    status: string;
    faession: string;
    sessionkey: string;
    GatewayPageURL: string;
    storeBanner: string;
    storeLogo: string;
    desc: { name: string; type: string; logo: string; gw: string }[];
    redirectGatewayURL: string;
    directPaymentURLBank: string;
    directPaymentURLCard: string;
    directPaymentURL: string;
    [key: string]: unknown;
  }

  interface SSLCommerzValidationResponse {
    status: string;
    tran_date: string;
    tran_id: string;
    val_id: string;
    amount: string;
    store_amount: string;
    card_type: string;
    card_no: string;
    bank_tran_id: string;
    currency: string;
    [key: string]: unknown;
  }

  class SSLCommerzPayment {
    constructor(store_id: string, store_passwd: string, is_live: boolean);
    init(data: SSLCommerzInitData): Promise<SSLCommerzInitResponse>;
    validate(data: { val_id: string }): Promise<SSLCommerzValidationResponse>;
    orderValidate(
      data: Record<string, unknown>,
      val_id: string,
      store_amount: string,
      currency: string
    ): Promise<SSLCommerzValidationResponse>;
    transactionQueryBySessionId(
      sessionkey: string
    ): Promise<Record<string, unknown>>;
    transactionQueryByTransactionId(
      tran_id: string
    ): Promise<Record<string, unknown>>;
  }

  export = SSLCommerzPayment;
}
