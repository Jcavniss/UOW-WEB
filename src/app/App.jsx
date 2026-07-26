import { AppShell } from "./components/AppShell";
import { Header } from "./components/Header";

export default function App() {
  const stage = 4;
  return (
    <>
      <Header />
      <AppShell>
        <section className="panel" style={{ padding: 34 }}><span className="eyebrow">Application shell</span><h1>Gamer<span className="accent">Diary</span></h1><p className="hero-copy">The main layout is ready for product sections.</p></section>
        
      </AppShell>
    </>
  );
}
