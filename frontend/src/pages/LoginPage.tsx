import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Input } from "../components/ui";
import { useAuth } from "../modules/auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("control.room");
  const [password, setPassword] = useState("warehouse");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      const nextPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-grid bg-hero-grid px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,157,46,0.22),_transparent_28%)]" />
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="relative hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 shadow-panel lg:block">
          <p className="text-xs uppercase tracking-[0.45em] text-ember/80">Epic Industrial Command</p>
          <h1 className="mt-5 max-w-2xl font-display text-5xl leading-tight text-white">
            Operate the warehouse network from one hardened control surface.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Monitor stock levels, route transfers, process goods movement, inspect audit trails, and track procurement
            performance without changing a single backend story.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {["Inventory control", "Procurement oversight", "Audit-ready reporting"].map((label) => (
              <Card key={label} className="bg-black/20">
                <p className="text-sm text-slate-300">{label}</p>
              </Card>
            ))}
          </div>
        </section>

        <Card className="relative mx-auto w-full max-w-xl p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-ember/80">Access Terminal</p>
          <h2 className="mt-4 font-display text-3xl text-white">Operator Sign-in</h2>
          <p className="mt-2 text-sm text-slate-400">
            Mock JWT session for frontend routing. Current backend endpoints remain unchanged.
          </p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Username</label>
              <Input value={username} onChange={(event) => setUsername(event.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Password</label>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? "Securing terminal..." : "Enter command center"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
