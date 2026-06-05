export const SCHEMA_CONFIG = {
  singletons: [
    { type: 'homePage', title: 'Home Page', icon: '🏠' },
    { type: 'siteSettings', title: 'Site Settings', icon: '⚙️' },
    { type: 'navigation', title: 'Navigation', icon: '🧭' },
  ],
  collections: [
    { type: 'wine', title: 'Wines', icon: '🍷', titleField: 'name', previewFields: ['producer', 'vintage'] },
    { type: 'menuCategory', title: 'Menu Categories', icon: '📋', titleField: 'title' },
    { type: 'menuItem', title: 'Menu Items', icon: '🍽️', titleField: 'name', previewFields: ['price'] },
    { type: 'event', title: 'Events', icon: '📅', titleField: 'title', previewFields: ['eventType', 'date'] },
    { type: 'teamMember', title: 'Team', icon: '👥', titleField: 'name', previewFields: ['role'] },
    { type: 'page', title: 'Pages', icon: '📄', titleField: 'internalTitle' },
  ],
  // Field definitions per document type — with descriptions showing where they appear on the site
  fields: {
    homePage: [
      // ── Hero Section ──
      { name: '_section_hero', title: '── Hero Section ──', type: 'section' },
      { name: 'heroTitle', title: 'Hero Title', type: 'string', description: 'Large title displayed over the hero image (e.g. "Bouteille")' },
      // NOTE: tagline appears in the hero but is stored in Site Settings
      { name: '_info_tagline', title: 'Hero Tagline', type: 'info', description: '→ The hero tagline is editable under Site Settings → Tagline' },

      // ── Essence / Marquee ──
      { name: '_section_essence', title: '── Essence & Marquee ──', type: 'section' },
      { name: '_info_essence', title: 'Essence Text', type: 'info', description: '→ The essence text below the hero is editable under Site Settings → Essence' },
      { name: '_info_marquee', title: 'Scrolling Marquee', type: 'info', description: '→ The scrolling marquee text is editable under Site Settings → Marquee Items' },

      // ── Wine Showcase Section ──
      { name: '_section_wines', title: '── Wine Showcase Section ──', type: 'section' },
      { name: 'winesSectionLabel', title: 'Section Label', type: 'i18nString', description: 'Small label above the wine section (e.g. "The Wines")' },
      { name: 'winesSectionTitle', title: 'Section Title', type: 'i18nString', description: 'Large heading in the wine showcase (e.g. "Selection")' },
      { name: 'winesCtaLabel', title: 'CTA Button Text', type: 'i18nString', description: 'Button text linking to the full wines page (e.g. "Discover the selection")' },
    ],
    siteSettings: [
      // ── Brand Identity ──
      { name: '_section_brand', title: '── Brand Identity ──', type: 'section' },
      { name: 'brandName', title: 'Brand Name', type: 'string', description: 'Used in the Nav & Footer logo alt text' },
      { name: 'tagline', title: 'Tagline', type: 'i18nString', description: 'Appears on: Home page hero subtitle, Footer tagline' },
      { name: 'essence', title: 'Essence', type: 'i18nString', description: 'Appears on: Home page — large text section below the hero' },
      { name: 'copyright', title: 'Copyright', type: 'string', description: 'Appears in the site Footer (e.g. "© 2026 Bouteille")' },

      // ── Contact Details ──
      { name: '_section_contact', title: '── Contact Details ──', type: 'section' },
      { name: 'email', title: 'Email', type: 'string', description: 'Appears on: Home location section, Contact page, Reservations page, Footer' },
      { name: 'openingHours', title: 'Opening Hours', type: 'i18nString', description: 'Appears on: Home location section, Contact page, Reservations page' },

      // ── Social Media ──
      { name: '_section_social', title: '── Social Media ──', type: 'section' },
      { name: 'instagramHandle', title: 'Instagram Handle', type: 'string', description: 'Display name shown on the site (e.g. "@bouteille.bar")' },
      { name: 'instagramUrl', title: 'Instagram URL', type: 'string', description: 'Full URL to Instagram profile — used in Home social CTA, Contact page, Footer' },

      // ── Map & Location ──
      { name: '_section_location', title: '── Map & Location ──', type: 'section' },
      { name: 'googleMapsUrl', title: 'Google Maps URL', type: 'string', description: '"Get Directions" link on the Home page & Contact page' },
      { name: 'googleMapsEmbedUrl', title: 'Google Maps Embed URL', type: 'string', description: 'Embedded map iframe on the Home page & Contact page' },

      // ── Menu Page ──
      { name: '_section_menu', title: '── Menu Page ──', type: 'section' },
      { name: 'allergenNotice', title: 'Allergen Notice', type: 'i18nText', description: 'Appears at the bottom of the Menu page' },
    ],
    navigation: [
      // ── CTA Button ──
      { name: '_section_cta', title: '── CTA Button ──', type: 'section' },
      { name: 'ctaLabel', title: 'CTA Button Label', type: 'i18nString', description: 'Primary call-to-action button text in the Nav & Footer (e.g. "Reserve")' },
      { name: 'ctaHref', title: 'CTA Button Link', type: 'string', description: 'URL the CTA button links to (e.g. "/reservations")' },

      // ── Section Labels (used across multiple pages) ──
      { name: '_section_labels', title: '── Section Labels ──', type: 'section' },
      { name: 'followLabel', title: 'Follow Label', type: 'i18nString', description: 'Social section heading (e.g. "Follow along") — Home, Contact, Footer' },
      { name: 'findUsLabel', title: 'Find Us Label', type: 'i18nString', description: 'Location section heading (e.g. "Find us") — Home, Contact, Reservations' },
      { name: 'touchLabel', title: 'Get in Touch Label', type: 'i18nString', description: 'Contact section heading (e.g. "Get in touch") — Home, Contact, Reservations' },
      { name: 'hoursLabel', title: 'Hours Label', type: 'i18nString', description: 'Hours section heading (e.g. "Hours") — Home, Contact, Reservations' },
      { name: 'getDirectionsLabel', title: 'Get Directions Label', type: 'i18nString', description: 'Directions link text (e.g. "Get directions") — Home page location section' },
    ],
    wine: [
      // ── Basic Info ──
      { name: 'name', title: 'Name', type: 'string', description: 'Wine name — shown on the Wines page grid & Home page showcase' },
      { name: 'vintage', title: 'Vintage', type: 'string', description: 'Year (e.g. "2023")' },
      { name: 'producer', title: 'Producer', type: 'string', description: 'Producer/domaine name' },

      // ── Origin ──
      { name: 'region', title: 'Region', type: 'string', description: 'e.g. "Loire", "Burgundy"' },
      { name: 'country', title: 'Country', type: 'string', description: 'Country code (e.g. "FR", "IT", "ES")' },

      // ── Details ──
      { name: 'type', title: 'Type', type: 'select', options: ['red', 'white', 'rosé', 'orange', 'sparkling'], description: 'Used for filtering on the Wines page' },
      { name: 'price', title: 'Price (€)', type: 'number', description: 'Price per glass — shown on Wine grid & Home showcase' },
      { name: 'tastingNote', title: 'Tasting Note', type: 'i18nText', description: 'Tasting description — shown on the Wines page grid' },

      // ── Display Options ──
      { name: 'featured', title: 'Featured', type: 'boolean', description: 'Featured wines can be selected for the Home page showcase' },
      { name: 'order', title: 'Sort Order', type: 'number', description: 'Controls display order (lower = first)' },
    ],
    menuCategory: [
      { name: 'title', title: 'Category Title', type: 'i18nString', description: 'Section heading on the Menu page (e.g. "Charcuterie & Cheese", "Small Plates")' },
      { name: 'order', title: 'Sort Order', type: 'number', description: 'Controls display order on the Menu page (lower = first)' },
    ],
    menuItem: [
      { name: 'name', title: 'Item Name', type: 'i18nString', description: 'Dish name on the Menu page' },
      { name: 'description', title: 'Description', type: 'i18nText', description: 'Short description shown below the item name' },
      { name: 'price', title: 'Price (€)', type: 'number', description: 'Price shown on the Menu page' },
      { name: 'featured', title: 'Featured', type: 'boolean', description: 'Featured items get special styling on the Menu page' },
    ],
    event: [
      { name: 'eventType', title: 'Event Type', type: 'select', options: ['featured', 'recurring', 'upcoming'], description: '"featured" = large hero card on Events page, "recurring" = weekly events section, "upcoming" = upcoming section' },
      { name: 'title', title: 'Title', type: 'i18nString', description: 'Event title — shown on Events page & Home page (if featured)' },
      { name: 'subtitle', title: 'Subtitle', type: 'i18nString', description: 'Secondary text below the title' },
      { name: 'tag', title: 'Tag', type: 'i18nString', description: 'Small tag/badge above the event card (e.g. "Every Thursday")' },
      { name: 'description', title: 'Description', type: 'i18nText', description: 'Full event description' },
      { name: 'date', title: 'Date', type: 'string', description: 'Event date (for upcoming/featured events)' },
      { name: 'time', title: 'Time', type: 'string', description: 'Event time (e.g. "19:00–22:00")' },
      { name: 'ctaLabel', title: 'CTA Button Text', type: 'i18nString', description: 'Button text (e.g. "RSVP", "Book now")' },
      { name: 'recurringDay', title: 'Recurring Day', type: 'string', description: 'Day of week for recurring events (e.g. "Thursday")' },
    ],
    teamMember: [
      { name: 'name', title: 'Name', type: 'string', description: 'Team member name — shown on the About page' },
      { name: 'role', title: 'Role', type: 'i18nString', description: 'Job title/role — shown below the name on the About page' },
      { name: 'order', title: 'Sort Order', type: 'number', description: 'Controls display order on the About page (lower = first)' },
    ],
    page: [
      { name: 'internalTitle', title: 'Internal Title', type: 'string', description: 'Admin-only label — not shown on the site' },
      { name: 'title', title: 'Page Title', type: 'i18nString', description: 'Main heading (h1) on the page' },
      { name: 'subtitle', title: 'Page Subtitle', type: 'i18nText', description: 'Introductory text below the page title' },
    ],
  } as Record<string, Array<{ name: string; title: string; type: string; description?: string; options?: string[] }>>,
  languages: [
    { id: 'en', title: 'English' },
    { id: 'fr', title: 'French' },
    { id: 'nl', title: 'Dutch' },
  ],
} as const;
