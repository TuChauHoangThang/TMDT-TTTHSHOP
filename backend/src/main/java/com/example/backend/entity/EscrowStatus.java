package com.example.backend.entity;

public enum EscrowStatus {
    PENDING,   // Awaiting payment/deposit
    HELD,      // Deposit received, held by platform
    RELEASED,  // Funds released to contractor
    REFUNDED,  // Funds refunded to customer
    DISPUTED   // Dispute opened by customer
}
