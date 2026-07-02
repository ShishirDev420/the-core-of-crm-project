import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Zap, RefreshCw, ChevronDown, LogOut, Users,
  ClipboardList, Target, Download, CheckCircle2, Lock,
} from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import thesis from '../thesis.json';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ObjectionMatrix { price: string; time: string; skepticism: string; }
interface ArchetypeRecord {
  archetype_name: string;
  behavioral_profile: string;
  discovery_blueprint: string[];
  objection_matrix: ObjectionMatrix;
  closing_protocol: string;
}
interface ZodiacEntry {
  sign: string; element: string;
  month_start: number; day_start: number;
  month_end: number;   day_end: number;
}
interface ClientResult {
  name: string;
  resolvedElement: string;
  archetype: ArchetypeRecord;
}
interface Session { username: string; displayName: string; }
type AppView = 'desk' | 'audit';
interface AuditEntry {
  id: string;
  timestamp: string;
  manager: string;
  clientName: string;
  archetype: string;
  element: string;
  difficulty: string;
  comments: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOCK_USERS: Record<string, { password: string; displayName: string }> = {
  rahul: { password: 'pass123', displayName: 'Rahul Sharma' },
  priya: { password: 'pass456', displayName: 'Priya Verma' },
  amit:  { password: 'pass789', displayName: 'Amit Patel'  },
};

const DIFFICULTY_OPTIONS = [
  'None — Deal Closed ✅',
  'Budget / Price Issues',
  'Trust / Builder Reputation',
  'Family / Partner Disagreement',
  'Delayed Possession Fear',
];

const AUDIT_KEY   = 'auraclose_audit';
const COUNTER_KEY = 'auraclose_counters';

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadAudit(): AuditEntry[] {
  try { return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]'); }
  catch { return []; }
}
function saveAudit(entries: AuditEntry[]) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
}
function loadCounters(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(COUNTER_KEY) || '{}'); }
  catch { return {}; }
}
function getCount(username: string) { return loadCounters()[username] ?? 0; }
function bumpCount(username: string): number {
  const c = loadCounters();
  c[username] = (c[username] ?? 0) + 1;
  localStorage.setItem(COUNTER_KEY, JSON.stringify(c));
  return c[username];
}

// ─── Element accent colours ───────────────────────────────────────────────────

const ACCENT: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  Fire:  { border: 'border-orange-500',  bg: 'bg-orange-500/10',  text: 'text-orange-400',  badge: 'bg-orange-500/20 text-orange-300'  },
  Earth: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  Air:   { border: 'border-violet-500',  bg: 'bg-violet-500/10',  text: 'text-violet-400',  badge: 'bg-violet-500/20 text-violet-300'  },
  Water: { border: 'border-cyan-500',    bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    badge: 'bg-cyan-500/20 text-cyan-300'      },
};
const FALLBACK = ACCENT['Water'];

// ─── Engine ──────────────────────────────────────────────────────────────────

