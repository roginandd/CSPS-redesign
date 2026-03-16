import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthenticatedNav from "../../components/AuthenticatedNav";
import SAMPLE from "../../assets/image 8.png";
import Layout from "../../components/Layout";
import { MerchType } from "../../enums/MerchType";
import type { MerchSummaryResponse } from "../../interfaces/merch/MerchResponse";
import {
  getAllMerchWithoutVariants,
  getMerchById,
  getMerchByType,
} from "../../api/merch";
import { S3_BASE_URL } from "../../constant";

const prefetchCache = new Map<number, any>();

const Index = () => {
  const TAGS = ["ALL", ...Object.values(MerchType)];
  const [merch, setMerch] = useState<MerchSummaryResponse[]>([]);
  const [activeTag, setActiveTag] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMerch = async (type: string) => {
    setLoading(true);
    try {
      const data =
        type === "ALL"
          ? await getAllMerchWithoutVariants()
          : await getMerchByType(type as MerchType);
      setMerch(data);
    } catch (err) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerch(activeTag);
  }, [activeTag]);

  const prefetchMerch = (id: number) => {
    if (!id || prefetchCache.has(id)) return;
    getMerchById(id).then((data) => prefetchCache.set(id, data));
  };

  const isFiltered = activeTag !== "ALL";
  const activeTagLabel = activeTag.charAt(0) + activeTag.slice(1).toLowerCase();

  return (
    <Layout>
      <AuthenticatedNav />

      <div className="max-w-[90rem] mx-auto px-6 mt-10">
        {/* Header Section mimicking the "Popular products" style */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <h2 className="text-[2rem] font-bold text-white tracking-tight">
            CSPS Products
          </h2>

          <div className="flex flex-wrap gap-3">
            {TAGS.map((t) => {
              const isActive = activeTag === t;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className={`transition-all duration-300 rounded-full px-6 py-2.5 text-sm font-medium border ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid Display - Refined spacing and 4-column desktop layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32">
              <div className="w-12 h-12 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin mb-4" />
              <p className="text-white font-medium">Loading products...</p>
            </div>
          ) : merch.length > 0 ? (
            merch.map((c) => (
              <Link
                to={`/merch/${c.merchId}`}
                key={c.merchId}
                onMouseEnter={() => prefetchMerch(c.merchId)}
                className="group flex flex-col"
              >
                {/* Image Container - Updated to CSPS Glassmorphism Style */}
                <div className="relative aspect-square bg-[#242050] border border-white/10 rounded-[2rem] overflow-hidden flex items-center justify-center p-8 transition-all duration-300 group-hover:border-purple-500/50 group-hover:shadow-2xl group-hover:shadow-purple-900/40">
                  {/* Subtle Gradient Glow behind the image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <img
                    src={c.s3ImageKey ? S3_BASE_URL + c.s3ImageKey : SAMPLE}
                    alt={c.merchName}
                    className="w-full h-full object-contain relative z-10 transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                </div>

                {/* Info Section - Clean and left-aligned */}
                <div className="mt-5 px-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/60 text-xs font-medium uppercase mb-1">
                        Name
                      </p>
                      <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-[#FDE006] transition-colors">
                        {c.merchName}
                      </h3>
                    </div>
                    <p className="text-white font-bold text-lg">
                      ₱{c.basePrice}
                    </p>
                  </div>
                  <p className="text-white/60 text-xs font-medium uppercase mt-2">
                    <span>Total Stock: </span>
                    {c.totalStockQuantity}
                  </p>
                  {/* Primary Action Button from Design System */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    <div className="w-full bg-[#FDE006] text-black text-center py-3 rounded-xl font-bold text-sm">
                      View Details
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-[2rem] border border-white/10 bg-[#1d1847]/80 px-6 py-16 sm:px-10">
              <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                  {isFiltered ? "No Matches" : "Catalog Empty"}
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">
                  {isFiltered
                    ? `No ${activeTagLabel} items available right now`
                    : "No products available yet"}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/62 sm:text-base">
                  {isFiltered
                    ? "Try another category or return to all products to keep browsing the catalog."
                    : "The merchandise catalog is currently empty. Check back later for new CSPS items."}
                </p>

                {isFiltered && (
                  <button
                    onClick={() => setActiveTag("ALL")}
                    className="mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d1847]"
                    type="button"
                  >
                    Browse all products
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
