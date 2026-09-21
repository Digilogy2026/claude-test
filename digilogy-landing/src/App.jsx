import React, { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Menu, X, ChevronLeft, ChevronRight, Check, Plus, Minus,
  RotateCcw, Bot, ArrowUpRight, Image,
} from "lucide-react";

/* ============================================================
   DIGILOGY — Website Development Landing Page
   Warm-neutral / slate / teal design system.
   First thing visitors see: a greeting + the Lead Form — no
   marketing headline above it.
   ============================================================ */

/* ---------------------------- Design tokens ---------------------------- */
const PAPER = "#FAF8F3";       // page background — warm ivory, richer than a flat cool grey
const PANEL = "#FFFFFF";       // cards, form, panels — crisp white against the warm base
const ALT = "#F1EBDB";         // alternating section tint — warm sand

const INK = "#1A1611";         // primary text — near-black with a warm undertone
const INK_SOFT = "#6B6152";    // secondary text — warm taupe-grey
const LINE = "#E7E0CE";
const LINE_STRONG = "#D4C7A8";

const TEAL = "#0B5E42";        // primary accent — deep emerald, richer than a flat teal
const TEAL_DEEP = "#083A2A";   // hover / pressed / gradient end
const GOLD = "#B08D3F";        // reserved for one premium highlight moment — used sparingly
const GRADIENT = `linear-gradient(135deg, ${TEAL}, ${TEAL_DEEP})`;

const SUCCESS = "#1F8A5F";
const ERROR = "#C0392B";

// Real business WhatsApp number, international format, no "+"/spaces/dashes.
const WHATSAPP_NUMBER = "919384096054";

// EmailJS config — sends the "New Lead" email to Info@digilogy.co.
// Uses EmailJS's plain REST API via fetch (no SDK import needed).
const EMAILJS_SERVICE_ID = "service_us09rtr";
const EMAILJS_TEMPLATE_ID = "template_fkvw2kn";
const EMAILJS_PUBLIC_KEY = "aELnBUqqrugJDBZHH";

async function sendLeadEmail(templateParams) {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`EmailJS request failed (${res.status}): ${text}`);
  }
  return res;
}

// Supabase config — stores every submitted lead in the `leads` table as a
// backup/record alongside the notification email above. The publishable
// key is safe to expose in the browser: the `leads` table has Row Level
// Security enabled with an insert-only policy, so the public site can add
// leads but can never read, edit or delete them back out.
const SUPABASE_URL = "https://gbcrpjoelqexcfluroyq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_3N4sMKHwcB-23KLNfteQrA_-V4qfgF-";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function saveLeadToDatabase(row) {
  try {
    const { error } = await supabase.from("leads").insert(row);
    if (error) console.error("Supabase insert failed:", error.message);
  } catch (err) {
    console.error("Supabase insert failed:", err);
  }
}

/* ---------------------------- Static content ---------------------------- */
const SERVICES = [
  {
    name: "Proven Expertise",
    category: "DIGITAL SOLUTIONS",
    stats: [
      { value: "99+", label: "Projects Delivered" },
      { value: "87%", label: "Client Retention" },
      { value: "15+", label: "Software Architects" },
    ],
    keywords: "Strategy · Design · Technology",
    backHeading: "What You Get",
    points: [
      { title: "Branded Website", desc: "Built around your identity." },
      { title: "Responsive Experience", desc: "Works across every screen." },
    ],
    cta: "Explore →",
  },
  {
    category: "WEBSITE DEVELOPMENT",
    title: "Built to Perform",
    supporting: "Custom, responsive and scalable development built around your business requirements.",
    keywords: "Custom · Responsive · Scalable",
    benefits: [
      { title: "Custom Development", desc: "Built around your requirements." },
      { title: "Responsive Design", desc: "Works seamlessly across devices." },
      { title: "Scalable Architecture", desc: "Ready for future growth." },
      { title: "SEO-Ready", desc: "Structured for search visibility." },
    ],
  },
  {
    category: "SOFTWARE TOOLS",
    title: "Built to Simplify",
    supporting: "Custom digital tools designed to make business processes easier, smarter and more efficient.",
    keywords: "Custom · Automated · Integrated",
    benefits: [
      { title: "Custom Workflows", desc: "Built around your processes." },
      { title: "Smart Automation", desc: "Reduce repetitive tasks." },
      { title: "Business Dashboards", desc: "Access important information easily." },
      { title: "System Integration", desc: "Connect your existing tools." },
    ],
  },
  {
    category: "MOBILE APPLICATIONS",
    title: "Built for Mobile",
    supporting: "Purpose-built applications that turn business ideas into intuitive digital experiences.",
    keywords: "iOS · Android · Cross-Platform",
    benefits: [
      { title: "Custom App Design", desc: "Designed around your users." },
      { title: "iOS & Android", desc: "Built for your target platforms." },
      { title: "Smooth Experiences", desc: "Simple and intuitive interactions." },
      { title: "Backend Integration", desc: "Connected to your business systems." },
    ],
  },
  {
    category: "LANDING PAGES",
    title: "Built to Convert",
    supporting: "Focused landing experiences designed to turn campaigns, traffic and opportunities into meaningful customer actions.",
    keywords: "Campaign · Lead · Conversion",
    benefits: [
      { title: "Campaign-Focused Design", desc: "Built around your offer." },
      { title: "Conversion Structure", desc: "Clear journeys and CTAs." },
      { title: "Lead Capture", desc: "Forms designed for enquiries." },
      { title: "Analytics Ready", desc: "Prepared for tracking and optimization." },
    ],
  },
];

/* Slide list for the "Digital Experiences We've Built" hover-expand
   slider — one slide per service category. Expanding a slide shows
   the list of client samples under `samples`. Each sample has just
   three fields: `client` (name), `logo` (image URL — leave empty
   to show a placeholder), and `url` (opens in a popup on click,
   never redirecting away from the page — leave empty for a
   non-clickable card). Add more sample entries to any category as
   needed. */
const WEBSITE_SAMPLES = [
  { client: "Sellassure", logo: "" },
  { client: "Rentassure", logo: "" },
  { client: "Athreya Sarvvaa", logo: "" },
  { client: "Travelogy", logo: "" },
  { client: "Lifaai", logo: "" },
  { client: "ICCW", logo: "" },
  { client: "GrowMore Technology", logo: "" },
  { client: "Fusion Design", logo: "" },
  { client: "Space Edit", logo: "" },
  { client: "My Hair Buddy", logo: "" },
  { client: "Idreams Events", logo: "" },
  { client: "Casagrand Dubai", logo: "" },
  { client: "Casagrand Industrial Warehouse", logo: "" },
];

const SOFTWARE_TOOL_SAMPLES = [
  { client: "Digilogy Work — Task Management", logo: "", url: "https://work.digilogy.co/" },
  { client: "Digilogy CRM", logo: "", url: "https://crm.digilogy.co/" },
  { client: "Digilogy Helpdesk — Ticketing System", logo: "", url: "https://helpdesk.digilogy.co/" },
];

const MOBILE_APP_SAMPLES = [
  { client: "CG WorkFlow", logo: "https://play-lh.googleusercontent.com/UrChlaBVwdGUsIB0KiBD5XQ95ZVHfFSXBAxqyaFzSNInU4ikfGbWL5EMDwEs6b4qSKfOmKpcHBNdgWTI0DBd=w240-h480", url: "https://play.google.com/store/apps/details?id=com.digilogy.CG_Task_Management" },
  { client: "CG Land Calculator", logo: "https://play-lh.googleusercontent.com/toyijwOxQ1QGK2Zxete1U-GL2LRsxCIEiQ1DAL-n4OuUYPdWVrQvUD051GyU6bgliApEjuz6SDtD_4rCXMpkTew=w240-h480", url: "https://play.google.com/store/apps/details?id=com.digilogy.cg_land_calc" },
];

const LANDING_PAGE_SAMPLES = [
  { client: "[Client Name]", logo: "", url: "" },
  { client: "[Client Name]", logo: "", url: "" },
];

const PORTFOLIO_SLIDES = [
  {
    key: "all-services",
    title: "All Services",
    groups: [
      { title: "Websites", samples: WEBSITE_SAMPLES },
      { title: "Software Tools", samples: SOFTWARE_TOOL_SAMPLES },
      { title: "Mobile Applications", samples: MOBILE_APP_SAMPLES },
      { title: "Landing Pages", samples: LANDING_PAGE_SAMPLES },
    ],
  },
  {
    key: "websites",
    title: "Websites",
    samples: WEBSITE_SAMPLES,
  },
  {
    key: "software-tools",
    title: "Software Tools",
    samples: SOFTWARE_TOOL_SAMPLES,
  },
  {
    key: "mobile-applications",
    title: "Mobile Applications",
    samples: MOBILE_APP_SAMPLES,
  },
  {
    key: "landing-pages",
    title: "Landing Pages",
    samples: LANDING_PAGE_SAMPLES,
  },
];

