import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CatalogOverview from './components/CatalogOverview';
import ProductDetail from './components/ProductDetail';
import ConfidenceRiskChart from './components/ConfidenceRiskChart';
import BatchConsole from './components/BatchConsole';
import ExportPanel from './components/ExportPanel';
import ApiContractModal from './components/ApiContractModal';
import { fetchProducts, fetchResolvedProduct, triggerReingest } from './api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [selectedSku, setSelectedSku] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [activeView, setActiveView] = useState('catalog');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [spotPos, setSpotPos] = useState({ x: 0, y: 0 });

  const loadCatalog = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data || []);
      if (data && data.length > 0 && !selectedSku) {
        loadProductDetail(data[0].sku);
      }
    } catch (err) {
      console.error('Error fetching catalog products:', err);
    }
  };

  const loadProductDetail = async (sku) => {
    try {
      setSelectedSku(sku);
      const detail = await fetchResolvedProduct(sku);
      setProductDetail(detail);
    } catch (err) {
      console.error('Error fetching product detail:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await triggerReingest();
      await loadCatalog();
      if (selectedSku) {
        await loadProductDetail(selectedSku);
      }
    } catch (err) {
      console.error('Re-ingest failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Unify Cursor Spotlight Tracking Listener
  useEffect(() => {
    const handlePointerMove = (e) => {
      setSpotPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useEffect(() => {
    loadCatalog();
  }, []);

  return (
    <div className="min-h-screen bg-[#040608] text-[#f3f5f9] flex flex-col font-sans relative">
      
      {/* Unify Ambient Flow & Grain & Cursor Spotlight Overlays */}
      <div className="bg-flow" />
      <div className="bg-grain" />
      <div
        className="cursor-spot"
        style={{
          transform: `translate(${spotPos.x}px, ${spotPos.y}px) translate(-50%, -50%)`,
          opacity: 0.85
        }}
      />

      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onRefresh={handleRefresh}
        onOpenContract={() => setIsContractOpen(true)}
        isRefreshing={isRefreshing}
        productCount={products.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeView === 'catalog' && (
          <CatalogOverview
            products={products}
            onSelectProduct={(sku) => {
              loadProductDetail(sku);
              setActiveView('detail');
            }}
          />
        )}

        {activeView === 'detail' && (
          <ProductDetail
            product={productDetail}
            products={products}
            onSelectSku={(sku) => loadProductDetail(sku)}
            onBack={() => setActiveView('catalog')}
          />
        )}

        {activeView === 'matrix' && (
          <ConfidenceRiskChart products={products} />
        )}

        {activeView === 'batch' && (
          <BatchConsole products={products} />
        )}

        {activeView === 'export' && (
          <ExportPanel products={products} />
        )}
      </main>

      {/* Part 2 Output Contract Modal */}
      {isContractOpen && productDetail && (
        <ApiContractModal
          product={productDetail}
          onClose={() => setIsContractOpen(false)}
        />
      )}

      {/* Unify Footer */}
      <footer className="border-t border-[#151a23] bg-[#040608]/90 py-6 text-slate-400 text-xs font-mono relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="brand-mark text-xs" style={{ width: '22px', height: '22px' }}>S</span>
            <span>SkuVeritas Part 1 — Data Intelligence Engine</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>FastAPI API: :8000</span>
            <span>•</span>
            <span>Unify Glow-Dark Theme</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
