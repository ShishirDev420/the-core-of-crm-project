import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Copy,
  FileCheck2,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

type View = 'copilot' | 'context' | 'playbook';
type Category =
  | 'Price'
  | 'Timing'
  | 'Competitor'
  | 'Trust'
  | 'Financing'
  | 'Legal / process'
  | 'Stakeholder'
  | 'Other';
type EntryStatus = 'review' | 'approved' | 'returned';

interface KnowledgeSource {
  id: string;
  title: string;
  detail: string;
  owner: string;
  verifiedAt: string;
  allowedUse: string;
}

interface Guidance {
  concern: string;
  discoveryQuestion: string;
  advisoryResponse: string;
  directResponse: string;
  nextStep: string;
  requiresReview: boolean;
  sourceIds: string[];
  createdAt: string;
}

interface PlaybookEntry {
  id: string;
  title: string;
  category: Category;
  objection: string;
  response: string;
  sourceIds: string[];
  status: EntryStatus;
  outcome: string;
  createdAt: string;
  owner: string;
  version: number;
}

const categories: Category[] = [
  'Price',
  'Timing',
  'Competitor',
  'Trust',
  'Financing',
  'Legal / process',
  'Stakeholder',
  'Other',
];

const sourceLibrary: KnowledgeSource[] = [
  {
    id: 'pricing',
    title: 'Approved price sheet',
    detail: 'Current commercial terms, inclusions, and unit-specific pricing.',
    owner: 'Sales operations',
    verifiedAt: '12 Jul 2026',
    allowedUse: 'Use only after selecting the relevant project and unit.',
  },
  {
    id: 'payment',
    title: 'Payment-plan guide',
    detail: 'Approved payment milestones and finance-process guidance.',
    owner: 'Finance desk',
    verifiedAt: '10 Jul 2026',
    allowedUse: 'Never imply approval or affordability on behalf of a lender.',
  },
  {
    id: 'rera',
    title: 'RERA and legal document pack',
    detail: 'Approved project registrations, disclosures, and document references.',
    owner: 'Compliance',
    verifiedAt: '09 Jul 2026',
    allowedUse: 'Share the document or escalate a legal interpretation.',
  },
  {
    id: 'faq',
    title: 'Project FAQ and amenity brief',
    detail: 'Current, approved answers for project and product questions.',
    owner: 'Project marketing',
    verifiedAt: '11 Jul 2026',
    allowedUse: 'Use only where the selected project is covered by the source.',
  },
  {
    id: 'inventory',
    title: 'Live inventory snapshot',
    detail: 'Time-bound availability status maintained by site operations.',
    owner: 'Site operations',
    verifiedAt: '12 Jul 2026',
    allowedUse: 'Required before stating any availability or urgency.',
  },
];

const guidanceByCategory: Record<
  Category,
  Omit<Guidance, 'requiresReview' | 'sourceIds' | 'createdAt'>
