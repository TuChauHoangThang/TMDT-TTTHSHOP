package com.example.backend.repository;

import com.example.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    /**
     * Tìm kiếm sản phẩm với keyword (tên) và/hoặc category slug.
     * Chỉ trả về sản phẩm ACTIVE.
     */
    @Query("""
        SELECT p FROM Product p
        JOIN FETCH p.category c
        WHERE p.status = com.example.backend.entity.Product$Status.ACTIVE
          AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:categorySlug IS NULL OR c.slug = :categorySlug)
    """)
    Page<Product> searchProducts(
            @Param("keyword") String keyword,
            @Param("categorySlug") String categorySlug,
            Pageable pageable
    );

    /**
     * Lấy sản phẩm nổi bật: ACTIVE, sắp xếp theo rating và rating count.
     */
    @Query("""
        SELECT p FROM Product p
        JOIN FETCH p.category
        WHERE p.status = com.example.backend.entity.Product$Status.ACTIVE
        ORDER BY p.ratingStars DESC, p.ratingCount DESC
    """)
    List<Product> findFeatured(Pageable pageable);

    /**
     * Lấy sản phẩm theo category slug.
     */
    @Query("""
        SELECT p FROM Product p
        JOIN FETCH p.category c
        WHERE p.status = com.example.backend.entity.Product$Status.ACTIVE
          AND c.slug = :categorySlug
    """)
    Page<Product> findByCategorySlug(@Param("categorySlug") String categorySlug, Pageable pageable);

    /**
     * Đếm số sản phẩm ACTIVE theo category (dùng cho CategoryResponse).
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.status = com.example.backend.entity.Product$Status.ACTIVE")
    long countActiveByCategoryId(@Param("categoryId") Long categoryId);
}
