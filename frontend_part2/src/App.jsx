import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OperatorDashboard from './components/OperatorDashboard';
import ProductTruthReport from './components/ProductTruthReport';
import TrustLedger from './components/TrustLedger';
import ErpExportPanel from './components/ErpExportPanel';
import PresenterModeOverlay from './components/PresenterModeOverlay';
import { fetchProducts, fetchResolvedProduct } from './api';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [selectedSku, setSelectedSku] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [activeView, setActiveView] = useState('report');
  const [fallbackActive, setFallbackActive] = useState(false);
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spotPos, setSpotPos] = useState({ x: 0, y: 0 });

  const loadProductsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data.products || []);
      setFallbackActive(data.fallback_active || false);

      if (data.products && data.products.length > 0) {
        const blockedProd = data.products.find(p => p.sku === "PR-9000") || data.products[0];
        loadProductDetail(blockedProd.sku);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to Part 2 backend engine.');
    } finally {
      setLoading(false);
    }
  };

  const loadProductDetail = async (sku) => {
    try {
      setSelectedSku(sku);
      const detail = await fetchResolvedProduct(sku);
      setProductDetail(detail);
    } catch (err) {
      console.error('Error loading product detail:', err);
    }
  };

  const handleDemoReset = async () => {
    await loadProductsData();
    if (selectedSku) await loadProductDetail(selectedSku);
    alert('Demo State Reset: All review actions and adaptive trust nudges returned to seed state.');
  };

  // Unify Cursor Spotlight Tracking Listener
  useEffect(() => {
    const handlePointerMove = (e) => {
      setSpotPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Global Navigation Keyboard Shortcuts: 1 = Dashboard, 2 = Report, 3 = Trust Ledger, 4 = ERP, P = Presenter Tour
  useEffect(() => {
    const handleGlobalNavKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
      if (isInput) return; // Do not trigger navigation when typing in text inputs!

      if (e.key === '1' || e.key === 'd' || e.key === 'D') {
        setActiveView('dashboard');
      } else if (e.key === '2' || e.key === 'r' || e.key === 'R') {
        setActiveView('report');
      } else if (e.key === '3' || e.key === 'l' || e.key === 'L' || e.key === 't' || e.key === 'T') {
        setActiveView('ledger');
      } else if (e.key === '4' || e.key === 'x' || e.key === 'X') {
        setActiveView('erp');
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPresenterMode(true);
      }
    };

    window.addEventListener('keydown', handleGlobalNavKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalNavKeyDown);
  }, []);

  useEffect(() => {
    loadProductsData();
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
        fallbackActive={fallbackActive}
        onStartPresenterMode={() => setIsPresenterMode(true)}
        onDemoReset={handleDemoReset}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 flex items-center justify-between text-xs font-mono shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error} Make sure Part 2 backend server is running on http://localhost:8001</span>
            </div>
            <button
              onClick={loadProductsData}
              className="btn btn-ghost text-xs"
            >
              Retry Connection
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4 text-slate-400">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin absolute" />
            </div>
            <p className="text-xs font-mono text-cyan-300/80">Connecting to SkuVeritas Part 2 Trust & Delivery Layer...</p>
          </div>
        ) : (
          <>
            {activeView === 'dashboard' && (
              <OperatorDashboard
                products={products}
                onSelectProduct={(sku) => {
                  loadProductDetail(sku);
                  setActiveView('report');
                }}
              />
            )}

            {activeView === 'report' && productDetail && (
              <ProductTruthReport
                product={productDetail}
                onBack={() => setActiveView('dashboard')}
                onRefreshData={() => {
                  loadProductsData();
                  if (selectedSku) loadProductDetail(selectedSku);
                }}
              />
            )}

            {activeView === 'ledger' && (
              <TrustLedger />
            )}

            {activeView === 'erp' && (
              <ErpExportPanel products={products} />
            )}
          </>
        )}

      </main>

      {/* Presenter Tour Overlay */}
      {isPresenterMode && (
        <PresenterModeOverlay onClose={() => setIsPresenterMode(false)} />
      )}

      {/* Footer */}
      <footer className="border-t border-[#151a23] bg-[#040608]/90 py-6 text-slate-400 text-xs font-mono relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="brand-mark text-xs" style={{ width: '22px', height: '22px' }}>S</span>
            <span>SkuVeritas Part 2 Trust & Delivery Layer</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>FastAPI API: :8001</span>
            <span>•</span>
            <span>Unify Glow-Dark Theme</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
