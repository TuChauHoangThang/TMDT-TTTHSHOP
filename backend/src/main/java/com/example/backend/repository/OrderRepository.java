package com.example.backend.repository;

import com.example.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i JOIN i.product p WHERE p.shop.id = :shopId ORDER BY o.createdAt DESC")
    List<Order> findByShopIdOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("shopId") Long shopId);

    long countByStatus(String status);

    long countByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    long countByStatusAndCreatedAtBetween(String status, java.time.LocalDateTime start, java.time.LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED'")
    BigDecimal sumCompletedRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    BigDecimal sumRevenueBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}
