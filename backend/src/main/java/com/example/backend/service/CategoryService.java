package com.example.backend.service;

import com.example.backend.dto.ProductDto;
import com.example.backend.entity.Category;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    /**
     * Lấy tất cả danh mục (kèm số lượng sản phẩm)
     */
    public List<ProductDto.CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc().stream()
                .map(c -> {
                    long count = productRepository.countActiveByCategoryId(c.getId());
                    return ProductDto.CategoryResponse.from(c, count);
                })
                .toList();
    }

    /**
     * Lấy danh mục theo slug
     */
    public ProductDto.CategoryResponse getCategoryBySlug(String slug) {
        Category c = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục: " + slug));
        long count = productRepository.countActiveByCategoryId(c.getId());
        return ProductDto.CategoryResponse.from(c, count);
    }

    /**
     * Tạo danh mục mới (Admin)
     */
    @Transactional
    public ProductDto.CategoryResponse createCategory(ProductDto.CategoryRequest dto) {
        if (categoryRepository.existsBySlug(dto.getSlug())) {
            throw new RuntimeException("Slug '" + dto.getSlug() + "' đã tồn tại");
        }
        Category c = new Category();
        c.setName(dto.getName());
        c.setSlug(dto.getSlug());
        c.setIcon(dto.getIcon());
        c.setImageUrl(dto.getImageUrl());
        c.setDescription(dto.getDescription());
        Category saved = categoryRepository.save(c);
        return ProductDto.CategoryResponse.from(saved, 0);
    }

    /**
     * Cập nhật danh mục (Admin)
     */
    @Transactional
    public ProductDto.CategoryResponse updateCategory(Long id, ProductDto.CategoryRequest dto) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục #" + id));
        if (!c.getSlug().equals(dto.getSlug()) && categoryRepository.existsBySlug(dto.getSlug())) {
            throw new RuntimeException("Slug '" + dto.getSlug() + "' đã tồn tại");
        }
        c.setName(dto.getName());
        c.setSlug(dto.getSlug());
        c.setIcon(dto.getIcon());
        c.setImageUrl(dto.getImageUrl());
        c.setDescription(dto.getDescription());
        Category saved = categoryRepository.save(c);
        long count = productRepository.countActiveByCategoryId(saved.getId());
        return ProductDto.CategoryResponse.from(saved, count);
    }

    /**
     * Xóa danh mục (Admin) — chỉ xóa khi không có sản phẩm
     */
    @Transactional
    public void deleteCategory(Long id) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục #" + id));
        long count = productRepository.countActiveByCategoryId(id);
        if (count > 0) {
            throw new RuntimeException("Không thể xóa danh mục đang có " + count + " sản phẩm");
        }
        categoryRepository.delete(c);
    }
}
