import { createClient } from '@sanity/client'
import { randomUUID } from 'crypto'

const client = createClient({
  projectId: 'un3ffdsw',
  dataset: 'production',
  apiVersion: '2026-05-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function i18nStr(en, fr, nl) {
  return [
    { _key: randomUUID().slice(0,8), language: 'en', _type: 'internationalizedArrayStringValue', value: en },
    { _key: randomUUID().slice(0,8), language: 'fr', _type: 'internationalizedArrayStringValue', value: fr || en },
    { _key: randomUUID().slice(0,8), language: 'nl', _type: 'internationalizedArrayStringValue', value: nl || en },
  ]
}

function i18nText(en, fr, nl) {
  return [
    { _key: randomUUID().slice(0,8), language: 'en', _type: 'internationalizedArrayTextValue', value: en },
    { _key: randomUUID().slice(0,8), language: 'fr', _type: 'internationalizedArrayTextValue', value: fr || en },
    { _key: randomUUID().slice(0,8), language: 'nl', _type: 'internationalizedArrayTextValue', value: nl || en },
  ]
}

async function restore() {
  // ── SITE SETTINGS ──
  await client.patch('siteSettings').set({
    tagline: i18nStr('A neighbourhood wine bar in Stockel, Brussels.', 'Un bar à vin de quartier à Stockel, Bruxelles.', 'Een buurtwijbar in Stokkel, Brussel.'),
    essence: i18nText('European wines, seasonal food, and the art of sharing.', 'Vins européens, cuisine de saison et l\'art du partage.', 'Europese wijnen, seizoensgebonden gerechten en de kunst van het delen.'),
    openingHours: i18nStr('Tue–Sat: 17:00–23:00 · Sun–Mon: Closed', 'Mar–Sam: 17h00–23h00 · Dim–Lun: Fermé', 'Din–Zat: 17:00–23:00 · Zon–Maa: Gesloten'),
    allergenNotice: i18nStr('Please inform staff of any allergies.', 'Veuillez informer le personnel de toute allergie.', 'Gelieve het personeel op de hoogte te brengen van eventuele allergieën.'),
  }).commit()
  console.log('✓ siteSettings')

  // ── NAVIGATION ──
  await client.patch('navigation').set({
    ctaLabel: i18nStr('Reserve', 'Réserver', 'Reserveren'),
    findUsLabel: i18nStr('Find us', 'Nous trouver', 'Vind ons'),
    touchLabel: i18nStr('Get in touch', 'Nous contacter', 'Neem contact op'),
    hoursLabel: i18nStr('Hours', 'Horaires', 'Openingsuren'),
    followLabel: i18nStr('Follow', 'Suivre', 'Volgen'),
    getDirectionsLabel: i18nStr('Get directions', 'Itinéraire', 'Routebeschrijving'),
  }).commit()
  console.log('✓ navigation')

  // Fix nav links labels too
  const nav = await client.fetch('*[_id == "navigation"][0]{links}')
  if (nav?.links) {
    const linkLabels = [
      ['Wines', 'Vins', 'Wijnen'],
      ['Menu', 'Menu', 'Menu'],
      ['Events', 'Événements', 'Evenementen'],
      ['About', 'À propos', 'Over ons'],
    ]
    const updatedLinks = nav.links.map((link, i) => ({
      ...link,
      label: linkLabels[i] ? i18nStr(...linkLabels[i]) : link.label,
    }))
    await client.patch('navigation').set({ links: updatedLinks }).commit()
  }
  console.log('✓ navigation links')

  // ── PAGE ABOUT ──
  await client.patch('page-about').set({
    title: i18nStr('About', 'À propos', 'Over ons'),
    subtitle: i18nStr('Our story, our team, our passion.', 'Notre histoire, notre équipe, notre passion.', 'Ons verhaal, ons team, onze passie.'),
  }).commit()
  console.log('✓ page-about')

  // ── TEAM ──
  const teams = [
    { id: 'tm-01', role: ['Founder & Chef', 'Fondateur & Chef', 'Oprichter & Chef'] },
    { id: 'tm-02', role: ['Sommelier', 'Sommelier', 'Sommelier'] },
    { id: 'tm-03', role: ['Front of House', 'Responsable de Salle', 'Gastheer'] },
    { id: 'tm-04', role: ['Pastry & Desserts', 'Pâtisserie & Desserts', 'Gebak & Desserten'] },
    { id: 'tm-05', role: ['Bar & Events', 'Bar & Événements', 'Bar & Evenementen'] },
  ]
  for (const tm of teams) {
    await client.patch(tm.id).set({ role: i18nStr(...tm.role) }).commit()
  }
  console.log('✓ teamMembers')

  // ── EVENTS ──
  const events = [
    { id: 'ev-01', title: ['Summer Wine Dinner', 'Dîner de Vin d\'Été', 'Zomer Wijndiner'], subtitle: ['A five-course pairing', 'Un accord en cinq plats', 'Een vijfgangendiner'], description: ['Join us for an evening of exceptional wines paired with seasonal dishes.', 'Rejoignez-nous pour une soirée de vins exceptionnels accompagnés de plats de saison.', 'Geniet van een avond met uitzonderlijke wijnen en seizoensgebonden gerechten.'], ctaLabel: ['Reserve your seat', 'Réserver votre place', 'Reserveer uw plaats'] },
    { id: 'ev-02', title: ['Natural Wine Tasting', 'Dégustation Vins Naturels', 'Natuurwijn Proeverij'], tag: ['Monthly', 'Mensuel', 'Maandelijks'], description: ['Discover our curated selection of natural wines from across Europe.', 'Découvrez notre sélection de vins naturels de toute l\'Europe.', 'Ontdek onze selectie natuurwijnen uit heel Europa.'] },
    { id: 'ev-03', title: ['Cheese & Wine Evening', 'Soirée Fromage & Vin', 'Kaas & Wijn Avond'], tag: ['Bi-weekly', 'Bimensuel', 'Tweewekelijks'], description: ['An exploration of artisan cheeses with perfectly paired wines.', 'Une exploration de fromages artisanaux avec des vins parfaitement accordés.', 'Een verkenning van ambachtelijke kazen met perfect bijpassende wijnen.'] },
    { id: 'ev-04', title: ['Live Jazz & Wine', 'Jazz Live & Vin', 'Live Jazz & Wijn'], tag: ['Weekly', 'Hebdomadaire', 'Wekelijks'], description: ['Unwind with live jazz performances and a glass of your favourite wine.', 'Détendez-vous avec des concerts de jazz live et un verre de votre vin préféré.', 'Ontspan met live jazzmuziek en een glas van uw favoriete wijn.'] },
    { id: 'ev-05', title: ['Winemaker\'s Table', 'Table du Vigneron', 'Wijnmakerstafel'], tag: ['Quarterly', 'Trimestriel', 'Driemaandelijks'], description: ['Meet the winemaker and taste directly from the source.', 'Rencontrez le vigneron et dégustez directement à la source.', 'Ontmoet de wijnmaker en proef rechtstreeks van de bron.'], ctaLabel: ['Learn more', 'En savoir plus', 'Meer informatie'] },
    { id: 'ev-06', title: ['Harvest Celebration', 'Fête des Vendanges', 'Oogstfeest'], tag: ['Annual', 'Annuel', 'Jaarlijks'], description: ['Celebrate the harvest season with special wines and festive dishes.', 'Célébrez la saison des vendanges avec des vins spéciaux et des plats festifs.', 'Vier het oogstseizoen met speciale wijnen en feestelijke gerechten.'], ctaLabel: ['Join us', 'Rejoignez-nous', 'Doe mee'] },
  ]
  for (const ev of events) {
    const patch = { title: i18nStr(...ev.title), description: i18nText(...ev.description) }
    if (ev.subtitle) patch.subtitle = i18nStr(...ev.subtitle)
    if (ev.tag) patch.tag = i18nStr(...ev.tag)
    if (ev.ctaLabel) patch.ctaLabel = i18nStr(...ev.ctaLabel)
    await client.patch(ev.id).set(patch).commit()
  }
  console.log('✓ events')

  // ── MENU CATEGORIES ──
  const categories = [
    { id: 'mc-01', title: ['Small Plates', 'Petites Assiettes', 'Kleine Gerechten'] },
    { id: 'mc-02', title: ['Charcuterie & Cheese', 'Charcuterie & Fromage', 'Vleeswaren & Kaas'] },
    { id: 'mc-03', title: ['Main Courses', 'Plats Principaux', 'Hoofdgerechten'] },
    { id: 'mc-04', title: ['Desserts', 'Desserts', 'Desserten'] },
    { id: 'mc-05', title: ['Sides', 'Accompagnements', 'Bijgerechten'] },
  ]
  for (const cat of categories) {
    await client.patch(cat.id).set({ title: i18nStr(...cat.title) }).commit()
  }
  console.log('✓ menuCategories')

  // ── MENU ITEMS ──
  const menuItems = [
    { id: 'mi-01', name: ['Marinated Olives', 'Olives Marinées', 'Gemarineerde Olijven'], description: ['Warm mixed olives with herbs and citrus.', 'Olives mixtes tièdes aux herbes et agrumes.', 'Warme gemengde olijven met kruiden en citrus.'] },
    { id: 'mi-02', name: ['Burrata', 'Burrata', 'Burrata'], description: ['With heirloom tomatoes, basil oil, and aged balsamic.', 'Avec tomates anciennes, huile de basilic et balsamique vieilli.', 'Met erfgoedtomaten, basilicumolie en gerijpte balsamico.'] },
    { id: 'mi-03', name: ['Beef Tartare', 'Tartare de Boeuf', 'Biefstuk Tartaar'], description: ['Hand-cut beef with capers, shallots, and quail egg.', 'Boeuf coupé au couteau avec câpres, échalotes et oeuf de caille.', 'Handgesneden rundvlees met kappertjes, sjalotten en kwartelei.'] },
    { id: 'mi-04', name: ['Croquettes aux Crevettes', 'Croquettes aux Crevettes', 'Garnaalkroketten'], description: ['Classic Belgian shrimp croquettes with lemon.', 'Croquettes de crevettes belges classiques au citron.', 'Klassieke Belgische garnaalkroketten met citroen.'] },
    { id: 'mi-05', name: ['Selection Board', 'Planche de Sélection', 'Selectieplank'], description: ['Artisan cured meats and aged cheeses.', 'Charcuteries artisanales et fromages affinés.', 'Ambachtelijke vleeswaren en gerijpte kazen.'] },
    { id: 'mi-06', name: ['Comté 24 months', 'Comté 24 mois', 'Comté 24 maanden'], description: ['Aged comté with fig compote.', 'Comté affiné avec compote de figues.', 'Gerijpte comté met vijgencompote.'] },
    { id: 'mi-07', name: ['Steak Frites', 'Steak Frites', 'Steak Friet'], description: ['Bavette steak with hand-cut fries and béarnaise.', 'Bavette avec frites maison et béarnaise.', 'Bavette steak met huisgesneden friet en béarnaise.'] },
    { id: 'mi-08', name: ['Sea Bass', 'Bar', 'Zeebaars'], description: ['Pan-seared with fennel, olive tapenade, and lemon butter.', 'Poêlé avec fenouil, tapenade d\'olives et beurre citronné.', 'Gebakken met venkel, olijventapenade en citroenboter.'] },
    { id: 'mi-09', name: ['Wild Mushroom Risotto', 'Risotto aux Champignons Sauvages', 'Wilde Paddenstoelen Risotto'], description: ['Arborio rice with seasonal mushrooms and parmesan.', 'Riz arborio aux champignons de saison et parmesan.', 'Arborio rijst met seizoenspaddenstoelen en parmezaan.'] },
    { id: 'mi-10', name: ['Tarte Tatin', 'Tarte Tatin', 'Tarte Tatin'], description: ['Caramelised apple tart with crème fraîche.', 'Tarte aux pommes caramélisées avec crème fraîche.', 'Gekarameliseerde appeltaart met crème fraîche.'] },
    { id: 'mi-11', name: ['Chocolate Fondant', 'Fondant au Chocolat', 'Chocolade Fondant'], description: ['Dark chocolate with a molten centre and vanilla ice cream.', 'Chocolat noir au coeur coulant et glace vanille.', 'Pure chocolade met een vloeibaar hart en vanille-ijs.'] },
    { id: 'mi-12', name: ['Cheese Selection', 'Sélection de Fromages', 'Kaasselectie'], description: ['Three artisan cheeses with honeycomb and walnuts.', 'Trois fromages artisanaux avec rayon de miel et noix.', 'Drie ambachtelijke kazen met honingraat en walnoten.'] },
    { id: 'mi-13', name: ['Seasonal Greens', 'Légumes de Saison', 'Seizoensgroenten'] },
    { id: 'mi-14', name: ['Truffle Fries', 'Frites à la Truffe', 'Truffelfriet'], description: ['Hand-cut fries with truffle oil and parmesan.', 'Frites maison à l\'huile de truffe et parmesan.', 'Huisgesneden friet met truffelolie en parmezaan.'] },
  ]
  for (const mi of menuItems) {
    const patch = { name: i18nStr(...mi.name) }
    if (mi.description) patch.description = i18nStr(...mi.description)
    await client.patch(mi.id).set(patch).commit()
  }
  console.log('✓ menuItems')

  // ── WINES ──
  const wines = [
    { id: 'wine-01', note: ['Crisp Muscadet with oceanic minerality and citrus lift.', 'Muscadet frais avec minéralité océanique et notes d\'agrumes.'] },
    { id: 'wine-02', note: ['Elegant Chablis with flinty minerality and green apple.', 'Chablis élégant avec minéralité silex et pomme verte.'] },
    { id: 'wine-03', note: ['Aromatic Riesling with stone fruit and petrol notes.', 'Riesling aromatique avec fruits à noyau et notes pétrolées.'] },
    { id: 'wine-04', note: ['Silky Pinot Noir with red berry and earthy undertones.'] },
    { id: 'wine-05', note: ['Structured Côtes du Rhône with dark fruit and spice.'] },
    { id: 'wine-06', note: ['Bright Barbera with cherry and vibrant acidity.'] },
    { id: 'wine-07', note: ['Refreshing Txakoli with green apple and sea spray.'] },
    { id: 'wine-08', note: ['Mineral Grüner Veltliner with white pepper and citrus.'] },
    { id: 'wine-09', note: ['Complex Chianti Classico with dried herbs and cherry.'] },
    { id: 'wine-10', note: ['Crisp Albariño with peach, apricot, and saline finish.'] },
    { id: 'wine-11', note: ['Rich Châteauneuf-du-Pape with blackberry and garrigue.'] },
    { id: 'wine-12', note: ['Delicate Prosecco with green apple and white flowers.'] },
  ]
  for (const w of wines) {
    await client.patch(w.id).set({
      tastingNote: i18nText(w.note[0], w.note[1] || w.note[0], w.note[2] || w.note[0]),
    }).commit()
  }
  console.log('✓ wines')

  console.log('\n✅ All data restored in v5 format!')
}

restore().catch(console.error)
