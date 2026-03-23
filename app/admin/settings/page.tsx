"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import {
  Store,
  CreditCard,
  Truck,
  Palette,
  Bell,
  ShieldCheck,
  Puzzle,
  UserCog,
  Save,
  RotateCcw,
  Upload,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Check,
  X,
  Mail,
  Send,
  Globe,
  DollarSign,
  Clock,
  Activity,
  Layers,
  Zap,
  AlertTriangle,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { useSettings } from "@/components/providers/SettingsProvider";

/* ─── TYPES ────────────────────────────────────────────────── */
type Section =
  | "store"
  | "payment"
  | "shipping"
  | "appearance"
  | "notifications"
  | "security"
  | "integrations"
  | "integrations"
  | "account";

interface BankAccount {
  id: string;
  bank: string;
  number: string;
  holder: string;
}

type ToastState = { msg: string; type: "success" | "error" } | null;

/* ─── SIDEBAR CONFIG ───────────────────────────────────────── */
const SIDEBAR_ITEMS: {
  key: Section;
  label: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
  {
    key: "store",
    label: "Store Settings",
    icon: <Store size={15} />,
    accent: "from-cyan-500 to-blue-500",
  },
  {
    key: "payment",
    label: "Payment Settings",
    icon: <CreditCard size={15} />,
    accent: "from-violet-500 to-purple-500",
  },
  {
    key: "shipping",
    label: "Shipping Settings",
    icon: <Truck size={15} />,
    accent: "from-emerald-500 to-teal-500",
  },
  {
    key: "appearance",
    label: "Appearance",
    icon: <Palette size={15} />,
    accent: "from-pink-500 to-rose-500",
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: <Bell size={15} />,
    accent: "from-amber-500 to-orange-500",
  },
  {
    key: "security",
    label: "Security",
    icon: <ShieldCheck size={15} />,
    accent: "from-red-500 to-rose-600",
  },
  {
    key: "integrations",
    label: "Integrations",
    icon: <Puzzle size={15} />,
    accent: "from-indigo-500 to-blue-600",
  },

  {
    key: "account",
    label: "Admin Account",
    icon: <UserCog size={15} />,
    accent: "from-zinc-400 to-zinc-600",
  },
];

/* ─── SMALL REUSABLE COMPONENTS ────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
      {children}
    </label>
  );
}

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 outline-none focus:border-cyan-500/60 focus:bg-white dark:focus:bg-black transition-all duration-200 ${className}`}
    />
  );
}

function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 outline-none focus:border-cyan-500/60 focus:bg-white dark:focus:bg-black transition-all duration-200 resize-none ${className}`}
    />
  );
}

function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-cyan-500/60 transition-all duration-200 appearance-none cursor-pointer ${className}`}
    >
      {children}
    </select>
  );
}

function Toggle({
  enabled,
  onToggle,
  accent = "bg-cyan-500",
}: {
  enabled: boolean;
  onToggle: () => void;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${enabled ? accent : "bg-zinc-300 dark:bg-zinc-700"}`}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm dark:shadow-none ${className}`}
    >
      {children}
    </motion.div>
  );
}

function CardTitle({
  icon,
  children,
  accent,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className={`p-2 rounded-xl bg-gradient-to-br ${accent || "from-cyan-500 to-blue-500"} text-white`}
      >
        {icon}
      </div>
      <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
        {children}
      </h3>
    </div>
  );
}
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-6">
      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-600">
        {label}
      </span>
      <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

function UploadBox({
  label,
  accept = "image/*",
  value,
  onChange,
}: {
  label: string;
  accept?: string;
  value?: string | null;
  onChange?: (file: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  useEffect(() => {
    if (value) setPreview(value);
  }, [value]);

  return (
    <div>
      <Label>{label}</Label>
      <div
        onClick={() => ref.current?.click()}
        className="relative group border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cyan-500/50 transition-all duration-200 bg-zinc-50 dark:bg-zinc-950 overflow-hidden"
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="w-full h-24 object-cover rounded-lg"
          />
        ) : (
          <>
            <Upload
              size={20}
              className="text-zinc-600 group-hover:text-cyan-500 transition-colors"
            />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
              Click to upload
            </span>
          </>
        )}
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setPreview(URL.createObjectURL(f));
              if (onChange) onChange(f);
            }
          }}
        />
      </div>
    </div>
  );
}

function GatewayItem({
  name,
  enabled,
  onToggle,
  children,
}: {
  name: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-100/60 dark:bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600" />
          <span className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Toggle
            enabled={enabled}
            onToggle={() => onToggle(!enabled)}
            accent="bg-cyan-500"
          />
          {enabled && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {enabled && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 bg-black/50 space-y-3 border-t border-zinc-900">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── NOTIFICATION ROW ─────────────────────────────────────── */
