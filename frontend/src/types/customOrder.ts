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

  // Thông tin nhà thầu (Cá nhân)
  contractorId: number;
  contractorName: string;
  contractorPhone?: string; // Số điện thoại từ DB (Bổ sung mới)

  // Thông tin cửa hàng/doanh nghiệp
  shopId: number;
  shopName: string;
  shopSlug?: string;
  shopLogo?: string;
  shopRating: number;
  shopAddress?: string;      // Địa chỉ cửa hàng từ DB (Bổ sung mới)
  completedOrders?: number;  // Số đơn đã làm (Bổ sung mới)

  // Thông tin báo giá
  quotedPrice: number;
  estimatedDays: number;
  note: string;
  status: QuoteStatus;
  imageUrls?: string[];      // Ảnh báo giá/demo của nhà thầu

  createdAt: string;
  updatedAt: string;
}

export interface CustomOrderRequest {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone?: string;     // SĐT khách hàng (để nhà thầu liên hệ sau khi được chọn)

  title: string;
  description: string;
  furnitureType: FurnitureType | string;
  material: string;
  dimensions: string;
  colorStyle: string;

  budgetMin: number;
  budgetMax: number;
  deadline: string;           // ISO date string (YYYY-MM-DD)
  status: CustomOrderStatus;

  imageUrls: string[];        // Danh sách link ảnh tham khảo
  quotes: CustomOrderQuote[]; // Danh sách các báo giá nhận được
  quoteCount: number;

  selectedQuoteId?: number;   // ID của báo giá đã được khách chọn
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------
// Form DTOs (Data Transfer Objects) - Dùng khi gửi dữ liệu lên Server
// ------------------------------------------------------------

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
  images: File[];             // Mảng file thực tế để upload multipart
}

export interface SubmitQuoteDto {
  quotedPrice: number | '';
  estimatedDays: number | '';
  note: string;
  imageUrls?: string[];       // Danh sách link ảnh đã upload
}