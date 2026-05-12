package com.example.backend.repository;

import com.example.backend.entity.CustomOrderRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomOrderRequestRepository extends JpaRepository<CustomOrderRequest, Long> {

    /** Lấy tất cả yêu cầu của một customer */
    List<CustomOrderRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    /** Lấy các yêu cầu đang OPEN hoặc QUOTED (nhà thầu xem) */
    @Query("SELECT r FROM CustomOrderRequest r WHERE r.status IN ('OPEN', 'QUOTED') ORDER BY r.createdAt DESC")
    Page<CustomOrderRequest> findOpenRequests(Pageable pageable);

    /** Tìm kiếm yêu cầu mở theo từ khóa + loại nội thất */
    @Query("SELECT r FROM CustomOrderRequest r WHERE r.status IN ('OPEN', 'QUOTED') " +
           "AND (:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:furnitureType IS NULL OR r.furnitureType = :furnitureType) " +
           "ORDER BY r.createdAt DESC")
    Page<CustomOrderRequest> searchOpenRequests(
            @Param("keyword") String keyword,
            @Param("furnitureType") String furnitureType,
            Pageable pageable);
}