/* Data for the BusinessGrowthTabs widget. Kept as structured data so
   content is easy to edit later without touching the component markup. */
const BUSINESS_GROWTH_TABS = [
  {
    tab: "Value",
    heading: "Your Website Should Do More Than Represent Your Business",
    body: "Your website should bring your brand, customers, marketing and business goals together.",
    points: ["Grow Your Presence", "Connect With Customers", "Support Your Growth", "Ready for What's Next"],
  },
  {
    tab: "Business",
    heading: "Your Business Comes First. The Website Follows.",
    body: "We start by understanding your business, your customers and your goals — then align the digital experience with your brand, built around what your business actually needs rather than forced into a template.",
    points: ["Business-first thinking", "Custom digital solutions", "Goal-driven planning", "Customer-focused experiences"],
  },
  {
    tab: "Growth",
    heading: "A Digital Foundation That Can Grow With You",
    body: "Your website is built on a flexible architecture that supports future features, integrations and business expansion — a foundation for continuous improvement, not a fixed end point. This is what it means to build a website that grows with your business.",
    points: ["Built for growth", "Flexible architecture", "Future-ready", "Easy to evolve"],
  },
  {
    tab: "Design",
    heading: "Make Your Business Stand Out Online",
    body: "Good design helps customers understand and connect with your business — it's not simply decoration. Every experience is brand-aligned, with a strong visual hierarchy and clear customer journeys throughout.",
    points: ["Brand-led design", "Intuitive UX", "Responsive experiences", "Clear journeys"],
  },
  {
    tab: "Performance",
    heading: "Built to Work for Your Business",
    body: "Beyond how it looks, your website is built to perform — with conversion-focused journeys, SEO-friendly foundations, and readiness for analytics and marketing integrations.",
    points: ["Conversion-focused", "SEO-ready", "Marketing-ready", "Analytics-ready"],
  },
  {
    tab: "Technology",
    heading: "Where Strategy Meets Technology",
    body: "The Right Technology for the Right Business. We select technology based on your project and business requirements — we choose the technology around your requirements, not the other way around.",
    techGroups: [
      { label: "CMS & Platforms", items: ["WordPress", "Shopify", "Custom CMS"] },
      { label: "Frameworks", items: ["React", "Next.js", "Node.js"] },
      { label: "Connectivity", items: ["APIs", "System Integrations"] },
    ],
  },
  {
    tab: "Vision",
    heading: "Built for Businesses That Are Going Somewhere",
    body: "Whatever stage your business is at, the digital experience should meet you there — and be ready for where you're headed next.",
    vision: [
      { title: "Established Businesses", desc: "Strengthen your digital presence." },
      { title: "Growing Businesses", desc: "Build a foundation for your next stage." },
      { title: "Expanding Businesses", desc: "Create digital experiences that can evolve with you." },
      { title: "New Digital Ventures", desc: "Turn your business idea into a digital experience." },
    ],
  },
];

const FAQS = [
  { q: "How long does a website project take?", a: "Timelines vary by scope. Once we understand your goals, we agree a project plan with clear stages from discovery through to launch." },
  { q: "Can you redesign our existing website?", a: "Yes. We can rebuild your digital presence around your current brand, content and business goals." },
  { q: "Do you build e-commerce websites?", a: "Yes — we design and develop e-commerce experiences suited to your products, catalogue and customers." },
  { q: "Can you integrate our existing systems?", a: "We can connect your website with the tools and systems your business already relies on." },
  { q: "Will the website be mobile responsive?", a: "Every website we build is designed to work well across desktop, tablet and mobile." },
  { q: "Can the website scale as our business grows?", a: "Yes. We build on a flexible foundation designed to evolve alongside your business." },
  { q: "Do you provide maintenance and support?", a: "We offer ongoing support so your website continues to perform as your business grows." },
  { q: "How do we get started?", a: "Share a few details through the website consultant or the enquiry form, and our team will follow up to discuss your project." },
];

const BUDGET_OPTIONS = ["Under ₹25,000", "₹25,000 – ₹50,000", "₹50,000 – ₹1,00,000", "More than ₹1,00,000", "Not Sure"];

const CONSULTANT_STEPS = [
  { key: "type", question: "What are you looking to build?", options: ["Business Website", "E-Commerce", "Web Application", "Website Redesign", "Not Sure Yet"] },
  { key: "goal", question: "What's the main goal?", options: ["Grow Your Business", "Build a Stronger Presence", "Generate More Enquiries", "Sell Online", "Create Something Custom"] },
  { key: "stage", question: "Where is your business today?", options: ["Established Business", "Growing Business", "Expanding Business", "Launching Something New"] },
  { key: "budget", question: "What's your budget range?", options: BUDGET_OPTIONS },
];

const TYPE_TO_PROJECT_OPTION = {
  "Business Website": "New Website",
  "E-Commerce": "E-Commerce",
  "Web Application": "Web Application",
  "Website Redesign": "Website Redesign",
  "Not Sure Yet": "Not Sure Yet",
};

const PROJECT_OPTIONS = ["Website Development", "Software Tools", "Mobile Application", "Landing Page Services", "New Website", "Website Redesign", "E-Commerce", "Web Application", "Custom Website", "Not Sure Yet"];

function buildRecommendation(answers) {
  const typePhrase = {
    "Business Website": "growth-focused business website",
    "E-Commerce": "considered e-commerce experience",
    "Web Application": "purpose-built web application",
    "Website Redesign": "refreshed, modern website",
    "Not Sure Yet": "tailored digital solution",
  }[answers.type] || "modern website";

  const stagePhrase = {
    "Established Business": "next stage of growth",
    "Growing Business": "growing customer base",
    "Expanding Business": "expanding operations",
    "Launching Something New": "new venture",
  }[answers.stage] || "goals";

  return `A ${typePhrase} could be a strong fit for your goals. We can structure the experience around your brand, customers and ${stagePhrase}.`;
}

/* ---------------------------- Small utilities ---------------------------- */
const cx = (...a) => a.filter(Boolean).join(" ");

/* Real responsive detection (replaces the prototype's manual device
   toggle). 768px matches the "mobile" breakpoint every component below
   already branches on via the `device` prop, so no component logic
   below needed to change — only how `device` is determined. */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpoint]);
  return isMobile;
}

/* ============================================================
   FOCUS TRAP — keeps Tab focus inside the mobile consultant modal
   ============================================================ */
const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
function FocusTrap({ active, children }) {
  const ref = useRef(null);
  const previouslyFocused = useRef(null);
  useEffect(() => {
    if (!active) return;
    previouslyFocused.current = document.activeElement;
    const container = ref.current;
    const items = container.querySelectorAll(FOCUSABLE);
    if (items.length) items[0].focus();
    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const els = Array.from(container.querySelectorAll(FOCUSABLE));
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused.current) previouslyFocused.current.focus();
    };
  }, [active]);
  return <div ref={ref}>{children}</div>;
}

/* ============================================================
   THANK YOU MODAL — shown after Lead Form submission or after
   "Discuss My Project" in the Website Consultant
   ============================================================ */
function ThankYouModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-labelledby="thankyou-heading">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <FocusTrap active={true}>
        <div
          className="animate-dropdownIn relative w-full max-w-[360px] rounded-[10px] border p-6 text-center"
          style={{ borderColor: LINE, backgroundColor: PANEL, boxShadow: "0 20px 50px rgba(26,22,17,0.25)" }}
        >
          <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1">
            <X size={16} color={INK_SOFT} />
          </button>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: SUCCESS }}>
            <Check color="#fff" size={22} />
          </div>
          <h3 id="thankyou-heading" className="text-[19px] font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK }}>
            Thank You!
          </h3>
          <p className="mt-2 text-[14px]" style={{ color: INK_SOFT, lineHeight: 1.55 }}>
            Thanks for the details — our team will connect with you shortly. Please visit{" "}
            <a href="https://digilogy.co" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2" style={{ color: TEAL }}>
              digilogy.co
            </a>{" "}
            for our detailed services.
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full rounded-[4px] py-2.5 text-[14px] font-medium text-white"
            style={{ backgroundImage: GRADIENT }}
          >
            Got it
          </button>
        </div>
      </FocusTrap>
    </div>
  );
}

