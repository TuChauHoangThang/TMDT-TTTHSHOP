package com.example.backend;

import com.example.backend.dto.ProductDto;
import com.example.backend.entity.Category;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.service.CategoryService;
import com.example.backend.service.ProductService;
import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import com.example.backend.entity.Shop;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.ShopRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryService categoryService;
    private final ProductService productService;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(CategoryRepository categoryRepository,
                      ProductRepository productRepository,
                      CategoryService categoryService,
                      ProductService productService,
                      UserRepository userRepository,
                      ShopRepository shopRepository,
                      PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.categoryService = categoryService;
        this.productService = productService;
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Chỉ seed users/shops nếu chưa có — KHÔNG bao giờ xóa data cũ
        if (!userRepository.existsByEmail("admin@test.com")) {
            System.out.println("[Seeder] Adding missing users and shops...");
            seedUsersAndShops();
        }

        // Seed categories nếu chưa có
        if (categoryRepository.count() == 0) {
            System.out.println("[Seeder] Adding categories and products...");
            seedCategoriesAndProducts();
            System.out.println("[Seeder] Done.");
        } else {
            // Categories đã có — chỉ seed products còn thiếu
            System.out.println("[Seeder] Categories exist, checking missing products...");
            seedMissingProducts();
            System.out.println("[Seeder] Product check done.");
        }
    }

    // ─── USERS & SHOPS ──────────────────────────────────────────────────────────

    private void seedUsersAndShops() {
        seedAdmin();
        seedCustomer();
        // ── NHÓM 1: Công ty có thật, thông tin công khai ──────────────────────
        // 1. Nesta — nesta.vn — nhà máy 5.000m², 120 công nhân
        seedContractor("contact@nesta.vn", "Công Ty Nesta", "0936316855",
            "Nội Thất Nesta", "noi-that-nesta",
            "Nesta là nhà thầu nội thất hàng đầu Việt Nam với nhà máy 5.000m², 120 công nhân lành nghề. Chuyên thiết kế, sản xuất và thi công nội thất trọn gói cho chung cư, biệt thự và khách sạn. Đã hoàn thiện hơn 3.000 căn hộ và 12.000m² văn phòng trên toàn quốc. Website: nesta.vn",
            "Lô B2-3, KCN Tân Đức, Đức Hòa, Long An (Nhà máy) | Showroom: 23 Phan Đăng Lưu, Bình Thạnh, TP.HCM",
            new BigDecimal("4.9"), 312);
        // 2. Hà Anh — noithathaanh.com — xưởng 2.000m², showroom 1.000m²
        seedContractor("contact@noithathaanh.com", "Nguyễn Hà Anh", "0902261386",
            "Nội Thất Hà Anh", "noi-that-ha-anh",
            "Hà Anh Furniture có 10 năm kinh nghiệm, xưởng sản xuất 2.000m² và showroom 1.000m². Chuyên sâu về đồ gỗ óc chó (walnut) tự nhiên: tủ bếp, tủ quần áo, giường ngủ, kệ TV từ hiện đại đến tân cổ điển. Bảo hành 5 năm toàn bộ sản phẩm. Website: noithathaanh.com",
            "Showroom: 68 Vạn Bảo, Quận 7, TP.HCM | Xưởng: KCN Bình Dương",
            new BigDecimal("4.8"), 215);
        // 3. APA Vietnam — apavietnam.com — thành lập 2006
        seedContractor("info@apavietnam.com", "Phạm An Phúc", "0903456789",
            "APA Vietnam Interiors", "apa-vietnam-interiors",
            "Công ty APA Vietnam thành lập năm 2006, hơn 18 năm kinh nghiệm thiết kế và thi công nội thất. Chuyên nhà phố, biệt thự, căn hộ cao cấp và văn phòng doanh nghiệp. Đội ngũ KTS chuyên nghiệp, cam kết đúng tiến độ và chất lượng. Website: apavietnam.com",
            "152 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
            new BigDecimal("4.8"), 178);
        // 4. Crystal Design TPL — 25 năm, Thủ Đức
        seedContractor("info@crystaldesigntpl.com", "Nguyễn Crystal", "0906317386",
            "Crystal Design TPL", "crystal-design-tpl",
            "Crystal Design TPL là công ty thiết kế nội thất văn phòng hàng đầu tại TP.HCM, hơn 25 năm kinh nghiệm. Chuyên thiết kế, sản xuất và thi công nội thất trọn gói cho văn phòng, showroom, cửa hàng. Kết hợp chuẩn Hàn Quốc và Việt Nam. Website: crystaldesigntpl.com",
            "231A Dương Đình Hội, Tăng Nhơn Phú B, Thủ Đức, TP.HCM",
            new BigDecimal("4.7"), 290);
        // 5. Thiên Minh Group — thienminh.group
        seedContractor("info@thienminh.group", "Lê Thiên Minh", "0909123456",
            "Thiên Minh Group", "thien-minh-group",
            "Thiên Minh Group chuyên thiết kế nội thất và thi công trọn gói cho chung cư, nhà phố, biệt thự và văn phòng tại TP.HCM. Cung cấp giải pháp tối ưu từ tư vấn, thiết kế đến lắp đặt hoàn thiện toàn bộ hạng mục. Website: thienminh.group",
            "45 Nguyễn Hữu Thọ, Quận 7, TP.HCM",
            new BigDecimal("4.7"), 156);
        // 6. Thành Khôi Net — thanhkhoi.net
        seedContractor("info@thanhkhoi.net", "Trần Thành Khôi", "0908234567",
            "Thành Khôi Furniture", "thanh-khoi-furniture",
            "Thành Khôi chuyên thiết kế, thi công và cung cấp nội thất cao cấp. Phương châm: Chất lượng trong từng thiết kế, hạnh phúc trong từng không gian sống. Dịch vụ trọn gói từ phác thảo ý tưởng đến nghiệm thu công trình. Website: thanhkhoi.net",
            "28 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM",
            new BigDecimal("4.6"), 134);
        // 7. Hoa Gia Decor — hoagiadecor.com — TP.HCM
        seedContractor("contact@hoagiadecor.com", "Võ Hoa Gia", "0901357924",
            "Hoa Gia Decor", "hoa-gia-decor",
            "Hoa Gia Decor chuyên thiết kế nội thất, thi công và cải tạo không gian sống tại TP.HCM. Dịch vụ đa dạng: căn hộ chung cư, nhà phố, văn phòng, nhà hàng. Đội thợ lành nghề, vật liệu chất lượng, giá cạnh tranh. Website: hoagiadecor.com",
            "132 Hoàng Văn Thụ, Phú Nhuận, TP.HCM",
            new BigDecimal("4.6"), 98);
        // 8. NewSpace — thietkens.com — Hà Nội
        seedContractor("info@thietkens.com", "Nguyễn NewSpace", "0968139559",
            "NewSpace Kiến Trúc & Nội Thất", "newspace-kien-truc-noi-that",
            "Công ty TNHH Kiến Trúc và Nội Thất NewSpace chuyên thiết kế & thi công kiến trúc và nội thất tại Hà Nội. Phong cách đa dạng: hiện đại, tối giản, cổ điển Indochine. Tư vấn miễn phí, thiết kế 3D trực quan. Website: thietkens.com",
            "Biệt thự 18, Ngõ 55, Dịch Vọng, Cầu Giấy, Hà Nội",
            new BigDecimal("4.8"), 112);
        // 9. Nội Thất VIX — noithatvix.com — HCM + HN
        seedContractor("sales@noithatvix.com", "Đinh Văn Vix", "0846794444",
            "Nội Thất VIX", "noi-that-vix",
            "Nội Thất VIX chuyên cung cấp bàn ghế văn phòng, nội thất công cộng và dân dụng tại TP.HCM và Hà Nội. Sản phẩm đạt chuẩn ISO, bảo hành dài hạn. Giao hàng toàn quốc, lắp đặt miễn phí nội thành. Website: noithatvix.com",
            "201 Tô Ký, Trung Chánh, Hóc Môn, TP.HCM",
            new BigDecimal("4.5"), 187);
        // 10. Prestige Interiors — prestige.vn — 10+ năm
        seedContractor("info@prestige.vn", "Hoàng Prestige", "0907654321",
            "Prestige Interiors", "prestige-interiors",
            "Prestige Interiors là đơn vị hàng đầu trong lĩnh vực thiết kế – thi công kiến trúc và nội thất tại TP.HCM với hơn 10 năm kinh nghiệm. Chuyên dự án cao cấp: biệt thự, penthouse, khách sạn boutique. Website: prestige.vn",
            "72 Lê Lợi, Quận 1, TP.HCM",
            new BigDecimal("4.9"), 243);
        // ── NHÓM 2: Nhà thầu phong cách thật, địa chỉ thật ────────────────────
        // 11.
        seedContractor("hoangphat@contractor.vn", "Nguyễn Hoàng Phát", "0901111001",
            "Hoàng Phát Nội Thất", "hoang-phat-noi-that",
            "Xưởng mộc Hoàng Phát chuyên thi công nội thất gỗ tự nhiên (óc chó, sồi Mỹ, tần bì) cho căn hộ và nhà phố. Hơn 8 năm kinh nghiệm, hơn 200 công trình đã hoàn thành tại TP.HCM và các tỉnh lân cận. Bảo hành 24 tháng.",
            "12 Nguyễn Trãi, Quận 1, TP.HCM",
            new BigDecimal("4.9"), 228);
        // 12.
        seedContractor("minhlong@contractor.vn", "Trần Minh Long", "0902222002",
            "Minh Long Furniture", "minh-long-furniture",
            "Minh Long Furniture chuyên sản xuất và thi công nội thất gỗ sồi Mỹ, óc chó nhập khẩu. Xưởng sản xuất tại Bình Dương, showroom tại Quận 3. Nhận đặt hàng theo bản vẽ, giao hàng toàn quốc trong 30–45 ngày.",
            "45 Lê Văn Sỹ, Quận 3, TP.HCM",
            new BigDecimal("4.8"), 165);
        // 13.
        seedContractor("thienhung@contractor.vn", "Lê Thiên Hùng", "0903333003",
            "Thiên Hùng Decor", "thien-hung-decor",
            "Thiên Hùng Decor chuyên thiết kế và thi công nội thất phong cách Scandinavian và tối giản Nhật Bản. Đội ngũ 15 thợ lành nghề, sử dụng hoàn toàn vật liệu thân thiện môi trường. Đã thi công hơn 150 căn hộ tại TP.HCM.",
            "78 Hoàng Diệu, Quận 4, TP.HCM",
            new BigDecimal("4.7"), 154);
        // 14.
        seedContractor("phuocbinh@contractor.vn", "Phạm Phước Bình", "0904444004",
            "Phước Bình Workshop", "phuoc-binh-workshop",
            "Phước Bình Workshop nhận đặt hàng tủ bếp, tủ âm tường, kệ TV và toàn bộ nội thất theo yêu cầu. Chuyên gỗ công nghiệp cao cấp phủ Acrylic và Melamine. Có xưởng riêng tại Bình Thạnh, cam kết tiến độ và chất lượng.",
            "22 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM",
            new BigDecimal("4.6"), 120);
        // 15.
        seedContractor("kimcuong@contractor.vn", "Võ Kim Cương", "0905555005",
            "Kim Cương Interiors", "kim-cuong-interiors",
            "Kim Cương Interiors chuyên thiết kế và thi công nội thất cao cấp cho penthouse, biệt thự và căn hộ hạng sang. Nhập khẩu vật liệu từ Ý, Đức và Tây Ban Nha. Đã hoàn thành hơn 400 công trình trên toàn quốc.",
            "99 Nguyễn Đình Chiểu, Quận 3, TP.HCM",
            new BigDecimal("5.0"), 410);
        // 16.
        seedContractor("thaison@contractor.vn", "Đặng Thái Sơn", "0906666006",
            "Thái Sơn Woodcraft", "thai-son-woodcraft",
            "Thái Sơn Woodcraft là xưởng mộc thủ công gia truyền, chuyên đồ gỗ cổ điển, phong cách retro và tân cổ điển Châu Âu. Sử dụng gỗ tự nhiên nguyên khối, chạm khắc thủ công. Mỗi sản phẩm là một tác phẩm nghệ thuật độc bản.",
            "55 Trần Hưng Đạo, Quận 5, TP.HCM",
            new BigDecimal("4.8"), 185);
        // 17.
        seedContractor("quocviet@contractor.vn", "Bùi Quốc Việt", "0907777007",
            "Quốc Việt Home", "quoc-viet-home",
            "Quốc Việt Home cung cấp nội thất giá xưởng trực tiếp, phục vụ dự án chung cư và biệt thự quy mô lớn. Có khả năng cung ứng số lượng lớn trong thời gian ngắn. Đối tác của nhiều chủ đầu tư bất động sản tại TP.HCM.",
            "34 Cách Mạng Tháng 8, Quận 10, TP.HCM",
            new BigDecimal("4.5"), 252);
        // 18.
        seedContractor("huonglan@contractor.vn", "Nguyễn Hương Lan", "0908888008",
            "Hương Lan Soft Decor", "huong-lan-soft-decor",
            "Hương Lan Soft Decor chuyên sofa, ghế thư giãn cao cấp và nội thất phòng khách. Đại lý độc quyền vải nhung Bỉ và da thật Ý tại TP.HCM. Nhận may đặt theo kích thước và màu sắc theo yêu cầu, giao hàng 30–60 ngày.",
            "88 Phan Xích Long, Bình Thạnh, TP.HCM",
            new BigDecimal("4.9"), 245);
        // 19.
        seedContractor("vinhphuc@contractor.vn", "Trương Vĩnh Phúc", "0909999009",
            "Vĩnh Phúc Furniture", "vinh-phuc-furniture",
            "Vĩnh Phúc Furniture chuyên thi công nội thất gỗ công nghiệp MDF phủ Melamine và Acrylic giá cạnh tranh. Phù hợp dự án chung cư tầm trung, nhà trọ, văn phòng. Giao hàng nhanh, lắp đặt tại nhà.",
            "66 Lũy Bán Bích, Tân Phú, TP.HCM",
            new BigDecimal("4.4"), 138);
        // 20.
        seedContractor("ngocanh@contractor.vn", "Lý Ngọc Ánh", "0910000010",
            "Ngọc Ánh Design Studio", "ngoc-anh-design-studio",
            "Ngọc Ánh Design Studio là studio thiết kế nội thất tổng thể với phong cách Indochine, Modern và Wabi-Sabi. KTS chính có 12 năm kinh nghiệm, từng làm việc tại Singapore và Nhật Bản. Nhận dự án cao cấp từ 500 triệu trở lên.",
            "17 Pasteur, Quận 1, TP.HCM",
            new BigDecimal("4.7"), 93);
        // 21.
        seedContractor("xuantrung@contractor.vn", "Nguyễn Xuân Trung", "0911001011",
            "Xuân Trung Gỗ Tự Nhiên", "xuan-trung-go-tu-nhien",
            "Xuân Trung chuyên sản xuất và thi công đồ gỗ tự nhiên: gỗ cao su, gỗ thông, gỗ tần bì. Xưởng 800m² tại Bình Chánh, nhận hàng theo bản vẽ. Đặc biệt mạnh về giường ngủ, tủ quần áo và kệ TV kiểu Nhật.",
            "45 Quốc lộ 1A, Bình Chánh, TP.HCM",
            new BigDecimal("4.5"), 110);
        // 22.
        seedContractor("maidinhnam@contractor.vn", "Mai Đình Nam", "0912002012",
            "Nam Phong Nội Thất", "nam-phong-noi-that",
            "Nam Phong Nội Thất chuyên thi công nội thất phong cách Đông Dương (Indochine) và cổ điển Pháp. Sử dụng vật liệu gỗ tự nhiên, đồng và đá cẩm thạch. Từng thi công nhiều biệt thự, resort và nhà hàng tại Hội An và TP.HCM.",
            "112 Trần Quốc Thảo, Quận 3, TP.HCM",
            new BigDecimal("4.8"), 167);
        // 23.
        seedContractor("bichvan@contractor.vn", "Phạm Bích Vân", "0913003013",
            "Bích Vân Interior Design", "bich-van-interior-design",
            "Bích Vân Interior Design chuyên thiết kế nội thất phòng ngủ, phòng trẻ em và không gian riêng tư. Phong cách chủ đạo: Pastel Minimalist, Nordic và Kawaii Japan. KTS nữ với góc nhìn tinh tế, lắng nghe từng yêu cầu của gia chủ.",
            "33 Nguyễn Đình Chiểu, Quận Bình Thạnh, TP.HCM",
            new BigDecimal("4.9"), 144);
        // 24.
        seedContractor("thanhliem@contractor.vn", "Trần Thanh Liêm", "0914004014",
            "Liêm Mộc Xưởng Gỗ", "liem-moc-xuong-go",
            "Liêm Mộc là xưởng gỗ gia truyền 3 đời tại Quận 12, chuyên đóng đồ gỗ thủ công theo đặt hàng. Mạnh về nội thất phòng ngủ: giường gỗ tự nhiên, tủ quần áo cửa trượt, đầu giường bọc da. Giá xưởng, không qua trung gian.",
            "89 Tân Thới Nhất, Quận 12, TP.HCM",
            new BigDecimal("4.6"), 88);
        // 25.
        seedContractor("duchinh@contractor.vn", "Nguyễn Đức Hinh", "0915005015",
            "Đức Hinh Smart Home", "duc-hinh-smart-home",
            "Đức Hinh Smart Home kết hợp nội thất cao cấp với hệ thống nhà thông minh (smart lighting, smart curtain, sensor). Chuyên dự án căn hộ cao cấp và penthouse tại Quận 2, 7, Thủ Đức. Đối tác Xiaomi, Philips Hue và Loxone.",
            "58 Xa lộ Hà Nội, Thủ Đức, TP.HCM",
            new BigDecimal("4.8"), 97);
        // 26.
        seedContractor("quangminh@contractor.vn", "Lê Quang Minh", "0916006016",
            "Quang Minh Tủ Bếp", "quang-minh-tu-bep",
            "Quang Minh Tủ Bếp chuyên thiết kế và thi công tủ bếp, đảo bếp và toàn bộ nội thất phòng bếp. Vật liệu Acrylic bóng gương, MDF chống ẩm, mặt bàn đá Granite nhập khẩu. Showroom trưng bày 30 mẫu tủ bếp tại quận Bình Tân.",
            "210 Kinh Dương Vương, Bình Tân, TP.HCM",
            new BigDecimal("4.7"), 203);
        // 27.
        seedContractor("tuankhoa@contractor.vn", "Lê Tuấn Khoa", "0917007017",
            "Khoa Decor & Painting", "khoa-decor-painting",
            "Khoa Decor nhận thi công nội thất trọn gói kết hợp sơn tường nghệ thuật, wallpaper và tranh tường 3D. Có đội thợ sơn chuyên nghiệp 20 người. Đã thực hiện nhiều dự án cafe, spa, văn phòng sáng tạo tại TP.HCM.",
            "15 Nguyễn Xiển, Long Bình, TP Thủ Đức, TP.HCM",
            new BigDecimal("4.5"), 128);
        // 28.
        seedContractor("baotrang@contractor.vn", "Đặng Bảo Trang", "0918008018",
            "Bảo Trang Luxury Decor", "bao-trang-luxury-decor",
            "Bảo Trang Luxury Decor chuyên nội thất cao cấp cho nhà hàng, khách sạn và resort. Nhập khẩu trực tiếp đồ nội thất từ Ý (Poliform, Minotti), Đan Mạch (Fritz Hansen). Đội KTS có kinh nghiệm làm việc tại châu Âu.",
            "Tòa nhà Saigon Centre, 65 Lê Lợi, Quận 1, TP.HCM",
            new BigDecimal("5.0"), 76);
        // 29.
        seedContractor("vananh@contractor.vn", "Trần Vân Anh", "0919009019",
            "Vân Anh Green Interior", "van-anh-green-interior",
            "Vân Anh Green Interior chuyên nội thất thân thiện môi trường từ gỗ tái chế, tre, mây tự nhiên. Phong cách Tropical và Boho chủ đạo. Đã cung cấp nội thất cho nhiều homestay, resort eco tại Đà Lạt và Phú Quốc.",
            "23 Nguyễn Thượng Hiền, Quận Bình Thạnh, TP.HCM",
            new BigDecimal("4.7"), 115);
        // 30.
        seedContractor("hoangnghia@contractor.vn", "Hoàng Nghĩa", "0920010020",
            "Nghĩa Phát Sofa & Ghế", "nghia-phat-sofa-ghe",
            "Nghĩa Phát chuyên sản xuất và sửa chữa sofa, ghế văn phòng, ghế nhà hàng. Xưởng 600m² tại Gò Vấp với hơn 30 thợ bọc nệm lành nghề. Nhận bọc lại sofa cũ, thay đổi màu sắc và chất liệu theo yêu cầu. Giá tốt, giao hàng nhanh.",
            "78 Phan Văn Trị, Gò Vấp, TP.HCM",
            new BigDecimal("4.6"), 175);
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail("admin@test.com")) {
            User u = new User(); u.setFullName("Admin TTTH"); u.setEmail("admin@test.com");
            u.setPassword(passwordEncoder.encode("Admin@123")); u.setPhone("0900000001");
            u.setRole(Role.ADMIN); u.setActive(true); userRepository.save(u);
        }
        if (!userRepository.existsByEmail("admin2@ttth.vn")) {
            User u = new User(); u.setFullName("Nguyễn Quản Trị"); u.setEmail("admin2@ttth.vn");
            u.setPassword(passwordEncoder.encode("Admin@123")); u.setPhone("0900000002");
            u.setRole(Role.ADMIN); u.setActive(true); userRepository.save(u);
        }
        if (!userRepository.existsByEmail("admin3@ttth.vn")) {
            User u = new User(); u.setFullName("Trần Hệ Thống"); u.setEmail("admin3@ttth.vn");
            u.setPassword(passwordEncoder.encode("Admin@123")); u.setPhone("0900000003");
            u.setRole(Role.ADMIN); u.setActive(true); userRepository.save(u);
        }
    }

    private void seedCustomer() {
        if (!userRepository.existsByEmail("customer@test.com")) {
            User u = new User(); u.setFullName("Nguyễn Văn An"); u.setEmail("customer@test.com");
            u.setPassword(passwordEncoder.encode("123456")); u.setPhone("0901234567");
            u.setRole(Role.CUSTOMER); u.setActive(true); userRepository.save(u);
        }
        if (!userRepository.existsByEmail("customer2@test.com")) {
            User u = new User(); u.setFullName("Trần Thị Bích"); u.setEmail("customer2@test.com");
            u.setPassword(passwordEncoder.encode("123456")); u.setPhone("0912345678");
            u.setRole(Role.CUSTOMER); u.setActive(true); userRepository.save(u);
        }
        if (!userRepository.existsByEmail("customer3@test.com")) {
            User u = new User(); u.setFullName("Lê Minh Khoa"); u.setEmail("customer3@test.com");
            u.setPassword(passwordEncoder.encode("123456")); u.setPhone("0923456789");
            u.setRole(Role.CUSTOMER); u.setActive(true); userRepository.save(u);
        }
    }

    private void seedContractor(String email, String fullName, String phone,
                                 String shopName, String shopSlug, String shopDesc, String shopAddress,
                                 BigDecimal rating, int ratingCount) {
        if (!userRepository.existsByEmail(email)) {
            User contractor = new User();
            contractor.setFullName(fullName);
            contractor.setEmail(email);
            contractor.setPassword(passwordEncoder.encode("123456"));
            contractor.setPhone(phone);
            contractor.setRole(Role.CONTRACTOR);
            contractor.setActive(true);
            userRepository.save(contractor);

            Shop shop = new Shop();
            shop.setOwner(contractor);
            shop.setName(shopName);
            shop.setSlug(shopSlug);
            shop.setDescription(shopDesc);
            shop.setAddress(shopAddress);
            shop.setRating(rating);
            shop.setRatingCount(ratingCount);
            shopRepository.save(shop);
        }
    }

    // ─── CATEGORIES & PRODUCTS ──────────────────────────────────────────────────

    private void seedCategoriesAndProducts() {
        Category catSofa    = createCategory("Sofa & Ghế",       "sofa-ghe",       "fa fa-couch",     "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80");
        Category catBanGhe  = createCategory("Bàn Ghế",          "ban-ghe",        "fa fa-chair",     "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80");
        Category catGiuong  = createCategory("Giường Ngủ",       "giuong-ngu",     "fa fa-bed",       "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80");
        Category catTuKe    = createCategory("Tủ & Kệ",          "tu-ke",          "fa fa-box",       "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80");
        Category catDen     = createCategory("Đèn Trang Trí",    "den-trang-tri",  "fa fa-lightbulb", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80");
        Category catBepAn   = createCategory("Nội Thất Phòng Bếp","noi-that-bep",  "fa fa-utensils",  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80");
        Category catNgoaiTroi = createCategory("Ngoài Trời",     "ngoai-troi",     "fa fa-umbrella-beach","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80");
        Category catVanPhong  = createCategory("Nội Thất Văn Phòng","van-phong",   "fa fa-briefcase", "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80");

        seedSofaProducts(catSofa.getId());
        seedBanGheProducts(catBanGhe.getId());
        seedGiuongProducts(catGiuong.getId());
        seedTuKeProducts(catTuKe.getId());
        seedDenProducts(catDen.getId());
        seedBepProducts(catBepAn.getId());
        seedNgoaiTroiProducts(catNgoaiTroi.getId());
        seedVanPhongProducts(catVanPhong.getId());
        // Batch 2 — thêm 100 sản phẩm
        seedSofaProducts2(catSofa.getId());
        seedBanGheProducts2(catBanGhe.getId());
        seedGiuongProducts2(catGiuong.getId());
        seedTuKeProducts2(catTuKe.getId());
        seedDenProducts2(catDen.getId());
        seedBepProducts2(catBepAn.getId());
        seedNgoaiTroiProducts2(catNgoaiTroi.getId());
        seedVanPhongProducts2(catVanPhong.getId());
    }

    // ─── SOFA & GHẾ (16 sản phẩm) ──────────────────────────────────────────────
    private void seedSofaProducts(Long catId) {
        p("Sofa Da Thật 3 Chỗ Cao Cấp",          "sf01-sofa-da-that-3-cho",      catId, 32_000_000L, 38_000_000L, false, "4.9", 88,  List.of("https://product.hstatic.net/1000360516/product/04_list_img_c6954b702b2845b6a417794382cf990d_1e83b50d3c6e427cb875528dd7244aea_master.jpg"),   List.of("CAO CẤP"));
        p("Sofa Vải Nhung Góc L 5 Chỗ",           "sf02-sofa-vai-nhung-goc-l",    catId, 18_500_000L, 22_000_000L, false, "4.8", 64,  List.of("https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80"),  List.of("HOT"));
        p("Ghế Armchair Bọc Vải Linen",            "sf03-ghe-armchair-linen",      catId,  5_800_000L,  7_200_000L, false, "4.7", 41,  List.of("https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80"),  List.of());
        p("Sofa Đơn Scandinavian Gỗ Sồi",          "sf04-sofa-don-scandinavian",   catId,  7_500_000L,           0L, false, "4.6", 29,  List.of("https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80"),  List.of("MỚI"));
        p("Ghế Thư Giãn Rocking Chair",            "sf05-ghe-thu-gian-rocking",    catId,  4_200_000L,  4_900_000L, false, "4.5", 55,  List.of("https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&q=80"),  List.of("-15%"));
        p("Sofa 2 Chỗ Bọc Da Microfiber",          "sf06-sofa-2-cho-microfiber",   catId, 12_000_000L, 14_500_000L, false, "4.8", 72,  List.of("https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&q=80"),  List.of("BESTSELLER"));
        p("Ghế Đôn Gỗ Walnut Tự Nhiên",            "sf07-ghe-don-walnut",          catId,  2_800_000L,           0L, false, "4.4", 38,  List.of("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"),   List.of());
        p("Sofa Bed Đa Năng Gấp Mở",               "sf08-sofa-bed-da-nang",        catId,  9_500_000L, 11_000_000L, false, "4.6", 47,  List.of("https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80"),  List.of("HOT"));
        p("Ghế Bean Bag Vải Nhung Cao Cấp",         "sf09-bean-bag-nhung",          catId,  1_500_000L,  1_900_000L, false, "4.3", 120, List.of("https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80"),  List.of("-20%"));
        p("Sofa Chesterfield Vải Nhung Xanh",       "sf10-sofa-chesterfield-xanh",  catId, 22_000_000L,           0L, false, "5.0", 18,  List.of("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"),   List.of("CAO CẤP"));
        p("Ghế Tình Nhân 2 Người Ngồi",             "sf11-ghe-tinh-nhan",           catId,  6_800_000L,  8_000_000L, false, "4.7", 33,  List.of("https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80"),  List.of());
        p("Sofa Nỉ 3 Chỗ Chân Gỗ Teak",            "sf12-sofa-ni-chan-teak",        catId, 14_200_000L,           0L, false, "4.8", 56,  List.of("https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&q=80"),  List.of("MỚI"));
        p("Ghế Lười Bố Bắp Ngả Lưng",              "sf13-ghe-luoi-bo-bap",         catId,  3_200_000L,  3_800_000L, false, "4.2", 88,  List.of("https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&q=80"),  List.of());
        p("Sofa Da Bò Ý Nhập Khẩu 4 Chỗ",          "sf14-sofa-da-bo-y",            catId,        0L,           0L, true,  "5.0", 5,   List.of("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"),   List.of("CAO CẤP", "NHẬP KHẨU"));
        p("Ghế Eames Replica Chân Thép",            "sf15-ghe-eames-replica",       catId,  2_200_000L,  2_800_000L, false, "4.5", 144, List.of("https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80"),  List.of("-20%"));
        p("Sofa Modular Tháo Lắp Tự Do",            "sf16-sofa-modular",            catId, 16_000_000L, 19_000_000L, false, "4.9", 27,  List.of("https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80"),  List.of("MỚI", "HOT"));
    }

    // ─── BÀN GHẾ (14 sản phẩm) ─────────────────────────────────────────────────
    private void seedBanGheProducts(Long catId) {
        p("Bộ Bàn Ăn Gỗ Sồi Mỹ 6 Ghế",            "bg01-bo-ban-an-soi-my-6-ghe",  catId, 24_900_000L,           0L, false, "5.0", 32,  List.of("https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80"),  List.of("MỚI"));
        p("Bàn Trà Mặt Kính Cường Lực Khung Thép",  "bg02-ban-tra-kinh-cuong-luc",  catId,  3_200_000L,  3_900_000L, false, "4.7", 58,  List.of("https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=400&q=80"),  List.of());
        p("Bàn Làm Việc Gỗ Tràm Nguyên Khối",       "bg03-ban-lam-viec-go-tram",    catId,  4_500_000L,           0L, false, "4.5", 75,  List.of("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80"),  List.of());
        p("Ghế Ăn Bọc Nệm Da PU Khung Gỗ",          "bg04-ghe-an-boc-nem-da-pu",    catId,  1_200_000L,  1_500_000L, false, "4.6", 200, List.of("https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=80"),  List.of("-20%"));
        p("Bàn Cafe Tròn Mặt Đá Marble",             "bg05-ban-cafe-tron-da-marble", catId,  4_800_000L,           0L, false, "4.8", 24,  List.of("https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&q=80"),  List.of("CAO CẤP"));
        p("Bàn Ăn Gập Tiết Kiệm Diện Tích",          "bg06-ban-an-gap-tiet-kiem",    catId,  2_100_000L,  2_600_000L, false, "4.4", 112, List.of("https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80"),  List.of("-20%", "TIẾT KIỆM"));
        p("Bộ Bàn Ghế Gỗ Óc Chó 4 Người",           "bg07-bo-ban-ghe-oc-cho-4ng",   catId, 32_000_000L,           0L, false, "5.0", 11,  List.of("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80"),  List.of("CAO CẤP"));
        p("Ghế Bar Khung Thép Chân Cao",              "bg08-ghe-bar-khung-thep",      catId,    980_000L,  1_200_000L, false, "4.3", 88,  List.of("https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=80"),  List.of("-20%"));
        p("Bàn Console Gỗ Thông Đầu Giường",         "bg09-ban-console-go-thong",    catId,  1_800_000L,           0L, false, "4.5", 45,  List.of("https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=400&q=80"),  List.of());
        p("Bộ Bàn Ghế Ăn Phong Cách Công Nghiệp",    "bg10-ban-ghe-phong-cach-cn",   catId, 18_500_000L, 21_000_000L, false, "4.7", 37,  List.of("https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80"),  List.of("HOT"));
        p("Bàn Phấn Gương Oval Gỗ Trắng",            "bg11-ban-phan-guong-oval",     catId,  3_500_000L,  4_200_000L, false, "4.6", 62,  List.of("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80"),  List.of());
        p("Ghế Ăn Plastic Scandinavian Nhiều Màu",    "bg12-ghe-an-plastic-scan",     catId,    650_000L,    850_000L, false, "4.2", 340, List.of("https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=80"),  List.of("-25%"));
        p("Bàn Làm Việc Đứng Điều Chỉnh Độ Cao",     "bg13-ban-lam-viec-dung",       catId,  7_200_000L,  8_500_000L, false, "4.8", 19,  List.of("https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=400&q=80"),  List.of("MỚI"));
        p("Bàn Trà Gỗ Pallet Handmade",               "bg14-ban-tra-go-pallet",       catId,  1_200_000L,           0L, false, "4.1", 156, List.of("https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&q=80"),  List.of("HANDMADE"));
    }

    // ─── GIƯỜNG NGỦ (14 sản phẩm) ──────────────────────────────────────────────
    private void seedGiuongProducts(Long catId) {
        p("Giường Gỗ Walnut King Size 1m8",          "gn01-giuong-walnut-king-1m8",  catId, 22_000_000L, 26_000_000L, false, "4.9", 44,  List.of("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80"),  List.of("CAO CẤP"));
        p("Giường Gỗ Sồi Queen Size 1m6",            "gn02-giuong-soi-queen-1m6",    catId,  8_500_000L,           0L, false, "4.7", 110, List.of("https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80"),  List.of("HOT"));
        p("Giường Bọc Nệm Đầu Giường Bọc Vải",       "gn03-giuong-boc-nem-vai",      catId, 12_500_000L, 14_000_000L, false, "4.6", 67,  List.of("https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=80"),  List.of());
        p("Giường Tầng Trẻ Em Gỗ Thông",             "gn04-giuong-tang-go-thong",    catId, 18_000_000L,           0L, false, "4.9", 42,  List.of("https://images.unsplash.com/photo-1617325247661-675ab03407d3?w=400&q=80"),  List.of("TRẺ EM"));
        p("Giường Pallet Gỗ Thông Tự Nhiên",          "gn05-giuong-pallet-thong",     catId,  2_500_000L,  3_000_000L, false, "4.2", 200, List.of("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80"),  List.of("GIÁ RẺ"));
        p("Giường Gỗ Óc Chó Cổ Điển Hoàng Gia",      "gn06-giuong-oc-cho-co-dien",   catId,        0L,           0L, true,  "5.0", 8,   List.of("https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80"),  List.of("CAO CẤP", "LUXURY"));
        p("Giường Hộp Có Ngăn Kéo Lưu Trữ",          "gn07-giuong-hop-ngan-keo",     catId,  9_800_000L, 11_500_000L, false, "4.7", 88,  List.of("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80"),  List.of("HOT", "TIỆN ÍCH"));
        p("Giường Gỗ Tần Bì Kiểu Nhật Thấp Sàn",     "gn08-giuong-tan-bi-kieu-nhat", catId,  6_500_000L,  7_800_000L, false, "4.8", 53,  List.of("https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80"),  List.of("NHẬT BẢN"));
        p("Giường Gỗ MDF Trắng Phong Cách Bắc Âu",   "gn09-giuong-mdf-trang-bac-au", catId,  5_200_000L,  6_100_000L, false, "4.5", 76,  List.of("https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=80"),  List.of());
        p("Giường Canopy Rèm Che 4 Cột",              "gn10-giuong-canopy-rem-che",   catId, 28_000_000L,           0L, false, "5.0", 12,  List.of("https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80"),  List.of("LUXURY"));
        p("Giường Đơn Gỗ Thông 1m2 Trẻ Em",          "gn11-giuong-don-1m2",          catId,  3_800_000L,  4_500_000L, false, "4.4", 93,  List.of("https://images.unsplash.com/photo-1617325247661-675ab03407d3?w=400&q=80"),  List.of("TRẺ EM"));
        p("Giường Thông Minh Gập Ngăn Tủ",            "gn12-giuong-thong-minh-gap",   catId, 16_500_000L, 19_000_000L, false, "4.8", 28,  List.of("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80"),  List.of("SMARTHOME", "MỚI"));
        p("Giường Gỗ Cao Su Chống Mối Mọt",           "gn13-giuong-go-cao-su",        catId,  7_100_000L,           0L, false, "4.6", 61,  List.of("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80"),  List.of());
        p("Giường Iron Art Sắt Rèn Nghệ Thuật",       "gn14-giuong-iron-art",         catId, 11_000_000L, 13_000_000L, false, "4.7", 35,  List.of("https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80"),  List.of("NGHỆ THUẬT"));
    }

    // ─── TỦ & KỆ (14 sản phẩm) ─────────────────────────────────────────────────
    private void seedTuKeProducts(Long catId) {
        p("Tủ Quần Áo 4 Cánh Gỗ Óc Chó",           "tk01-tu-quan-ao-4-canh-oc-cho", catId, 24_000_000L,           0L, false, "4.9", 38,  List.of("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"),  List.of("CAO CẤP"));
        p("Kệ TV Gỗ Tần Bì Kiểu Dáng Thấp",         "tk02-ke-tv-go-tan-bi-thap",    catId,  7_100_000L,  7_900_000L, false, "4.5", 55,  List.of("https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&q=80"),  List.of("-10%"));
        p("Tủ Quần Áo Cửa Lùa 2m Gương",             "tk03-tu-quan-ao-cua-lua-guong", catId, 18_000_000L,           0L, false, "4.7", 44,  List.of("https://images.unsplash.com/photo-1595526114101-1b9a1eb3d327?w=400&q=80"),  List.of("MỚI"));
        p("Kệ Sách Gỗ Thông 5 Tầng",                 "tk04-ke-sach-5-tang",          catId,  2_800_000L,           0L, false, "4.4", 167, List.of("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"),  List.of());
        p("Tủ Giày 20 Ngăn Cửa Chớp",                "tk05-tu-giay-20-ngan",         catId,  3_500_000L,           0L, false, "4.8", 82,  List.of("https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=400&q=80"),  List.of("BÁN CHẠY"));
        p("Kệ Trang Trí Treo Tường Hexagon",          "tk06-ke-trang-tri-hexagon",    catId,    750_000L,    950_000L, false, "4.3", 230, List.of("https://images.unsplash.com/photo-1505069190533-da1c9af13346?w=400&q=80"),  List.of("-20%"));
        p("Tủ Đầu Giường 3 Ngăn Gỗ Óc Chó",          "tk07-tu-dau-giuong-3-ngan",    catId,  2_200_000L,  2_800_000L, false, "4.6", 118, List.of("https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&q=80"),  List.of());
        p("Tủ Hồ Sơ Văn Phòng 4 Ngăn Khoá",          "tk08-tu-ho-so-van-phong",      catId,  4_200_000L,           0L, false, "4.5", 72,  List.of("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"),  List.of());
        p("Kệ Phòng Bếp Đa Năng Inox 304",            "tk09-ke-bep-inox-304",         catId,  1_850_000L,  2_200_000L, false, "4.6", 144, List.of("https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&q=80"),  List.of());
        p("Tủ Rượu Gỗ Walnut Khung Kính",             "tk10-tu-ruou-walnut-khung-kinh",catId, 14_500_000L,           0L, false, "5.0", 23,  List.of("https://images.unsplash.com/photo-1595526114101-1b9a1eb3d327?w=400&q=80"),  List.of("CAO CẤP"));
        p("Kệ Góc Tường Gỗ Tự Nhiên 3 Tầng",         "tk11-ke-goc-tuong-3-tang",     catId,  1_100_000L,  1_400_000L, false, "4.2", 190, List.of("https://images.unsplash.com/photo-1505069190533-da1c9af13346?w=400&q=80"),  List.of("-20%"));
        p("Tủ Quần Áo Walk-in Closet Tùy Chỉnh",      "tk12-tu-walk-in-closet",       catId,        0L,           0L, true,  "5.0", 7,   List.of("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Kệ Sách Hình Cây Độc Đáo Thiết Kế",       "tk13-ke-sach-hinh-cay",        catId,  5_500_000L,  6_500_000L, false, "4.8", 31,  List.of("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"),  List.of("ĐỘC ĐÁO"));
        p("Tủ Nhà Bếp Dưới Bồn Rửa Chống Ẩm",        "tk14-tu-bep-duoi-bon-rua",     catId,  2_900_000L,           0L, false, "4.4", 97,  List.of("https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=400&q=80"),  List.of());
    }

    // ─── ĐÈN TRANG TRÍ (12 sản phẩm) ──────────────────────────────────────────
    private void seedDenProducts(Long catId) {
        p("Đèn Thả Trần Mây Tre Đan Thủ Công",       "dn01-den-tha-may-tre-thu-cong", catId,  2_200_000L,           0L, false, "4.8", 55,  List.of("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80"),  List.of("HANDMADE"));
        p("Đèn Chùm Pha Lê Khung Đồng Mạ Vàng",      "dn02-den-chum-pha-le-dong",    catId, 12_500_000L, 15_000_000L, false, "5.0", 18,  List.of("https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&q=80"),  List.of("CAO CẤP", "LUXURY"));
        p("Đèn Bàn Đọc Sách Cần Cẩu Công Nghiệp",    "dn03-den-ban-can-cau-cn",      catId,    850_000L,  1_200_000L, false, "4.6", 140, List.of("https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80"),  List.of("-30%"));
        p("Đèn Cây Đứng Phong Cách Retro Đồng",       "dn04-den-cay-retro-dong",      catId,  2_800_000L,           0L, false, "4.7", 42,  List.of("https://images.unsplash.com/photo-1524484485831-a92fa817e4bb?w=400&q=80"),  List.of());
        p("Đèn Tường Gắn Wall Sconce Đồng Thau",      "dn05-den-tuong-dong-thau",     catId,  1_400_000L,  1_700_000L, false, "4.5", 78,  List.of("https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&q=80"),  List.of("-15%"));
        p("Đèn LED Âm Trần Thông Minh Điều Chỉnh",    "dn06-den-led-am-tran-thong-minh",catId,    320_000L,           0L, false, "4.3", 680, List.of("https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&q=80"),  List.of("SMARTHOME"));
        p("Đèn Thả Bàn Ăn Thanh Kim Loại Linear",     "dn07-den-tha-linear",          catId,  3_600_000L,  4_200_000L, false, "4.8", 34,  List.of("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80"),  List.of());
        p("Đèn Ngủ Để Bàn Gỗ Tự Nhiên LED",           "dn08-den-ngu-de-ban-go",       catId,    680_000L,    900_000L, false, "4.4", 210, List.of("https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80"),  List.of("-25%"));
        p("Đèn Sàn Gỗ Tre Đan Cao 1m7",               "dn09-den-san-go-tre",          catId,  1_900_000L,           0L, false, "4.6", 48,  List.of("https://images.unsplash.com/photo-1524484485831-a92fa817e4bb?w=400&q=80"),  List.of("MỚI"));
        p("Đèn Neon Sign Tuỳ Chỉnh Chữ LED",          "dn10-den-neon-sign-led",       catId,  2_500_000L,           0L, false, "4.9", 77,  List.of("https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Đèn Vintage Edison Bóng Sợi Đốt",          "dn11-den-vintage-edison",      catId,    450_000L,    600_000L, false, "4.2", 320, List.of("https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&q=80"),  List.of("-25%"));
        p("Đèn Mây Tre Bướm Treo Trần Nghệ Thuật",    "dn12-den-may-tre-buom",        catId,  4_500_000L,           0L, false, "5.0", 16,  List.of("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80"),  List.of("NGHỆ THUẬT", "HANDMADE"));
    }

    // ─── NỘI THẤT PHÒNG BẾP (12 sản phẩm) ─────────────────────────────────────
    private void seedBepProducts(Long catId) {
        p("Tủ Bếp Acrylic Bóng Gương Toàn Bộ",       "bp01-tu-bep-acrylic-bong-guong",catId,        0L,           0L, true,  "5.0", 15,  List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Đảo Bếp Gỗ Óc Chó Mặt Đá Granite",        "bp02-dao-bep-da-granite",      catId,        0L,           0L, true,  "5.0", 9,   List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("CAO CẤP", "THEO YÊU CẦU"));
        p("Bộ Tủ Bếp MDF Phủ Melamine Chống Ẩm",     "bp03-tu-bep-mdf-melamine",     catId,        0L,           0L, true,  "4.7", 52,  List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Kệ Bếp Inox 304 Treo Tường 2 Tầng",        "bp04-ke-bep-inox-treo-tuong",  catId,  1_200_000L,  1_500_000L, false, "4.5", 144, List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of());
        p("Ghế Bar Bếp Chân Cao Bọc PU Cửa Chớp",    "bp05-ghe-bar-bep-boc-pu",      catId,    950_000L,  1_200_000L, false, "4.4", 88,  List.of("https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=80"),  List.of());
        p("Bàn Đảo Bếp Di Động Bánh Xe",               "bp06-ban-dao-bep-di-dong",     catId,  3_200_000L,  3_800_000L, false, "4.6", 63,  List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("TIỆN ÍCH"));
        p("Tủ Lạnh Âm Tủ Bếp Mặt Gỗ",                "bp07-tu-lanh-am-tu-bep",       catId,        0L,           0L, true,  "4.9", 7,   List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Kệ Gia Vị Quay Góc 360° Inox",              "bp08-ke-gia-vi-quay-360",      catId,    580_000L,    750_000L, false, "4.3", 280, List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("-25%"));
        p("Bồn Rửa Chén 2 Ngăn Inox 304 Dày",         "bp09-bon-rua-chen-2-ngan",     catId,  2_800_000L,           0L, false, "4.7", 110, List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of());
        p("Máy Hút Mùi Âm Tủ Bếp Inverter",           "bp10-may-hut-mui-am-tu",       catId,  6_500_000L,  7_800_000L, false, "4.8", 44,  List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of());
        p("Tủ Bếp Trên Gỗ Sồi Cánh Nhôm Kính",        "bp11-tu-bep-tren-go-soi-kinh", catId,        0L,           0L, true,  "4.8", 28,  List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Bộ Bàn Ghế Ăn Phòng Bếp 4 Ghế Gỗ Sồi",   "bp12-ban-ghe-an-phong-bep",    catId, 14_500_000L,           0L, false, "4.7", 35,  List.of("https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80"),  List.of());
    }

    // ─── NGOÀI TRỜI (10 sản phẩm) ──────────────────────────────────────────────
    private void seedNgoaiTroiProducts(Long catId) {
        p("Bộ Bàn Ghế Nhôm Đúc Sân Vườn 4 Ghế",      "nt01-ban-ghe-nhom-duc-san-vuon",catId, 16_500_000L,           0L, false, "4.8", 28,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of("NGOÀI TRỜI"));
        p("Ghế Xích Đu Đôi Khung Sắt Sơn Tĩnh Điện", "nt02-ghe-xich-du-doi-sat",     catId,  4_800_000L,  5_600_000L, false, "4.7", 42,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of());
        p("Bộ Ghế Mây Nhựa Ban Công 2 Chỗ",            "nt03-ghe-may-nhua-ban-cong",   catId,  2_900_000L,  3_500_000L, false, "4.5", 66,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of());
        p("Bàn Ngoài Trời Mặt Kính Chân Nhôm",         "nt04-ban-ngoai-troi-kinh-nhom",catId,  3_800_000L,           0L, false, "4.6", 38,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of());
        p("Ghế Tắm Nắng Nằm Dài Nhựa HDPE",            "nt05-ghe-tam-nang-nam-dai",    catId,  2_200_000L,  2_700_000L, false, "4.4", 55,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of("-20%"));
        p("Bộ Bàn Ghế Gỗ Teak Ngoài Trời 6 Người",    "nt06-ban-ghe-teak-6-nguoi",    catId, 42_000_000L,           0L, false, "5.0", 8,   List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of("CAO CẤP", "TEAK"));
        p("Xích Đu Thư Giãn Nhà Vườn Dạng Trứng",      "nt07-xich-du-dang-trung",      catId,  6_200_000L,  7_500_000L, false, "4.9", 33,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of("HOT"));
        p("Ghế Adirondack Gỗ Thông Sân Vườn",          "nt08-ghe-adirondack-go-thong", catId,  1_800_000L,  2_200_000L, false, "4.5", 74,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of());
        p("Ô Dù Ngoài Trời 2.7m Chống Tia UV",         "nt09-o-du-ngoai-troi-chong-uv",catId,  3_200_000L,           0L, false, "4.6", 92,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of());
        p("Kệ Hoa Ban Công Sắt Uốn Nghệ Thuật",        "nt10-ke-hoa-ban-cong-sat-uon", catId,    880_000L,  1_100_000L, false, "4.3", 148, List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of("-20%"));
    }

    // ─── VĂN PHÒNG (12 sản phẩm) ────────────────────────────────────────────────
    private void seedVanPhongProducts(Long catId) {
        p("Ghế Xoay Giám Đốc Da Thật Cao Cấp",         "vp01-ghe-xoay-giam-doc-da",    catId,  8_500_000L, 10_000_000L, false, "4.9", 44,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("CAO CẤP"));
        p("Bàn Giám Đốc Gỗ Óc Chó Chữ L",              "vp02-ban-giam-doc-oc-cho-chu-l",catId, 22_000_000L,           0L, false, "5.0", 12,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("CAO CẤP"));
        p("Ghế Nhân Viên Lưng Lưới Thoáng Khí",         "vp03-ghe-nhan-vien-luoi",      catId,  2_200_000L,  2_800_000L, false, "4.6", 185, List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of());
        p("Bàn Văn Phòng Gỗ Công Nghiệp 1m4",           "vp04-ban-van-phong-1m4",       catId,  2_800_000L,           0L, false, "4.5", 130, List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of());
        p("Tủ Tài Liệu Gỗ MDF Có Khoá 4 Ngăn",          "vp05-tu-tai-lieu-4-ngan",      catId,  4_500_000L,  5_200_000L, false, "4.7", 78,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("-15%"));
        p("Ghế Hội Trường Xếp Chân Inox",                "vp06-ghe-hoi-truong-xep",      catId,    420_000L,    550_000L, false, "4.3", 500, List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("-25%"));
        p("Bàn Họp Hình Oval 10 Người Gỗ Sồi",          "vp07-ban-hop-oval-10-nguoi",   catId,        0L,           0L, true,  "5.0", 5,   List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Vách Ngăn Di Động Văn Phòng",                  "vp08-vach-ngan-di-dong",       catId,  3_800_000L,           0L, false, "4.6", 41,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of());
        p("Ghế Gaming Tựa Lưng Cao Tích Hợp Gối",        "vp09-ghe-gaming-tua-lung-cao", catId,  3_500_000L,  4_200_000L, false, "4.8", 220, List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("HOT", "GAMING"));
        p("Bàn Làm Việc Đứng Gấp Gọn Đa Năng",           "vp10-ban-dung-gap-gon",        catId,  1_900_000L,  2_400_000L, false, "4.5", 95,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("-20%"));
        p("Kệ Hồ Sơ Treo Tường Văn Phòng",               "vp11-ke-ho-so-treo-tuong",     catId,  1_100_000L,           0L, false, "4.4", 160, List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of());
        p("Ghế Đợi Reception Sofa Mini 2 Chỗ",           "vp12-ghe-doi-reception-sofa",  catId,  5_800_000L,  7_000_000L, false, "4.7", 33,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of());
    }

    // ─── BATCH 2 — SOFA & GHẾ (13 SP) ───────────────────────────────────────────
    private void seedSofaProducts2(Long catId) {
        p("Sofa Góc L Bọc Da Microfiber Đen",       "sf17-sofa-goc-l-da-den",       catId, 26_000_000L, 30_000_000L, false, "4.8", 34,  List.of("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"),  List.of("HOT"));
        p("Ghế Ngồi Bệt Nhật Bản Zaisu",            "sf18-ghe-zaisu-nhat-ban",      catId,  1_800_000L,  2_200_000L, false, "4.5", 92,  List.of("https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80"), List.of("-20%"));
        p("Sofa Mini 1 Chỗ Phòng Ngủ",              "sf19-sofa-mini-1-cho",         catId,  3_900_000L,  4_500_000L, false, "4.6", 68,  List.of("https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80"),  List.of());
        p("Ghế Lắc Phòng Khách Gỗ Cong",            "sf20-ghe-lac-go-cong",         catId,  5_200_000L,           0L, false, "4.7", 44,  List.of("https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80"),  List.of("MỚI"));
        p("Sofa Bọc Vải Bố Xám Tro 4 Chỗ",         "sf21-sofa-vai-bo-xam-4-cho",   catId, 16_800_000L,           0L, false, "4.7", 51,  List.of("https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&q=80"),  List.of());
        p("Ghế Papasan Mây Tổng Hợp Tròn",          "sf22-ghe-papasan-may",         catId,  2_400_000L,  2_900_000L, false, "4.4", 110, List.of("https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&q=80"),  List.of("-15%"));
        p("Sofa Vintage Nhung Đỏ Đô 3 Chỗ",        "sf23-sofa-vintage-nhung-do",   catId, 19_500_000L, 23_000_000L, false, "4.9", 26,  List.of("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"),   List.of("CAO CẤP"));
        p("Ghế Trứng Treo Trần Mây Đan",            "sf24-ghe-trung-treo-tran-may", catId,  4_600_000L,  5_400_000L, false, "4.8", 77,  List.of("https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80"), List.of("HOT"));
        p("Sofa 3 Chỗ Chân Gỗ Bọc Tweed",          "sf25-sofa-3-cho-tweed",        catId, 11_500_000L,           0L, false, "4.6", 39,  List.of("https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80"),  List.of());
        p("Ghế Đôn Bọc Nhung Có Nắp Đựng Đồ",      "sf26-ghe-don-nhung-co-nap",    catId,  2_100_000L,  2_600_000L, false, "4.3", 135, List.of("https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80"),  List.of("-20%"));
        p("Sofa Recliner Ngả Lưng Chân Co Duỗi",   "sf27-sofa-recliner-nga-lung",  catId, 14_000_000L, 17_000_000L, false, "4.9", 58,  List.of("https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&q=80"),  List.of("HOT", "TIỆN ÍCH"));
        p("Ghế Ôm Bọc Vải Teddy Mềm Mịn",          "sf28-ghe-om-vai-teddy",        catId,  1_200_000L,  1_500_000L, false, "4.5", 200, List.of("https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&q=80"),  List.of("-20%"));
        p("Sofa Da Bò Nappa 2.5 Chỗ Ngồi",         "sf29-sofa-da-bo-nappa-2-5-cho",catId, 28_000_000L,           0L, false, "5.0", 15,  List.of("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80"),   List.of("LUXURY", "NHẬP KHẨU"));
    }

    // ─── BATCH 2 — BÀN GHẾ (13 SP) ──────────────────────────────────────────────
    private void seedBanGheProducts2(Long catId) {
        p("Bàn Ăn Gỗ Thông Chân Chữ X 6 Người",    "bg15-ban-an-go-thong-chu-x",   catId, 12_500_000L,           0L, false, "4.7", 42,  List.of("https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80"), List.of());
        p("Ghế Ăn Mây Nhựa Lưng Tròn",              "bg16-ghe-an-may-nhua-lung-tron",catId,   880_000L,  1_100_000L, false, "4.4", 180, List.of("https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=80"),  List.of("-20%"));
        p("Bàn Học Sinh Gỗ Công Nghiệp Có Ngăn",    "bg17-ban-hoc-sinh-co-ngan",    catId,  1_600_000L,  2_000_000L, false, "4.5", 210, List.of("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80"),  List.of("-20%"));
        p("Bộ Bàn Ăn Tròn Gỗ Sồi 4 Ghế",           "bg18-bo-ban-an-tron-soi-4-ghe",catId, 18_000_000L,           0L, false, "4.8", 29,  List.of("https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80"), List.of("MỚI"));
        p("Ghế Nhựa Đúc Không Tay Vịn Nhiều Màu",   "bg19-ghe-nhua-duc-khong-tay",  catId,    380_000L,    500_000L, false, "4.0", 620, List.of("https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=80"),  List.of("-25%"));
        p("Bàn Trà Gỗ Sồi Ngăn Kéo Dưới",           "bg20-ban-tra-soi-ngan-keo",    catId,  4_200_000L,  5_000_000L, false, "4.7", 55,  List.of("https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=400&q=80"),  List.of());
        p("Bộ Bàn Ghế Picnic Gỗ Thông Ngoài Trời",  "bg21-bo-ban-ghe-picnic",       catId,  6_800_000L,           0L, false, "4.6", 34,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of());
        p("Bàn Vanity Trang Điểm Đèn LED Gương",     "bg22-ban-vanity-den-led-guong",catId,  5_500_000L,  6_500_000L, false, "4.8", 88,  List.of("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80"),  List.of("HOT"));
        p("Ghế Quầy Bar Gỗ Chân Cao Swivel",         "bg23-ghe-bar-go-swivel",       catId,  1_800_000L,  2_200_000L, false, "4.5", 77,  List.of("https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=80"),  List.of());
        p("Bàn Ăn Kính Cường Lực 8 Người Oval",      "bg24-ban-an-kinh-oval-8-nguoi",catId, 22_000_000L,           0L, false, "4.9", 18,  List.of("https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80"), List.of("CAO CẤP"));
        p("Bàn Nesting Lồng Nhau 3 Cái",             "bg25-ban-nesting-3-cai",       catId,  3_200_000L,  3_800_000L, false, "4.6", 63,  List.of("https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=400&q=80"),  List.of("-15%"));
        p("Ghế Gỗ Tự Nhiên Handmade Mộc Mạc",       "bg26-ghe-go-tu-nhien-handmade",catId,  1_400_000L,           0L, false, "4.3", 144, List.of("https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=80"),  List.of("HANDMADE"));
        p("Bàn Bên Sofa Chân Pin Cắm",               "bg27-ban-ben-sofa-chan-pin",   catId,    680_000L,    850_000L, false, "4.2", 310, List.of("https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=400&q=80"),  List.of("-20%"));
    }

    // ─── BATCH 2 — GIƯỜNG NGỦ (12 SP) ───────────────────────────────────────────
    private void seedGiuongProducts2(Long catId) {
        p("Giường Ngủ Khung Sắt Rèn Tối Giản",      "gn15-giuong-sat-ren-toi-gian", catId,  6_200_000L,  7_500_000L, false, "4.6", 58,  List.of("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80"),  List.of());
        p("Giường Gỗ Cao Su 1m2 Trẻ Em Có Rào",     "gn16-giuong-go-cao-su-1m2-rao",catId,  5_800_000L,           0L, false, "4.8", 74,  List.of("https://images.unsplash.com/photo-1617325247661-675ab03407d3?w=400&q=80"),  List.of("TRẺ EM"));
        p("Giường Đôi Gỗ Thông Kiểu Cổ Điển",       "gn17-giuong-doi-go-thong-co-dien",catId,9_400_000L,11_000_000L,false,"4.7",43, List.of("https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80"),  List.of());
        p("Giường Gấp Gọn Đa Năng Murphy Bed",       "gn18-giuong-gap-murphy-bed",   catId, 24_000_000L,           0L, false, "4.9", 19,  List.of("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80"),  List.of("MỚI", "TIỆN ÍCH"));
        p("Giường Bọc Đầu Da PU Có Đèn LED",        "gn19-giuong-boc-dau-da-den-led",catId,13_500_000L,15_000_000L,false,"4.8",37, List.of("https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80"),  List.of("HOT"));
        p("Giường Gỗ Óc Chó Tự Nhiên 1m4",          "gn20-giuong-oc-cho-1m4",       catId, 18_500_000L,           0L, false, "5.0", 24,  List.of("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80"),  List.of("CAO CẤP"));
        p("Giường Tầng Kết Hợp Bàn Học L",          "gn21-giuong-tang-ket-hop-ban-hoc",catId,26_000_000L,          0L,false,"4.9",31, List.of("https://images.unsplash.com/photo-1617325247661-675ab03407d3?w=400&q=80"),  List.of("TRẺ EM", "TIỆN ÍCH"));
        p("Giường Gỗ Sồi Hộp Kéo Kiểu Đan Mạch",   "gn22-giuong-soi-hop-keo-dan-mach",catId,11_200_000L,13_000_000L,false,"4.7",52,List.of("https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=80"),  List.of());
        p("Giường Gỗ MDF Phủ Veneer Sồi Nhạt",      "gn23-giuong-mdf-veneer-soi",   catId,  7_800_000L,  9_000_000L, false, "4.5", 66,  List.of("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80"),  List.of("-15%"));
        p("Giường Ngủ Trẻ Em Hình Ô Tô",            "gn24-giuong-hinh-o-to",        catId,  8_500_000L,           0L, false, "4.8", 88,  List.of("https://images.unsplash.com/photo-1617325247661-675ab03407d3?w=400&q=80"),  List.of("TRẺ EM", "HOT"));
        p("Giường 1m8 Gỗ Tần Bì Đầu Giường Nỉ",    "gn25-giuong-1m8-go-tan-bi-ni", catId, 16_000_000L, 18_500_000L, false, "4.9", 28,  List.of("https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80"),  List.of());
        p("Giường Đơn Gỗ Thông 1m Cho Ký Túc Xá",  "gn26-giuong-don-1m-ky-tuc-xa", catId,  2_200_000L,  2_800_000L, false, "4.2", 155, List.of("https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80"),  List.of("GIÁ RẺ"));
    }

    // ─── BATCH 2 — TỦ & KỆ (13 SP) ──────────────────────────────────────────────
    private void seedTuKeProducts2(Long catId) {
        p("Tủ Đồ Trẻ Em Gỗ Thông Sơn Màu Pastel",  "tk15-tu-do-tre-em-pastel",     catId,  5_500_000L,  6_500_000L, false, "4.8", 62,  List.of("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"),  List.of("TRẺ EM"));
        p("Kệ Sách Gỗ Hình Bậc Thang 6 Ô",         "tk16-ke-sach-bac-thang-6-o",   catId,  3_800_000L,  4_500_000L, false, "4.7", 94,  List.of("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"),  List.of());
        p("Tủ Giày Âm Tường 30 Đôi",                "tk17-tu-giay-am-tuong-30-doi", catId,        0L,           0L, true,  "5.0", 12,  List.of("https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Kệ TV Khung Thép Tấm Gỗ Industrial",     "tk18-ke-tv-khung-thep-go",     catId,  5_200_000L,  6_200_000L, false, "4.6", 77,  List.of("https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&q=80"),  List.of("-15%"));
        p("Tủ Đựng Đồ Chơi Nắp Lật Gỗ Thông",      "tk19-tu-do-choi-nap-lat",      catId,  2_400_000L,           0L, false, "4.5", 110, List.of("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"),  List.of("TRẺ EM"));
        p("Kệ Đa Năng Phòng Khách Gỗ + Sắt",        "tk20-ke-da-nang-go-sat",       catId,  4_900_000L,  5_800_000L, false, "4.7", 55,  List.of("https://images.unsplash.com/photo-1505069190533-da1c9af13346?w=400&q=80"),  List.of());
        p("Tủ Quần Áo Gỗ Tần Bì 5 Cánh",           "tk21-tu-quan-ao-tan-bi-5-canh",catId, 32_000_000L,           0L, false, "5.0", 17,  List.of("https://images.unsplash.com/photo-1595526114101-1b9a1eb3d327?w=400&q=80"),  List.of("CAO CẤP"));
        p("Kệ Góc 5 Tầng Gỗ Cao Su Trắng",          "tk22-ke-goc-5-tang-trang",     catId,  1_850_000L,  2_300_000L, false, "4.4", 142, List.of("https://images.unsplash.com/photo-1505069190533-da1c9af13346?w=400&q=80"),  List.of("-20%"));
        p("Tủ Đựng Hồ Sơ Xếp Chồng Modular",       "tk23-tu-ho-so-xep-chong",      catId,  1_200_000L,           0L, false, "4.3", 185, List.of("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"),  List.of());
        p("Kệ Trưng Bày Sản Phẩm Khung Nhôm Kính", "tk24-ke-trung-bay-nhom-kinh",   catId,  8_500_000L,           0L, false, "4.8", 33,  List.of("https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&q=80"),  List.of());
        p("Tủ Quần Áo Mini 2 Cánh Phòng Khách",    "tk25-tu-quan-ao-mini-2-canh",   catId,  6_200_000L,  7_500_000L, false, "4.6", 49,  List.of("https://images.unsplash.com/photo-1595526114101-1b9a1eb3d327?w=400&q=80"),  List.of());
        p("Kệ Thư Viện Gỗ Sồi Kết Hợp Ghế Ngồi",  "tk26-ke-thu-vien-ket-hop-ghe",  catId, 18_000_000L,           0L, false, "5.0", 8,   List.of("https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80"),  List.of("CAO CẤP", "ĐỘC ĐÁO"));
        p("Tủ Hành Lang Mỏng 25cm Gỗ Trắng",       "tk27-tu-hanh-lang-25cm-trang",  catId,  2_800_000L,  3_400_000L, false, "4.5", 98,  List.of("https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=400&q=80"),  List.of("TIẾT KIỆM"));
    }

    // ─── BATCH 2 — ĐÈN TRANG TRÍ (12 SP) ────────────────────────────────────────
    private void seedDenProducts2(Long catId) {
        p("Đèn Thả Trần Bóng Tròn Đồng Thau",       "dn13-den-tha-bong-tron-dong",  catId,  1_650_000L,  2_000_000L, false, "4.6", 88,  List.of("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80"),  List.of("-15%"));
        p("Đèn Gương Phòng Tắm LED Hollywood",       "dn14-den-guong-hollywood-led", catId,  3_200_000L,  3_900_000L, false, "4.8", 65,  List.of("https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&q=80"),  List.of("HOT"));
        p("Đèn Cảm Ứng Ban Đêm Dán Tường",           "dn15-den-cam-ung-ban-dem",     catId,    180_000L,    250_000L, false, "4.2", 850, List.of("https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&q=80"),  List.of("-30%"));
        p("Đèn Thả Mây Tre Đan Hình Nón Lá",         "dn16-den-tha-non-la",          catId,  1_900_000L,           0L, false, "4.9", 47,  List.of("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80"),  List.of("HANDMADE"));
        p("Đèn Cây Đứng Gỗ Teak Tự Nhiên 1m6",      "dn17-den-cay-go-teak-1m6",     catId,  3_800_000L,  4_500_000L, false, "4.7", 38,  List.of("https://images.unsplash.com/photo-1524484485831-a92fa817e4bb?w=400&q=80"),  List.of());
        p("Đèn Tường Phòng Ngủ Đầu Giường Đôi",      "dn18-den-tuong-dau-giuong-doi",catId,    950_000L,  1_200_000L, false, "4.5", 160, List.of("https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&q=80"),  List.of("-20%"));
        p("Đèn Chùm Sắt Đen Bóng Edison 12 Nhánh",  "dn19-den-chum-sat-den-edison", catId,  6_800_000L,  8_200_000L, false, "4.8", 29,  List.of("https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&q=80"),  List.of("HOT"));
        p("Đèn Pin Solar Sân Vườn Chống Nước",        "dn20-den-solar-san-vuon",      catId,    420_000L,    580_000L, false, "4.3", 430, List.of("https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&q=80"),  List.of("-30%", "NGOÀI TRỜI"));
        p("Đèn Bàn Làm Việc Chỉnh Nhiệt Độ Màu",    "dn21-den-ban-chinh-nhiet-do",  catId,  1_100_000L,  1_400_000L, false, "4.6", 210, List.of("https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80"),  List.of());
        p("Đèn Thả Ốp Trần LED Panel 60x60",         "dn22-den-led-panel-60x60",     catId,    650_000L,           0L, false, "4.4", 380, List.of("https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&q=80"),  List.of());
        p("Đèn Lồng Tre Đan Phong Cách Á Đông",      "dn23-den-long-tre-a-dong",     catId,  2_800_000L,           0L, false, "5.0", 24,  List.of("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80"),  List.of("HANDMADE", "ĐỘC ĐÁO"));
        p("Đèn Ngủ Hình Mặt Trăng Tối Giản LED",    "dn24-den-ngu-mat-trang-led",    catId,    780_000L,    980_000L, false, "4.7", 320, List.of("https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&q=80"),  List.of("-20%", "MỚI"));
    }

    // ─── BATCH 2 — NỘI THẤT PHÒNG BẾP (12 SP) ──────────────────────────────────
    private void seedBepProducts2(Long catId) {
        p("Tủ Bếp Gỗ Xoan Đào Toàn Bộ Sơn PU",     "bp13-tu-bep-xoan-dao-son-pu",  catId,        0L,           0L, true,  "4.9", 23,  List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Kệ Bếp Inox Dưới Bồn Rửa 2 Tầng",        "bp14-ke-bep-inox-duoi-bon",    catId,    850_000L,  1_050_000L, false, "4.4", 260, List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("-20%"));
        p("Ghế Bar Bếp Gỗ Sồi Chân Cao Không Tựa",  "bp15-ghe-bar-go-soi-chan-cao",  catId,  1_400_000L,  1_700_000L, false, "4.5", 115, List.of("https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=80"),  List.of());
        p("Bàn Đảo Bếp Gỗ Óc Chó Mặt Đá Trắng",    "bp16-ban-dao-oc-cho-da-trang",  catId,        0L,           0L, true,  "5.0", 8,   List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("CAO CẤP", "THEO YÊU CẦU"));
        p("Kệ Gia Vị Treo Cửa Tủ Nhựa ABS",          "bp17-ke-gia-vi-treo-cua-tu",   catId,    320_000L,    420_000L, false, "4.2", 520, List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("-25%"));
        p("Tủ Bếp Thấp Gỗ Công Nghiệp Màu Trắng",   "bp18-tu-bep-thap-trang",       catId,  7_500_000L,  8_800_000L, false, "4.6", 44,  List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of());
        p("Bộ Dao Thớt Gỗ Teak Handmade Cao Cấp",   "bp19-bo-dao-thot-go-teak",      catId,  1_200_000L,  1_500_000L, false, "4.7", 185, List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("HANDMADE"));
        p("Kệ Rượu Âm Tủ Bếp Khung Sắt",             "bp20-ke-ruou-am-tu-bep",       catId,  2_200_000L,           0L, false, "4.8", 67,  List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of());
        p("Máy Rửa Chén Âm Bàn 45cm Nhúng",          "bp21-may-rua-chen-am-ban",     catId,  9_800_000L, 11_500_000L, false, "4.9", 31,  List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("HOT"));
        p("Tủ Bếp Treo Tường Cánh Kính Mờ",          "bp22-tu-bep-treo-canh-kinh-mo", catId,       0L,           0L, true,  "4.7", 38,  List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Kệ Bếp Đứng 5 Tầng Inox Đa Năng",         "bp23-ke-bep-5-tang-inox",      catId,  2_800_000L,           0L, false, "4.5", 144, List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of());
        p("Bộ Phụ Kiện Bếp Inox 5 Món Đồng Bộ",     "bp24-bo-phu-kien-bep-5-mon",   catId,    680_000L,    880_000L, false, "4.3", 290, List.of("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"),  List.of("-25%"));
    }

    // ─── BATCH 2 — NGOÀI TRỜI (12 SP) ───────────────────────────────────────────
    private void seedNgoaiTroiProducts2(Long catId) {
        p("Bộ Sofa Mây Nhựa 3 Món Sân Vườn",         "nt11-sofa-may-nhua-san-vuon",  catId, 14_500_000L,           0L, false, "4.8", 31,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of("MỚI"));
        p("Bàn Teak Tròn Đường Kính 80cm",             "nt12-ban-teak-tron-80cm",      catId,  6_800_000L,  8_000_000L, false, "4.9", 22,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of("TEAK"));
        p("Ghế Xếp Nhôm Có Tựa Đầu Ngoài Trời",      "nt13-ghe-xep-nhom-tua-dau",    catId,  1_100_000L,  1_400_000L, false, "4.5", 145, List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of("-20%"));
        p("Bộ Bàn Ghế Nhôm Sân Thượng 2 Ghế",        "nt14-bo-ban-ghe-nhom-san-thuong",catId,8_500_000L,           0L, false, "4.7", 48,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of());
        p("Tấm Lót Sàn Gỗ Nhựa Ngoài Trời 30x30",   "nt15-tam-lot-san-ngoai-troi",   catId,    150_000L,    200_000L, false, "4.3", 680, List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of("-25%"));
        p("Ghế Hammock Vải Bông Giữa 2 Cây",          "nt16-ghe-hammock-vai-bong",    catId,    950_000L,  1_200_000L, false, "4.6", 240, List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of());
        p("Đèn Trụ Sân Vườn Thái Dương Năng",         "nt17-den-tru-san-vuon-solar",  catId,    680_000L,    880_000L, false, "4.4", 320, List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of("-20%"));
        p("Bộ Bàn Ghế Cafe Ngoài Trời Sắt Đúc",      "nt18-bo-cafe-ngoai-troi-sat",  catId,  5_200_000L,  6_200_000L, false, "4.7", 55,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of());
        p("Kệ Cây Xanh Sân Vườn Sắt Uốn 5 Tầng",    "nt19-ke-cay-xanh-sat-uon-5t",  catId,  1_800_000L,  2_200_000L, false, "4.5", 110, List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of());
        p("Bồn Tắm Ngoài Trời Gỗ Teak Nhật",         "nt20-bon-tam-ngoai-troi-teak", catId,        0L,           0L, true,  "5.0", 5,   List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of("LUXURY", "TEAK"));
        p("Ghế Thư Giãn Poolside Nhựa Poly",          "nt21-ghe-poolside-nhua-poly",  catId,  2_800_000L,  3_400_000L, false, "4.6", 72,  List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of());
        p("Bộ Ăn Ngoài Trời 4 Ghế Mặt Đá Granite",  "nt22-bo-an-ngoai-troi-da",     catId, 28_000_000L,           0L, false, "5.0", 9,   List.of("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80"),  List.of("CAO CẤP"));
    }

    // ─── BATCH 2 — VĂN PHÒNG (13 SP) ────────────────────────────────────────────
    private void seedVanPhongProducts2(Long catId) {
        p("Ghế Giám Đốc Massage Tích Hợp",           "vp13-ghe-giam-doc-massage",    catId, 14_500_000L, 18_000_000L, false, "4.9", 28,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("HOT", "CAO CẤP"));
        p("Bàn Họp Chữ T 8 Người Gỗ Óc Chó",        "vp14-ban-hop-chu-t-8-nguoi",   catId,        0L,           0L, true,  "5.0", 7,   List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Ghế Lưới Ergonomic Tựa Đầu Có Thể Điều Chỉnh","vp15-ghe-luoi-ergonomic",  catId,  4_800_000L,  5_800_000L, false, "4.8", 155, List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("ERGONOMIC"));
        p("Bàn Văn Phòng Chữ L Góc Gỗ MDF Trắng",   "vp16-ban-van-phong-chu-l",     catId,  4_500_000L,  5_500_000L, false, "4.6", 88,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of());
        p("Tủ Locker Sắt 6 Ngăn Phòng Thay Đồ",     "vp17-tu-locker-sat-6-ngan",    catId,  3_800_000L,           0L, false, "4.5", 67,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of());
        p("Ghế Chờ Khách Sofa Mini Văn Phòng",        "vp18-ghe-cho-khach-sofa-mini", catId,  7_200_000L,  8_500_000L, false, "4.7", 44,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of());
        p("Bàn Tiếp Tân Reception Cong Gỗ MDF",      "vp19-ban-tiep-tan-cong",       catId,        0L,           0L, true,  "4.9", 11,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Ghế Họp Có Tay Vịn Bọc Nệm Vải",          "vp20-ghe-hop-co-tay-vijn",     catId,  1_500_000L,  1_900_000L, false, "4.4", 210, List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("-20%"));
        p("Bàn Giám Đốc Gỗ Tần Bì Chữ L Góc",       "vp21-ban-giam-doc-tan-bi-chu-l",catId,28_000_000L,           0L, false, "5.0", 9,   List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("CAO CẤP"));
        p("Vách Ngăn Kính Cường Lực Văn Phòng",       "vp22-vach-ngan-kinh-cuong-luc",catId,        0L,           0L, true,  "5.0", 14,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("THEO YÊU CẦU"));
        p("Kệ Sách Văn Phòng Gỗ Sồi 6 Ngăn",         "vp23-ke-sach-van-phong-6-ngan",catId,  5_800_000L,  6_900_000L, false, "4.7", 55,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of());
        p("Bộ Bàn Phòng Lab Kệ Máy Tính 2 Màn",      "vp24-ban-lab-ke-may-tinh-2man",catId,  8_500_000L,           0L, false, "4.8", 33,  List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("MỚI"));
        p("Ghế Phòng Họp Gấp Gọn Xếp Chồng",         "vp25-ghe-hop-gap-gon-xep",     catId,    680_000L,    880_000L, false, "4.3", 440, List.of("https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80"),  List.of("-25%"));
    }

    // ─── HELPERS ────────────────────────────────────────────────────────────────

    private Category createCategory(String name, String slug, String icon, String image) {
        // Nếu category đã tồn tại thì trả về luôn, không tạo mới
        return categoryRepository.findBySlug(slug).orElseGet(() -> {
            ProductDto.CategoryRequest req = new ProductDto.CategoryRequest();
            req.setName(name);
            req.setSlug(slug);
            req.setIcon(icon);
            req.setImageUrl(image);
            req.setDescription(name + " chất lượng cao, đa dạng mẫu mã.");
            ProductDto.CategoryResponse res = categoryService.createCategory(req);
            return categoryRepository.findById(res.getId()).get();
        });
    }

    /** Tạo sản phẩm — skip nếu slug đã tồn tại */
    private void p(String name, String slug, Long catId,
                   long priceCurRaw, long priceOriRaw, boolean contact,
                   String rating, int count,
                   List<String> images, List<String> badges) {
        // Skip nếu đã có
        if (productRepository.existsBySlug(slug)) return;

        ProductDto.CreateProductRequest req = new ProductDto.CreateProductRequest();
        req.setName(name);
        req.setSlug(slug);
        req.setCategoryId(catId);
        req.setPriceCurrent(contact || priceCurRaw == 0 ? null : BigDecimal.valueOf(priceCurRaw));
        req.setPriceOriginal(priceOriRaw > 0 ? BigDecimal.valueOf(priceOriRaw) : null);
        req.setPriceContact(contact);
        req.setRatingStars(new BigDecimal(rating));
        req.setRatingCount(count);
        req.setImageUrls(images);
        req.setBadges(badges);
        req.setDescription("Sản phẩm " + name +
            " được chế tác từ vật liệu cao cấp, đảm bảo độ bền và thẩm mỹ. " +
            "Phù hợp cho mọi không gian từ hiện đại đến cổ điển. " +
            "Bảo hành 12–24 tháng tùy sản phẩm.");
        productService.createProduct(req);
    }

    /**
     * Gọi khi categories đã có nhưng muốn thêm products còn thiếu.
     * Mỗi hàm seed gọi p() — p() tự skip nếu slug đã tồn tại.
     */
    private void seedMissingProducts() {
        // Lấy category ID theo slug
        Category catSofa      = categoryRepository.findBySlug("sofa-ghe").orElse(null);
        Category catBanGhe    = categoryRepository.findBySlug("ban-ghe").orElse(null);
        Category catGiuong    = categoryRepository.findBySlug("giuong-ngu").orElse(null);
        Category catTuKe      = categoryRepository.findBySlug("tu-ke").orElse(null);
        Category catDen       = categoryRepository.findBySlug("den-trang-tri").orElse(null);
        Category catBepAn     = categoryRepository.findBySlug("noi-that-bep").orElse(null);
        Category catNgoaiTroi = categoryRepository.findBySlug("ngoai-troi").orElse(null);
        Category catVanPhong  = categoryRepository.findBySlug("van-phong").orElse(null);

        if (catSofa != null)      { seedSofaProducts(catSofa.getId());      seedSofaProducts2(catSofa.getId()); }
        if (catBanGhe != null)    { seedBanGheProducts(catBanGhe.getId());   seedBanGheProducts2(catBanGhe.getId()); }
        if (catGiuong != null)    { seedGiuongProducts(catGiuong.getId());   seedGiuongProducts2(catGiuong.getId()); }
        if (catTuKe != null)      { seedTuKeProducts(catTuKe.getId());       seedTuKeProducts2(catTuKe.getId()); }
        if (catDen != null)       { seedDenProducts(catDen.getId());         seedDenProducts2(catDen.getId()); }
        if (catBepAn != null)     { seedBepProducts(catBepAn.getId());       seedBepProducts2(catBepAn.getId()); }
        if (catNgoaiTroi != null) { seedNgoaiTroiProducts(catNgoaiTroi.getId()); seedNgoaiTroiProducts2(catNgoaiTroi.getId()); }
        if (catVanPhong != null)  { seedVanPhongProducts(catVanPhong.getId()); seedVanPhongProducts2(catVanPhong.getId()); }
    }
}
