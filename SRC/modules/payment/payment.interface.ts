export interface IPaymentInitPayload {
  tutorId: string;
  slot: string;
  date: string;
  amount: number;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentAddress?: string;
}

export interface ISSLCommerzCallbackPayload {
  tran_id: string;
  val_id: string;
  amount: string;
  card_type: string;
  store_amount: string;
  bank_tran_id: string;
  status: string;
  tran_date: string;
  currency: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
  verify_sign: string;
  verify_key: string;
  [key: string]: unknown;
}
