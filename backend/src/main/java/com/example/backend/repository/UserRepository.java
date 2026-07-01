package com.example.backend.repository;

import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleOrderByCreatedAtDesc(Role role);
    long countByRole(Role role);
    long countByRoleAndCreatedAtBetween(Role role, java.time.LocalDateTime start, java.time.LocalDateTime end);
    List<User> findAllByOrderByCreatedAtDesc();
}