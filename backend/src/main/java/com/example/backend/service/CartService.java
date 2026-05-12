package com.example.backend.service;

import com.example.backend.dto.CartDto;
import com.example.backend.entity.CartItem;
import com.example.backend.entity.Product;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public CartDto.CartResponse getCart(String customerId) {
        List<CartItem> items = cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        
        List<CartDto.CartItemResponse> itemResponses = items.stream().map(item -> {
            CartDto.CartItemResponse res = new CartDto.CartItemResponse();
            res.setId(item.getId());
            res.setProductId(item.getProduct().getId());
            res.setProductName(item.getProduct().getName());
            res.setProductSlug(item.getProduct().getSlug());
            
            // Get primary image
            String imgUrl = item.getProduct().getImages().stream()
                .filter(i -> Boolean.TRUE.equals(i.isPrimary()))
                .map(i -> i.getImageUrl())
                .findFirst()
                .orElse(item.getProduct().getImages().isEmpty() ? null : item.getProduct().getImages().get(0).getImageUrl());
            res.setProductImage(imgUrl);
            
            BigDecimal price = item.getProduct().getPriceCurrent() != null ? item.getProduct().getPriceCurrent() : BigDecimal.ZERO;
            res.setPrice(price);
            res.setQuantity(item.getQuantity());
            res.setTotalLinePrice(price.multiply(BigDecimal.valueOf(item.getQuantity())));
            
            return res;
        }).collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(CartDto.CartItemResponse::getTotalLinePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartDto.CartResponse response = new CartDto.CartResponse();
        response.setItems(itemResponses);
        response.setCartTotal(total);
        return response;
    }

    @Transactional
    public void addToCart(String customerId, CartDto.AddToCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        Optional<CartItem> existingItem = cartItemRepository.findByCustomerIdAndProductId(customerId, product.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCustomerId(customerId);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            cartItemRepository.save(newItem);
        }
    }

    @Transactional
    public void updateCartItem(String customerId, Long itemId, CartDto.UpdateCartRequest request) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item không tồn tại"));

        if (!item.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Không có quyền cập nhật");
        }

        if (request.getQuantity() <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
        }
    }

    @Transactional
    public void removeCartItem(String customerId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item không tồn tại"));

        if (!item.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Không có quyền xóa");
        }

        cartItemRepository.delete(item);
    }
    
    @Transactional
    public void clearCart(String customerId) {
        cartItemRepository.deleteByCustomerId(customerId);
    }
}
