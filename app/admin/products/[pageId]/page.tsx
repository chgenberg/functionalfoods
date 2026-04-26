"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Upload,
  Trash2,
  Plus,
  ExternalLink,
  AlertCircle,
  Check,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface PageContent {
  title?: string;
  subtitle?: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  heroImage?: string;
  price?: string;
  priceNote?: string;
  features?: string[];
  benefits?: { title: string; description: string }[];
  sections?: { title: string; content: string }[];
  ctaText?: string;
  ctaUrl?: string;
  authorSection?: string;
  quote?: string;
}

function normalizePageContent(input: unknown): PageContent {
  if (!input || typeof input !== "object") return {};
  const raw = input as Record<string, unknown>;

  const benefits = Array.isArray(raw.benefits)
    ? raw.benefits
        .filter((b) => b && typeof b === "object")
        .map((b) => {
          const item = b as Record<string, unknown>;
          return {
            title: String(item.title ?? ""),
            description: String(item.description ?? ""),
          };
        })
    : undefined;

  const features = Array.isArray(raw.features)
    ? raw.features.map((f) => String(f ?? ""))
    : undefined;

  return {
    ...raw,
    ...(features ? { features } : {}),
    ...(benefits ? { benefits } : {}),
  } as PageContent;
}

interface PageConfig {
  pageId: string;
  name: string;
  path: string;
  fields: {
    key: keyof PageContent;
    label: string;
    type: "text" | "textarea" | "image" | "array" | "benefits";
    placeholder?: string;
    help?: string;
  }[];
}

