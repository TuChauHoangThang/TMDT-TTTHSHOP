package com.example.backend.repository;

import com.example.backend.entity.Escrow;
import com.example.backend.entity.EscrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}
