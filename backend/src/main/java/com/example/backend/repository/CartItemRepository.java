package com.example.backend.repository;

import com.example.backend.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    Optional<CartItem> findByCustomerIdAndProductId(String customerId, Long productId);
    void deleteByCustomerId(String customerId);
}
