export interface TransactionItem {
  id: number;
  EqUuid: string;
  TxType: string;
  ChargeValue: number;
  MeterSerial: string;
  MeterUuid: string;
  MeterId: number;
  Message: string;
  Code: string;
  ResponseDate: string; // or Date if you'll parse it
  CustomerName: string;
  CustomerCode: string;
  Address: string;
  AcitvityName: string; // Note: Typo in "ActivityName"
  UserId: number;
  PaymentWalletId: number;
  created_at: string; // or Date
  updated_at: string; // or Date
  PaymentMode: string;
  Amount: number;
  AccountNumber: string;
  AsyncId: string;
  TxnStatus?: string;
  PaymentChannel: string;
  MerchantCode: string;
  TerminalId: string;
  PaymentNaration: string; // Note: Typo in "PaymentNarration"
  PaymentProduct: string;
  PaymentBy: string;
  MeterNumber: string;
  MeterType: string;
  PaymentStatusCode: string;
  PaymentStatus: string;
  PaymentMessage: string;
  ExternalTransactionId: string;
  InstitutionApprovalCode: string;
}

export interface BuyPowerResponse {
  status: 'success' | 'error';
  message: string;
  data: TransactionItem | null;
}

export interface PaymentConfirmationResponse {
  status: 'success' | 'error';
  message: string;
  data: TransactionItem | null;
}

export interface TransactionsResponse {
  status: 'success' | 'error';
  message: string;
  data: [];
}