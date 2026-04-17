package com.trustpay.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * AppConfig — registers shared beans for HTTP client calls.
 * RestTemplate → used for synchronous weather API calls.
 * WebClient    → used for non-blocking Flask ML API calls.
 */
@Configuration
public class AppConfig {

    @Value("${ml.flask.url:http://localhost:5001}")
    private String flaskBaseUrl;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * WebClient configured to call the Flask ML API.
     * Timeout: 5 seconds (Flask should respond fast enough).
     */
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl(flaskBaseUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
