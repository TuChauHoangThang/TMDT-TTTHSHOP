package com.example.backend.service;

import com.example.backend.dto.OrderRequestDTO;
import com.example.backend.entity.CartItem;
import com.example.backend.entity.Order;
import com.example.backend.entity.OrderItem;
import com.example.backend.entity.Product;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;


@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Order createOrder(String customerId, OrderRequestDTO requestDTO) {
        List<CartItem> cartItems = cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Order order = new Order();
        order.setCustomerId(customerId);
        order.setFullName(requestDTO.getFullName());
        order.setPhone(requestDTO.getPhone());
        order.setAddress(requestDTO.getAddress());
        order.setNote(requestDTO.getNote());
        order.setPaymentMethod(requestDTO.getPaymentMethod());
        order.setStatus("PENDING");

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            
            int requestedQty = cartItem.getQuantity();
            if (product.getStock() != null && product.getStock() < requestedQty) {
                throw new RuntimeException("Sản phẩm '" + product.getName() + "' không đủ số lượng trong kho! Hiện chỉ còn " + product.getStock() + " sản phẩm.");
            }
            if (product.getStock() != null) {
                product.setStock(product.getStock() - requestedQty);
            }
            
            BigDecimal price = product.getPriceCurrent() != null ? product.getPriceCurrent() : BigDecimal.ZERO;
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(requestedQty);
            orderItem.setPrice(price);

            order.getItems().add(orderItem);

            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(requestedQty));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        cartItemRepository.deleteByCustomerId(customerId);
        
        notificationService.createNotification(
            customerId, 
            "Đặt hàng thành công", 
            "Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý. Cảm ơn bạn đã mua sắm tại HTTTSHOP!"
        );

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByCustomer(String customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long id, String customerId) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng #" + id));
        if (!order.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền xem đơn hàng này");
        }
        return order;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
