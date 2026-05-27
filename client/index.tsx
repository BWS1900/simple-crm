import { Link, Route, Router, Routes, SignInWithGoogle, signOut, useAuth, useMutation, useQuery, useNavigate, useParams } from "lakebed/client";
import { useState } from "preact/hooks";
import {
  cleanCompany,
  cleanContactName,
  cleanEmail,
  cleanNotes,
  cleanPhone,
  type Contact,
} from "../shared/contacts";

const AVATAR_COLORS = [
  "bg-[#0071e3]", "bg-[#ff9f0a]", "bg-[#ff375f]",
  "bg-[#30d158]", "bg-[#5e5ce6]", "bg-[#64d2ff]",
  "bg-[#ac8e68]", "bg-[#ff6482]",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name }: { name: string }) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-white ${avatarColor(name)}`}
    >
      {initial}
    </span>
  );
}

function AuthPill() {
  const auth = useAuth();
  const label = auth.displayName;

  if (auth.isLoading) {
    return <span className="text-[13px] text-[#86868b]">Checking session...</span>;
  }

  const initial = label.trim().slice(0, 1).toUpperCase() || "?";

  if (auth.isGuest) {
    return (
      <SignInWithGoogle className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ed]" />
    );
  }

  return (
    <div className="flex items-center gap-2">
      {auth.picture ? (
        <img
          alt=""
          className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-black/5"
          referrerPolicy="no-referrer"
          src={auth.picture}
        />
      ) : (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e8e8ed] text-[11px] font-semibold text-[#1d1d1f]">
          {initial}
        </span>
      )}
      <button
        className="text-[13px] text-[#86868b] transition-colors hover:text-[#1d1d1f]"
        type="button"
        onClick={() => signOut()}
      >
        Sign out
      </button>
    </div>
  );
}

function ContactListPage() {
  const contacts = useQuery<Contact[]>("contacts");
  const deleteContact = useMutation<[id: string], void>("deleteContact");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = contacts.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[34px] font-bold leading-tight tracking-[-0.02em] text-[#1d1d1f]">
            Contacts
          </h1>
          <p className="mt-1 text-[15px] text-[#86868b]">
            {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-1 rounded-full bg-[#0071e3] px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-[#0077ed] active:scale-[0.97]"
          to="/add"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add
        </Link>
      </div>

      <div className="relative mb-6">
        <svg class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          className="w-full rounded-xl border border-black/[0.08] bg-[#e8e8ed] py-3 pl-11 pr-4 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-all focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/10"
          placeholder="Search contacts..."
          value={search}
          onInput={(e) => setSearch(e.currentTarget.value)}
        />
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5f7]">
            <svg class="h-8 w-8 text-[#86868b]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <p className="text-[17px] font-medium text-[#1d1d1f]">No contacts yet</p>
          <p className="mt-1 text-[15px] text-[#86868b]">
            Add your first contact to get started.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <p className="text-[17px] font-medium text-[#1d1d1f]">No results</p>
          <p className="mt-1 text-[15px] text-[#86868b]">
            No contacts match "{search}".
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((contact) => (
            <div
              className="group relative overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
              key={contact.id}
            >
              {deleteId === contact.id ? (
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={contact.name} />
                    <div>
                      <p className="text-[15px] font-medium text-[#1d1d1f]">{contact.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#86868b]">Delete this contact?</span>
                    <button
                      className="rounded-full bg-[#ff3b30] px-4 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#ff453a]"
                      type="button"
                      onClick={async () => {
                        await deleteContact(contact.id);
                        setDeleteId(null);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="rounded-full bg-[#e8e8ed] px-4 py-1.5 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#dcdce0]"
                      type="button"
                      onClick={() => setDeleteId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <Link className="block px-5 py-4" to={`/contacts/${contact.id}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={contact.name} />
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-[#1d1d1f]">
                          {contact.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 text-[13px] text-[#86868b]">
                          {contact.company && <span className="truncate">{contact.company}</span>}
                          {contact.email && <span className="hidden truncate sm:inline">{contact.email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {contact.phone && (
                        <span className="hidden text-[13px] text-[#86868b] sm:inline">
                          {contact.phone}
                        </span>
                      )}
                      <button
                        className="rounded-full p-1.5 text-[#86868b] opacity-0 transition-all hover:bg-[#f5f5f7] hover:text-[#ff3b30] group-hover:opacity-100"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteId(contact.id);
                        }}
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <svg class="h-4 w-4 shrink-0 text-[#c7c7cc]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ContactFormCard({
  initial,
  onSubmit,
  submitLabel,
  title,
}: {
  initial?: Contact;
  onSubmit: (name: string, email: string, phone: string, company: string, notes: string) => Promise<void>;
  submitLabel: string;
  title: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!cleanContactName(name)) {
      setError("Name is required.");
      return;
    }
    setError("");
    await onSubmit(
      cleanContactName(name),
      cleanEmail(email),
      cleanPhone(phone),
      cleanCompany(company),
      cleanNotes(notes)
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-8">
      <h1 className="mb-8 text-[28px] font-bold leading-tight tracking-[-0.02em] text-[#1d1d1f]">
        {title}
      </h1>

      <form className="flex flex-col gap-5" onSubmit={(e) => void handleSubmit(e)}>
        {error && (
          <div className="rounded-xl bg-[#ff3b30]/10 px-4 py-3 text-[14px] font-medium text-[#ff3b30]">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Name</label>
          <input
            className="w-full rounded-xl border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-all focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/10"
            maxLength={100}
            placeholder="Full name"
            value={name}
            onInput={(e) => setName(e.currentTarget.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Email</label>
            <input
              className="w-full rounded-xl border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-all focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/10"
              maxLength={200}
              placeholder="email@example.com"
              type="email"
              value={email}
              onInput={(e) => setEmail(e.currentTarget.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Phone</label>
            <input
              className="w-full rounded-xl border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-all focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/10"
              maxLength={30}
              placeholder="(555) 123-4567"
              type="tel"
              value={phone}
              onInput={(e) => setPhone(e.currentTarget.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Company</label>
          <input
            className="w-full rounded-xl border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-all focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/10"
            maxLength={100}
            placeholder="Company name"
            value={company}
            onInput={(e) => setCompany(e.currentTarget.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#1d1d1f]">Notes</label>
          <textarea
            className="w-full rounded-xl border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-all focus:border-[#0071e3] focus:bg-white focus:ring-4 focus:ring-[#0071e3]/10"
            maxLength={500}
            placeholder="Add notes about this contact..."
            rows={4}
            value={notes}
            onInput={(e) => setNotes(e.currentTarget.value)}
          />
        </div>

        <button
          className="mt-1 inline-flex items-center justify-center rounded-full bg-[#0071e3] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#0077ed] active:scale-[0.98]"
          type="submit"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}

function AddContactPage() {
  const addContact = useMutation<[string, string, string, string, string], void>("addContact");
  const navigate = useNavigate();

  return (
    <div>
      <Link
        className="mb-6 inline-flex items-center gap-1 text-[15px] text-[#0071e3] transition-colors hover:text-[#0077ed]"
        to="/"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>
      <ContactFormCard
        submitLabel="Add Contact"
        title="New Contact"
        onSubmit={async (name, email, phone, company, notes) => {
          await addContact(name, email, phone, company, notes);
          navigate("/");
        }}
      />
    </div>
  );
}

function EditContactPage() {
  const { id } = useParams<{ id: string }>();
  const contacts = useQuery<Contact[]>("contacts");
  const updateContact = useMutation<[string, string, string, string, string, string], void>(
    "updateContact"
  );
  const deleteContact = useMutation<[id: string], void>("deleteContact");
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const contact = contacts.find((c) => c.id === id);

  if (!contacts.length) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-4 h-2 w-16 animate-pulse rounded-full bg-[#e8e8ed]" />
        <p className="text-[15px] text-[#86868b]">Loading...</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div>
        <Link
          className="mb-6 inline-flex items-center gap-1 text-[15px] text-[#0071e3] transition-colors hover:text-[#0077ed]"
          to="/"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <p className="text-[17px] font-medium text-[#1d1d1f]">Contact not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        className="mb-6 inline-flex items-center gap-1 text-[15px] text-[#0071e3] transition-colors hover:text-[#0077ed]"
        to="/"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>
      <ContactFormCard
        initial={contact}
        submitLabel="Save Changes"
        title="Edit Contact"
        onSubmit={async (name, email, phone, company, notes) => {
          await updateContact(id, name, email, phone, company, notes);
          navigate("/");
        }}
      />
      <div className="mt-4 rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-8">
        {confirmDelete ? (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[15px] font-medium text-[#1d1d1f]">
              Delete this contact?
            </span>
            <div className="flex items-center gap-2">
              <button
                className="rounded-full bg-[#ff3b30] px-5 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[#ff453a]"
                type="button"
                onClick={async () => {
                  await deleteContact(id);
                  navigate("/");
                }}
              >
                Delete
              </button>
              <button
                className="rounded-full bg-[#e8e8ed] px-5 py-2 text-[14px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#dcdce0]"
                type="button"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#ff3b30] transition-colors hover:text-[#ff453a]"
            type="button"
            onClick={() => setConfirmDelete(true)}
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Contact
          </button>
        )}
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <p className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-[#1d1d1f]">
        Page Not Found
      </p>
      <Link
        className="mt-4 inline-flex items-center gap-1 text-[15px] text-[#0071e3] transition-colors hover:text-[#0077ed]"
        to="/"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Contacts
      </Link>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
        <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#f5f5f7]/80">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
            <Link className="text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f] transition-colors hover:text-[#86868b]" to="/">
              Simple CRM
            </Link>
            <AuthPill />
          </div>
          <div className="mx-auto max-w-2xl px-6">
            <div className="h-px bg-black/[0.06]" />
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-6 py-8">
          <Routes>
            <Route path="/" element={<ContactListPage />} />
            <Route path="/add" element={<AddContactPage />} />
            <Route path="/contacts/:id" element={<EditContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