function NotifRow({
  label,
  desc,
  enabled,
  onToggle,
}: {
  label: string;
  desc?: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-900 last:border-none">
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
          {label}
        </p>
        {desc && (
          <p className="text-[9px] text-zinc-500 dark:text-zinc-600 mt-0.5">
            {desc}
          </p>
        )}
      </div>
      <Toggle enabled={enabled} onToggle={() => onToggle(!enabled)} />
    </div>
  );
}

/* ─── LOG TABLE ROW ────────────────────────────────────────── */
const MOCK_LOGS = [
  {
    admin: "Administrator",
    action: "Updated store settings",
    date: "2026-03-16 09:12",
    ip: "103.18.52.4",
  },
  {
    admin: "Administrator",
    action: "Added new product",
    date: "2026-03-15 14:30",
    ip: "103.18.52.4",
  },
  {
    admin: "Administrator",
    action: "Deleted journal entry",
    date: "2026-03-14 11:05",
    ip: "45.12.66.8",
  },
];

/* ─── SECTIONS ──────────────────────────────────────────────── */

function StoreSettings({
  data,
  onSave,
}: {
  data: any;
  onSave: (newData: any) => void;
}) {
  const [formData, setFormData] = useState(data || {});

  const handleChange = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardTitle
          icon={<Store size={14} />}
          accent="from-cyan-500 to-blue-500"
        >
          Store Information
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Store Name</Label>
            <Input
              placeholder="CHCKT.STORE"
              value={formData.store_name || ""}
              onChange={(e) => handleChange("store_name", e.target.value)}
            />
          </div>
          <div>
            <Label>Store Email</Label>
            <Input
              type="email"
              placeholder="admin@chckt.store"
              value={formData.store_email || ""}
              onChange={(e) => handleChange("store_email", e.target.value)}
            />
          </div>
          <div>
            <Label>Store Phone</Label>
            <Input
              type="tel"
              placeholder="+62 812 3456 7890"
              value={formData.store_phone || ""}
              onChange={(e) => handleChange("store_phone", e.target.value)}
            />
          </div>
          <div>
            <Label>Currency</Label>
            <Select
              value={formData.currency || "IDR"}
              onChange={(e) => handleChange("currency", e.target.value)}
            >
              <option value="IDR">IDR — Indonesian Rupiah</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Label>Store Address</Label>
          <Textarea
            rows={2}
            placeholder="Jl. Sudirman No. 1, Jakarta Pusat, 10220"
            value={formData.store_address || ""}
            onChange={(e) => handleChange("store_address", e.target.value)}
          />
        </div>
        <div className="mt-4">
          <Label>Store Description</Label>
          <Textarea
            rows={3}
            placeholder="Premium brutalist streetwear collections..."
            value={formData.store_description || ""}
            onChange={(e) => handleChange("store_description", e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <CardTitle
          icon={<Globe size={14} />}
          accent="from-cyan-500 to-blue-500"
        >
          Regional Settings
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Timezone</Label>
            <Select
              value={formData.timezone || "Asia/Jakarta (UTC+7)"}
              onChange={(e) => handleChange("timezone", e.target.value)}
            >
              <option>Asia/Jakarta (UTC+7)</option>
              <option>Asia/Singapore (UTC+8)</option>
              <option>UTC+0 — London</option>
            </Select>
          </div>
          <div>
            <Label>Language</Label>
            <Select
              value={formData.language || "Bahasa Indonesia"}
              onChange={(e) => handleChange("language", e.target.value)}
            >
              <option>Bahasa Indonesia</option>
              <option>English</option>
              <option>中文</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle
          icon={<Upload size={14} />}
          accent="from-cyan-500 to-blue-500"
        >
          Brand Assets
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <UploadBox
            label="Store Logo"
            value={formData.logo_url}
            onChange={async (f) => {
              const fileName = `brand/logo-${Date.now()}.png`;
              const { data: uploadData, error } = await supabase.storage
                .from("assets")
                .upload(fileName, f);
              if (error)
                return Swal.fire("Upload Failed", error.message, "error");
              const {
                data: { publicUrl },
              } = supabase.storage.from("assets").getPublicUrl(fileName);
              handleChange("logo_url", publicUrl);
            }}
          />
          <UploadBox
            label="Store Banner"
            value={formData.banner_url}
            onChange={async (f) => {
              const fileName = `brand/banner-${Date.now()}.png`;
              const { data: uploadData, error } = await supabase.storage
                .from("assets")
                .upload(fileName, f);
              if (error)
                return Swal.fire("Upload Failed", error.message, "error");
              const {
                data: { publicUrl },
              } = supabase.storage.from("assets").getPublicUrl(fileName);
              handleChange("banner_url", publicUrl);
            }}
          />
        </div>
        <div className="mt-5 p-4 border border-zinc-800 rounded-xl bg-zinc-900/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-[8px] font-black text-zinc-500 overflow-hidden">
            {formData.logo_url ? (
              <img
                src={formData.logo_url}
                alt="logo"
                className="w-full h-full object-cover"
              />
            ) : (
              "LOGO"
            )}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-white">
              {formData.store_name || "CHCKT.STORE"}
            </p>
            <p className="text-[9px] text-zinc-600 mt-0.5">
              Preview — {formData.currency || "IDR"} ·{" "}
              {formData.language || "Bahasa"}
            </p>
          </div>
          <div className="ml-auto px-3 py-1 rounded-full border border-zinc-800 text-[8px] font-black uppercase tracking-widest text-cyan-500">
            Live Preview
          </div>
        </div>
      </Card>
    </div>
  );
}

function PaymentSettings({
  data,
  onSave,
}: {
  data: any;
  onSave: (newData: any) => void;
}) {
  const [formData, setFormData] = useState(
    data || { gateways: {}, manual_banks: [] },
  );

  const handleChange = (section: string, value: any) => {
    const updated = { ...formData, [section]: value };
    setFormData(updated);
    onSave(updated);
  };

  const addBank = () => {
    const updated = {
      ...formData,
      manual_banks: [
        ...(formData.manual_banks || []),
        { id: String(Date.now()), bank: "", number: "", holder: "" },
      ],
    };
    setFormData(updated);
    onSave(updated);
  };

  const removeBank = (id: string) => {
    const updated = {
      ...formData,
      manual_banks: formData.manual_banks.filter((x: any) => x.id !== id),
    };
    setFormData(updated);
    onSave(updated);
  };

  const updateBank = (id: string, key: string, value: string) => {
    const updated = {
      ...formData,
      manual_banks: formData.manual_banks.map((b: any) =>
        b.id === id ? { ...b, [key]: value } : b,
      ),
    };
    setFormData(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardTitle
          icon={<CreditCard size={14} />}
          accent="from-violet-500 to-purple-500"
        >
          Payment Gateways
        </CardTitle>
        <div className="space-y-3">
          <GatewayItem
            name="Pakasir"
            enabled={formData.gateways?.pakasir?.enabled || false}
            onToggle={(v) =>
              handleChange("gateways", {
                ...formData.gateways,
                pakasir: { ...formData.gateways.pakasir, enabled: v },
              })
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="Pakasir API Key"
                  value={formData.gateways?.pakasir?.api_key || ""}
                  onChange={(e) =>
                    handleChange("gateways", {
                      ...formData.gateways,
                      pakasir: {
                        ...formData.gateways.pakasir,
                        api_key: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Project Slug</Label>
                <Input
                  placeholder="daemonium"
                  value={formData.gateways?.pakasir?.slug || ""}
                  onChange={(e) =>
                    handleChange("gateways", {
                      ...formData.gateways,
                      pakasir: {
                        ...formData.gateways.pakasir,
                        slug: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </GatewayItem>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <CardTitle
            icon={<Layers size={14} />}
            accent="from-violet-500 to-purple-500"
          >
            Manual Bank Transfer
          </CardTitle>
          <button
            type="button"
            onClick={addBank}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
          >
            <Plus size={11} /> Add Account
          </button>
        </div>
        <div className="space-y-4">
          {formData.manual_banks?.map((bank: any, i: number) => (
            <div
              key={bank.id}
              className="p-4 border border-zinc-900 rounded-xl bg-zinc-900/20 relative"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Account #{i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeBank(bank.id)}
                  className="text-zinc-700 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    placeholder="BCA"
                    value={bank.bank}
                    onChange={(e) =>
                      updateBank(bank.id, "bank", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Number</Label>
                  <Input
                    placeholder="1234567890"
                    value={bank.number}
                    onChange={(e) =>
                      updateBank(bank.id, "number", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Holder</Label>
                  <Input
                    placeholder="PT CHCKT STORE"
                    value={bank.holder}
                    onChange={(e) =>
                      updateBank(bank.id, "holder", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ShippingSettings({
  data,
  onSave,
}: {
  data: any;
  onSave: (newData: any) => void;
}) {
  const [formData, setFormData] = useState(
    data || { fee_mode: "dynamic", providers: {} },
  );

  const handleChange = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardTitle
          icon={<Truck size={14} />}
          accent="from-emerald-500 to-teal-500"
        >
          Shipping Providers
        </CardTitle>
        <div className="space-y-3">
          <GatewayItem
            name="RajaOngkir"
            enabled={formData.providers?.rajaongkir?.enabled || false}
            onToggle={(v) =>
              handleChange("providers", {
                ...formData.providers,
                rajaongkir: { ...formData.providers.rajaongkir, enabled: v },
              })
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>API Key</Label>
                <Input
                  placeholder="xxxxxxxxxxxxxxxxxx"
                  value={formData.providers?.rajaongkir?.api_key}
                  onChange={(e) =>
                    handleChange("providers", {
                      ...formData.providers,
                      rajaongkir: {
                        ...formData.providers.rajaongkir,
                        api_key: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Default Origin City</Label>
                <Input
                  placeholder="Jakarta"
                  value={formData.providers?.rajaongkir?.origin}
                  onChange={(e) =>
                    handleChange("providers", {
                      ...formData.providers,
                      rajaongkir: {
                        ...formData.providers.rajaongkir,
                        origin: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </GatewayItem>
        </div>
      </Card>

      <Card>
        <CardTitle
          icon={<DollarSign size={14} />}
          accent="from-emerald-500 to-teal-500"
        >
          Shipping Fee Mode
        </CardTitle>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {(["dynamic", "flat"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleChange("fee_mode", m)}
              className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                formData.fee_mode === m
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {m === "flat" ? "Flat Rate" : "Dynamic Shipping"}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {formData.fee_mode === "flat" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Label>Flat Rate Price (IDR)</Label>
              <Input
                type="number"
                placeholder="25000"
                value={formData.flat_rate}
                onChange={(e) => handleChange("flat_rate", e.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

function AppearanceSettings({
  data,
  onSave,
}: {
  data: any;
  onSave: (newData: any) => void;
}) {
  const [formData, setFormData] = useState(
    data || {
      colors: { primary: "#06b6d4", secondary: "#8b5cf6", accent: "#f43f5e" },
      typography: "Inter",
    },
  );

  const handleChange = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardTitle
          icon={<Palette size={14} />}
          accent="from-pink-500 to-rose-500"
        >
          Color System
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(["primary", "secondary", "accent"] as const).map((c) => (
            <div key={c}>
              <Label>{c} Color</Label>
              <div className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <input
                  type="color"
                  value={formData.colors?.[c] || "#000000"}
                  onChange={(e) =>
                    handleChange("colors", {
                      ...formData.colors,
                      [c]: e.target.value,
                    })
                  }
                  className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {formData.colors?.[c]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle icon={<Zap size={14} />} accent="from-pink-500 to-rose-500">
          Typography
        </CardTitle>
        <div>
          <Label>Font Family</Label>
          <Select
            value={formData.typography || "Inter"}
            onChange={(e) => handleChange("typography", e.target.value)}
          >
            <option value="Inter">Inter — Modern Geometric</option>
            <option value="Geist Sans">Geist — Developer Minimal</option>
            <option value="Space Grotesk">Space Grotesk — Technical</option>
            <option value="DM Mono">DM Mono — Monospace</option>
          </Select>
        </div>
      </Card>
      <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">
          Visual Synchronizer
        </p>
        <p className="text-[9px] text-rose-500/70">
          Warna dan tipografi yang Anda pilih di sini akan langsung disuntikkan
          ke dalam CSS variables aplikasi setelah Anda menekan tombol "Save
          Changes".
        </p>
      </div>
    </div>
  );
}

function NotificationSettings({
  data,
  onSave,
}: {
  data: any;
  onSave: (newData: any) => void;
}) {
  const [formData, setFormData] = useState(
    data || { admin_email: "", events: {} },
  );

  const handleChange = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardTitle
          icon={<Bell size={14} />}
          accent="from-amber-500 to-orange-500"
        >
          Email Notifications
        </CardTitle>
        <div className="mb-4">
          <Label>Admin Email Address</Label>
          <Input
            type="email"
            placeholder="admin@chckt.store"
            value={formData.admin_email || ""}
            onChange={(e) => handleChange("admin_email", e.target.value)}
          />
        </div>
        <SectionDivider label="Trigger Events" />
        <NotifRow
          label="New Order"
          desc="Trigger when a customer places an order"
          enabled={formData.events?.new_order || false}
          onToggle={(v) =>
            handleChange("events", { ...formData.events, new_order: v })
          }
        />
        <NotifRow
          label="Low Stock Alert"
          desc="Trigger when product stock is below 10 items"
          enabled={formData.events?.low_stock || false}
          onToggle={(v) =>
            handleChange("events", { ...formData.events, low_stock: v })
          }
        />
      </Card>
    </div>
  );
}

function SecuritySettings({
  data,
  onSave,
}: {
  data: any;
  onSave: (newData: any) => void;
}) {
  const [formData, setFormData] = useState(
    data || { two_fa: false, login_alert: true },
  );

  const handleChange = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardTitle
          icon={<ShieldCheck size={14} />}
          accent="from-red-500 to-rose-600"
        >
          Authentication
        </CardTitle>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-900 rounded-xl bg-zinc-50 dark:bg-zinc-900/20">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Two Factor Authentication
              </p>
              <p className="text-[9px] text-zinc-500 dark:text-zinc-600 mt-0.5">
                Requires OTP on every login
              </p>
            </div>
            <Toggle
              enabled={formData.two_fa}
              onToggle={() => handleChange("two_fa", !formData.two_fa)}
              accent="bg-red-500"
            />
          </div>
          <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-900 rounded-xl bg-zinc-50 dark:bg-zinc-900/20">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Login Alert Email
              </p>
              <p className="text-[9px] text-zinc-500 dark:text-zinc-600 mt-0.5">
                Send email on new device login
              </p>
            </div>
            <Toggle
              enabled={formData.login_alert}
              onToggle={() =>
                handleChange("login_alert", !formData.login_alert)
              }
              accent="bg-red-500"
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle
          icon={<Activity size={14} />}
          accent="from-red-500 to-rose-600"
        >
          Admin Activity Log
        </CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-semibold">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-900">
                {["Admin", "Action", "Date", "IP Address"].map((h) => (
                  <th
                    key={h}
                    className="pb-3 pr-6 text-left text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_LOGS.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-100 dark:border-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors"
                >
                  <td className="py-3 pr-6 text-zinc-700 dark:text-zinc-300 font-bold">
                    {row.admin}
                  </td>
                  <td className="py-3 pr-6 text-zinc-500">{row.action}</td>
                  <td className="py-3 pr-6 text-zinc-400 dark:text-zinc-600 font-mono">
                    {row.date}
                  </td>
                  <td className="py-3 text-cyan-600 font-mono">{row.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function IntegrationSettings({
  data,
  onSave,
}: {
  data: any;
  onSave: (newData: any) => void;
}) {
  const [formData, setFormData] = useState(
    data || { google_analytics: "", meta_pixel: "" },
  );

  const handleChange = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardTitle
          icon={<Puzzle size={14} />}
          accent="from-indigo-500 to-blue-600"
        >
          Analytics & Tracking
        </CardTitle>
        <div className="space-y-4">
          <div className="p-4 border border-zinc-900 rounded-xl bg-zinc-900/20">
            <Label>Google Analytics Tracking ID</Label>
            <Input
              placeholder="G-XXXXXXXXXX"
              value={formData.google_analytics || ""}
              onChange={(e) => handleChange("google_analytics", e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function AccountSettings({
  profile,
  onUpdate,
}: {
  profile: any;
  onUpdate: () => void;
}) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    avatar_url: profile?.avatar_url || "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          email: formData.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      Swal.fire({
        title: "SUCCESS",
        text: "Your profile has been updated.",
        icon: "success",
        confirmButtonColor: "#000",
      });
      onUpdate();
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setFormData({ ...formData, avatar_url: publicUrl });
      Swal.fire(
        "Avatar Updated",
        "Your profile photo has been changed.",
        "success",
      );
      onUpdate();
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardTitle
          icon={<UserCog size={14} />}
          accent="from-zinc-400 to-zinc-600"
        >
          Admin Profile
        </CardTitle>
        <form onSubmit={handleUpdateProfile}>
          <div className="flex items-center gap-5 mb-6 p-4 border border-zinc-900 rounded-xl bg-zinc-900/20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shrink-0 overflow-hidden">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                formData.full_name?.charAt(0) || "A"
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-black uppercase tracking-wider text-white">
                {formData.full_name || "Administrator"}
              </p>
              <p className="text-[9px] text-zinc-600 mt-0.5">
                {formData.email}
              </p>
            </div>
            <UploadBox label="Change Photo" onChange={handleAvatarChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Admin Name</Label>
              <Input
                placeholder="Administrator"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Admin Email</Label>
              <Input
                type="email"
                placeholder="admin@chckt.store"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              disabled={loading}
              className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={12} />
              ) : (
                <Save size={12} />
              )}
              Sync Update
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle
          icon={<ShieldCheck size={14} />}
          accent="from-zinc-400 to-zinc-600"
        >
          Change Password
        </CardTitle>
        <div className="space-y-4">
          <div>
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="Minimum 8 characters"
                className="pr-10"
                id="new-password-input"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
              >
                {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              const pwd = (
                document.getElementById(
                  "new-password-input",
                ) as HTMLInputElement
              ).value;
              if (pwd.length < 8)
                return Swal.fire(
                  "Weak Password",
                  "Required at least 8 characters",
                  "warning",
                );
              setLoading(true);
              const { error } = await supabase.auth.updateUser({
                password: pwd,
              });
              setLoading(false);
              if (error) return Swal.fire("Error", error.message, "error");
              Swal.fire("Success", "Password updated successfully", "success");
            }}
            className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-all"
          >
            Update Security Credentials
          </button>
          <div className="p-3 border border-amber-500/20 bg-amber-500/5 rounded-xl flex items-center gap-2">
            <AlertTriangle size={12} className="text-amber-500 shrink-0" />
            <span className="text-[9px] text-amber-500/80 font-semibold">
              Changing your password will sign you out of all active sessions.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─── SECTION RENDERER ─────────────────────────────────────── */
function SectionRenderer({
  active,
  profile,
  settings,
  onUpdate,
  onUpdateSetting,
}: {
  active: Section;
  profile: any;
  settings: any;
  onUpdate: () => void;
  onUpdateSetting: (section: Section, data: any) => void;
}) {
  switch (active) {
    case "store":
      return (
        <StoreSettings
          data={settings.store}
          onSave={(d) => onUpdateSetting("store", d)}
        />
      );
    case "payment":
      return (
        <PaymentSettings
          data={settings.payment}
          onSave={(d) => onUpdateSetting("payment", d)}
        />
      );
    case "shipping":
      return (
        <ShippingSettings
          data={settings.shipping}
          onSave={(d) => onUpdateSetting("shipping", d)}
        />
      );
    case "appearance":
      return (
        <AppearanceSettings
          data={settings.appearance}
          onSave={(d) => onUpdateSetting("appearance", d)}
        />
      );
    case "notifications":
      return (
        <NotificationSettings
          data={settings.notifications}
          onSave={(d) => onUpdateSetting("notifications", d)}
        />
      );
    case "security":
      return (
        <SecuritySettings
          data={settings.security}
          onSave={(d) => onUpdateSetting("security", d)}
        />
      );
    case "integrations":
      return (
        <IntegrationSettings
          data={settings.integrations}
          onSave={(d) => onUpdateSetting("integrations", d)}
        />
      );

    case "account":
      return <AccountSettings profile={profile} onUpdate={onUpdate} />;
    default:
      return (
        <StoreSettings
          data={settings.store}
          onSave={(d) => onUpdateSetting("store", d)}
        />
      );
  }
}

/* ─── ROOT PAGE ─────────────────────────────────────────────── */
/* ─── ROOT PAGE ─────────────────────────────────────────────── */
export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get("section") as Section) || "store";
  const [active, setActive] = useState<Section>(initialSection);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any>({
    store: {},
    payment: { gateways: {}, manual_banks: [] },
    shipping: { fee_mode: "dynamic", providers: {} },
    appearance: {},
    notifications: {},
    security: {},
    integrations: {},
    landing_content: {},
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // Parallel fetch profile and site settings
      const [resProfile, resSettings] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("site_settings").select("*"),
      ]);

      if (resProfile.error) throw resProfile.error;
      if (resProfile.data.role?.toLowerCase() !== "admin") {
        router.push("/shop");
        return;
      }
      setProfile(resProfile.data);

      if (resSettings.data) {
        const settingsMap = resSettings.data.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});
        setSettings((prev: any) => ({ ...prev, ...settingsMap }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // If table doesn't exist, we'll just use defaults
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { refreshSettings } = useSettings();
  const activeItem = SIDEBAR_ITEMS.find((i) => i.key === active)!;

  const handleUpdateSetting = (section: Section, newData: any) => {
    setSettings((prev: any) => ({ ...prev, [section]: newData }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const upsertData = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("site_settings")
        .upsert(upsertData, { onConflict: "key" });
      if (error) throw error;

      Swal.fire({
        title: "SYSTEM SYNCED",
        text: "Global configuration updated successfully.",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        background: "#000",
        color: "#fff",
      });

      setSaved(true);
      setHasChanges(false);
      await refreshSettings();
      setTimeout(() => setSaved(false), 2500);
    } catch (error: any) {
      Swal.fire("Sync Error", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-cyan-500" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
            Initializing Terminal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pt-24 md:pt-32 pb-12">
      {/* ── PAGE HEADER ── */}
      <div className=" top-[72px] md:top-[96px] z-40 border-b border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className="w-full px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <div
              className={`text-[8px] font-black uppercase tracking-widest bg-gradient-to-r ${activeItem.accent} bg-clip-text text-transparent`}
            >
              {activeItem.label}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">
                  Unsaved Changes
                </span>
              </motion.div>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-all"
            >
              <RotateCcw size={11} /> Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                saved
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {saving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "linear",
                  }}
                >
                  <RotateCcw size={11} />
                </motion.div>
              ) : saved ? (
                <Check size={11} />
              ) : (
                <Save size={11} />
              )}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* ── SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 gap-1 sticky top-[144px] md:top-[176px] h-fit">
          <p className="text-[7px] font-black uppercase tracking-[0.35em] text-zinc-700 mb-3 px-2">
            Configuration
          </p>
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActive(item.key);
                  setHasChanges(false);
                }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? "bg-zinc-900 dark:bg-zinc-900 text-white"
                    : "text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/40"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-pill"
                    className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-gradient-to-b ${item.accent}`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span
                  className={`transition-all ${isActive ? `bg-gradient-to-br ${item.accent} bg-clip-text text-transparent` : ""}`}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {item.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* ── MOBILE TABS ── */}
        <div className="lg:hidden w-full mb-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${
                  active === item.key
                    ? "border-zinc-600 bg-zinc-900 text-white"
                    : "border-zinc-200 dark:border-zinc-900 text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT PANEL ── */}
        <main className="flex-1 min-w-0">
          {/* Section heading */}
          <div className="mb-6">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950 mb-3`}
            >
              <span
                className={`bg-gradient-to-r ${activeItem.accent} bg-clip-text text-transparent`}
              >
                {activeItem.icon}
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">
                {activeItem.label}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-white">
              {activeItem.label}
            </h1>
            <div
              className={`h-0.5 w-12 rounded bg-gradient-to-r ${activeItem.accent} mt-2`}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <SectionRenderer
                active={active}
                profile={profile}
                settings={settings}
                onUpdate={fetchData}
                onUpdateSetting={handleUpdateSetting}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── FLOATING SAVE BAR (mobile) ── */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-xl lg:hidden"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              Unsaved
            </span>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest"
            >
              <Save size={11} /> Save
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