/* ============================================================
   LEAD FORM MODAL — opened from the floating "Let's Build" CTA.
   Same LeadForm fields/logic as the inline card; submitting it
   successfully closes this and hands off to ThankYouModal.
   ============================================================ */
function LeadFormModal({ device, values, errors, submitted, onChange, onSubmit, onReset, onClose, sending, emailError }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-labelledby="leadmodal-heading">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <FocusTrap active={true}>
        <div
          className="animate-dropdownIn relative w-full max-w-[420px] rounded-[10px] border p-6"
          style={{ borderColor: LINE, backgroundColor: PANEL, boxShadow: "0 20px 50px rgba(26,22,17,0.25)", maxHeight: "88vh", overflowY: "auto" }}
        >
          <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1">
            <X size={16} color={INK_SOFT} />
          </button>
          <p id="leadmodal-heading" className="pr-6 text-[18px] font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK }}>
            Let's Build Your Website
          </p>
          <p className="mt-1 mb-4 text-[13px]" style={{ color: INK_SOFT }}>
            Share a few details and our team will get in touch.
          </p>
          <LeadForm device={device} values={values} errors={errors} submitted={submitted} onChange={onChange} onSubmit={onSubmit} onReset={onReset} sending={sending} emailError={emailError} />
        </div>
      </FocusTrap>
    </div>
  );
}

/* ============================================================
   PROJECT PREVIEW POPUP — opened by clicking a project sample in
   "Digital Experiences We've Built". Shows the site in a large
   embedded frame with a close button; never navigates the
   visitor away from the page.
   ============================================================ */
function ProjectPreviewPopup({ url, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Project preview">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} aria-hidden="true" />
      <FocusTrap active={true}>
        <div
          className="animate-dropdownIn relative flex h-full w-full max-w-[1100px] flex-col overflow-hidden rounded-[10px] border"
          style={{ borderColor: LINE, backgroundColor: PANEL, boxShadow: "0 24px 60px rgba(26,22,17,0.35)" }}
        >
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: LINE }}>
            <span className="truncate text-[13px]" style={{ color: INK_SOFT }}>{url}</span>
            <button onClick={onClose} aria-label="Close" className="ml-3 flex shrink-0 items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-[12.5px] font-medium" style={{ borderColor: LINE_STRONG, color: INK }}>
              <X size={14} /> Close
            </button>
          </div>
          <iframe src={url} title="Project preview" className="flex-1" style={{ border: "none", width: "100%" }} />
        </div>
      </FocusTrap>
    </div>
  );
}

/* ============================================================
   NAVBAR
   ============================================================ */
function Navbar({ device, onNav, menuOpen, setMenuOpen }) {
  const mobile = device === "mobile";
  const links = ["Services", "Work", "About"];
  return (
    <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ borderColor: LINE, backgroundColor: "rgba(246,247,246,0.9)" }}>
      <div className={cx("flex items-center justify-between", mobile ? "px-5 py-4" : "px-10 py-5")}>
        <span className="font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: mobile ? 18 : 20, color: INK }}>
          DIGILOGY
        </span>

        {!mobile && (
          <nav className="flex items-center gap-9">
            {links.map((l) => (
              <button key={l} onClick={() => onNav(l)} className="text-[15px] transition-colors hover:opacity-70" style={{ color: INK_SOFT }}>
                {l}
              </button>
            ))}
            <button
              onClick={() => onNav("LeadForm")}
              className="rounded-[4px] px-5 py-2.5 text-[15px] font-medium text-white transition-colors"
              style={{ backgroundImage: GRADIENT }}
            >
              Let's Talk →
            </button>
          </nav>
        )}

        {mobile && (
          <button aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} className="p-1">
            {menuOpen ? <X size={22} color={INK} /> : <Menu size={22} color={INK} />}
          </button>
        )}
      </div>

      {/* Dropdown floats over the page — it does not push content down.
          Backdrop dims/blocks the page behind it and closes the menu on tap. */}
      {mobile && menuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30"
            style={{ backdropFilter: "blur(1px)" }}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="animate-dropdownIn absolute left-4 right-4 top-full z-40 overflow-hidden rounded-[8px] border shadow-[0_16px_36px_rgba(26,22,17,0.18)]"
            style={{ borderColor: LINE, backgroundColor: PANEL, marginTop: 8 }}
            role="menu"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <button key={l} onClick={() => { onNav(l); setMenuOpen(false); }} className="py-2.5 text-left text-[16px]" style={{ color: INK }} role="menuitem">
                  {l}
                </button>
              ))}
              <button onClick={() => { onNav("LeadForm"); setMenuOpen(false); }} className="mt-2 rounded-[4px] py-3 text-center text-[15px] font-medium text-white" style={{ backgroundImage: GRADIENT }} role="menuitem">
                Let's Talk →
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

/* ============================================================
   WEBSITE CONSULTANT
   ============================================================ */
