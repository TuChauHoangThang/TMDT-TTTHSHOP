package com.example.backend.service;

import com.example.backend.dto.ProductDto;
import com.example.backend.entity.Category;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductBadge;
import com.example.backend.entity.ProductImage;
import com.example.backend.entity.Shop;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.ShopRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.math.BigDecimal;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ShopRepository shopRepository;

    public ProductService(ProductRepository productRepository, 
                          CategoryRepository categoryRepository, 
                          ShopRepository shopRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.shopRepository = shopRepository;
    }

    /**
     * Tìm kiếm và phân trang sản phẩm
     */
    public ProductDto.PagedProductResponse getProducts(String keyword, String categorySlug, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.searchProducts(keyword, categorySlug, pageable);
        return ProductDto.PagedProductResponse.from(productPage.map(ProductDto.ProductSummary::from));
    }

    /**
     * Lấy danh sách sản phẩm của Seller (Nhà thầu)
     */
    public ProductDto.PagedProductResponse getProductsByShop(Long contractorId, int page, int size) {
        Shop shop = shopRepository.findByOwnerId(contractorId)
                .orElseThrow(() -> new RuntimeException("Tài khoản nhà thầu chưa cấu hình cửa hàng"));
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepository.findByShopId(shop.getId(), pageable);
        return ProductDto.PagedProductResponse.from(productPage.map(ProductDto.ProductSummary::from));
    }

    /**
     * Sản phẩm nổi bật (trang chủ)
     */
    public List<ProductDto.ProductSummary> getFeaturedProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.findFeatured(pageable).stream()
                .map(ProductDto.ProductSummary::from)
                .toList();
    }

    /**
     * Gợi ý tìm kiếm (autocomplete)
     */
    public List<ProductDto.ProductSummary> getSuggestions(String keyword, int limit) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.findSuggestions(keyword.trim(), pageable).stream()
                .map(ProductDto.ProductSummary::from)
                .toList();
    }

    /**
     * Chi tiết sản phẩm
     */
    public ProductDto.ProductDetail getProductById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm #" + id));
        return ProductDto.ProductDetail.from(p);
    }
    
    /**
     * Chi tiết sản phẩm theo slug
     */
    public ProductDto.ProductDetail getProductBySlug(String slug) {
        Product p = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với slug: " + slug));
        return ProductDto.ProductDetail.from(p);
    }

    /**
     * Tạo sản phẩm (Admin / Seller)
     */
    @Transactional
    public ProductDto.ProductDetail createProduct(ProductDto.CreateProductRequest dto, Long contractorId) {
        if (productRepository.existsBySlug(dto.getSlug())) {
            throw new RuntimeException("Slug '" + dto.getSlug() + "' đã tồn tại");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        Product p = new Product();
        p.setName(dto.getName());
        p.setSlug(dto.getSlug());
        p.setDescription(dto.getDescription());
        p.setCategory(category);
        p.setPriceCurrent(dto.getPriceCurrent());
        p.setPriceOriginal(dto.getPriceOriginal());
        p.setPriceContact(dto.getPriceContact() != null ? dto.getPriceContact() : false);
        p.setRatingStars(dto.getRatingStars() != null ? dto.getRatingStars() : BigDecimal.valueOf(5.0));
        p.setRatingCount(dto.getRatingCount() != null ? dto.getRatingCount() : 0);

        if (contractorId != null) {
            Shop shop = shopRepository.findByOwnerId(contractorId)
                    .orElseThrow(() -> new RuntimeException("Tài khoản nhà thầu chưa cấu hình cửa hàng"));
            p.setShop(shop);
            p.setStatus(Product.Status.PENDING); // Sản phẩm seller đăng mặc định chờ duyệt
        } else if (dto.getShopId() != null) {
            Shop shop = shopRepository.findById(dto.getShopId())
                    .orElseThrow(() -> new RuntimeException("Cửa hàng không tồn tại"));
            p.setShop(shop);
            p.setStatus(Product.Status.PENDING);
        } else {
            p.setStatus(Product.Status.ACTIVE); // Sản phẩm admin đăng hoạt động ngay
        }

        // Images
        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            for (int i = 0; i < dto.getImageUrls().size(); i++) {
                ProductImage img = new ProductImage();
                img.setProduct(p);
                img.setImageUrl(dto.getImageUrls().get(i));
                img.setSortOrder(i);
                img.setPrimary(i == 0); // First image is primary
                p.getImages().add(img);
            }
        }

        // Badges
        if (dto.getBadges() != null && !dto.getBadges().isEmpty()) {
            for (String label : dto.getBadges()) {
                ProductBadge badge = new ProductBadge();
                badge.setProduct(p);
                badge.setBadgeLabel(label);
                p.getBadges().add(badge);
            }
        }

        Product saved = productRepository.save(p);
        return ProductDto.ProductDetail.from(saved);
    }

    /**
     * Cập nhật sản phẩm (Admin / Seller)
     */
    @Transactional
    public ProductDto.ProductDetail updateProduct(Long id, ProductDto.UpdateProductRequest dto, Long contractorId) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm #" + id));

        if (contractorId != null) {
            Shop shop = shopRepository.findByOwnerId(contractorId)
                    .orElseThrow(() -> new RuntimeException("Tài khoản nhà thầu chưa cấu hình cửa hàng"));
            if (p.getShop() == null || !p.getShop().getId().equals(shop.getId())) {
                throw new RuntimeException("Bạn không có quyền sửa sản phẩm này");
            }
            p.setStatus(Product.Status.PENDING); // Đưa về chờ duyệt khi Seller cập nhật
        } else {
            if (dto.getShopId() != null) {
                Shop shop = shopRepository.findById(dto.getShopId())
                        .orElseThrow(() -> new RuntimeException("Cửa hàng không tồn tại"));
                p.setShop(shop);
            }
            if (dto.getStatus() != null) {
                p.setStatus(Product.Status.valueOf(dto.getStatus()));
            }
        }

        if (dto.getName() != null) p.setName(dto.getName());
        if (dto.getDescription() != null) p.setDescription(dto.getDescription());
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
            p.setCategory(category);
        }
        if (dto.getPriceCurrent() != null) p.setPriceCurrent(dto.getPriceCurrent());
        if (dto.getPriceOriginal() != null) p.setPriceOriginal(dto.getPriceOriginal());
        if (dto.getPriceContact() != null) p.setPriceContact(dto.getPriceContact());
        if (dto.getRatingStars() != null) p.setRatingStars(dto.getRatingStars());
        if (dto.getRatingCount() != null) p.setRatingCount(dto.getRatingCount());

        // Update Images
        if (dto.getImageUrls() != null) {
            p.getImages().clear();
            for (int i = 0; i < dto.getImageUrls().size(); i++) {
                ProductImage img = new ProductImage();
                img.setProduct(p);
                img.setImageUrl(dto.getImageUrls().get(i));
                img.setSortOrder(i);
                img.setPrimary(i == 0);
                p.getImages().add(img);
            }
        }

        // Update Badges
        if (dto.getBadges() != null) {
            p.getBadges().clear();
            for (String label : dto.getBadges()) {
                ProductBadge badge = new ProductBadge();
                badge.setProduct(p);
                badge.setBadgeLabel(label);
                p.getBadges().add(badge);
            }
        }

        Product saved = productRepository.save(p);
        return ProductDto.ProductDetail.from(saved);
    }

    /**
     * Soft delete sản phẩm (Admin / Seller)
     */
    @Transactional
    public void deleteProduct(Long id, Long contractorId) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm #" + id));
        if (contractorId != null) {
            Shop shop = shopRepository.findByOwnerId(contractorId)
                    .orElseThrow(() -> new RuntimeException("Tài khoản nhà thầu chưa cấu hình cửa hàng"));
            if (p.getShop() == null || !p.getShop().getId().equals(shop.getId())) {
                throw new RuntimeException("Bạn không có quyền xóa sản phẩm này");
            }
        }
        p.setStatus(Product.Status.INACTIVE);
        productRepository.save(p);
    }
}
