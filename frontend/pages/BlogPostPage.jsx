import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ChevronLeft, Calendar, User, Share2 } from 'lucide-react';
import api from '../services/api.js';

const BlogPostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await api.getBlogPost(id);
        setPost(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner"></div></div>;
  if (!post) return <div style={{ textAlign: 'center', padding: '100px' }}>Post not found. <Link to="/blog">Return to Blog</Link></div>;

  return (
    <article className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '32px', textDecoration: 'none', fontWeight: 500 }}>
        <ChevronLeft size={20} /> Back to Blog
      </Link>

      <header style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '24px', lineHeight: 1.2 }}>{post.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: 'var(--text-muted)', fontSize: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} /> <span>{post.author}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} /> <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
             <Button variant="ghost" size="small"><Share2 size={16} /> Share</Button>
          </div>
        </div>
      </header>

      <div style={{ borderRadius: '24px', overflow: 'hidden', marginBottom: '48px', boxShadow: 'var(--shadow-card)' }}>
        <img src={post.imageUrl} alt={post.title} style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} />
      </div>

      <div style={{ fontSize: '18px', lineHeight: 1.8, color: 'var(--text-primary)' }}>
        <p style={{ marginBottom: '24px', fontWeight: 600, fontSize: '20px' }}>{post.summary}</p>
        <div style={{ whiteSpace: 'pre-wrap' }}>
           {post.content || "Content coming soon..."}
        </div>
      </div>

      <footer style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
        <Card glow style={{ textAlign: 'center', padding: '48px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Want more gig worker insights?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Subscribe to our newsletter for weekly safety tips and earnings strategies.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <input 
               type="email" 
               placeholder="your@email.com" 
               style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', width: '300px' }} 
            />
            <Button variant="primary">Subscribe</Button>
          </div>
        </Card>
      </footer>
    </article>
  );
};

export default BlogPostPage;
