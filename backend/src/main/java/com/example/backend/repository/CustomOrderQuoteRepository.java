package com.example.backend.repository;

import com.example.backend.entity.CustomOrderQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomOrderQuoteRepository extends JpaRepository<CustomOrderQuote, Long> {

    List<CustomOrderQuote> findByRequest_IdOrderByCreatedAtAsc(Long requestId);

    /** Kiểm tra nhà thầu đã báo giá cho yêu cầu này chưa */
    boolean existsByRequest_IdAndContractorId(Long requestId, Long contractorId);

    /** Lấy báo giá của nhà thầu cho một yêu cầu cụ thể */
    Optional<CustomOrderQuote> findByRequest_IdAndContractorId(Long requestId, Long contractorId);

    List<CustomOrderQuote> findByContractorIdAndStatus(Long contractorId, CustomOrderQuote.Status status);
}
