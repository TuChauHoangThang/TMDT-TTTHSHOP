package com.example.backend.repository;

import com.example.backend.entity.Escrow;
import com.example.backend.entity.EscrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.backend.dto.TopPartnerDto;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Repository
public interface EscrowRepository extends JpaRepository<Escrow, Long> {
    Optional<Escrow> findByRequestId(Long requestId);
    List<Escrow> findAllByOrderByCreatedAtDesc();
    List<Escrow> findByStatus(EscrowStatus status);

    @Query("SELECT e FROM Escrow e WHERE e.customer.id = :customerId ORDER BY e.createdAt DESC")
    List<Escrow> findByCustomerIdOrderByCreatedAtDesc(@Param("customerId") Long customerId);

    @Query("SELECT e FROM Escrow e WHERE e.contractor.id = :contractorId ORDER BY e.createdAt DESC")
    List<Escrow> findByContractorIdOrderByCreatedAtDesc(@Param("contractorId") Long contractorId);
    @Query("SELECT new com.example.backend.dto.TopPartnerDto(" +
            "e.contractor.id, e.contractor.fullName, e.contractor.email, " +
            "COUNT(e), COALESCE(SUM(e.netAmount), 0)) " +
            "FROM Escrow e " +
            "WHERE e.status = com.example.backend.entity.EscrowStatus.RELEASED " +
            "GROUP BY e.contractor.id, e.contractor.fullName, e.contractor.email " +
            "ORDER BY COUNT(e) DESC")
    List<TopPartnerDto> findTopContractors(Pageable pageable);

    @Query("SELECT new com.example.backend.dto.TopPartnerDto(" +
            "e.customer.id, e.customer.fullName, e.customer.email, " +
            "COUNT(e), COALESCE(SUM(e.amount), 0)) " +
            "FROM Escrow e " +
            "WHERE e.status = com.example.backend.entity.EscrowStatus.RELEASED " +
            "GROUP BY e.customer.id, e.customer.fullName, e.customer.email " +
            "ORDER BY COUNT(e) DESC")
    List<TopPartnerDto> findTopCustomers(Pageable pageable);
    @Query("SELECT new com.example.backend.dto.TopPartnerDto(" +
            "e.contractor.id, e.contractor.fullName, e.contractor.email, " +
            "COUNT(e), COALESCE(SUM(e.netAmount), 0)) " +
            "FROM Escrow e " +
            "WHERE e.status = com.example.backend.entity.EscrowStatus.RELEASED " +
            "AND e.contractor.id = :contractorId " +
            "GROUP BY e.contractor.id, e.contractor.fullName, e.contractor.email")
    Optional<TopPartnerDto> findContractorStats(@Param("contractorId") Long contractorId);

    @Query("SELECT new com.example.backend.dto.TopPartnerDto(" +
            "e.customer.id, e.customer.fullName, e.customer.email, " +
            "COUNT(e), COALESCE(SUM(e.amount), 0)) " +
            "FROM Escrow e " +
            "WHERE e.status = com.example.backend.entity.EscrowStatus.RELEASED " +
            "AND e.customer.id = :customerId " +
            "GROUP BY e.customer.id, e.customer.fullName, e.customer.email")
    Optional<TopPartnerDto> findCustomerStats(@Param("customerId") Long customerId);
}
