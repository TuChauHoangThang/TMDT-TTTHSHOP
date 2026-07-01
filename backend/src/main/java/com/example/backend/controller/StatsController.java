package com.example.backend.controller;

import com.example.backend.dto.TopPartnerDto;
import com.example.backend.repository.EscrowRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final EscrowRepository escrowRepository;

    public StatsController(EscrowRepository escrowRepository) {
        this.escrowRepository = escrowRepository;
    }

    @GetMapping("/top-contractors")
    public List<TopPartnerDto> getTopContractors(@RequestParam(defaultValue = "10") int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return escrowRepository.findTopContractors(pageable);
    }

    @GetMapping("/top-customers")
    public List<TopPartnerDto> getTopCustomers(@RequestParam(defaultValue = "10") int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return escrowRepository.findTopCustomers(pageable);
    }
    @GetMapping("/contractor/{id}")
    public TopPartnerDto getContractorStats(@PathVariable Long id) {
        return escrowRepository.findContractorStats(id)
                .orElse(new TopPartnerDto(id, "", "", 0L, java.math.BigDecimal.ZERO));
    }

    @GetMapping("/customer/{id}")
    public TopPartnerDto getCustomerStats(@PathVariable Long id) {
        return escrowRepository.findCustomerStats(id)
                .orElse(new TopPartnerDto(id, "", "", 0L, java.math.BigDecimal.ZERO));
    }
}