const PAGE_CONFIGS: Record<string, PageConfig> = {
  brodboken: {
    pageId: "brodboken",
    name: "Brödboken E-bok",
    path: "/brodboken",
    fields: [
      { key: "title", label: "Rubrik", type: "text", placeholder: "Brödboken" },
      {
        key: "subtitle",
        label: "Underrubrik",
        type: "text",
        placeholder: "E-bok av Ulrika Davidsson",
      },
      {
        key: "description",
        label: "Beskrivning",
        type: "textarea",
        placeholder: "Huvudbeskrivning av e-boken...",
      },
      {
        key: "shortDescription",
        label: "Kort beskrivning",
        type: "textarea",
        placeholder: "Kortare beskrivning...",
      },
      {
        key: "image",
        label: "Produktbild",
        type: "image",
        help: "Huvudbild för e-boken (visas på produktsidan)",
      },
      {
        key: "price",
        label: "Pris (visningstext)",
        type: "text",
        placeholder: "149 kr",
      },
      {
        key: "features",
        label: "Funktioner/Features",
        type: "array",
        placeholder: 'T.ex. "40+ brödrecept"',
      },
      {
        key: "authorSection",
        label: "Om författaren",
        type: "textarea",
        placeholder: "Text om Ulrika...",
      },
    ],
  },
  paskbuffe: {
    pageId: "paskbuffe",
    name: "Påskbuffé E-bok",
    path: "/e-bocker/paskbuffe",
    fields: [
      { key: "title", label: "Rubrik", type: "text", placeholder: "Påskbuffé" },
      {
        key: "subtitle",
        label: "Underrubrik",
        type: "text",
        placeholder: "E-bok av Ulrika Davidsson",
      },
      {
        key: "description",
        label: "Beskrivning",
        type: "textarea",
        placeholder: "Huvudbeskrivning av e-boken...",
      },
      {
        key: "shortDescription",
        label: "Kort beskrivning",
        type: "textarea",
        placeholder: "Kortare beskrivning...",
      },
      {
        key: "image",
        label: "Produktbild",
        type: "image",
        help: "Huvudbild för e-boken (visas på produktsidan)",
      },
      {
        key: "price",
        label: "Pris (visningstext)",
        type: "text",
        placeholder: "99 kr",
      },
      {
        key: "features",
        label: "Funktioner/Features",
        type: "array",
        placeholder: 'T.ex. "50 påskiga recept"',
      },
      {
        key: "authorSection",
        label: "Om författaren",
        type: "textarea",
        placeholder: "Text om Ulrika...",
      },
    ],
  },
  boken: {
    pageId: "boken",
    name: "Functional Foods Boken",
    path: "/boken",
    fields: [
      {
        key: "title",
        label: "Rubrik",
        type: "text",
        placeholder: "Functional Foods: Mat för ett friskare liv",
      },
      {
        key: "subtitle",
        label: "Underrubrik",
        type: "text",
        placeholder: "Din guide till en hälsosammare livsstil genom smart kost",
      },
      {
        key: "description",
        label: "Beskrivning",
        type: "textarea",
        placeholder: "Huvudbeskrivning...",
      },
      {
        key: "shortDescription",
        label: "Kort beskrivning",
        type: "textarea",
        placeholder: "Kort beskrivning...",
      },
      { key: "image", label: "Bokbild", type: "image", help: "Bild på boken" },
      {
        key: "price",
        label: "Pris (endast siffror)",
        type: "text",
        placeholder: "239",
      },
      {
        key: "features",
        label: "Funktioner (max 3)",
        type: "array",
        placeholder: 'T.ex. "60+ recept"',
      },
      {
        key: "quote",
        label: "Citat",
        type: "textarea",
        placeholder: "Ett inspirerande citat...",
      },
      {
        key: "authorSection",
        label: "Om författaren",
        type: "textarea",
        placeholder: "Text om Ulrika...",
      },
    ],
  },
  "functional-basics": {
    pageId: "functional-basics",
    name: "Functional Basics Kurs",
    path: "/utbildning/functional-basics",
    fields: [
      {
        key: "title",
        label: "Kursnamn",
        type: "text",
        placeholder: "Functional Basics",
      },
      {
        key: "subtitle",
        label: "Undertitel",
        type: "text",
        placeholder: "Grunden i functional foods",
      },
      {
        key: "description",
        label: "Kursbeskrivning",
        type: "textarea",
        placeholder: "Utförlig beskrivning av kursen...",
      },
      {
        key: "shortDescription",
        label: "Kort beskrivning",
        type: "textarea",
        placeholder: "Kort sammanfattning...",
      },
      {
        key: "image",
        label: "Kursbild",
        type: "image",
        help: "Huvudbild för kursen",
      },
      {
        key: "features",
        label: "Vad ingår",
        type: "array",
        placeholder: 'T.ex. "75 recept & måltidsplan"',
      },
      { key: "benefits", label: "Fördelar", type: "benefits" },
    ],
  },
  "functional-flow": {
    pageId: "functional-flow",
    name: "Functional Flow Kurs",
    path: "/utbildning/functional-flow",
    fields: [
      {
        key: "title",
        label: "Kursnamn",
        type: "text",
        placeholder: "Functional Flow",
      },
      {
        key: "subtitle",
        label: "Undertitel",
        type: "text",
        placeholder: "För hormoner & ämnesomsättning",
      },
      {
        key: "description",
        label: "Kursbeskrivning",
        type: "textarea",
        placeholder: "Utförlig beskrivning av kursen...",
      },
      {
        key: "shortDescription",
        label: "Kort beskrivning",
        type: "textarea",
        placeholder: "Kort sammanfattning...",
      },
      {
        key: "image",
        label: "Kursbild",
        type: "image",
        help: "Huvudbild för kursen",
      },
      {
        key: "features",
        label: "Vad ingår",
        type: "array",
        placeholder: 'T.ex. "6 veckors program"',
      },
      { key: "benefits", label: "Fördelar", type: "benefits" },
    ],
  },
  "functional-energy": {
    pageId: "functional-energy",
    name: "Functional Energy Kurs",
    path: "/utbildning/functional-energy",
    fields: [
      {
        key: "title",
        label: "Kursnamn",
        type: "text",
        placeholder: "Functional Energy",
      },
      {
        key: "subtitle",
        label: "Undertitel",
        type: "text",
        placeholder: "Mer energi varje dag",
      },
      {
        key: "description",
        label: "Kursbeskrivning",
        type: "textarea",
        placeholder: "Utförlig beskrivning av kursen...",
      },
      {
        key: "shortDescription",
        label: "Kort beskrivning",
        type: "textarea",
        placeholder: "Kort sammanfattning...",
      },
      {
        key: "image",
        label: "Kursbild",
        type: "image",
        help: "Huvudbild för kursen",
      },
      {
        key: "features",
        label: "Vad ingår",
        type: "array",
        placeholder: 'T.ex. "Energigivande recept"',
      },
      { key: "benefits", label: "Fördelar", type: "benefits" },
    ],
  },
  "hormonell-balans": {
    pageId: "hormonell-balans",
    name: "Hormonell Balans Kurs",
    path: "/utbildning/hormonell-balans",
    fields: [
      {
        key: "title",
        label: "Kursnamn",
        type: "text",
        placeholder: "Hormonell Balans",
      },
      {
        key: "subtitle",
        label: "Undertitel",
        type: "text",
        placeholder: "Balansera dina hormoner naturligt",
      },
      {
        key: "description",
        label: "Kursbeskrivning",
        type: "textarea",
        placeholder: "Utförlig beskrivning av kursen...",
      },
      {
        key: "shortDescription",
        label: "Kort beskrivning",
        type: "textarea",
        placeholder: "Kort sammanfattning...",
      },
      {
        key: "image",
        label: "Kursbild",
        type: "image",
        help: "Huvudbild för kursen",
      },
      {
        key: "features",
        label: "Vad ingår",
        type: "array",
        placeholder: 'T.ex. "Hormonbalanserande recept"',
      },
      { key: "benefits", label: "Fördelar", type: "benefits" },
    ],
  },
};