function Consultant({ device, step, answers, onSelect, onBack, onReset, onDiscuss, contact, onChangeContact, sending, emailError, fullScreen }) {
  const mobile = device === "mobile";
  const total = CONSULTANT_STEPS.length;
  const showRecommendation = step > total;
  const current = CONSULTANT_STEPS[step - 1];
  const [contactErrors, setContactErrors] = useState({});

  const handleDiscuss = () => {
    const errs = {};
    if (!contact.name.trim()) errs.name = "Please enter your name.";
    if (!contact.phone.trim()) errs.phone = "Please enter your phone number.";
    setContactErrors(errs);
    if (Object.keys(errs).length === 0) onDiscuss();
  };

  return (
    <div className={cx("h-full", fullScreen ? "flex flex-col" : "")}>
      <div className="mb-1 inline-flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: LINE_STRONG }}>
        <Bot size={13} color={TEAL} />
        <span className="text-[12px] font-medium" style={{ color: TEAL }}>Website Consultant</span>
      </div>

      <h3 className={cx("mt-2 font-semibold", mobile ? "text-[17px]" : "text-[18px]")} style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK, lineHeight: 1.25 }}>
        Let's Build the Right Website for Your Business
      </h3>
      <p className="mt-1.5 text-[13px]" style={{ color: INK_SOFT, lineHeight: 1.5 }}>
        Not sure what you need? Answer a few quick questions and we'll help you find the right direction.
      </p>

      {!showRecommendation && (
        <div className="mt-1.5 text-[11.5px] font-medium" style={{ color: INK_SOFT }} aria-live="polite">
          Step {step} of {total}
        </div>
      )}

      <div className="mt-3" key={step}>
        {!showRecommendation ? (
          <div className="animate-stepIn">
            <p className="mb-2 text-[14px] font-medium" style={{ color: INK }} id={`consultant-q-${step}`}>{current.question}</p>
            <div role="group" aria-labelledby={`consultant-q-${step}`} className="flex flex-wrap gap-1.5">
              {current.options.map((opt) => {
                const selected = answers[current.key] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => onSelect(current.key, opt)}
                    aria-pressed={selected}
                    className="rounded-[4px] border px-3 py-1.5 text-left text-[13px] transition-colors"
                    style={{
                      borderColor: selected ? TEAL : LINE_STRONG,
                      backgroundImage: selected ? GRADIENT : "none",
                      backgroundColor: selected ? "transparent" : PANEL,
                      color: selected ? "#fff" : INK,
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {step > 1 && (
              <button onClick={onBack} className="mt-3 text-[12.5px] underline underline-offset-2" style={{ color: INK_SOFT }}>
                ← Back
              </button>
            )}
          </div>
        ) : (
          <div className="animate-stepIn rounded-[6px] border p-3" style={{ borderColor: LINE_STRONG, backgroundColor: ALT }} role="status">
            <p className="text-[13.5px]" style={{ color: INK, lineHeight: 1.5 }}>{buildRecommendation(answers)}</p>

            <p className="mb-2 mt-3 text-[12px] font-medium" style={{ color: INK }}>Almost done — how can our team reach you?</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  value={contact.name}
                  onChange={(e) => onChangeContact("name", e.target.value)}
                  placeholder="Name"
                  aria-label="Name"
                  aria-invalid={Boolean(contactErrors.name)}
                  className="w-full rounded-[4px] border px-2.5 py-2 text-[13px] outline-none"
                  style={{ borderColor: contactErrors.name ? ERROR : LINE_STRONG, backgroundColor: PANEL, color: INK }}
                />
                {contactErrors.name && <p className="mt-0.5 text-[10.5px]" style={{ color: ERROR }}>{contactErrors.name}</p>}
              </div>
              <div>
                <input
                  value={contact.phone}
                  onChange={(e) => onChangeContact("phone", e.target.value)}
                  placeholder="Phone"
                  type="tel"
                  aria-label="Phone"
                  aria-invalid={Boolean(contactErrors.phone)}
                  className="w-full rounded-[4px] border px-2.5 py-2 text-[13px] outline-none"
                  style={{ borderColor: contactErrors.phone ? ERROR : LINE_STRONG, backgroundColor: PANEL, color: INK }}
                />
                {contactErrors.phone && <p className="mt-0.5 text-[10.5px]" style={{ color: ERROR }}>{contactErrors.phone}</p>}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button onClick={handleDiscuss} disabled={sending} className="rounded-[4px] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60" style={{ backgroundImage: GRADIENT }}>
                {sending ? "Sending…" : "Discuss My Project →"}
              </button>
              <button onClick={() => { setContactErrors({}); onReset(); }} className="inline-flex items-center gap-1.5 text-[12.5px] underline underline-offset-2" style={{ color: INK_SOFT }}>
                <RotateCcw size={12} /> Start Over
              </button>
            </div>
            {emailError && <p className="mt-2 text-[12px]" style={{ color: ERROR }}>{emailError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   LEAD FORM (also doubles as the page's greeting/hero content)
   ============================================================ */
function LeadForm({ device, values, errors, submitted, onChange, onSubmit, onReset, sending, emailError }) {
  const mobile = device === "mobile";
  const field = (label, name, type = "text", required = false) => (
    <div className="mb-2.5">
      <label className="mb-1 block text-[12px] font-medium" style={{ color: INK }}>
        {label}{required && <span style={{ color: ERROR }}> *</span>}
      </label>
      <input
        type={type}
        value={values[name]}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={Boolean(errors[name])}
        aria-required={required}
        className="w-full rounded-[4px] border px-3 py-2 text-[13.5px] outline-none transition-shadow"
        style={{ borderColor: errors[name] ? ERROR : LINE_STRONG, backgroundColor: PANEL, color: INK }}
        onFocus={(e) => { e.currentTarget.style.borderColor = errors[name] ? ERROR : TEAL; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(11,94,66,0.14)`; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = errors[name] ? ERROR : LINE_STRONG; e.currentTarget.style.boxShadow = "none"; }}
      />
      {errors[name] && <p className="mt-0.5 text-[11px]" style={{ color: ERROR }}>{errors[name]}</p>}
    </div>
  );

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-6 text-center" role="status" aria-live="polite">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: SUCCESS }}>
          <Check color="#fff" size={18} />
        </div>
        <h3 className="text-[16px] font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK }}>
          Thanks — your project details have been received.
        </h3>
        <p className="mt-1.5 max-w-[300px] text-[13px]" style={{ color: INK_SOFT }}>
          Our team will get in touch to understand your requirements.
        </p>
        <button onClick={onReset} className="mt-4 text-[12.5px] underline underline-offset-2" style={{ color: INK_SOFT }}>
          Submit another project
        </button>
      </div>
    );
  }

  return (
    <div>
      <div role="form" aria-label="Website project enquiry">
        <div className="grid grid-cols-2 gap-3">
          {field("Name", "name", "text", true)}
          {field("Company", "company")}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field("Work Email", "email", "email", true)}
          {field("Phone", "phone", "tel", true)}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="mb-2.5">
            <label className="mb-1 block text-[12px] font-medium" style={{ color: INK }}>What are you looking to build?</label>
            <select
              value={values.projectType}
              onChange={(e) => onChange("projectType", e.target.value)}
              className="w-full rounded-[4px] border px-3 py-2 text-[13.5px] outline-none"
              style={{ borderColor: errors.projectType ? ERROR : LINE_STRONG, backgroundColor: PANEL, color: INK }}
            >
              <option value="">Select an option</option>
              {PROJECT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {errors.projectType && <p className="mt-0.5 text-[11px]" style={{ color: ERROR }}>{errors.projectType}</p>}
          </div>

          <div className="mb-2.5">
            <label className="mb-1 block text-[12px] font-medium" style={{ color: INK }}>Budget Range</label>
            <select
              value={values.budget}
              onChange={(e) => onChange("budget", e.target.value)}
              className="w-full rounded-[4px] border px-3 py-2 text-[13.5px] outline-none"
              style={{ borderColor: LINE_STRONG, backgroundColor: PANEL, color: INK }}
            >
              <option value="">Select a range</option>
              {BUDGET_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-[12px] font-medium" style={{ color: INK }}>Project Details</label>
          <textarea
            rows={2}
            value={values.details}
            onChange={(e) => onChange("details", e.target.value)}
            className="w-full resize-none rounded-[4px] border px-3 py-2 text-[13.5px] outline-none"
            style={{ borderColor: LINE_STRONG, backgroundColor: PANEL, color: INK }}
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={sending}
          className={cx("rounded-[4px] font-medium text-white disabled:opacity-60", mobile ? "w-full py-2.5 text-[14px]" : "px-5 py-2.5 text-[13.5px]")}
          style={{ backgroundImage: GRADIENT }}
        >
          {sending ? "Sending…" : "Start Your Website Project →"}
        </button>
        {emailError && <p className="mt-2 text-[12px]" style={{ color: ERROR }}>{emailError}</p>}
      </div>
    </div>
  );
}

/* ============================================================
   CONVERSION ROW — Website Consultant + Lead Form, together,
   in the first scroll. Mobile: Lead Form first, Consultant second.
   ============================================================ */
function ConversionRow({ device, consultantRef, leadFormRef, step, answers, onSelect, onBack, onReset, onDiscuss, lead, errors, submitted, onChange, onSubmit, onResetLead, sending, emailError }) {
  const mobile = device === "mobile";

  const consultantBlock = (
    <div ref={consultantRef} className={cx(mobile ? "p-3.5" : "p-4")} style={!mobile ? { borderRight: `1px solid ${LINE}` } : {}}>
      <Consultant device={device} step={step} answers={answers} onSelect={onSelect} onBack={onBack} onReset={onReset} onDiscuss={onDiscuss} contact={{ name: lead.name, phone: lead.phone }} onChangeContact={onChange} sending={sending} emailError={emailError} />
    </div>
  );
  const leadFormBlock = (
    <div ref={leadFormRef} className={cx(mobile ? "border-b p-3.5" : "p-4")} style={mobile ? { borderColor: LINE } : {}}>
      <h1
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK, lineHeight: 1.2 }}
        className={cx(mobile ? "text-[15.5px]" : "text-[16px]", "font-semibold")}
      >
        Thanks for Choosing Digilogy for Your Website
      </h1>
      <p className="mt-1 mb-2 text-[12px]" style={{ color: INK_SOFT }}>
        Please share the below details to connect.
      </p>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: TEAL }}>Let's Build Your Website</p>
      <LeadForm device={device} values={lead} errors={errors} submitted={submitted} onChange={onChange} onSubmit={onSubmit} onReset={onResetLead} sending={sending} emailError={emailError} />
    </div>
  );

  return (
    <div className={cx(mobile ? "px-5 pt-4" : "mx-auto max-w-[1080px] px-10 pt-5")}>
      <div className={cx("rounded-[8px] border", mobile ? "" : "grid grid-cols-2")} style={{ borderColor: LINE, backgroundColor: PANEL, boxShadow: "0 10px 32px rgba(26,22,17,0.08), 0 2px 6px rgba(26,22,17,0.04)" }}>
        {mobile ? leadFormBlock : <>{consultantBlock}{leadFormBlock}</>}
      </div>
    </div>
  );
}

/* ============================================================
   SERVICES CAROUSEL
   ============================================================ */
function ServiceFlipCard({ device, name, desc, points, stats, backHeading, cta, category, title, supporting, keywords, benefits }) {
  const mobile = device === "mobile";
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped((f) => !f);
  const height = mobile ? 280 : 268;
  const ariaName = stats ? name : `${category} — ${title}`;

  // Shared typography/spacing so every card — Card 1 included — looks identical in format.
  const categoryCls = "text-[10.5px] font-medium uppercase tracking-wide";
  const titleCls = "mt-1 text-[15.5px] font-semibold";
  const backHeadingCls = "mt-1 text-[13px] font-semibold";
  const secondaryCls = "mt-1.5 text-[11.5px]";
  const hintCls = "mt-auto pt-2 text-[11px] font-medium";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${ariaName}. ${flipped ? "Showing details. Press to go back." : "Press to learn more."}`}
      onClick={toggle}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } }}
      className="snap-start shrink-0 cursor-pointer outline-none"
      style={{ perspective: 1000, height, width: mobile ? "78%" : "calc(25% - 10.5px)" }}
    >
      <div
        className="flip-card-inner relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transitionProperty: "transform",
          transitionDuration: "0.5s",
          transitionTimingFunction: "cubic-bezier(0.4, 0.15, 0.2, 1)",
        }}
      >
        {/* FRONT — same typography/spacing for every card */}
        <div
          aria-hidden={flipped}
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[6px] border p-4"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderColor: TEAL, backgroundColor: PANEL }}
        >
          <p className={categoryCls} style={{ color: TEAL }}>{category}</p>
          <p className={titleCls} style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK }}>{stats ? name : title}</p>

          {stats ? (
            <>
              <div className="mt-2.5 flex flex-col gap-1.5">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-baseline gap-1.5">
                    <span className="text-[14px] font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: GOLD }}>{s.value}</span>
                    <span className="text-[11.5px]" style={{ color: INK_SOFT }}>{s.label}</span>
                  </div>
                ))}
              </div>
              {keywords && <p className="mt-1.5 text-[10.5px] font-medium" style={{ color: TEAL }}>{keywords}</p>}
            </>
          ) : (
            <>
              <p className={secondaryCls} style={{ color: INK_SOFT, lineHeight: 1.45 }}>{supporting}</p>
              <p className="mt-1.5 text-[10.5px] font-medium" style={{ color: TEAL }}>{keywords}</p>
            </>
          )}

          <p className={hintCls} style={{ color: TEAL }}>↗ Tap to Learn More</p>
        </div>

        {/* BACK — same typography/spacing for every card */}
        <div
          aria-hidden={!flipped}
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[6px] border p-4"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: TEAL, backgroundColor: ALT }}
        >
          <p className={categoryCls} style={{ color: TEAL }}>{category}</p>
          <p className={backHeadingCls} style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK }}>{backHeading || "What You Get"}</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {(stats ? points : benefits).map((item) => {
              const pt = typeof item === "object" ? item : { title: item };
              return (
                <div key={pt.title} className="flex items-start gap-1.5">
                  <Check size={11} color={TEAL} className="mt-0.5 shrink-0" />
                  <span className="leading-snug">
                    <span className="block text-[11px] font-medium" style={{ color: INK }}>{pt.title}</span>
                    {pt.desc && <span className="block text-[10px]" style={{ color: INK_SOFT }}>{pt.desc}</span>}
                  </span>
                </div>
              );
            })}
          </div>
          <p className={hintCls} style={{ color: TEAL }}>↩ Tap to Go Back</p>
        </div>
      </div>
    </div>
  );
}

