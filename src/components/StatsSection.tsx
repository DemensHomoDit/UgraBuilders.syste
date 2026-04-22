import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 15, suffix: "+", label: "лет опыта", desc: "на рынке строительства" },
  { value: 500, suffix: "+", label: "домов", desc: "построено под ключ" },
  { value: 12, suffix: "", label: "регионов", desc: "присутствия в России" },
  { value: 98, suffix: "%", label: "клиентов", desc: "рекомендуют нас" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const t = setInterval(() => {
      cur += value / 55;
      if (cur >= value) { setN(value); clearInterval(t); }
      else setN(Math.floor(cur));
    }, 18);
    return () => clearInterval(t);
  }, [inView, value]);
  return <span ref={ref}>{n}{suffix}</span>;
}

export default function StatsSection() {
  return (
    <section className="py-16 md:py-20 bg-primary">
      <div className="max-w-[1320px] mx-auto px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 tracking-tight">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm font-semibold text-white/80 mb-0.5">{s.label}</div>
              <div className="text-xs text-white/40">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