> = {
  Price: {
    concern: 'They may be weighing the full cost, payment timing, or what is included. Confirm which one matters most.',
    discoveryQuestion: 'Would it help if we compare the full cost, included items, and payment timing side by side?',
    advisoryResponse:
      'That is a fair question. A home should work within a comfortable plan, so let us separate the total cost, included items, and payment milestones before you compare options.',
    directResponse:
      'Let us use the approved price sheet and payment-plan guide to compare the complete cost side by side. Which part of the outflow would you like to examine first?',
    nextStep: 'Share the approved comparison or schedule a finance-desk walkthrough.',
  },
  Timing: {
    concern: 'They may need a clearer decision timeline or more confidence before moving to a next step.',
    discoveryQuestion: 'What would you need to feel comfortable deciding the timing: more information, another stakeholder, or a site visit?',
    advisoryResponse:
      'Taking time to decide is reasonable. If we identify the one open question, I can help you get the right information without creating artificial pressure.',
    directResponse:
      'Let us agree on the single question that is holding the decision up and get an approved answer to it before we plan the next step.',
    nextStep: 'Set a specific follow-up after the outstanding question is resolved.',
  },
  Competitor: {
    concern: 'They may be comparing value, location, service, or risk across options.',
    discoveryQuestion: 'Which comparison point matters most to you: total cost, layout, documentation, location, or service after booking?',
    advisoryResponse:
      'Comparing options is sensible. We can make the decision clearer by using the same criteria for every property rather than relying on broad claims.',
    directResponse:
      'Let us build a like-for-like comparison using only the approved documents and the criteria that matter to you.',
    nextStep: 'Prepare a neutral comparison checklist and confirm the client’s decision criteria.',
  },
  Trust: {
    concern: 'They may need evidence, transparency, or a direct conversation with the right owner.',
    discoveryQuestion: 'What would help build confidence: documentation, a site walkthrough, or a conversation with the project team?',
    advisoryResponse:
      'It makes sense to verify before committing. We should address the specific concern with the relevant approved material instead of asking you to take a claim on trust.',
    directResponse:
      'Let us identify the exact proof you need and arrange access to the right document or project owner.',
    nextStep: 'Share the relevant evidence or escalate to the project owner for a direct answer.',
  },
  Financing: {
    concern: 'They may be assessing affordability, payment timing, or lender requirements.',
    discoveryQuestion: 'Is the main concern the upfront amount, the milestone schedule, or how a lender may assess the application?',
    advisoryResponse:
      'Financing decisions are personal, so I would not want to make assumptions. We can review the approved payment options and involve the finance desk for the specific questions.',
    directResponse:
      'Let us use the approved payment-plan guide, then have the finance desk confirm what applies to your situation.',
    nextStep: 'Escalate to the finance desk; do not promise lender approval or affordability.',
  },
  'Legal / process': {
    concern: 'They may need an accurate document, approval status, or a transparent explanation of the process.',
    discoveryQuestion: 'Which document or process step would you like clarified before we continue?',
    advisoryResponse:
      'That deserves a documented answer. I can point you to the approved material and bring in the right project or compliance owner for any interpretation.',
    directResponse:
      'Let us log the exact legal or process question and have the compliance owner answer it from the approved documents.',
    nextStep: 'Escalate to compliance or the project owner with the exact question recorded.',
  },
  Stakeholder: {
    concern: 'They may need another decision-maker to participate before progressing.',
    discoveryQuestion: 'Who else should feel confident about this decision, and what would they need to review?',
    advisoryResponse:
      'Including the right people early usually creates a better decision. We can set up a calm, structured walkthrough around the questions that matter to them.',
    directResponse:
      'Let us arrange a shared review with the stakeholder and prepare the approved facts they will want to see.',
    nextStep: 'Book a joint review and capture the stakeholder’s open questions.',
  },
  Other: {
    concern: 'The underlying concern is not yet clear enough to answer responsibly.',
    discoveryQuestion: 'Could you tell me a little more about what feels unresolved so I can get you the right information?',
    advisoryResponse:
      'Thank you for raising that. I do not want to guess at the answer, so let us clarify the concern and connect it to the right approved information.',
    directResponse:
      'Let us capture the exact question, then bring back a verified answer rather than a generic reassurance.',
    nextStep: 'Classify the new objection and route it to the appropriate owner.',
  },
};

const defaultEntries: PlaybookEntry[] = [
  {
    id: 'playbook-price',
    title: 'Total-cost comparison',
    category: 'Price',
    objection: 'The overall price feels higher than expected.',
    response:
      'Use the approved price sheet to compare the complete cost and included items before recommending a next step.',
    sourceIds: ['pricing', 'payment'],
    status: 'approved',
    outcome: 'Canonical team response',
    createdAt: '2026-07-12T08:30:00.000Z',
    owner: 'Sales operations',
    version: 3,
  },
  {
    id: 'playbook-trust',
    title: 'Evidence before reassurance',
    category: 'Trust',
    objection: 'I need to be sure the information is reliable.',
    response:
      'Ask what proof would help, then provide the relevant approved source or bring in the project owner.',
    sourceIds: ['rera', 'faq'],
    status: 'approved',
    outcome: 'Canonical team response',
    createdAt: '2026-07-11T10:15:00.000Z',
    owner: 'Compliance',
    version: 2,
  },
  {
    id: 'playbook-finance',
    title: 'Finance-desk escalation',
    category: 'Financing',
    objection: 'Can you guarantee a certain loan outcome?',
    response:
      'Do not promise an outcome. Capture the question and route it to the finance desk with the approved payment-plan guide.',
    sourceIds: ['payment'],
    status: 'approved',
    outcome: 'Guardrail response',
    createdAt: '2026-07-10T12:00:00.000Z',
    owner: 'Finance desk',
    version: 1,
  },
];

