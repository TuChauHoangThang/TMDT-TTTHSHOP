package com.example.backend;

import com.example.backend.dto.ProductDto;
import com.example.backend.entity.Category;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.service.CategoryService;
import com.example.backend.service.ProductService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryService categoryService;
    private final ProductService productService;

    public DataSeeder(CategoryRepository categoryRepository, ProductRepository productRepository, CategoryService categoryService, ProductService productService) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.categoryService = categoryService;
        this.productService = productService;
    }

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0 && productRepository.count() == 0) {
            System.out.println("Seeding Data...");
            seedCategoriesAndProducts();
            System.out.println("Seeding Completed.");
        }
    }

    private void seedCategoriesAndProducts() {
        // 1. Seed Categories
        Category catSofa = createCategory("Sofa & Ghế", "sofa-ghe", "fa fa-couch", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80");
        Category catBanGhe = createCategory("Bàn Ghế", "ban-ghe", "fa fa-chair", "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80");
        Category catGiuong = createCategory("Giường Ngủ", "giuong-ngu", "fa fa-bed", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80");
        Category catTuKe = createCategory("Tủ & Kệ", "tu-ke", "fa fa-box", "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80");
        Category catDen = createCategory("Đèn Trang Trí", "den-trang-tri", "fa fa-lightbulb", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80");

        // 2. Seed Products (30 items total, 6 per category)

        // --- SOFA & GHẾ (6 items) ---
        createProduct("Sofa Gỗ Óc Chó 3 Chỗ Ngồi", "sf001-sofa-go-oc-cho", catSofa.getId(), 
                new BigDecimal("18500000"), new BigDecimal("22000000"), false, new BigDecimal("4.5"), 48, 
                List.of("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"), List.of("HOT"));
        createProduct("Ghế Armchair Gỗ Cao Su", "gh011-ghe-armchair", catSofa.getId(), 
                new BigDecimal("5800000"), null, false, new BigDecimal("4.5"), 29, 
                List.of("https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80"), List.of("HOT"));
        createProduct("Sofa Góc L Vải Nhung", "sf005-sofa-goc-l", catSofa.getId(), 
                null, null, true, new BigDecimal("5.0"), 41, 
                List.of("https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80"), List.of());
        createProduct("Ghế Thư Giãn Phong Cách Nhật", "sf006-ghe-thu-gian", catSofa.getId(), 
                new BigDecimal("4200000"), new BigDecimal("4900000"), false, new BigDecimal("4.0"), 12, 
                List.of("https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80"), List.of("-15%"));
        createProduct("Sofa Đơn Vải Bố Lanh", "sf007-sofa-don", catSofa.getId(), 
                new BigDecimal("3500000"), null, false, new BigDecimal("4.8"), 66, 
                List.of("https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&q=80"), List.of("BESTSELLER"));
        createProduct("Sofa Da Thật 2 Chỗ Ngồi", "sf008-sofa-da", catSofa.getId(), 
                new BigDecimal("32000000"), new BigDecimal("35000000"), false, new BigDecimal("4.9"), 8, 
                List.of("https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&q=80"), List.of("CAO CẤP"));

        // --- BÀN GHẾ (6 items) ---
        createProduct("Bộ Bàn Ăn Gỗ Sồi 6 Ghế", "ba006-bo-ban-an", catBanGhe.getId(), 
                new BigDecimal("24900000"), null, false, new BigDecimal("5.0"), 32, 
                List.of("https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80"), List.of("MỚI"));
        createProduct("Bàn Trà Mặt Kính Khung Thép", "bt002-ban-tra", catBanGhe.getId(), 
                new BigDecimal("3200000"), new BigDecimal("3900000"), false, new BigDecimal("5.0"), 15, 
                List.of("https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=400&q=80"), List.of());
        createProduct("Bàn Làm Việc Gỗ Tràm", "blv01-ban-lam-viec", catBanGhe.getId(), 
                new BigDecimal("4500000"), null, false, new BigDecimal("4.2"), 55, 
                List.of("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80"), List.of());
        createProduct("Ghế Ăn Bọc Nệm Da", "ga02-ghe-an", catBanGhe.getId(), 
                new BigDecimal("1200000"), new BigDecimal("1500000"), false, new BigDecimal("4.6"), 80, 
                List.of("https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=80"), List.of("-20%"));
        createProduct("Bàn Cafe Tròn Mặt Đá", "bc01-ban-cafe", catBanGhe.getId(), 
                new BigDecimal("2800000"), null, false, new BigDecimal("4.1"), 10, 
                List.of("https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&q=80"), List.of());
        createProduct("Bộ Bàn Ghế Sân Vườn Nhôm Đúc", "bg03-ban-ghe-san-vuon", catBanGhe.getId(), 
                new BigDecimal("15600000"), null, false, new BigDecimal("4.8"), 5, 
                List.of("https://images.unsplash.com/photo-1416879598056-0c822e11f185?w=400&q=80"), List.of("NGOÀI TRỜI"));

        // --- GIƯỜNG NGỦ (6 items) ---
        createProduct("Giường Ngủ Gỗ Walnut King Size", "gn003-giuong-ngu-go-walnut", catGiuong.getId(), 
                new BigDecimal("15200000"), new BigDecimal("17900000"), false, new BigDecimal("4.0"), 21, 
                List.of("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80"), List.of("-15%"));
        createProduct("Giường Gỗ Sồi Hiện Đại 1m6", "gn004-giuong-go-soi", catGiuong.getId(), 
                new BigDecimal("8500000"), null, false, new BigDecimal("4.7"), 110, 
                List.of("https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80"), List.of("HOT"));
        createProduct("Giường Ngủ Bọc Nệm Đầu Giường", "gn005-giuong-boc-nem", catGiuong.getId(), 
                new BigDecimal("12500000"), new BigDecimal("14000000"), false, new BigDecimal("4.3"), 34, 
                List.of("https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=80"), List.of());
        createProduct("Giường Tầng Trẻ Em Chống Mối Mọt", "gn006-giuong-tang", catGiuong.getId(), 
                new BigDecimal("18000000"), null, false, new BigDecimal("4.9"), 42, 
                List.of("https://images.unsplash.com/photo-1617325247661-675ab03407d3?w=400&q=80"), List.of("TRẺ EM"));
        createProduct("Giường Pallet Gỗ Thông", "gn007-giuong-pallet", catGiuong.getId(), 
                new BigDecimal("2500000"), new BigDecimal("3000000"), false, new BigDecimal("4.1"), 200, 
                List.of("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80"), List.of("GIÁ RẺ"));
        createProduct("Giường Ngủ Cổ Điển Hoàng Gia", "gn008-giuong-co-dien", catGiuong.getId(), 
                null, null, true, new BigDecimal("5.0"), 3, 
                List.of("https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80"), List.of("CAO CẤP"));

        // --- TỦ & KỆ (6 items) ---
        createProduct("Kệ Sách Đa Năng Gỗ Thông", "ks009-ke-sach", catTuKe.getId(), 
                null, null, true, new BigDecimal("4.5"), 67, 
                List.of("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"), List.of());
        createProduct("Kệ TV Gỗ Thông Nguyên Tấm", "ktv05-ke-tv", catTuKe.getId(), 
                new BigDecimal("7100000"), new BigDecimal("7900000"), false, new BigDecimal("4.0"), 38, 
                List.of("https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&q=80"), List.of("-10%"));
        createProduct("Tủ Quần Áo Cửa Lùa Cao Cấp", "tq01-tu-quan-ao", catTuKe.getId(), 
                new BigDecimal("14500000"), null, false, new BigDecimal("4.6"), 25, 
                List.of("https://images.unsplash.com/photo-1595526114101-1b9a1eb3d327?w=400&q=80"), List.of("MỚI"));
        createProduct("Tủ Đầu Giường 2 Ngăn", "tdg02-tu-dau-giuong", catTuKe.getId(), 
                new BigDecimal("1200000"), new BigDecimal("1500000"), false, new BigDecimal("4.2"), 150, 
                List.of("https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&q=80"), List.of());
        createProduct("Tủ Giày Cửa Chớp Thông Hơi", "tg03-tu-giay", catTuKe.getId(), 
                new BigDecimal("3500000"), null, false, new BigDecimal("4.8"), 60, 
                List.of("https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=400&q=80"), List.of("BÁN CHẠY"));
        createProduct("Kệ Trang Trí Treo Tường Khung Thép", "ktt04-ke-trang-tri", catTuKe.getId(), 
                new BigDecimal("850000"), new BigDecimal("1000000"), false, new BigDecimal("4.4"), 95, 
                List.of("https://images.unsplash.com/photo-1505069190533-da1c9af13346?w=400&q=80"), List.of("-15%"));

        // --- ĐÈN TRANG TRÍ (6 items) ---
        createProduct("Đèn Thả Trần Mây Tre Đan", "dt018-den-tha-tran", catDen.getId(), 
                new BigDecimal("1950000"), null, false, new BigDecimal("4.5"), 22, 
                List.of("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80"), List.of("MỚI"));
        createProduct("Đèn Bàn Đọc Sách Kiểu Dáng Công Nghiệp", "db02-den-ban", catDen.getId(), 
                new BigDecimal("850000"), new BigDecimal("1200000"), false, new BigDecimal("4.7"), 120, 
                List.of("https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80"), List.of("-30%"));
        createProduct("Đèn Cây Đứng Góc Sofa", "dc03-den-cay", catDen.getId(), 
                new BigDecimal("2100000"), null, false, new BigDecimal("4.3"), 45, 
                List.of("https://images.unsplash.com/photo-1524484485831-a92fa817e4bb?w=400&q=80"), List.of());
        createProduct("Đèn Tường Phong Cách Cổ Điển", "dt04-den-tuong", catDen.getId(), 
                new BigDecimal("1100000"), null, false, new BigDecimal("4.6"), 30, 
                List.of("https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&q=80"), List.of());
        createProduct("Đèn Chùm Thủy Tinh Khung Đồng", "dc05-den-chum", catDen.getId(), 
                new BigDecimal("8500000"), new BigDecimal("9500000"), false, new BigDecimal("4.9"), 15, 
                List.of("https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&q=80"), List.of("CAO CẤP"));
        createProduct("Đèn LED Âm Trần Thông Minh", "dl06-den-led", catDen.getId(), 
                new BigDecimal("250000"), null, false, new BigDecimal("4.1"), 500, 
                List.of("https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&q=80"), List.of("SMARTHOME"));

    }

    private Category createCategory(String name, String slug, String icon, String image) {
        ProductDto.CategoryRequest req = new ProductDto.CategoryRequest();
        req.setName(name);
        req.setSlug(slug);
        req.setIcon(icon);
        req.setImageUrl(image);
        req.setDescription(name + " chất lượng cao.");
        ProductDto.CategoryResponse res = categoryService.createCategory(req);
        return categoryRepository.findById(res.getId()).get();
    }

    private void createProduct(String name, String slug, Long categoryId, BigDecimal priceCur, BigDecimal priceOri, boolean priceContact, BigDecimal rating, int count, List<String> images, List<String> badges) {
        ProductDto.CreateProductRequest req = new ProductDto.CreateProductRequest();
        req.setName(name);
        req.setSlug(slug);
        req.setCategoryId(categoryId);
        req.setPriceCurrent(priceCur);
        req.setPriceOriginal(priceOri);
        req.setPriceContact(priceContact);
        req.setRatingStars(rating);
        req.setRatingCount(count);
        req.setImageUrls(images);
        req.setBadges(badges);
        req.setDescription("Mô tả chi tiết cho sản phẩm " + name + ". Sản phẩm được chế tác từ những vật liệu tốt nhất, đảm bảo độ bền và tính thẩm mỹ cao. Phù hợp cho nhiều không gian kiến trúc khác nhau, từ cổ điển đến hiện đại. Chế độ bảo hành dài hạn mang lại sự an tâm cho khách hàng.");
        productService.createProduct(req);
    }
}