function ServicesCarousel({ device }) {
  const mobile = device === "mobile";
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const perView = mobile ? 1 : 4;
  const maxIndex = SERVICES.length - perView;

  const go = (dir) => {
    const next = Math.max(0, Math.min(maxIndex, index + dir));
    setIndex(next);
    const track = trackRef.current;
    if (track) {
      const card = track.children[0];
      const cardW = card ? card.getBoundingClientRect().width + 14 : 0;
      track.scrollTo({ left: next * cardW, behavior: "smooth" });
    }
  };

  return (
    <section className={cx(mobile ? "px-5 py-6" : "px-10 py-8")}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={cx("font-semibold", mobile ? "text-[19px]" : "text-[22px]")} style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK }}>
          What We Build
        </h2>
        {!mobile && (
          <div className="flex gap-2">
            <button onClick={() => go(-1)} aria-label="Previous" className="rounded-full border p-2" style={{ borderColor: LINE_STRONG }}><ChevronLeft size={16} color={INK} /></button>
            <button onClick={() => go(1)} aria-label="Next" className="rounded-full border p-2" style={{ borderColor: LINE_STRONG }}><ChevronRight size={16} color={INK} /></button>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-label="What We Build — scrollable"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
        }}
        className="flex snap-x snap-mandatory items-start gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SERVICES.map((s) => (
          <ServiceFlipCard
            key={s.name || s.category}
            device={device}
            name={s.name}
            desc={s.desc}
            points={s.points}
            stats={s.stats}
            backHeading={s.backHeading}
            cta={s.cta}
            category={s.category}
            title={s.title}
            supporting={s.supporting}
            keywords={s.keywords}
            benefits={s.benefits}
          />
        ))}
      </div>

      {mobile ? (
        <div className="mt-2 flex items-center justify-center gap-3">
          <button onClick={() => go(-1)} aria-label="Previous"><ChevronLeft size={18} color={INK_SOFT} /></button>
          <div className="flex gap-1.5">
            {SERVICES.map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: i === index ? TEAL : LINE_STRONG }} />
            ))}
          </div>
          <button onClick={() => go(1)} aria-label="Next"><ChevronRight size={18} color={INK_SOFT} /></button>
        </div>
      ) : (
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: i === index ? TEAL : LINE_STRONG }} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   Generic section shell
   ============================================================ */
