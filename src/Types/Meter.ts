// First, define the response types
export interface Meter {
  id: number;
  EqUuid: string;
  MeterSerial: string;
  MeterId: string;
  MeterNumber: string;
  AccountNumber: string | null;
  SPN: string;
  MeterProvider: string;
  MeterModel: string | null;
  UserId: number;
  RegionId: string;
  DistrictId: string;
  CardType: string;
  MeterType: string;
  MeterBrand: string | null;
  MeteringSystem: string | null;
  CardId: string | null;
  cardBuffer: string | null;
  SystemCode: string | null;
  DistrictCode: string | null;
  MeterCategory: string | null;
  MeterActivityName: string | null;
  MeterMinAmount: number | null;
  MeterMaxAmount: number | null;
  MeterLastChargeDate: string | null;
  MeterLastChargeValue: number | null;
  TotalPenalties: number | null;
  LastMonthKwh: number | null;
  LastMonthMoney: number | null;
  AvailableCredit: number | null;
  TotalCreditAdjustment: number | null;
  TotalDebitAdjustment: number | null;
  CmsRegionDistrict: string;
  FullMeterCode: string | null;
  CustomerName: string;
  CustomerAddress: string;
  created_at: string;
  updated_at: string;
}

export interface GetAllMetersResponse {
  status: 'success' | 'error';
  message: string;
  data: Meter[];
}

