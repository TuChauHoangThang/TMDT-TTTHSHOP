import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { productService, categoryService } from '../../services/productService';
import type { Product, Category } from '../../types';
import '../../css/HomePage.css'; // Reusing some CSS

const ProductList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const cats = await categoryService.getAll();
        setCategories(cats);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchInitData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts({ 
          categorySlug: categorySlug || undefined,
          size: 20
        });
        setProducts(data.content || []);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categorySlug]);

  return (
    <main style={{ paddingTop: '8rem', paddingBottom: '4rem', background: '#fcfcfc' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
          {categorySlug ? `Danh mục: ${categories.find(c => c.slug === categorySlug)?.name || categorySlug}` : 'Tất Cả Sản Phẩm'}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
          {/* Sidebar Filter */}
          <aside style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem', display: 'inline-block' }}>Danh Mục</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <button 
                  onClick={() => setSearchParams({})} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: !categorySlug ? 'var(--color-primary)' : '#555', fontWeight: !categorySlug ? 'bold' : 'normal', textAlign: 'left', width: '100%' }}
                >
                  Tất cả sản phẩm
                </button>
              </li>
              {categories.map(c => (
                <li key={c.id} style={{ marginBottom: '0.8rem' }}>
                  <button 
                    onClick={() => setSearchParams({ category: c.slug || '' })} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: categorySlug === c.slug ? 'var(--color-primary)' : '#555', fontWeight: categorySlug === c.slug ? 'bold' : 'normal', textAlign: 'left', width: '100%', display: 'flex', justifyContent: 'space-between' }}
                  >
                    <span>{c.name}</span>
                    <span style={{ background: '#eee', padding: '2px 8px', borderRadius: '20px', fontSize: '0.85rem' }}>{c.productCount || c.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Product Grid */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}><h3>Đang tải sản phẩm...</h3></div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}><h3>Không tìm thấy sản phẩm nào!</h3></div>
            ) : (
              <div className="products-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductList;
