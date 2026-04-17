package com.trustpay.backend.repository;

import com.trustpay.backend.model.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    List<BlogPost> findByCategory(String category);
    List<BlogPost> findAllByOrderByCreatedAtDesc();
}
