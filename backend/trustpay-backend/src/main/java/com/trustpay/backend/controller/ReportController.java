package com.trustpay.backend.controller;

import com.trustpay.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/activity/csv")
    public ResponseEntity<byte[]> downloadActivityReport() {
        String csvData = reportService.generateActivityReportCsv();
        byte[] bytes = csvData.getBytes();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "activity_report.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(bytes);
    }
}
