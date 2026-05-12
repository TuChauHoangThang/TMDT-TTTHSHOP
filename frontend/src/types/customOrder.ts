// ============================================================
// Types for Custom Order / RFQ (Request for Quotation) Feature
// ============================================================

export type CustomOrderStatus =
  | 'OPEN'         // Đang chờ báo giá từ nhà thầu
  | 'QUOTED'       // Đã nhận ít nhất 1 báo giá
  | 'IN_PROGRESS'  // Khách đã chọn nhà thầu, đang thực hiện
  | 'COMPLETED'    // Hoàn thành
  | 'CANCELLED';   // Đã hủy

export type QuoteStatus =
  | 'PENDING'    // Chờ khách hàng xem xét
  | 'ACCEPTED'   // Khách hàng đã chọn báo giá này
  | 'REJECTED'   // Bị từ chối (khách chọn báo giá khác)
  | 'WITHDRAWN'; // Nhà thầu tự rút báo giá

export type FurnitureType =
  | 'Sofa & Ghế'
  | 'Bàn & Ghế'
  | 'Giường Ngủ'
  | 'Tủ & Kệ'
  | 'Bàn Làm Việc'
  | 'Nội thất nhà bếp'
  | 'Nội thất ngoài trời'
  | 'Khác';

export interface CustomOrderImage {
  id: number;
  requestId: number;
  imageUrl: string;
}

export interface CustomOrderQuote {
  id: number;
  requestId: number;
  contractorId: number;
  contractorName: string;
  shopId: number;
  shopName: string;
  shopLogo?: string;
  shopRating: number;
  quotedPrice: number;
  estimatedDays: number;
  note: string;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomOrderRequest {
  id: number;
  customerId: number;
  customerName: string;
  title: string;
  description: string;
  furnitureType: FurnitureType | string;
  material: string;
  dimensions: string;
  colorStyle: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;           // ISO date string
  status: CustomOrderStatus;
  imageUrls: string[];
  quotes: CustomOrderQuote[];
  quoteCount: number;
  selectedQuoteId?: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Form DTOs ----

export interface CreateCustomOrderDto {
  title: string;
  description: string;
  furnitureType: string;
  material: string;
  dimensions: string;
  colorStyle: string;
  budgetMin: number | '';
  budgetMax: number | '';
  deadline: string;
  images: File[];
}

export interface SubmitQuoteDto {
  quotedPrice: number | '';
  estimatedDays: number | '';
  note: string;
}