const storageKey = 'auraclose-playbook-v1';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function readEntries(): PlaybookEntry[] {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return defaultEntries;
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as PlaybookEntry[] : defaultEntries;
  } catch {
    return defaultEntries;
  }
}

function makeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : String(Date.now());
}

function createGuidance(category: Category, sourceIds: string[]): Guidance {
  const base = guidanceByCategory[category];
  const requiresReview =
    sourceIds.length === 0 ||
    category === 'Financing' ||
    category === 'Legal / process';

  return {
    ...base,
    requiresReview,
    sourceIds,
    createdAt: new Date().toISOString(),
  };
}

function StatusPill({ status }: { status: EntryStatus }) {
  const labels: Record<EntryStatus, string> = {
    review: 'Needs review',
    approved: 'Approved',
    returned: 'Returned',
  };

  return <span className={'status-pill status-' + status}>{labels[status]}</span>;
}

function SourceChip({ source }: { source: KnowledgeSource }) {
  return (
    <span className="source-chip" title={source.allowedUse}>
      <FileCheck2 aria-hidden="true" />
      {source.title}
      <span>{source.verifiedAt}</span>
    </span>
  );
}

export default function Home() {
  const [view, setView] = useState<View>('copilot');
  const [client, setClient] = useState({
    name: '',
    project: '',
    stage: 'Discovery',
    communicationLens: 'Detail-first',
  });
  const [priorities, setPriorities] = useState(['Clear documentation', 'Comfortable payment plan']);
  const [newPriority, setNewPriority] = useState('');
  const [category, setCategory] = useState<Category>('Price');
  const [objection, setObjection] = useState('');
  const [context, setContext] = useState('');
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>(['pricing', 'payment']);
  const [guidance, setGuidance] = useState<Guidance | null>(null);
  const [generating, setGenerating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [outcome, setOutcome] = useState('Follow-up needed');
  const [entries, setEntries] = useState<PlaybookEntry[]>(readEntries);
  const [toast, setToast] = useState('');

  const selectedSources = useMemo(
    () => sourceLibrary.filter((source) => selectedSourceIds.includes(source.id)),
    [selectedSourceIds],
  );
  const pendingCount = entries.filter((entry) => entry.status === 'review').length;
  const approvedCount = entries.filter((entry) => entry.status === 'approved').length;

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const toggleSource = (sourceId: string) => {
    setSelectedSourceIds((current) =>
      current.includes(sourceId)
        ? current.filter((id) => id !== sourceId)
        : [...current, sourceId],
    );
  };

  const generateResponse = () => {
    if (!objection.trim()) {
      setValidationMessage('Add the client’s exact concern before generating guidance.');
      return;
    }
    setValidationMessage('');
    setGenerating(true);
    window.setTimeout(() => {
      setGuidance(createGuidance(category, selectedSourceIds));
      setGenerating(false);
    }, 520);
  };

  const addPriority = () => {
    const cleanPriority = newPriority.trim();
    if (!cleanPriority || priorities.includes(cleanPriority)) return;
    setPriorities((current) => [...current, cleanPriority]);
    setNewPriority('');
  };

  const copyResponse = async () => {
    if (!guidance) return;
    const copyText = [
      guidance.advisoryResponse,
      'Ask next: ' + guidance.discoveryQuestion,
      'Recommended next step: ' + guidance.nextStep,
    ].join('\n\n');

    try {
      await navigator.clipboard.writeText(copyText);
      setToast('Response copied. Review the source chips before using it.');
    } catch {
      setToast('Copy was unavailable in this browser. You can select the response text manually.');
    }
  };

  const saveForReview = () => {
    if (!guidance) return;
    const entry: PlaybookEntry = {
      id: makeId(),
      title: category + ' — new field pattern',
      category,
      objection: objection.trim(),
      response: guidance.advisoryResponse,
      sourceIds: guidance.sourceIds,
      status: 'review',
      outcome,
      createdAt: new Date().toISOString(),
      owner: 'Current closer',
      version: 1,
    };
    setEntries((current) => [entry, ...current]);
    setToast('Saved to the site-head review queue. It is not yet visible to the wider team.');
  };

  const updateEntryStatus = (entryId: string, status: EntryStatus) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? { ...entry, status, owner: status === 'approved' ? 'Site head' : entry.owner }
          : entry,
      ),
    );
    setToast(status === 'approved' ? 'Playbook entry approved for the team.' : 'Entry returned for revision.');
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to workspace</a>

      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true"><Sparkles /></div>
          <div>
            <p className="eyebrow">AuraClose Engine</p>
            <h1>Objection Intelligence</h1>
          </div>
        </div>

        <div className="header-status" aria-label="Workspace status">
          <span className="status-dot" aria-hidden="true" />
          <span>Human-reviewed guidance</span>
          <ShieldCheck aria-hidden="true" />
        </div>
      </header>

      <nav className="primary-nav" aria-label="Primary workspace navigation">
        <button
          className={view === 'copilot' ? 'nav-item nav-item-active' : 'nav-item'}
          onClick={() => setView('copilot')}
          aria-current={view === 'copilot' ? 'page' : undefined}
        >
          <MessageSquareText aria-hidden="true" />
          <span>Live Copilot</span>
        </button>
        <button
          className={view === 'context' ? 'nav-item nav-item-active' : 'nav-item'}
          onClick={() => setView('context')}
          aria-current={view === 'context' ? 'page' : undefined}
        >
          <UserRound aria-hidden="true" />
          <span>Client Context</span>
        </button>
        <button
          className={view === 'playbook' ? 'nav-item nav-item-active' : 'nav-item'}
          onClick={() => setView('playbook')}
          aria-current={view === 'playbook' ? 'page' : undefined}
        >
          <BookOpen aria-hidden="true" />
          <span>Team Playbook</span>
          {pendingCount > 0 && <b className="nav-count">{pendingCount}</b>}
        </button>
      </nav>

      <main id="main-content" className="workspace">
        {view === 'copilot' && (
          <>
            <section className="page-intro">
              <div>
                <p className="eyebrow">Conversation workspace</p>
                <h2>Turn a live concern into a clear, credible next step.</h2>
                <p>
                  The copilot drafts guidance from the evidence you select. It never sends a message,
                  commits inventory, or makes a claim without your review.
                </p>
              </div>
              <div className="safety-callout">
                <LockKeyhole aria-hidden="true" />
                <span>Use client-stated needs only. No DOB or inferred personality data is needed here.</span>
              </div>
            </section>

            <div className="copilot-layout">
              <section className="panel intake-panel" aria-labelledby="copilot-input-title">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Step 1</p>
                    <h3 id="copilot-input-title">Capture the concern</h3>
                  </div>
                  <span className="panel-kicker">Editable by closer</span>
                </div>

                <label className="field-label" htmlFor="client-concern">What did the client say?</label>
                <textarea
                  id="client-concern"
                  className="text-field objection-field"
                  value={objection}
                  onChange={(event) => setObjection(event.target.value)}
                  placeholder="For example: “I like the project, but I need to understand the full cost before I involve my family.”"
                />

                <div className="field-grid">
                  <div>
                    <label className="field-label" htmlFor="objection-category">Likely category</label>
                    <select
                      id="objection-category"
                      className="text-field select-field"
                      value={category}
                      onChange={(event) => setCategory(event.target.value as Category)}
                    >
                      {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="deal-stage">Deal stage</label>
                    <select
                      id="deal-stage"
                      className="text-field select-field"
                      value={client.stage}
                      onChange={(event) => setClient({ ...client, stage: event.target.value })}
                    >
                      <option>Discovery</option>
                      <option>Site visit</option>
                      <option>Comparison</option>
                      <option>Decision</option>
                      <option>Post-visit follow-up</option>
                    </select>
                  </div>
                </div>

                <label className="field-label" htmlFor="deal-context">Helpful context <span>optional</span></label>
                <input
                  id="deal-context"
                  className="text-field"
                  value={context}
                  onChange={(event) => setContext(event.target.value)}
                  placeholder="Project, unit, stakeholder, timing, or a stated priority"
                />

                <div className="evidence-picker">
                  <div className="evidence-picker-heading">
                    <div>
                      <p className="eyebrow">Step 2</p>
                      <h4>Choose approved evidence</h4>
                    </div>
                    <span>{selectedSources.length} selected</span>
                  </div>

                  <div className="source-option-list">
                    {sourceLibrary.map((source) => {
                      const checked = selectedSourceIds.includes(source.id);
                      return (
                        <label className={checked ? 'source-option source-option-selected' : 'source-option'} key={source.id}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSource(source.id)}
                          />
                          <span className="source-check">{checked && <Check aria-hidden="true" />}</span>
                          <span>
                            <strong>{source.title}</strong>
                            <small>{source.detail}</small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {validationMessage && <p className="validation-message" role="alert">{validationMessage}</p>}

                <button className="button button-primary generate-button" type="button" onClick={generateResponse} disabled={generating}>
                  {generating ? <RefreshCw className="spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
                  {generating ? 'Checking approved facts…' : 'Generate grounded response'}
                  {!generating && <ArrowRight aria-hidden="true" />}
                </button>
              </section>

              <aside className="panel evidence-panel" aria-labelledby="available-evidence-title">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Evidence control</p>
                    <h3 id="available-evidence-title">Facts available to use</h3>
                  </div>
                  <BadgeCheck className="heading-icon" aria-hidden="true" />
                </div>

                <p className="panel-description">
                  Each source is owned, dated, and restricted to its approved use. Select only material that applies to this conversation.
                </p>

                <div className="source-library">
                  {sourceLibrary.map((source) => (
                    <article className="source-library-item" key={source.id}>
                      <div>
                        <FileCheck2 aria-hidden="true" />
                        <div>
                          <h4>{source.title}</h4>
                          <p>{source.detail}</p>
                        </div>
                      </div>
                      <dl>
                        <div><dt>Owner</dt><dd>{source.owner}</dd></div>
                        <div><dt>Verified</dt><dd>{source.verifiedAt}</dd></div>
                      </dl>
                    </article>
                  ))}
                </div>

                <div className="guardrail-card">
                  <ShieldCheck aria-hidden="true" />
                  <div>
                    <strong>Guardrail on</strong>
                    <p>Availability, returns, legal interpretation, discounts, and lender outcomes need verified evidence or a manager review.</p>
                  </div>
                </div>
              </aside>
            </div>

            {generating && (
              <section className="panel loading-panel" aria-live="polite">
                <div className="loading-line loading-line-wide" />
                <div className="loading-line" />
                <div className="loading-line loading-line-short" />
              </section>
            )}

            {guidance && !generating && (
              <section className="guidance-result" aria-labelledby="guidance-title">
                <div className="result-header">
                  <div>
                    <p className="eyebrow">Step 3</p>
                    <h3 id="guidance-title">Here is a clear way to respond</h3>
                  </div>
                  {guidance.requiresReview
                    ? <span className="review-flag"><Clock3 aria-hidden="true" /> Confirm before using</span>
                    : <span className="ready-flag"><BadgeCheck aria-hidden="true" /> Evidence selected</span>}
                </div>

                <div className="guidance-grid">
                  <article className="guidance-card concern-card">
                    <p className="card-label">Likely concern</p>
                    <p>{guidance.concern}</p>
                  </article>
                  <article className="guidance-card">
                    <p className="card-label">Ask next</p>
                    <p>{guidance.discoveryQuestion}</p>
                  </article>
                </div>

                <div className="response-variants">
                  <article className="response-variant">
                    <div>
                      <p className="card-label">Advisory response</p>
                      <span>Calm and consultative</span>
                    </div>
                    <p>{guidance.advisoryResponse}</p>
                  </article>
                  <article className="response-variant">
                    <div>
                      <p className="card-label">Direct response</p>
                      <span>Clear and concise</span>
                    </div>
                    <p>{guidance.directResponse}</p>
                  </article>
                </div>

                <div className="result-bottom-grid">
                  <div className="next-step-card">
                    <ChevronRight aria-hidden="true" />
                    <div>
                      <p className="card-label">Recommended next step</p>
                      <p>{guidance.nextStep}</p>
                    </div>
                  </div>
                  <div className="sources-used-card">
                    <p className="card-label">Facts used</p>
                    {selectedSources.length > 0 ? (
                      <div className="source-chip-row">
                        {selectedSources.map((source) => <SourceChip key={source.id} source={source} />)}
                      </div>
                    ) : (
                      <p className="insufficient-facts">No approved sources were selected. Keep this to a clarification question or send it for review.</p>
                    )}
                  </div>
                </div>

                {guidance.requiresReview && (
                  <div className="review-notice">
                    <LockKeyhole aria-hidden="true" />
                    <p>
                      This topic needs a verified source or site-head confirmation. The draft deliberately avoids commitments, urgency, guarantees, and legal or finance interpretations.
                    </p>
                  </div>
                )}

                <div className="result-actions">
                  <button className="button button-secondary" type="button" onClick={copyResponse}>
                    <Copy aria-hidden="true" /> Copy response
                  </button>
                  <label className="outcome-select">
                    <span>Outcome</span>
                    <select value={outcome} onChange={(event) => setOutcome(event.target.value)}>
                      <option>Follow-up needed</option>
                      <option>Document requested</option>
                      <option>Joint review booked</option>
                      <option>Concern resolved</option>
                      <option>Escalation required</option>
                    </select>
                  </label>
                  <button className="button button-dark" type="button" onClick={saveForReview}>
                    <Send aria-hidden="true" /> Send for manager review
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        {view === 'context' && (
          <>
            <section className="page-intro compact-intro">
              <div>
                <p className="eyebrow">Client context</p>
                <h2>Make the conversation personal without making assumptions.</h2>
                <p>Record only what the customer has stated or what the closer can substantiate from the conversation.</p>
              </div>
            </section>

            <div className="context-layout">
              <section className="panel context-card">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Customer-stated details</p>
                    <h3>Conversation brief</h3>
                  </div>
                  <UserRound className="heading-icon" aria-hidden="true" />
                </div>

                <div className="field-grid">
                  <div>
                    <label className="field-label" htmlFor="client-name">Client name <span>optional</span></label>
                    <input
                      id="client-name"
                      className="text-field"
                      value={client.name}
                      onChange={(event) => setClient({ ...client, name: event.target.value })}
                      placeholder="Use a preferred name only"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="project-name">Project / product <span>optional</span></label>
                    <input
                      id="project-name"
                      className="text-field"
                      value={client.project}
                      onChange={(event) => setClient({ ...client, project: event.target.value })}
                      placeholder="Relevant project or unit"
                    />
                  </div>
                </div>

                <label className="field-label" htmlFor="communication-lens">Conversation preference</label>
                <select
                  id="communication-lens"
                  className="text-field select-field"
                  value={client.communicationLens}
                  onChange={(event) => setClient({ ...client, communicationLens: event.target.value })}
                >
                  <option>Detail-first</option>
                  <option>Direct and concise</option>
                  <option>Collaborative</option>
                  <option>Not yet known</option>
                </select>
                <p className="field-help">Use only an explicit preference or an observed conversation style. It is editable and never determines eligibility, pricing, or treatment.</p>
              </section>

              <section className="panel priorities-card">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Decision criteria</p>
                    <h3>What matters to the client?</h3>
                  </div>
                  <Layers3 className="heading-icon" aria-hidden="true" />
                </div>

                <div className="priority-list">
                  {priorities.map((priority) => (
                    <span className="priority-pill" key={priority}>
                      {priority}
                      <button type="button" onClick={() => setPriorities((current) => current.filter((item) => item !== priority))} aria-label={'Remove ' + priority}>×</button>
                    </span>
                  ))}
                </div>

                <div className="add-priority">
                  <input
                    className="text-field"
                    value={newPriority}
                    onChange={(event) => setNewPriority(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addPriority();
                      }
                    }}
                    placeholder="Add a client-stated priority"
                  />
                  <button className="button button-secondary" type="button" onClick={addPriority}>Add</button>
                </div>

                <div className="context-note">
                  <ShieldCheck aria-hidden="true" />
                  <p>Numerology or zodiac can be retained as an optional internal training lens, but it is not used in this customer record or response engine.</p>
                </div>
              </section>

              <section className="panel plan-card">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Conversation plan</p>
                    <h3>Prepare before the next touchpoint</h3>
                  </div>
                  <ClipboardCheck className="heading-icon" aria-hidden="true" />
                </div>
                <ol className="plan-list">
                  <li><b>1</b><span>Confirm the open question rather than guessing at the objection.</span></li>
                  <li><b>2</b><span>Choose only the source material that is current for this project.</span></li>
                  <li><b>3</b><span>Use a calm response, then agree on a specific next action and owner.</span></li>
                </ol>
                <button className="button button-primary" type="button" onClick={() => setView('copilot')}>
                  Open Live Copilot <ArrowRight aria-hidden="true" />
                </button>
              </section>
            </div>
          </>
        )}

        {view === 'playbook' && (
          <>
            <section className="page-intro compact-intro">
              <div>
                <p className="eyebrow">Team learning</p>
                <h2>Approved learning, not uncontrolled self-training.</h2>
                <p>Drafts become shared guidance only after a site head reviews the response, sources, and outcome.</p>
              </div>
            </section>

            <div className="metric-row">
              <article className="metric-card"><span>Approved playbooks</span><strong>{approvedCount}</strong><BookOpen aria-hidden="true" /></article>
              <article className="metric-card"><span>Needs review</span><strong>{pendingCount}</strong><Clock3 aria-hidden="true" /></article>
              <article className="metric-card"><span>Source library</span><strong>{sourceLibrary.length}</strong><FileCheck2 aria-hidden="true" /></article>
              <article className="metric-card"><span>Policy status</span><strong>On</strong><ShieldCheck aria-hidden="true" /></article>
            </div>

            <section className="panel playbook-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Site-head control centre</p>
                  <h3>Review queue and versioned playbooks</h3>
                </div>
                <BarChart3 className="heading-icon" aria-hidden="true" />
              </div>

              <div className="entry-list">
                {entries.map((entry) => {
                  const entrySources = sourceLibrary.filter((source) => entry.sourceIds.includes(source.id));
                  return (
                    <article className="playbook-entry" key={entry.id}>
                      <div className="entry-main">
                        <div className="entry-meta">
                          <StatusPill status={entry.status} />
                          <span>{entry.category}</span>
                          <span>v{entry.version}</span>
                        </div>
                        <h4>{entry.title}</h4>
                        <p className="entry-objection">“{entry.objection}”</p>
                        <p>{entry.response}</p>
                        <div className="source-chip-row">
                          {entrySources.length > 0
                            ? entrySources.map((source) => <SourceChip key={source.id} source={source} />)
                            : <span className="insufficient-facts">No approved source attached</span>}
                        </div>
                      </div>
                      <aside className="entry-side">
                        <dl>
                          <div><dt>Outcome</dt><dd>{entry.outcome}</dd></div>
                          <div><dt>Owner</dt><dd>{entry.owner}</dd></div>
                          <div><dt>Updated</dt><dd>{formatDate(entry.createdAt)}</dd></div>
                        </dl>
                        {entry.status === 'review' && (
                          <div className="entry-actions">
                            <button className="button button-primary small-button" type="button" onClick={() => updateEntryStatus(entry.id, 'approved')}>
                              <Check aria-hidden="true" /> Approve
                            </button>
                            <button className="button button-secondary small-button" type="button" onClick={() => updateEntryStatus(entry.id, 'returned')}>
                              Return
                            </button>
                          </div>
                        )}
                      </aside>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="learning-rule">
              <ShieldCheck aria-hidden="true" />
              <div>
                <h3>How the learning loop works</h3>
                <p>Log a case → draft a response → site-head review → approve a versioned playbook → observe outcome. A single closer note never rewrites team guidance automatically.</p>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        <span>Demo workspace · browser-local records only</span>
        <span>Connect CRM, approved documents, role-based access, and a server-side AI service before production rollout.</span>
      </footer>

      {toast && <div className="toast-message" role="status">{toast}</div>}
    </div>
  );
}
