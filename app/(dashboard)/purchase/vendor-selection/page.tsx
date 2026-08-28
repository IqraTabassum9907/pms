"use client";

import React, { useEffect, useState } from "react";
import { Award, Zap, DollarSign, CheckCircle2, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { useRouter } from "next/navigation";

export default function VendorSelectionPage() {
  const router = useRouter();
  const [indents, setIndents] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [selectedIndentId, setSelectedIndentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [indRes, quoRes] = await Promise.all([
        fetch("/api/indents"),
        fetch("/api/quotations"),
      ]);
      const indData = await indRes.json();
      const quoData = await quoRes.json();

      const appIndents = (Array.isArray(indData) ? indData : []).filter((i) => i.status === "APPROVED");
      setIndents(appIndents);
      setQuotations(Array.isArray(quoData) ? quoData : []);

      if (appIndents.length) setSelectedIndentId(appIndents[0].id);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentQuotations = quotations.filter((q) => q.indentId === selectedIndentId);
  const selectedIndent = indents.find((i) => i.id === selectedIndentId);

  // Calculate best highlights
  let lowestPriceQuoteId = "";
  let highestRatingQuoteId = "";

  if (currentQuotations.length > 0) {
    const sortedByPrice = [...currentQuotations].sort((a, b) => a.totalAmount - b.totalAmount);
    lowestPriceQuoteId = sortedByPrice[0]?.id;

    const sortedByRating = [...currentQuotations].sort((a, b) => (b.vendor?.rating || 0) - (a.vendor?.rating || 0));
    highestRatingQuoteId = sortedByRating[0]?.id;
  }

  const handleSelectVendor = async (quote: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/vendor-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotationId: quote.id,
          indentId: quote.indentId,
          vendorId: quote.vendorId,
        }),
      });

      if (res.ok) {
        router.push(`/purchase/po?quotationId=${quote.id}`);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Side-by-Side Vendor Comparison Matrix</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Evaluate multi-vendor commercial quotes side-by-side on price, delivery timeline, and vendor quality rating.
        </p>
      </div>

      {/* Select Indent */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Select
              label="Select Indent Requisition to Compare"
              value={selectedIndentId}
              onChange={(e) => setSelectedIndentId(e.target.value)}
              options={indents.map((i) => ({ label: `${i.indentNo} - ${i.department?.name}`, value: i.id }))}
            />
          </div>
          {selectedIndent && (
            <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
              <div>Est Budget: <strong className="text-slate-900 dark:text-slate-100">₹{selectedIndent.totalEstimatedAmount?.toLocaleString("en-IN")}</strong></div>
              <div>Quotes Received: <strong className="text-blue-600">{currentQuotations.length} Vendors</strong></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side-by-Side Comparison Matrix */}
      {currentQuotations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentQuotations.map((quote) => {
            const isLowest = quote.id === lowestPriceQuoteId;
            const isTopRated = quote.id === highestRatingQuoteId;

            return (
              <Card
                key={quote.id}
                className={`relative flex flex-col justify-between transition-all ${
                  isLowest ? "border-2 border-emerald-500 shadow-lg shadow-emerald-500/10" : ""
                }`}
              >
                <div>
                  {/* Badges Header */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-600" /> {quote.vendor?.name}
                      </h3>
                      <StatusBadge status={quote.status} />
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {isLowest && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <DollarSign className="w-3 h-3 mr-1" /> Lowest Price
                        </span>
                      )}
                      {isTopRated && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <Award className="w-3 h-3 mr-1" /> Top Rated Vendor
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Commercial Details Table */}
                  <div className="p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-medium">Quotation No:</span>
                      <span className="font-bold">{quote.quotationNo}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-medium">Vendor Rating:</span>
                      <span className="font-bold text-amber-500">⭐ {quote.vendor?.rating || 4.5} / 5.0</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-medium">Payment Terms:</span>
                      <span className="font-bold">{quote.paymentTerms}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-medium">Freight Charge:</span>
                      <span className="font-bold">₹{quote.freight?.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-medium">GST Tax Split:</span>
                      <span className="font-bold">₹{quote.taxAmount?.toLocaleString("en-IN")}</span>
                    </div>

                    {/* Total Grand Cost */}
                    <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between mt-3">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Grand Commercial Total:</span>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400">
                        ₹{quote.totalAmount?.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full font-bold shadow-md"
                    onClick={() => handleSelectVendor(quote)}
                    isLoading={isSubmitting}
                  >
                    Select Vendor & Create PO <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center text-slate-500">
          No commercial vendor quotations found for this indent. Record quotations first.
        </Card>
      )}
    </div>
  );
}
