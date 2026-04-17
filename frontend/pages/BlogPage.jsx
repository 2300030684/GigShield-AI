import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ArrowRight, Calendar, User, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await api.getBlogPosts();
        setPosts(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <header style={{ marginBottom: '60px', textAlign: 'center' }}>
        <Badge variant="cyan" style={{ marginBottom: '16px' }}>INSIGHTS & UPDATES</Badge>
        <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '20px', letterSpacing: '-1px' }}>
          The Trustpay <span className="text-gradient">Blog</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px' }}>
          Expert insights on gig economy trends, safety guides, and the technology behind instant payouts.
        </p>
        
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <input 
            type="text" 
            placeholder="Search for articles..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '1px solid var(--border)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s'
            }}
          />
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
          {filteredPosts.map(post => (
            <Card key={post.id} glow style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '240px', overflow: 'hidden' }}>
                <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="hover-scale" />
              </div>
              <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <Badge variant="ghost" style={{ background: 'var(--bg-secondary)' }}>{post.category}</Badge>
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', lineHeight: 1.3 }}>{post.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.6, flex: 1 }}>{post.summary}</p>
                
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <User size={14} /> <span>{post.author}</span>
                  </div>
                  <Link to={`/blog/${post.id}`}>
                    <Button variant="ghost" icon={<ArrowRight size={16} />}>Read Full</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;
