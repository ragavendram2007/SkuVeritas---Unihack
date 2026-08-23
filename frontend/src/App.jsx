import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CatalogOverview from './components/CatalogOverview';
import ProductDetail from './components/ProductDetail';
import ConfidenceRiskChart from './components/ConfidenceRiskChart';
import BatchConsole from './components/BatchConsole';
import ExportPanel from './components/ExportPanel';
import ApiContractModal from './components/ApiContractModal';
import { fetchProducts, fetchResolvedProduct, triggerReingest } from './api';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [selectedSku, setSelectedSku] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [activeView, setActiveView] = useState('catalog');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);

  const loadCatalogData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
      
      // Default select PR-9000 to highlight diagnosis feature immediately
      if (!selectedSku && data.length > 0) {
        const conflictProd = data.find(p => p.sku === "PR-9000") || data[0];
        loadProductDetail(conflictProd.sku);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to SkuVeritas backend engine.');
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

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await triggerReingest();
      await loadCatalogData();
      if (selectedSku) {
        await loadProductDetail(selectedSku);
      }
    } catch (err) {
      setError(err.message || 'Re-ingest failed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBatchEnrich = async () => {
    try {
      await fetch('http://localhost:8000/api/enrich/batch?limit=30', { method: 'POST' });
      await loadCatalogData();
    } catch (e) {
      console.error('Batch enrich failed:', e);
    }
  };

  const handleRunAllBackground = async () => {
    try {
      await fetch('http://localhost:8000/api/enrich/all', { method: 'POST' });
    } catch (e) {
      console.error('Run all job failed:', e);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      <Navbar
        onRefresh={handleRefresh}
        onOpenContract={() => setIsContractOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        isRefreshing={isRefreshing}
        productCount={products.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 flex items-center justify-between text-xs font-mono shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error} Make sure backend server is running on http://localhost:8000</span>
            </div>
            <button
              onClick={loadCatalogData}
              className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 rounded-xl transition-all font-semibold"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4 text-slate-400">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin absolute" />
            </div>
            <p className="text-xs font-mono text-cyan-300/80">Initializing SkuVeritas Engine & Ingesting Raw Sources...</p>
          </div>
        ) : (
          <>
            {activeView === 'catalog' && (
              selectedSku && productDetail ? (
                <ProductDetail
                  product={productDetail}
                  onBack={() => {
                    setSelectedSku(null);
                    setProductDetail(null);
                  }}
                  onOpenContract={() => setIsContractOpen(true)}
                />
              ) : (
                <CatalogOverview
                  products={products}
                  onSelectProduct={(sku) => loadProductDetail(sku)}
                />
              )
            )}

            {activeView === 'matrix' && (
              <ConfidenceRiskChart products={products} />
            )}

            {activeView === 'batch' && (
              <BatchConsole
                onBatchEnrich={handleBatchEnrich}
                onRunAll={handleRunAllBackground}
              />
            )}

            {activeView === 'export' && (
              <ExportPanel />
            )}
          </>
        )}

      </main>

      {/* Part 2 Contract Inspector Modal */}
      {isContractOpen && productDetail && (
        <ApiContractModal
          product={productDetail}
          onClose={() => setIsContractOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-[#04060a] py-6 text-slate-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SkuVeritas Complete Build — Dataset A & Dataset B Web Discovery Platform</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>FastAPI Server: :8000</span>
            <span>•</span>
            <span>Vite Frontend: :5173</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