function Section({ device, alt, heading, sub, children, refProp, fullWidthHeading }) {
  const mobile = device === "mobile";
  return (
    <section ref={refProp} className={cx(mobile ? "px-5 py-12" : "px-10 py-16")} style={{ backgroundColor: alt ? ALT : PAPER }}>
      <div className={cx(mobile ? "" : "mx-auto max-w-[1080px]")}>
        {heading && (
          <div className={cx(mobile ? "mb-7" : "mb-10", !mobile && !fullWidthHeading && "max-w-[640px]")}>
            <h2 className={cx("font-semibold", mobile ? "text-[22px]" : "text-[30px]")} style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK, lineHeight: 1.2 }}>
              {heading}
            </h2>
            {sub && <p className="mt-3 text-[14.5px]" style={{ color: INK_SOFT, lineHeight: 1.6 }}>{sub}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/* ============================================================
   BUSINESS / GROWTH / DESIGN / PERFORMANCE / TECHNOLOGY / VISION
   TAB WIDGET
   ============================================================ */
function BusinessGrowthTabs({ device, tabsRef }) {
  const mobile = device === "mobile";
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const current = BUSINESS_GROWTH_TABS[active];

  const selectTab = (i) => {
    setActive(i);
    if (mobile && trackRef.current) {
      const btn = trackRef.current.children[i];
      if (btn) btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  const scrollTabs = (dir) => {
    const next = Math.max(0, Math.min(BUSINESS_GROWTH_TABS.length - 1, active + dir));
    selectTab(next);
  };

  return (
    <section ref={tabsRef} className={cx(mobile ? "px-5 py-12" : "px-10 py-16")} style={{ backgroundColor: PAPER }}>
      <div className={cx(mobile ? "" : "mx-auto max-w-[1080px]")}>
        <div className={cx(mobile ? "mb-6" : "mb-8")}>
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide" style={{ color: TEAL }}>How We Build</p>
          <h2 className={cx("font-semibold", mobile ? "text-[22px]" : "text-[30px]")} style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK, lineHeight: 1.2 }}>
            More Than a Website. Built Around Your Business.
          </h2>
        </div>

        {/* One combined widget: tabs sit flush against the content panel —
            no divider line, no padding gap — so it reads as one continuous
            surface rather than two stacked pieces. */}
        <div className="overflow-hidden rounded-[8px] border" style={{ borderColor: LINE, backgroundColor: PANEL, boxShadow: "0 10px 32px rgba(26,22,17,0.08), 0 2px 6px rgba(26,22,17,0.04)" }}>
          {/* Tabs */}
          {mobile ? (
            <div className="flex items-center gap-2 px-4 pt-4">
              <button onClick={() => scrollTabs(-1)} aria-label="Previous tab" className="shrink-0 rounded-full border p-2" style={{ borderColor: LINE_STRONG }}>
                <ChevronLeft size={15} color={INK_SOFT} />
              </button>
              <div
                ref={trackRef}
                role="tablist"
                aria-label="How we build"
                className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {BUSINESS_GROWTH_TABS.map((t, i) => (
                  <button
                    key={t.tab}
                    role="tab"
                    aria-selected={active === i}
                    onClick={() => selectTab(i)}
                    className="shrink-0 whitespace-nowrap rounded-t-[4px] border border-b-0 px-3.5 py-2.5 text-[13px] font-medium transition-colors"
                    style={{
                      borderColor: active === i ? LINE : "transparent",
                      backgroundColor: active === i ? ALT : "transparent",
                      color: active === i ? TEAL : INK_SOFT,
                    }}
                  >
                    {t.tab}
                  </button>
                ))}
              </div>
              <button onClick={() => scrollTabs(1)} aria-label="Next tab" className="shrink-0 rounded-full border p-2" style={{ borderColor: LINE_STRONG }}>
                <ChevronRight size={15} color={INK_SOFT} />
              </button>
            </div>
          ) : (
            <div role="tablist" aria-label="How we build" className="flex flex-wrap gap-1 px-3 pt-3">
              {BUSINESS_GROWTH_TABS.map((t, i) => (
                <button
                  key={t.tab}
                  role="tab"
                  aria-selected={active === i}
                  onClick={() => selectTab(i)}
                  className="rounded-t-[4px] border border-b-0 px-5 py-2.5 text-[14px] font-medium transition-colors"
                  style={{
                    borderColor: active === i ? LINE : "transparent",
                    backgroundColor: active === i ? ALT : "transparent",
                    color: active === i ? TEAL : INK_SOFT,
                  }}
                >
                  {t.tab}
                </button>
              ))}
            </div>
          )}

          {/* Content panel — flush against the active tab, same tint, no gap or divider */}
          <div key={active} role="tabpanel" className="animate-stepIn p-6" style={{ backgroundColor: ALT }}>
            <h3 className={cx("font-semibold", mobile ? "text-[19px]" : "text-[22px]")} style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK, lineHeight: 1.25 }}>
              {current.heading}
            </h3>
            <p className="mt-2.5 text-[14px]" style={{ color: INK_SOFT, lineHeight: 1.6 }}>
              {current.body}
            </p>

            {current.points && (
              <div className={cx("mt-5 grid gap-3", mobile ? "grid-cols-1" : "grid-cols-2")}>
                {current.points.map((p) => (
                  <div key={p} className="flex items-center gap-2.5 rounded-[6px] border px-4 py-3" style={{ borderColor: LINE, backgroundColor: PANEL }}>
                    <Check size={14} color={TEAL} />
                    <span className="text-[13.5px]" style={{ color: INK }}>{p}</span>
                  </div>
                ))}
  </div>
            )}

            {current.techGroups && (
              <div className="mt-5 flex flex-col gap-4">
                {current.techGroups.map((g) => (
                  <div key={g.label}>
                    <p className="mb-2 text-[11.5px] font-medium uppercase tracking-wide" style={{ color: TEAL }}>{g.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {g.items.map((item) => (
                        <span key={item} className="rounded-full border px-4 py-1.5 text-[13px]" style={{ borderColor: LINE_STRONG, color: INK, backgroundColor: PANEL }}>{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {current.vision && (
              <div className={cx("mt-5 grid gap-3", mobile ? "grid-cols-1" : "grid-cols-2")}>
                {current.vision.map((v) => (
                  <div key={v.title} className="rounded-[6px] border p-4" style={{ borderColor: LINE, backgroundColor: PANEL }}>
                    <p className="text-[13.5px] font-medium" style={{ color: INK }}>{v.title}</p>
                    <p className="mt-1 text-[12.5px]" style={{ color: INK_SOFT, lineHeight: 1.45 }}>{v.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PORTFOLIO — hover-to-expand slider. Slides: projects, then
   Achievements, then Testimonial, then individual clients — all
   within the same "Digital Experiences We've Built" section.
   Desktop: hovering a slide expands it and reveals its detail;
   moving off the row returns to the first slide.
   Mobile: no hover, so tapping a slide expands it instead.
   The row scrolls horizontally once slides no longer fit.
   ============================================================ */
function Portfolio({ device, refProp }) {
  const mobile = device === "mobile";
  const [active, setActive] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const trackRef = useRef(null);

  const collapsedW = mobile ? 56 : 84;
  const panelH = mobile ? 320 : 360;

  const scrollBy = (dir) => {
    if (trackRef.current) trackRef.current.scrollBy({ left: dir * (mobile ? 180 : 260), behavior: "smooth" });
  };

  return (
    <Section
      device={device}
      refProp={refProp}
      heading="Digital Experiences We've Built"
      fullWidthHeading
    >
      <div className="relative">
        <div
          ref={trackRef}
          onMouseLeave={() => !mobile && setActive(0)}
          className="flex gap-2 overflow-x-auto rounded-[8px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ height: panelH }}
        >
          {PORTFOLIO_SLIDES.map((s, i) => {
            const isActive = active === i;
            return (
              <div
                key={s.key}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                aria-label={`${s.title}${isActive ? ", expanded" : ""}`}
                onMouseEnter={() => !mobile && setActive(i)}
                onClick={() => setActive(i)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(i); } }}
                className="trust-slide-panel relative cursor-pointer overflow-hidden rounded-[8px] border outline-none"
                style={{
                  flex: isActive ? "1 1 0%" : `0 0 ${collapsedW}px`,
                  minWidth: isActive ? (mobile ? 190 : 260) : collapsedW,
                  height: panelH,
                  borderColor: isActive ? TEAL : LINE,
                  backgroundColor: isActive ? PANEL : ALT,
                  transitionProperty: "flex-grow, flex-basis, background-color, border-color",
                  transitionDuration: "0.4s",
                  transitionTimingFunction: "cubic-bezier(0.4, 0.1, 0.2, 1)",
                }}
              >
                {/* Collapsed label */}
                <div
                  aria-hidden={isActive}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-200"
                  style={{ opacity: isActive ? 0 : 1 }}
                >
                  <Image size={18} color={TEAL} />
                  <span
                    className="whitespace-nowrap text-[12px] font-medium"
                    style={{ color: INK_SOFT, writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    {s.title}
                  </span>
                </div>

                {/* Expanded — list of project samples for this category (or,
                    for "All Services", one heading + list per category) */}
                <div
                  aria-hidden={!isActive}
                  className="absolute inset-0 overflow-auto p-4"
                  style={{ opacity: isActive ? 1 : 0, transition: "opacity 0.3s", scrollbarWidth: "thin" }}
                >
                  <div style={{ minWidth: 300 }}>
                    {!s.groups && (
                      <p className="mb-3 text-[13px] font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK }}>{s.title}</p>
                    )}

                    {(s.groups || [{ title: null, samples: s.samples }]).map((group, gIdx) => (
                      <div key={gIdx} className={gIdx > 0 ? "mt-5" : ""}>
                        {group.title && (
                          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide" style={{ color: TEAL }}>{group.title}</p>
                        )}
                        <div className="flex flex-col gap-2.5">
                          {group.samples.map((p, idx) => (
                            <div
                              key={idx}
                              onClick={(e) => { if (p.url) { e.stopPropagation(); setPreviewUrl(p.url); } }}
                              className="flex items-center gap-3 rounded-[6px] border p-3"
                              style={{ borderColor: LINE, backgroundColor: ALT, cursor: p.url ? "pointer" : "default" }}
                            >
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border p-1" style={{ borderColor: LINE, backgroundColor: p.dark ? INK : PANEL }}>
                                {p.logo ? (
                                  <img src={p.logo} alt={p.client} className="h-full w-full object-contain" />
                                ) : (
                                  <span className="text-[9px]" style={{ color: INK_SOFT }}>[LOGO]</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium" style={{ color: INK }}>{p.client}</p>
                                {p.url && (
                                  <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: TEAL }}>
                                    View <ArrowUpRight size={11} />
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex justify-center gap-2">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-md"
            style={{ borderColor: TEAL, backgroundColor: PANEL }}
          >
            <ChevronLeft size={20} color={TEAL} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-md"
            style={{ borderColor: TEAL, backgroundColor: PANEL }}
          >
            <ChevronRight size={20} color={TEAL} />
          </button>
        </div>
      </div>

      {previewUrl && <ProjectPreviewPopup url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </Section>
  );
}

/* ============================================================
   FAQ
   ============================================================ */
function FAQ({ device, refProp }) {
  const [open, setOpen] = useState(0);
  return (
    <Section device={device} refProp={refProp} heading="Frequently Asked Questions">
      <div>
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="border-b py-4" style={{ borderColor: LINE }}>
              <button onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center justify-between text-left" aria-expanded={isOpen}>
                <span className="pr-4 text-[15px] font-medium" style={{ color: INK }}>{f.q}</span>
                {isOpen ? <Minus size={16} color={INK_SOFT} /> : <Plus size={16} color={INK_SOFT} />}
              </button>
              <div className={cx("grid transition-[grid-template-rows] duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <p className="pt-3 text-[14px]" style={{ color: INK_SOFT, lineHeight: 1.6 }}>{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ============================================================
   NETWORK WATERMARK — a subtle, original abstract pattern of
   connected nodes used as decorative background behind key
   sections. Purely decorative — hidden from screen readers.
   ============================================================ */
const NETWORK_NODES = [
  { x: 60, y: 24, r: 4 }, { x: 160, y: 52, r: 3 }, { x: 90, y: 82, r: 5 },
  { x: 230, y: 18, r: 3 }, { x: 260, y: 72, r: 6 }, { x: 340, y: 40, r: 3 },
  { x: 380, y: 90, r: 4 }, { x: 440, y: 24, r: 3 }, { x: 470, y: 62, r: 5 },
  { x: 540, y: 84, r: 3 }, { x: 560, y: 34, r: 4 }, { x: 630, y: 58, r: 6 },
  { x: 660, y: 18, r: 3 }, { x: 700, y: 84, r: 4 }, { x: 760, y: 46, r: 3 },
  { x: 800, y: 22, r: 5 }, { x: 830, y: 74, r: 3 }, { x: 900, y: 40, r: 4 },
  { x: 930, y: 84, r: 3 }, { x: 960, y: 12, r: 4 }, { x: 1020, y: 56, r: 6 },
  { x: 1060, y: 28, r: 3 }, { x: 1100, y: 80, r: 4 }, { x: 1140, y: 44, r: 3 },
  { x: 1180, y: 18, r: 5 },
];
const NETWORK_LINKS = [
  [0, 1], [1, 2], [1, 3], [3, 4], [2, 4], [4, 5], [5, 6], [5, 7], [7, 8],
  [4, 8], [8, 9], [8, 10], [10, 11], [11, 12], [11, 13], [13, 14], [12, 14],
  [14, 15], [15, 16], [15, 17], [17, 18], [17, 19], [19, 20], [20, 21],
  [20, 22], [22, 23], [23, 24], [21, 23], [9, 13], [16, 18],
];

function NetworkWatermark({ color = TEAL, dotColor = GOLD, opacity = 0.16, height = 110 }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 w-full"
      style={{ height, opacity }}
      viewBox="0 0 1200 100"
      preserveAspectRatio="none"
    >
      {NETWORK_LINKS.map(([a, b], i) => {
        const from = NETWORK_NODES[a];
        const to = NETWORK_NODES[b];
        return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={1.5} />;
      })}
      {NETWORK_NODES.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.r >= 5 ? dotColor : color} />
      ))}
    </svg>
  );
}

function WhatsAppButton({ device }) {
  const mobile = device === "mobile";
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed z-40 flex items-center justify-center rounded-full shadow-[0_8px_20px_rgba(37,211,102,0.4)]"
      style={{
        right: mobile ? 16 : 24,
        bottom: mobile ? 84 : 100,
        width: mobile ? 52 : 56,
        height: mobile ? 52 : 56,
        backgroundColor: "#25D366",
      }}
    >
      <svg viewBox="0 0 32 32" width={mobile ? 26 : 28} height={mobile ? 26 : 28} fill="#fff" aria-hidden="true">
        <path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.22.6 4.34 1.74 6.2L4 29l7.95-1.7a12.9 12.9 0 0 0 4.07.66h.01c6.62 0 12.02-5.4 12.02-12.02C28.05 8.4 22.65 3 16.02 3zm0 21.86h-.01a10.2 10.2 0 0 1-5.2-1.42l-.37-.22-3.87.83.83-3.78-.24-.39a10.19 10.19 0 0 1-1.55-5.44c0-5.63 4.58-10.21 10.22-10.21 2.73 0 5.29 1.06 7.22 3 1.93 1.93 3 4.49 2.99 7.22 0 5.63-4.6 10.41-10.22 10.41zm5.6-7.65c-.31-.15-1.82-.9-2.1-1s-.49-.15-.69.15-.79 1-.97 1.2-.36.23-.66.08a8.35 8.35 0 0 1-2.46-1.52 9.2 9.2 0 0 1-1.7-2.11c-.18-.31 0-.47.13-.62.14-.14.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.39-.02-.54s-.69-1.66-.94-2.28c-.25-.6-.5-.51-.69-.52h-.59c-.2 0-.53.08-.81.39s-1.06 1.04-1.06 2.53 1.09 2.94 1.24 3.14c.15.2 2.14 3.27 5.19 4.58.73.31 1.29.5 1.74.64.73.23 1.4.2 1.92.12.59-.09 1.82-.74 2.07-1.46s.26-1.33.18-1.46c-.08-.13-.28-.2-.59-.36z" />
      </svg>
    </a>
  );
}

function StickyBar({ device, onOpenConsultant, onGoToForm, onDismiss }) {
  const mobile = device === "mobile";
  if (mobile) {
    return (
      <button
        onClick={onOpenConsultant}
        aria-label="Open Website Consultant chat"
        className="animate-stickyIn fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(11,94,66,0.35)]"
        style={{ backgroundImage: GRADIENT, marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <Bot size={24} />
      </button>
    );
  }
  return (
    <div className="animate-stickyIn fixed bottom-5 right-6 z-40 flex items-center gap-4 rounded-[8px] border px-5 py-3.5 shadow-[0_10px_30px_rgba(26,22,17,0.12)]" style={{ backgroundColor: PANEL, borderColor: LINE_STRONG }}>
      <button onClick={onDismiss} aria-label="Dismiss" className="absolute -right-2 -top-2 rounded-full border p-0.5" style={{ borderColor: LINE_STRONG, backgroundColor: PANEL }}>
        <X size={11} color={INK_SOFT} />
      </button>
      <div className="flex items-center gap-2.5">
        <Bot size={17} color={TEAL} />
        <div>
          <p className="text-[13.5px] font-medium" style={{ color: INK }}>Not sure what website is right for you?</p>
          <button onClick={onOpenConsultant} className="text-[12.5px] underline underline-offset-2" style={{ color: INK_SOFT }}>Need help choosing?</button>
        </div>
      </div>
      <button onClick={onGoToForm} className="whitespace-nowrap rounded-[4px] px-4 py-2 text-[13.5px] font-medium text-white" style={{ backgroundImage: GRADIENT }}>
        Let's Build →
      </button>
    </div>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer({ device }) {
  const mobile = device === "mobile";
  return (
    <footer className={cx("border-t", mobile ? "px-5 py-10" : "px-10 py-12")} style={{ borderColor: LINE, backgroundColor: ALT }}>
      <div className={cx(mobile ? "" : "mx-auto flex max-w-[1080px] items-start justify-between")}>
        <div>
          <p className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: INK, fontSize: 18 }}>DIGILOGY</p>
          <p className="mt-1 text-[13px]" style={{ color: INK_SOFT }}>Website Development</p>
        </div>
        <nav className={cx("flex flex-wrap gap-x-6 gap-y-2", mobile ? "mt-6" : "")}>
          {["Services", "Work", "Process", "About", "Contact"].map((l) => (
            <span key={l} className="text-[13.5px]" style={{ color: INK_SOFT }}>{l}</span>
          ))}
        </nav>
      </div>
      <div className={cx("flex gap-3", mobile ? "mt-6" : "mt-8")}>
        {["[Social]", "[Social]", "[Social]"].map((s, i) => (
          <span key={i} className="rounded-full border px-3 py-1 text-[11px]" style={{ borderColor: LINE_STRONG, color: INK_SOFT }}>{s}</span>
        ))}
      </div>
    </footer>
  );
}

/* ============================================================
   PAGE (the shippable content)
   ============================================================ */
function Page({ device }) {
  const mobile = device === "mobile";

  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [lead, setLead] = useState({ name: "", company: "", email: "", phone: "", projectType: "", budget: "", details: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [stickyVisible, setStickyVisible] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);
  const [mobileConsultantOpen, setMobileConsultantOpen] = useState(false);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [leadFormModalOpen, setLeadFormModalOpen] = useState(false);

  const scrollRef = useRef(null);
  const consultantRef = useRef(null);
  const leadFormRef = useRef(null);
  const portfolioRef = useRef(null);
  const servicesRef = useRef(null);
  const tabsRef = useRef(null);
  const faqRef = useRef(null);

  const refMap = { Services: servicesRef, Work: portfolioRef, About: tabsRef, Portfolio: portfolioRef, LeadForm: leadFormRef, Consultant: consultantRef, FAQ: faqRef };

  const scrollTo = (name) => {
    const ref = refMap[name];
    if (ref && ref.current) ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScroll = (e) => {
    const y = e.currentTarget.scrollTop;
    setStickyVisible(y > 420);
    if (y <= 420) setStickyDismissed(false);
  };

  const onSelectConsultant = (key, value) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => Math.min(CONSULTANT_STEPS.length + 1, s + 1));
  };
  const onBackConsultant = () => setStep((s) => Math.max(1, s - 1));
  const onResetConsultant = () => { setAnswers({}); setStep(1); };

  const onChangeLead = (name, value) => setLead((l) => ({ ...l, [name]: value }));

  const validate = () => {
    const e = {};
    if (!lead.name.trim()) e.name = "Please enter your name.";
    if (!lead.email.trim()) e.email = "Please enter your work email.";
    else if (!/^\S+@\S+\.\S+$/.test(lead.email)) e.email = "Please enter a valid email address.";
    if (!lead.phone.trim()) e.phone = "Please enter your phone number.";
    if (!lead.projectType) e.projectType = "Please select a project type.";
    return e;
  };

  // Shared: validates + sends the "New Lead" email via EmailJS and saves a
  // row to Supabase in parallel, then shows the Thank You popup once the
  // email genuinely sends (the database write is a backup record — it
  // never blocks the visitor's confirmation if it hiccups).
  const submitLead = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return false;
    setEmailError("");
    setSending(true);
    try {
      await sendLeadEmail({
        client_name: lead.name,
        company: lead.company || "—",
        phone: lead.phone,
        email: lead.email,
        project_type: lead.projectType,
        budget: lead.budget || "Not specified",
        details: lead.details || "—",
      });
      saveLeadToDatabase({
        name: lead.name,
        company: lead.company || null,
        email: lead.email,
        phone: lead.phone,
        project_type: lead.projectType,
        budget: lead.budget || null,
        details: lead.details || null,
        source: "digilogy_landing_form",
      });
      setSubmitted(true);
      setLeadFormModalOpen(false);
      setThankYouOpen(true);
      return true;
    } catch (err) {
      setEmailError(`We couldn't send your details just now. (${err.message || "unknown error"})`);
      return false;
    } finally {
      setSending(false);
    }
  };

  const onSubmitLead = (e) => {
    e.preventDefault();
    submitLead();
  };

  const onResetLead = () => {
    setLead({ name: "", company: "", email: "", phone: "", projectType: "", budget: "", details: "" });
    setErrors({});
    setSubmitted(false);
    setEmailError("");
  };

  const handleStartProjectCta = () => {
    const errs = validate();
    if (Object.keys(errs).length === 0) {
      submitLead();
    } else {
      setLeadFormModalOpen(true);
    }
  };

  // Chatbot path: sends the same "New Lead" email using the consultant's
  // own answers (type/goal/stage/budget) plus the name/phone just collected,
  // and saves the same details to Supabase.
  const onDiscuss = async () => {
    const mapped = TYPE_TO_PROJECT_OPTION[answers.type] || "";
    setLead((l) => ({ ...l, projectType: mapped || l.projectType }));
    setMobileConsultantOpen(false);
    setEmailError("");
    setSending(true);
    try {
      await sendLeadEmail({
        client_name: lead.name,
        company: lead.company || "—",
        phone: lead.phone,
        email: lead.email || "—",
        project_type: mapped || answers.type || "Not specified",
        budget: answers.budget || "Not specified",
        details: `Main goal: ${answers.goal || "—"}. Business stage: ${answers.stage || "—"}.`,
      });
      saveLeadToDatabase({
        name: lead.name,
        company: lead.company || null,
        email: lead.email || null,
        phone: lead.phone,
        project_type: mapped || answers.type || null,
        goal: answers.goal || null,
        business_stage: answers.stage || null,
        budget: answers.budget || null,
        source: "digilogy_landing_consultant",
      });
      setThankYouOpen(true);
    } catch (err) {
      setEmailError(`We couldn't send your details just now. (${err.message || "unknown error"})`);
    } finally {
      setSending(false);
    }
  };

  const showMobileFab = mobile && !mobileConsultantOpen;
  const showDesktopStickyCard = !mobile && stickyVisible && !stickyDismissed;

  return (
    <div className="relative h-full" style={{ backgroundColor: PAPER }}>
      <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto overflow-x-hidden">
        <Navbar device={device} onNav={scrollTo} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        {/* First scroll: Website Consultant + Lead Form (greeting now lives inside the form card), and What We Build */}
        <div className="relative overflow-hidden pb-32">
          <NetworkWatermark />
          <div ref={servicesRef} className="relative">
            <ConversionRow
              device={device}
              consultantRef={consultantRef}
              leadFormRef={leadFormRef}
              step={step}
              answers={answers}
              onSelect={onSelectConsultant}
              onBack={onBackConsultant}
              onReset={onResetConsultant}
              onDiscuss={onDiscuss}
              lead={lead}
              errors={errors}
              submitted={submitted}
              onChange={onChangeLead}
              onSubmit={onSubmitLead}
              onResetLead={onResetLead}
              sending={sending}
              emailError={emailError}
            />
          </div>
        </div>

        <div className="relative overflow-hidden pb-16">
          <NetworkWatermark opacity={0.12} height={80} />
          <ServicesCarousel device={device} />
        </div>

        <div className="relative overflow-hidden pb-16">
          <NetworkWatermark opacity={0.1} height={80} />
          <Portfolio device={device} refProp={portfolioRef} />
        </div>

        <div className="relative overflow-hidden pb-16">
          <NetworkWatermark opacity={0.12} height={80} />
          <BusinessGrowthTabs device={device} tabsRef={tabsRef} />
        </div>

        <div className="relative overflow-hidden pb-16">
          <NetworkWatermark opacity={0.1} height={80} />
          <FAQ device={device} refProp={faqRef} />
        </div>

        <div className="relative overflow-hidden">
          <NetworkWatermark opacity={0.1} height={70} />
          <Section device={device} alt heading="Ready to Build What's Next?" sub="Tell us about your business, goals and what you're looking to build.">
            <div className={cx("flex gap-3", mobile ? "flex-col" : "flex-row")}>
              <button onClick={handleStartProjectCta} className={cx("rounded-[4px] font-medium text-white", mobile ? "w-full py-3.5 text-[15px]" : "px-7 py-3.5 text-[15px]")} style={{ backgroundImage: GRADIENT }}>
                Start Your Website Project →
              </button>
              <button onClick={() => setLeadFormModalOpen(true)} className={cx("rounded-[4px] border font-medium", mobile ? "w-full py-3.5 text-[15px]" : "px-7 py-3.5 text-[15px]")} style={{ borderColor: LINE_STRONG, color: INK }}>
                Talk to Our Website Team
              </button>
            </div>
          </Section>
        </div>

        <Footer device={device} />
      </div>

      <WhatsAppButton device={device} />

      {(showMobileFab || showDesktopStickyCard) && (
        <StickyBar
          device={device}
          onOpenConsultant={() => (mobile ? setMobileConsultantOpen(true) : scrollTo("Consultant"))}
          onGoToForm={() => setLeadFormModalOpen(true)}
          onDismiss={() => setStickyDismissed(true)}
        />
      )}

      {mobile && mobileConsultantOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: PANEL }} role="dialog" aria-modal="true" aria-label="Website Consultant">
          <FocusTrap active={mobileConsultantOpen}>
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: LINE }}>
              <span className="text-[14px] font-medium" style={{ color: INK }}>Website Consultant</span>
              <button onClick={() => setMobileConsultantOpen(false)} aria-label="Close"><X size={20} color={INK} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <Consultant device={device} step={step} answers={answers} onSelect={onSelectConsultant} onBack={onBackConsultant} onReset={onResetConsultant} onDiscuss={onDiscuss} contact={{ name: lead.name, phone: lead.phone }} onChangeContact={onChangeLead} sending={sending} emailError={emailError} fullScreen />
            </div>
          </FocusTrap>
        </div>
      )}

      {leadFormModalOpen && (
        <LeadFormModal
          device={device}
          values={lead}
          errors={errors}
          submitted={submitted}
          onChange={onChangeLead}
          onSubmit={onSubmitLead}
          onReset={onResetLead}
          onClose={() => setLeadFormModalOpen(false)}
          sending={sending}
          emailError={emailError}
        />
      )}

      {thankYouOpen && <ThankYouModal onClose={() => setThankYouOpen(false)} />}

    </div>
  );
}

/* ============================================================
   APP — production entry point. Detects real viewport width
   (matching the `md` breakpoint used elsewhere) instead of the
   prototype's manual desktop/mobile toggle button.
   ============================================================ */
export default function App() {
  const isMobile = useIsMobile();
  return (
    <div style={{ height: "100dvh" }}>
      <Page device={isMobile ? "mobile" : "desktop"} />
    </div>
  );
}
