"use client";

import React, { useEffect, useState } from "react";
import { Plus, Eye, Building2, CheckCircle2, Star, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function VendorMasterPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/masters?entity=vendors");
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleCreateVendor = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "vendors",
          data: {
            name,
            contactPerson,
            email,
            phone,
            gstNumber,
            paymentTerms,
          },
        }),
      });

      if (res.ok) {
        setIsAddOpen(false);
        fetchVendors();
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const columns = [
    {
      accessorKey: "code",
      header: "Vendor Code",
      cell: ({ row }: any) => <span className="font-bold text-blue-600">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Vendor Name",
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-100">{row.original.name}</div>
          <div className="text-[10px] text-slate-500">{row.original.city}, {row.original.state}</div>
        </div>
      ),
    },
    {
      accessorKey: "contactPerson",
      header: "Contact Person",
      cell: ({ row }: any) => `${row.original.contactPerson} (${row.original.phone})`,
    },
    {
      accessorKey: "gstNumber",
      header: "GSTIN / PAN",
      cell: ({ row }: any) => (
        <div>
          <div className="font-mono text-xs">{row.original.gstNumber}</div>
          <div className="text-[10px] text-slate-500">PAN: {row.original.pan}</div>
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }: any) => (
        <span className="font-bold text-amber-500 flex items-center">
          <Star className="w-3.5 h-3.5 mr-1 fill-amber-400" /> {row.original.rating}
        </span>
      ),
    },
    {
      accessorKey: "paymentTerms",
      header: "Terms",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendor Master Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise database of qualified suppliers, commercial payment terms, GSTIN numbers, and performance ratings.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add New Vendor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={vendors}
        searchPlaceholder="Search Vendors (Name, Code, GSTIN, City)..."
      />

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Enterprise Vendor"
        subtitle="Register vendor profile, commercial tax details, and bank credentials."
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <Input label="Company / Vendor Name" value={name} onChange={(e) => setName(e.target.value)} required />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Contact Person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="GSTIN Number" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
          </div>

          <Select
            label="Payment Terms"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            options={[
              { label: "Net 30 Days", value: "Net 30 Days" },
              { label: "Net 45 Days", value: "Net 45 Days" },
              { label: "Net 60 Days", value: "Net 60 Days" },
              { label: "100% Advance Payment", value: "100% Advance" },
            ]}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateVendor} isLoading={isSubmitting} className="font-bold">
              Save Vendor Profile
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
