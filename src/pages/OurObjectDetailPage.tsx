import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Maximize2, Layers, Building2, ArrowLeft, ArrowRight } from "lucide-react";
import { db } from "@/integrations/db/client";
import { OurObject, OurObjectImage, OurObjectReview } from "@/types/ourObjects";
import ObjectGallery from "@/components/objects/ObjectGallery";
import ObjectReviewBlock from "@/components/objects/ObjectReviewBlock";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (v: string) => UUID_RE.test(v);

function NotFoundState() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">Объект не найден</h1>
          <p className="text-gray-500 mb-8">Этот объект не существует или ещё не опубликован.</p>
          <Link to="/objects" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">
            <ArrowLeft size={16} />
            Вернуться к объектам
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}

interface InfoItemProps { icon: React.ReactNode; label: string; value: string | number; }
function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex flex-col gap-1.5 bg-gray-50 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">{icon}{label}</div>
      <p className="text-gray-900 font-semibold text-base">{value}</p>
    </div>
  );
}

export default function OurObjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [object, setObject] = useState<OurObject | null>(null);
  const [images, setImages] = useState<OurObjectImage[]>([]);
  const [review, setReview] = useState<OurObjectReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setIsLoading(false); return; }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        let objectData: OurObject | null = null;

        if (isUUID(id)) {
          const { data, error } = await db.from("our_objects").select("*").eq("id", id).maybeSingle();
          if (error) throw error;
          objectData = data;
        } else {
          const { data, error } = await db.from("our_objects").select("*").eq("slug", id).maybeSingle();
          if (error) throw error;
          objectData = data;
        }

        if (!objectData || !objectData.is_published) { setNotFound(true); setIsLoading(false); return; }
        setObject(objectData);

        const { data: imagesData, error: imagesError } = await db
          .from("our_object_images").select("*").eq("object_id", objectData.id).order("display_order", { ascending: true });
        if (!imagesError) setImages(imagesData || []);

        const { data: reviewData, error: reviewError } = await db
          .from("our_object_reviews").select("*").eq("object_id", objectData.id).eq("is_published", true).maybeSingle();
        if (!reviewError) setReview(reviewData || null);

      } catch (error) {
        console.error("Error loading object:", error);
        toast.error("Не удалось загрузить объект");
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (object) document.title = `${object.title} — Наши объекты`;
    return () => { document.title = "UgraBuilders"; };
  }, [object]);

  useEffect(() => {
    if (!object?.excerpt) return;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    const prev = meta.getAttribute("content") ?? "";
    meta.setAttribute("content", object.excerpt);
    return () => { if (meta) meta.setAttribute("content", prev); };
  }, [object?.excerpt]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-12 w-full">
          <div className="bg-gray-100 rounded-3xl aspect-[16/7] animate-pulse mb-10" />
          <div className="space-y-4 max-w-2xl">
            <div className="h-8 bg-gray-100 rounded-xl w-3/4 animate-pulse" />
            <div className="h-5 bg-gray-100 rounded-xl w-1/2 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded-xl w-full animate-pulse" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (notFound || !object) return <NotFoundState />;

  const infoItems: InfoItemProps[] = [];
  if (object.city) infoItems.push({ icon: <MapPin size={13} />, label: "Город", value: object.city });
  if (object.construction_year) infoItems.push({ icon: <Calendar size={13} />, label: "Год постройки", value: object.construction_year });
  if (object.area) infoItems.push({ icon: <Maximize2 size={13} />, label: "Площадь", value: `${object.area} м²` });
  if (object.material) infoItems.push({ icon: <Layers size={13} />, label: "Материал", value: object.material });
  if (object.stories) infoItems.push({ icon: <Building2 size={13} />, label: "Этажей", value: object.stories });

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="max-w-[1320px] mx-auto px-5 md:px-8 w-full">

        <div className="pt-8 pb-6">
          <Link to="/objects" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={15} />Наши объекты
          </Link>
        </div>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
          {object.cover_image && (
            <div className="relative overflow-hidden rounded-3xl aspect-[16/7] mb-10 bg-gray-100">
              <img src={object.cover_image} alt={object.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          )}
          <div className="max-w-3xl">
            <p className="label-tag mb-4">Наши объекты</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4 leading-[1.1]">{object.title}</h1>
            {object.subtitle && <p className="text-xl text-gray-500 leading-relaxed">{object.subtitle}</p>}
          </div>
        </motion.section>

        {infoItems.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {infoItems.map((item) => <InfoItem key={item.label} {...item} />)}
            </div>
          </motion.section>
        )}

        {object.description && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-5">Об объекте</h2>
            <div className="max-w-3xl text-gray-600 leading-relaxed whitespace-pre-line">{object.description}</div>
          </motion.section>
        )}

        {images.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Фотографии</h2>
            <ObjectGallery images={images} />
          </motion.section>
        )}

        {review && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Отзыв клиента</h2>
            <div className="max-w-2xl"><ObjectReviewBlock review={review} /></div>
          </motion.section>
        )}

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-20 py-12 px-8 md:px-12 bg-gray-50 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Хотите похожий проект?</h2>
            <p className="text-gray-500">Расскажите нам о своих пожеланиях — мы подберём оптимальное решение.</p>
          </div>
          <Link to="/contacts" className="flex-shrink-0 inline-flex items-center gap-2 bg-primary text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all">
            Обсудить похожий проект<ArrowRight size={16} />
          </Link>
        </motion.section>
      </div>
      <Footer />
    </main>
  );
}