function calcLifePath(dob: string) {
  const digits = dob.replace(/\D/g, '');
  if (!digits) return 0;
  let t = digits.split('').reduce((s, d) => s + parseInt(d, 10), 0);
  while (t > 9 && t !== 11 && t !== 22)
    t = t.toString().split('').reduce((s, d) => s + parseInt(d, 10), 0);
  return t;
}
function resolveZodiac(m: number, d: number) {
  for (const e of thesis.zodiac_map as ZodiacEntry[]) {
    const { sign, element, month_start: ms, day_start: ds, month_end: me, day_end: de } = e;
    if (ms > me) {
      if ((m === ms && d >= ds) || (m === me && d <= de)) return { sign, element };
    } else {
      if ((m === ms && d >= ds) || (m > ms && m < me) || (m === me && d <= de)) return { sign, element };
    }
  }
  return { sign: 'Unknown', element: 'Water' };
}
function resolveElement(base: string, lp: number) {
  return (thesis.life_path_element_overrides as Record<string, string>)[String(lp)] ?? base;
}
function formatTs(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

// ─── ObjRow ───────────────────────────────────────────────────────────────────

function ObjRow({ trigger, script, accent }: {
  trigger: string; script: string; accent: typeof FALLBACK;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-2 rounded-2xl overflow-hidden transition-all ${open ? accent.border : 'border-border/60'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-all ${open ? accent.bg : 'bg-card'}`}
      >
        <span className="text-base font-bold text-foreground leading-snug">{trigger}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`px-5 pb-5 pt-3 ${accent.bg} border-t ${accent.border}`}>
          <p className="text-base font-semibold text-foreground leading-relaxed">"{script}"</p>
        </div>
      )}
    </div>
  );
}

// ─── Post-Table Review ────────────────────────────────────────────────────────

function PostTableReview({ session, result, onSaved }: {
  session: Session; result: ClientResult; onSaved: () => void;
}) {
  const [comments,   setComments  ] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [saved,      setSaved     ] = useState(false);
  const [error,      setError     ] = useState('');

  const handleSave = () => {
    if (!difficulty) { setError('Please select the main difficulty faced.'); return; }
    const entry: AuditEntry = {
      id:         crypto.randomUUID(),
      timestamp:  new Date().toISOString(),
      manager:    session.displayName,
      clientName: result.name,
      archetype:  result.archetype.archetype_name,
      element:    result.resolvedElement,
      difficulty,
      comments:   comments.trim(),
    };
    const existing = loadAudit();
    saveAudit([entry, ...existing]);
    setSaved(true);
    setError('');
    onSaved();
  };

  if (saved) {
    return (
      <div className="rounded-2xl border-2 border-green-500/60 bg-green-500/10 px-5 py-6 flex items-center gap-4">
        <CheckCircle2 className="w-7 h-7 text-green-400 shrink-0" />
        <div>
          <p className="font-bold text-green-400 text-base">Session Saved to Audit Log</p>
          <p className="text-sm text-muted-foreground mt-0.5">Site Head can review this entry in the Audit Log tab.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border/60 overflow-hidden">
      <div className="bg-muted/30 px-5 py-3 border-b border-border/40">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          📝 Post-Table Closer Review
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">Log this session for the Site Head audit report</p>
      </div>
      <div className="bg-card px-5 py-5 space-y-4">

        {/* Client Reactions */}
        <div className="space-y-2">
          <label className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground block">
            Client Reactions &amp; Comments
          </label>
          <Textarea
            placeholder="How did the client respond? Any notable reactions, questions, or moments..."
            value={comments}
            onChange={e => setComments(e.target.value)}
            className="bg-input/40 border-border text-base min-h-[90px] resize-none leading-relaxed"
          />
        </div>

        {/* Main Difficulty */}
        <div className="space-y-2">
          <label className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground block">
            Main Difficulty Faced
          </label>
          <Select onValueChange={v => { setDifficulty(v); setError(''); }}>
            <SelectTrigger className="bg-input/40 border-border h-12 text-base">
              <SelectValue placeholder="Select outcome / difficulty..." />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt} className="text-base py-3">{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {/* Submit */}
        <button
          onClick={handleSave}
          className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-bold text-base tracking-wide py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <ClipboardList className="w-5 h-5" />
          Save Client Session to Site Head Audit Log
        </button>
      </div>
    </div>
  );
}

// ─── Closing Desk ─────────────────────────────────────────────────────────────

const intakeSchema = z.object({
  name: z.string().min(1, 'Enter client name'),
  dob:  z.string().min(1, 'Enter date of birth'),
});
type IntakeValues = z.infer<typeof intakeSchema>;

function ClosingDesk({ session }: { session: Session }) {
  const [result,       setResult     ] = useState<ClientResult | null>(null);
  const [clientCount,  setClientCount] = useState(() => getCount(session.username));
  const [reviewKey,    setReviewKey  ] = useState(0); // resets review on new search

  const form = useForm<IntakeValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: { name: '', dob: '' },
  });

  const onSubmit = (data: IntakeValues) => {
    const [, monthStr, dayStr] = data.dob.split('-');
    const { element: base } = resolveZodiac(parseInt(monthStr, 10), parseInt(dayStr, 10));
    const lp              = calcLifePath(data.dob);
    const resolvedElement = resolveElement(base, lp);
    const archetype       = (thesis.archetypes as Record<string, ArchetypeRecord>)[resolvedElement];
    if (!archetype) return;
    const newCount = bumpCount(session.username);
    setClientCount(newCount);
    setResult({ name: data.name, resolvedElement, archetype });
    setReviewKey(k => k + 1);
    setTimeout(() => document.getElementById('output')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const reset = () => {
    setResult(null);
    form.reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const a = result ? (ACCENT[result.resolvedElement] ?? FALLBACK) : FALLBACK;

  return (
    <div className="space-y-5">

      {/* ── Metric card ── */}
      <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 px-6 py-5 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary/70">Total Clients Attended</p>
          <p className="text-5xl font-extrabold text-primary leading-none mt-1">{clientCount}</p>
        </div>
        <Target className="w-12 h-12 text-primary/20" />
      </div>

      {/* ── Intake form ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <input
                    {...field}
                    placeholder="Client Name"
                    autoComplete="off"
                    className="w-full bg-card border border-border rounded-xl px-4 py-4 text-base font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive px-1" />
              </FormItem>
            )} />
            <FormField control={form.control} name="dob" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <input
                    type="date"
                    min="1940-01-01"
                    max={new Date().toISOString().split('T')[0]}
                    {...field}
                    className="w-full bg-card border border-border rounded-xl px-4 py-4 text-base font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all [&::-webkit-calendar-picker-indicator]:opacity-30"
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive px-1" />
              </FormItem>
            )} />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-bold text-base tracking-wide py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-5 h-5" />
            Get Closing Strategy
          </button>
        </form>
      </Form>

      {/* ── Output ── */}
      {result && (
        <div id="output" className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-400">

          {/* Box 1 — Client Persona */}
          <div className={`rounded-2xl border-2 ${a.border} overflow-hidden`}>
            <div className={`${a.bg} px-5 py-3 border-b ${a.border}`}>
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">1 · Client Persona</p>
            </div>
            <div className="bg-card px-5 py-5 space-y-2">
              <p className={`text-2xl font-extrabold tracking-tight ${a.text}`}>{result.archetype.archetype_name}</p>
              <p className="text-base text-foreground/90 leading-relaxed">{result.archetype.behavioral_profile}</p>
            </div>
          </div>

          {/* Box 2 — Discovery Questions */}
          <div className="rounded-2xl border-2 border-border/60 overflow-hidden">
            <div className="bg-muted/30 px-5 py-3 border-b border-border/40">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">2 · Ask These Questions</p>
            </div>
            <div className="bg-card px-5 py-5 space-y-4">
              {result.archetype.discovery_blueprint.map((q, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold ${a.badge}`}>{i + 1}</span>
                  <p className="text-base font-semibold text-foreground leading-snug pt-1">"{q}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Box 3 — Live Objection Counter */}
          <div className="rounded-2xl border-2 border-border/60 overflow-hidden">
            <div className="bg-muted/30 px-5 py-3 border-b border-border/40">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">3 · Live Objection Counter</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Tap a row to see the exact script</p>
            </div>
            <div className="bg-card px-4 py-4 space-y-3">
              <ObjRow trigger='If Client says: "Price is too high"'      script={result.archetype.objection_matrix.price}      accent={a} />
              <ObjRow trigger='If Client says: "I need time to think"'   script={result.archetype.objection_matrix.time}       accent={a} />
              <ObjRow trigger="If Client says: I don't trust the builder" script={result.archetype.objection_matrix.skepticism} accent={a} />
            </div>
          </div>

          {/* Box 4 — Token Close */}
          <div className="rounded-2xl border-2 border-destructive/60 overflow-hidden">
            <div className="bg-destructive/10 px-5 py-3 border-b border-destructive/40">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-destructive">4 · Token Close — Say This Now</p>
            </div>
            <div className="bg-destructive/5 px-5 py-6">
              <p className="text-lg font-bold text-foreground leading-relaxed border-l-4 border-destructive pl-4">
                "{result.archetype.closing_protocol}"
              </p>
            </div>
          </div>

          {/* Box 5 — Post-Table Review */}
          <PostTableReview
            key={reviewKey}
            session={session}
            result={result}
            onSaved={() => {}}
          />

          {/* Reset */}
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 py-4 border border-border text-muted-foreground font-mono text-xs uppercase tracking-widest hover:bg-muted hover:text-foreground transition-all rounded-xl active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" /> New Client
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Audit Log View ───────────────────────────────────────────────────────────

function AuditLogView() {
  const [entries, setEntries] = useState<AuditEntry[]>(() => loadAudit());

  const refresh = useCallback(() => setEntries(loadAudit()), []);

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">

      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">Site Manager Audit Log</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{entries.length} session{entries.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="flex items-center gap-1.5 border border-border text-muted-foreground rounded-lg px-3 py-2 text-xs font-mono hover:text-foreground hover:bg-muted transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          {entries.length > 0 && (
            <button onClick={downloadJson} className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary rounded-lg px-3 py-2 text-xs font-mono hover:bg-primary/20 transition-all">
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border/50 bg-muted/10 px-6 py-14 text-center">
          <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-bold text-muted-foreground">No sessions logged yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Complete a client session on the Live Closing Desk and submit the Closer Review.</p>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-border/60 overflow-hidden">

          {/* Mobile-friendly card stack (shown < md) */}
          <div className="md:hidden divide-y divide-border/40">
            {entries.map((e, idx) => (
              <div key={e.id} className={`px-4 py-4 space-y-2 ${idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-bold text-sm text-foreground">{e.clientName}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${ACCENT[e.element]?.badge ?? FALLBACK.badge}`}>{e.element}</span>
                </div>
                <p className="text-xs font-mono text-muted-foreground">{formatTs(e.timestamp)} · {e.manager}</p>
                <p className="text-xs text-foreground/80 line-clamp-1">{e.archetype.split('(')[0].trim()}</p>
                <div className={`inline-block text-xs px-2 py-0.5 rounded border font-medium ${
                  e.difficulty.includes('Deal Closed')
                    ? 'border-green-500/40 text-green-400 bg-green-500/10'
                    : 'border-destructive/40 text-destructive/80 bg-destructive/5'
                }`}>{e.difficulty}</div>
                {e.comments && <p className="text-xs text-muted-foreground/70 italic">"{e.comments}"</p>}
              </div>
            ))}
          </div>

          {/* Desktop table (shown ≥ md) */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-mono font-bold uppercase tracking-widest pl-4">Time</TableHead>
                  <TableHead className="text-xs font-mono font-bold uppercase tracking-widest">Manager</TableHead>
                  <TableHead className="text-xs font-mono font-bold uppercase tracking-widest">Client</TableHead>
                  <TableHead className="text-xs font-mono font-bold uppercase tracking-widest">Element</TableHead>
                  <TableHead className="text-xs font-mono font-bold uppercase tracking-widest">Archetype</TableHead>
                  <TableHead className="text-xs font-mono font-bold uppercase tracking-widest">Difficulty</TableHead>
                  <TableHead className="text-xs font-mono font-bold uppercase tracking-widest pr-4">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e, idx) => (
                  <TableRow key={e.id} className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/10'}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap pl-4">{formatTs(e.timestamp)}</TableCell>
                    <TableCell className="text-sm font-semibold">{e.manager}</TableCell>
                    <TableCell className="text-sm font-semibold">{e.clientName}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${ACCENT[e.element]?.badge ?? FALLBACK.badge}`}>{e.element}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[180px]">
                      {e.archetype.split('(')[0].trim()}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium whitespace-nowrap ${
                        e.difficulty.includes('Deal Closed')
                          ? 'border-green-500/40 text-green-400 bg-green-500/10'
                          : 'border-destructive/40 text-destructive/80 bg-destructive/5'
                      }`}>{e.difficulty}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground/70 italic max-w-[200px] truncate pr-4">
                      {e.comments || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

const loginSchema = z.object({
  username: z.string().min(1, 'Enter username'),
  password: z.string().min(1, 'Enter password'),
});
type LoginValues = z.infer<typeof loginSchema>;

function LoginScreen({ onLogin }: { onLogin: (s: Session) => void }) {
  const [loginError, setLoginError] = useState('');
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = (data: LoginValues) => {
    const user = MOCK_USERS[data.username.toLowerCase().trim()];
    if (!user || user.password !== data.password) {
      setLoginError('Invalid username or password. Please try again.');
      return;
    }
    setLoginError('');
    onLogin({ username: data.username.toLowerCase().trim(), displayName: user.displayName });
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/30 mb-2">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-mono font-bold text-2xl tracking-tight">
            AURA<span className="text-primary">CLOSE</span>
          </h1>
          <p className="text-sm text-muted-foreground">Sign in to your Closing Manager account</p>
        </div>

        {/* Demo credentials hint */}
        <div className="bg-muted/30 border border-border/50 rounded-xl px-4 py-3 space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Demo Accounts</p>
          {Object.entries(MOCK_USERS).map(([u, { password: p, displayName: d }]) => (
            <p key={u} className="text-xs text-muted-foreground font-mono">
              <span className="text-foreground font-bold">{u}</span> / {p}
              <span className="text-muted-foreground/50"> — {d}</span>
            </p>
          ))}
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <input
                    {...field}
                    placeholder="Username"
                    autoComplete="username"
                    autoCapitalize="none"
                    className="w-full bg-card border border-border rounded-xl px-4 py-4 text-base font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive px-1" />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <input
                    {...field}
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    className="w-full bg-card border border-border rounded-xl px-4 py-4 text-base font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                  />
                </FormControl>
                <FormMessage className="text-xs text-destructive px-1" />
              </FormItem>
            )} />

            {loginError && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/40 px-4 py-3">
                <p className="text-sm text-destructive font-medium">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-bold text-base tracking-wide py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-5 h-5" /> Sign In
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [view,    setView   ] = useState<AppView>('desk');

  if (!session) return <LoginScreen onLogin={s => { setSession(s); setView('desk'); }} />;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans">

      {/* ── App header ── */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="max-w-lg mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-mono font-bold text-base tracking-tight whitespace-nowrap">
              AURA<span className="text-primary">CLOSE</span>
            </h1>
            <span className="text-muted-foreground/40 text-sm hidden sm:inline">·</span>
            <span className="text-sm text-muted-foreground truncate hidden sm:inline">{session.displayName}</span>
          </div>
          <button
            onClick={() => setSession(null)}
            className="flex items-center gap-1.5 border border-border text-muted-foreground rounded-lg px-3 py-2 text-xs font-mono hover:text-foreground hover:bg-muted transition-all shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>

        {/* Navigation tabs */}
        <div className="max-w-lg mx-auto px-5 pb-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => setView('desk')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
              view === 'desk'
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Target className="w-4 h-4" /> Live Closing Desk
          </button>
          <button
            onClick={() => setView('audit')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
              view === 'audit'
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" /> Site Manager Audit
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6 pb-24">
        {view === 'desk'
          ? <ClosingDesk  session={session} />
          : <AuditLogView />
        }
      </main>
    </div>
  );
}
