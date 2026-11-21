package com.maireposteria.users.domain.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.maireposteria.users.domain.entity.AdminAuditLog;

public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, java.util.UUID> {
    List<AdminAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
