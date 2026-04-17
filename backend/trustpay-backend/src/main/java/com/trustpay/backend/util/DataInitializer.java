package com.trustpay.backend.util;

import com.trustpay.backend.model.BlogPost;
import com.trustpay.backend.model.InsuranceProduct;
import com.trustpay.backend.repository.BlogPostRepository;
import com.trustpay.backend.repository.InsuranceProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final BlogPostRepository blogPostRepository;
    private final InsuranceProductRepository insuranceProductRepository;

    @Override
    public void run(String... args) throws Exception {
        if (blogPostRepository.count() == 0) {
            blogPostRepository.saveAll(Arrays.asList(
                BlogPost.builder()
                    .title("The Future of Gig Economy Insurance")
                    .summary("How AI and real-time data are transforming how delivery partners stay protected.")
                    .content("Full content here...")
                    .author("Trustpay AI Team")
                    .category("Trends")
                    .imageUrl("https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&q=80&w=600")
                    .build(),
                BlogPost.builder()
                    .title("Managing Your Earnings During Monsoons")
                    .summary("Tips and tricks to stay safe and maximize your income during rainy seasons.")
                    .content("Full content here...")
                    .author("Safety Division")
                    .category("Guides")
                    .imageUrl("https://images.unsplash.com/photo-1534274988757-a28bf1f534c7?auto=format&fit=crop&q=80&w=600")
                    .build(),
                BlogPost.builder()
                    .title("Understanding Instant Payouts")
                    .summary("How Trustpay ensures you get your claim amount in under 60 seconds.")
                    .content("Full content here...")
                    .author("Tech Blog")
                    .category("Product")
                    .imageUrl("https://images.unsplash.com/photo-1556742049-02e49f9d2d18?auto=format&fit=crop&q=80&w=600")
                    .build()
            ));
        }

        if (insuranceProductRepository.count() == 0) {
            insuranceProductRepository.saveAll(Arrays.asList(
                InsuranceProduct.builder()
                    .name("Elite Weather Protection")
                    .description("Maximum coverage for extreme weather events. Includes rain, heatwaves, and storms.")
                    .category("Environmental")
                    .monthlyPremium(new BigDecimal("299.00"))
                    .coverageAmount(new BigDecimal("50000.00"))
                    .iconName("CloudRain")
                    .build(),
                InsuranceProduct.builder()
                    .name("Traffic Delay Shield")
                    .description("Get compensated for significant road disruptions and political rallies.")
                    .category("Logistics")
                    .monthlyPremium(new BigDecimal("149.00"))
                    .coverageAmount(new BigDecimal("25000.00"))
                    .iconName("Navigation")
                    .build(),
                InsuranceProduct.builder()
                    .name("Health Hero")
                    .description("Specialized health insurance for gig workers with 24/7 tele-consultation.")
                    .category("Health")
                    .monthlyPremium(new BigDecimal("499.00"))
                    .coverageAmount(new BigDecimal("200000.00"))
                    .iconName("Heart")
                    .build()
            ));
        }
    }
}
