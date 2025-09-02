import { Meter } from "./Meter";

// types/wallet.ts
export interface Wallet {
  id: number;
  EqUuid: string;
  Name: string;
  AccNumber: string;
  Image: string | '';
  Network: 'MTN' | 'TELECEL' | 'AIRTELTIGO';
  Type: 'momo';
  IsDefault: boolean,
  UserId: number;
  created_at: string;
  updated_at: string;
}

export interface WalletsResponse {
  status: 'success' | 'error';
  message: string;
  data: Wallet[];
}


// Define the form data type
export interface MeterFormData {
//   PhoneNumber: string;
  MeterNumber: string;
  MeterCategory: 'prepaid' | 'postpaid';
//   Alias: string;
//   AccountNumber: string;
}


// First, define the response types
export interface MeterResponseData {
  id: string;
  PhoneNumber: string;
  MeterNumber: string;
  MeterCategory: 'prepaid' | 'postpaid';
  Alias?: string;
  AccountNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeterResponse {
  status: 'success' | 'error';
  message: string;
  data: Meter | null;
}