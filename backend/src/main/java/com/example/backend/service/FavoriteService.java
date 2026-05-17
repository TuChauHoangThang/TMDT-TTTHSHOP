package com.example.backend.service;

import com.example.backend.dto.ProductDto;
import com.example.backend.entity.Favorite;
import com.example.backend.entity.Product;
import com.example.backend.repository.FavoriteRepository;
import com.example.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<ProductDto.ProductSummary> getFavorites(String customerId) {
        return favoriteRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(f -> ProductDto.ProductSummary.from(f.getProduct()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void toggleFavorite(String customerId, Long productId) {
        Optional<Favorite> existing = favoriteRepository.findByCustomerIdAndProductId(customerId, productId);
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
        } else {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            Favorite favorite = new Favorite();
            favorite.setCustomerId(customerId);
            favorite.setProduct(product);
            favoriteRepository.save(favorite);
        }
    }
}