function getDynamicEbookConfig(pageId: string): PageConfig {
  const humanized = pageId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    pageId,
    name: `${humanized} E-bok`,
    path: `/e-bocker/${pageId}`,
    fields: [
      { key: "title", label: "Rubrik", type: "text", placeholder: humanized || "Ny E-bok" },
      {
        key: "subtitle",
        label: "Underrubrik",
        type: "text",
        placeholder: "E-bok av Ulrika Davidsson",
      },
      {
        key: "description",
        label: "Beskrivning",
        type: "textarea",
        placeholder: "Huvudbeskrivning av e-boken...",
      },
      {
        key: "shortDescription",
        label: "Kort beskrivning",
        type: "textarea",
        placeholder: "Kortare beskrivning...",
      },
      {
        key: "image",
        label: "Produktbild",
        type: "image",
        help: "Huvudbild för e-boken (visas på produktsidan)",
      },
      {
        key: "price",
        label: "Pris (visningstext)",
        type: "text",
        placeholder: "99 kr",
      },
      {
        key: "features",
        label: "Funktioner/Features",
        type: "array",
        placeholder: 'T.ex. "50 recept"',
      },
      {
        key: "authorSection",
        label: "Om författaren",
        type: "textarea",
        placeholder: "Text om Ulrika...",
      },
    ],
  };
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.pageId as string;

  const [content, setContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasCustomContent, setHasCustomContent] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentImageField, setCurrentImageField] = useState<
    keyof PageContent | null
  >(null);

  const config = PAGE_CONFIGS[pageId] || getDynamicEbookConfig(pageId);

  useEffect(() => {
    if (pageId) {
      fetchContent();
    }
  }, [pageId]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/pages/${pageId}`);
      if (!response.ok) throw new Error("Failed to fetch page");
      const data = await response.json();
      const incoming = data?.content ?? null;
      setContent(normalizePageContent(incoming));
      setHasCustomContent(!!incoming);
      setLastUpdatedAt(
        data?.updatedAt ? new Date(data.updatedAt).toISOString() : null,
      );
    } catch (err) {
      console.error(err);
      setError("Kunde inte hämta sidinnehåll");
    } finally {
      setLoading(false);
    }
  };

  const buildTemplateFromConfig = (cfg: PageConfig): PageContent => {
    const template: PageContent = {};
    for (const f of cfg.fields) {
      if (f.type === "text" || f.type === "textarea") {
        // Use placeholder as an initial starting point (user can overwrite)
        if (f.placeholder) (template as any)[f.key] = f.placeholder;
      } else if (f.type === "array") {
        // Add a few empty items so the user sees the structure immediately
        (template as any)[f.key] = ["", "", ""];
      } else if (f.type === "benefits") {
        template.benefits = [
          { title: "", description: "" },
          { title: "", description: "" },
          { title: "", description: "" },
        ];
      } else if (f.type === "image") {
        // leave empty
      }
    }
    return template;
  };

  const fillTemplate = () => {
    if (!config) return;
    if (
      !confirm(
        "Fyll i en mall som utgångspunkt? Du kan alltid ändra allt innan du sparar.",
      )
    )
      return;
    setContent(buildTemplateFromConfig(config));
    setHasChanges(true);
    setSuccess("Mall ifylld – redigera och spara när du är klar.");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setSuccess("Ändringar sparade!");
      setHasChanges(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Kunde inte spara ändringar");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Är du säker på att du vill återställa till standardinnehållet? Alla ändringar kommer att tas bort.",
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to reset");

      setContent({});
      setSuccess("Sidan återställd till standard");
      setHasChanges(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Kunde inte återställa sidan");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardUnsaved = () => {
    if (
      !confirm(
        "Ångra osparade ändringar? Detta påverkar inte hemsidan förrän du sparar.",
      )
    )
      return;
    setContent({});
    setHasChanges(false);
    setSuccess("Osparade ändringar ångrade");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentImageField) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "course");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();

      setContent((prev) => ({
        ...prev,
        [currentImageField]: data.url,
      }));
      setHasChanges(true);
      setSuccess("Bild uppladdad!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Kunde inte ladda upp bild");
    } finally {
      setUploading(false);
      setCurrentImageField(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerImageUpload = (field: keyof PageContent) => {
    setCurrentImageField(field);
    fileInputRef.current?.click();
  };

  const updateField = (key: keyof PageContent, value: any) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const addArrayItem = (key: keyof PageContent) => {
    const current = (content[key] as string[]) || [];
    updateField(key, [...current, ""]);
  };

  const updateArrayItem = (
    key: keyof PageContent,
    index: number,
    value: string,
  ) => {
    const current = (content[key] as string[]) || [];
    const updated = [...current];
    updated[index] = value;
    updateField(key, updated);
  };

  const removeArrayItem = (key: keyof PageContent, index: number) => {
    const current = (content[key] as string[]) || [];
    updateField(
      key,
      current.filter((_, i) => i !== index),
    );
  };

  const addBenefit = () => {
    const current = content.benefits || [];
    updateField("benefits", [...current, { title: "", description: "" }]);
  };

  const updateBenefit = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    const current = content.benefits || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    updateField("benefits", updated);
  };

  const removeBenefit = (index: number) => {
    const current = content.benefits || [];
    updateField(
      "benefits",
      current.filter((_, i) => i !== index),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[var(--primary-green)]" />
      </div>
    );
  }

  if (!pageId || !config) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">
            Ogiltig produktsida. Kontrollera URL och försök igen.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tillbaka till produktsidor
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
          </Link>
          <div>
            <h1 className="text-xl font-medium text-[var(--text-primary)]">
              Redigera {config.name}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {config.path}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${
                  hasCustomContent
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {hasCustomContent ? "Anpassad" : "Standard"}
              </span>
              {lastUpdatedAt && (
                <span className="text-xs text-[var(--text-secondary)]">
                  Senast uppdaterad:{" "}
                  {new Date(lastUpdatedAt).toLocaleString("sv-SE")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={config.path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Visa sida
          </a>
          {!hasCustomContent && (
            <button
              onClick={fillTemplate}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors"
              title="Fyll i en mall så att du har något att utgå från"
            >
              <Plus className="w-4 h-4" />
              Fyll i mall
            </button>
          )}
          <button
            onClick={hasCustomContent ? handleReset : handleDiscardUnsaved}
            disabled={saving || (!hasCustomContent && !hasChanges)}
            className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-lg transition-colors ${
              saving || (!hasCustomContent && !hasChanges)
                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border border-red-200 text-red-600 hover:bg-red-50"
            }`}
            title={
              !hasCustomContent && !hasChanges
                ? "Inget sparat innehåll att återställa"
                : undefined
            }
          >
            <Trash2 className="w-4 h-4" />
            {hasCustomContent ? "Ta bort ändringar" : "Ångra ändringar"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
              hasChanges
                ? "bg-[var(--primary-green)] text-white hover:bg-[var(--primary-green-dark)]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Spara
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Guidance */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-1">Info</h3>
        <p className="text-sm text-blue-800">
          Den publika sidan visar <strong>standardinnehåll</strong> tills du
          sparar en ändring här. Om fälten är tomma betyder det att det ännu
          inte finns anpassat innehåll sparat för sidan.
        </p>
        {!hasCustomContent && (
          <p className="text-xs text-blue-800 mt-2">
            Tips: klicka på <strong>“Fyll i mall”</strong> för att få en
            utgångspunkt (du kan sedan ändra allt och spara).
          </p>
        )}
      </div>

      {/* Uploading overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <RefreshCw className="w-6 h-6 animate-spin text-[var(--primary-green)]" />
            <span>Laddar upp bild...</span>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-[var(--border-light)] rounded-lg p-6 space-y-6">
        {config.fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              {field.label}
            </label>
            {field.help && (
              <p className="text-xs text-[var(--text-secondary)]">
                {field.help}
              </p>
            )}

            {field.type === "text" && (
              <input
                type="text"
                value={(content[field.key] as string) || ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
              />
            )}

            {field.type === "textarea" && (
              <textarea
                value={(content[field.key] as string) || ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-4 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)] resize-y"
              />
            )}

            {field.type === "image" && (
              <div className="flex items-start gap-4">
                {content[field.key] ? (
                  <div className="relative w-32 h-32 border border-[var(--border-light)] rounded-lg overflow-hidden">
                    <Image
                      src={content[field.key] as string}
                      alt={field.label}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => updateField(field.key, "")}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-[var(--border-light)] rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="space-y-2">
                  <button
                    onClick={() => triggerImageUpload(field.key)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-[var(--border-light)] rounded-lg hover:border-[var(--primary-green)] transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Ladda upp bild
                  </button>
                  <p className="text-xs text-[var(--text-secondary)]">
                    JPG, PNG, WebP eller GIF. Max 10MB.
                  </p>
                  {content[field.key] && (
                    <input
                      type="text"
                      value={(content[field.key] as string) || ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder="Eller klistra in URL"
                      className="w-full px-3 py-1.5 text-sm border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
                    />
                  )}
                </div>
              </div>
            )}

            {field.type === "array" && (
              <div className="space-y-2">
                {((content[field.key] as string[]) || []).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        updateArrayItem(field.key, index, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className="flex-1 px-4 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
                    />
                    <button
                      onClick={() => removeArrayItem(field.key, index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem(field.key)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--primary-green)] hover:bg-[var(--primary-beige)] rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Lägg till
                </button>
              </div>
            )}

            {field.type === "benefits" && (
              <div className="space-y-3">
                {(content.benefits || []).map((benefit, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        Fördel {index + 1}
                      </span>
                      <button
                        onClick={() => removeBenefit(index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={benefit.title}
                      onChange={(e) =>
                        updateBenefit(index, "title", e.target.value)
                      }
                      placeholder="Titel"
                      className="w-full px-3 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
                    />
                    <textarea
                      value={benefit.description}
                      onChange={(e) =>
                        updateBenefit(index, "description", e.target.value)
                      }
                      placeholder="Beskrivning"
                      rows={2}
                      className="w-full px-3 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--primary-green)]"
                    />
                  </div>
                ))}
                <button
                  onClick={addBenefit}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--primary-green)] hover:bg-[var(--primary-beige)] rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Lägg till fördel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Unsaved changes warning */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            Du har osparade ändringar
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Spara nu
          </button>
        </div>
      )}
    </div>
  );
}
