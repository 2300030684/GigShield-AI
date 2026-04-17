package com.trustpay.backend.controller;

import com.trustpay.backend.model.InsuranceProduct;
import com.trustpay.backend.repository.InsuranceProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insurance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InsuranceController {

    private final InsuranceProductRepository insuranceProductRepository;

    @GetMapping("/products")
    public List<InsuranceProduct> getAllProducts() {
        return insuranceProductRepository.findByActiveTrue();
    }

    @GetMapping("/products/category/{category}")
    public List<InsuranceProduct> getProductsByCategory(@PathVariable String category) {
        return insuranceProductRepository.findByCategory(category);
    }
}
