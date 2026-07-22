import { useEffect, useState } from "react";

export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <span style={styles.logoDot} />
          <span style={styles.brandText}>Starter</span>
        </div>
        <nav style={styles.nav}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#about" style={styles.navLink}>About</a>
          <a href="#cta" style={styles.navLinkCta}>Get started</a>
        </nav>
      </header>

      <main style={styles.main}>
        <section
          style={{
            ...styles.hero,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
          }}
        >
          <span style={styles.eyebrow}>Welcome</span>
          <h1 style={styles.title}>Your app is ready to grow.</h1>
          <p style={styles.subtitle}>
            This is a clean starter. Tell me what you want to build and I'll turn it into a                   real product.
          </p>
          <div style={styles.ctaRow}>
            <a href="#cta" style={styles.primaryBtn}>Get started</a>
            <a href="#features" style={styles.ghostBtn}>Learn more</a>
          </div>
        </section>

        <section id="features" style={styles.features}>
          {[
            { title: "Fast", text: "Vite + React + TypeScript out of the box." },
            { title: "Secure", text: "Supabase-ready for auth and data persistence." },
            { title: "Polished", text: "Clean, responsive design with subtle motion." },
          ].map((f) => (
            <article key={f.title} style={styles.card}>
              <h3 style={styles.cardTitle}>{f.title}</h3>
              <p style={styles.cardText}>{f.text}</p>
            </article>
          ))}
        </section>

        <section id="cta" style={styles.cta}>
          <h2 style={styles.ctaTitle}>Ready to build something?</h2>
          <p style={styles.ctaText}>Describe your idea and I'll make it real.</p>
        </section>
      </main>

      <footer style={styles.footer}>
        <span>Starter · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 24px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 0",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoDot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--primary), var(--accent))",
    display: "inline-block",
  },
  brandText: {
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  nav: {
    display: "flex",
    gap: 20,
    alignItems: "center",
  },
  navLink: {
    color: "var(--text-muted)",
    fontWeight: 500,
    fontSize: 14,
    transition: "color 0.2s ease",
  },
  navLinkCta: {
    color: "#fff",
    background: "var(--primary)",
    padding: "8px 14px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    transition: "background 0.2s ease",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 64,
    padding: "32px 0 80px",
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    paddingTop: 48,
    transition: "opacity 0.6s ease, transform 0.6s ease",
  },
  eyebrow: {
    color: "var(--primary)",
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  title: {
    fontSize: "clamp(32px, 5vw, 56px)",
    lineHeight: 1.1,
    margin: "0 0 16px",
    fontWeight: 700,
    letterSpacing: -1,
    maxWidth: 760,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 1.6,
    color: "var(--text-muted)",
    maxWidth: 560,
    margin: "0 0 28px",
  },
  ctaRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  primaryBtn: {
    background: "var(--primary)",
    color: "#fff",
    padding: "12px 22px",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 15,
    transition: "background 0.2s ease, transform 0.2s ease",
  },
  ghostBtn: {
    color: "var(--text)",
    padding: "12px 22px",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 15,
    border: "1px solid var(--border)",
    background: "#fff",
    transition: "background 0.2s ease",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 24,
    boxShadow: "var(--shadow)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cardTitle: {
    margin: "0 0 8px",
    fontSize: 18,
    fontWeight: 600,
  },
  cardText: {
    margin: 0,
    color: "var(--text-muted)",
    fontSize: 15,
    lineHeight: 1.6,
  },
  cta: {
    textAlign: "center",
    padding: "48px 24px",
    borderRadius: 20,
    background: "linear-gradient(135deg, var(--primary), var(--accent))",
    color: "#fff",
  },
  ctaTitle: {
    fontSize: 28,
    margin: "0 0 8px",
    fontWeight: 700,
  },
  ctaText: {
    margin: 0,
    opacity: 0.9,
  },
  footer: {
    padding: "24px 0",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: 13,
  },
};
