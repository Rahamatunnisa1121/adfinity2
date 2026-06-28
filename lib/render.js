function resolveSiteUrl() {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

const SITE = {
  title: 'Graphic Design Services in Vijayawada | Logo Design & Branding | Adfinity',
  description:
    'Adfinity Graphic Design & Print Media offers professional logo design, branding, website design, brochure design, packaging design, and print media services in Vijayawada and across Andhra Pradesh.',
  keywords:
    'graphic design services in Vijayawada, logo design Vijayawada, branding services Andhra Pradesh, website design Vijayawada, brochure design, packaging design, print media solutions, graphic designer near me, creative design agency Andhra Pradesh',
  url: resolveSiteUrl(),
  phone: '+91 88864 64646',
  phoneDisplay: '8886464646',
  phoneTel: '+918886464646',
  whatsapp: '918886464646',
  email: 'adfinity.vja@gmail.com',
  contactName: 'Adfinity Team',
  brand: 'Adfinity Designs',
  copyright: '2026 Adfinity Designs, Vijayawada. All rights reserved.',
  instagram: 'https://www.instagram.com/weadfinity/',
  googleMaps:
    'https://www.google.com/maps/dir//%27%27/data=!4m8!4m7!1m0!1m5!1m1!1s0x3a35efffb7cc92d7:0x22e4fc3753e5d5a4!2m2!1d80.6279084!2d16.513962',
  googleBusiness:
    'https://business.google.com/v/adfinity-designing-print-media/011003451350217721070/6915/_?',
  mapsEmbed:
    'https://maps.google.com/maps?q=16.513962,80.6279084&hl=en&z=17&output=embed',
  address:
    '2nd Floor, 28-5-1/3, Kuppa St, beside Vishalandhra Book Stall, Near Besant Road, Opposite Raj Towers, Arundalpet, Governor Peta, Vijayawada, Andhra Pradesh 520002',
  hours: 'Mon – Sat, 10:00 AM – 7:00 PM IST',
  officeImage: '/resources/images/contact/studio.png',
  logoImage: '/resources/images/logo.png',
  seo: {
    about: {
      title: 'About Us | Adfinity Graphic Design & Branding | Vijayawada',
      description:
        'Adfinity Graphic Design & Print Media is a creative design studio in Vijayawada. Logo design, branding, print media, website design and marketing creatives across Andhra Pradesh.',
      keywords:
        'graphic designer Vijayawada, branding services Andhra Pradesh, logo design Vijayawada, creative design company, print media services, website design Andhra Pradesh',
    },
    contact: {
      title: 'Contact Us | Graphic Design & Branding | Adfinity Vijayawada',
      description:
        'Ready to grow your brand? Contact Adfinity Graphic Design & Print Media for creative design, branding, website design, and print media solutions across Vijayawada and Andhra Pradesh.',
      keywords:
        'contact graphic designer Vijayawada, branding services Andhra Pradesh, logo design Vijayawada, website design company, print media services',
    },
    portfolio: {
      keywords:
        'graphic design portfolio Vijayawada, logo design portfolio, branding projects Andhra Pradesh, website design portfolio, packaging design samples, creative design showcase',
    },
    services: {
      keywords:
        'graphic design services, logo design Vijayawada, website design, packaging design, brochure design, branding services',
    },
  },
};

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderCategoryLinks(categories, activeCategory = null) {
  return categories
    .map((cat) => {
      const active = cat.id === activeCategory ? ' active ' : ' ';
      return `<a class="dropdown-item${active}" href="/${cat.id}">${esc(cat.navLabel)}</a>`;
    })
    .join(' ');
}

function renderMedia(item) {
  const title = esc(item.title);
  const poster = esc(item.videoPoster || item.thumbnail);

  if (item.video) {
    return `<img title="${title}" alt="${title}" src="${poster}"> <video poster="${poster}" autoplay playsinline muted loop preload="auto"><source src="${esc(item.video)}" type="video/mp4">Your browser does not support the video tag.</video>`;
  }

  return `<img title="${title}" alt="${title}" src="${esc(item.thumbnail)}">`;
}

function renderGridItem(item, stats = { views: 0, likes: 0 }) {
  const href = `/${item.category}/${item.slug}`;
  return `<div class="items"><a href="${href}">  ${renderMedia(item)} <div class="hover"><div class="row"><div class="col">${esc(item.title)}</div><div class="col-auto d-flex align-content-end flex-wrap"><ul class=""><li class="thumb-views">${stats.views}</li><li class="thumb-app">${stats.likes}</li></ul></div></div></div></a></div>`;
}

function renderGridItems(items, getStats) {
  return items.map((item) => renderGridItem(item, getStats(`/${item.category}/${item.slug}`))).join('');
}

function renderGalleryAsset(asset, title) {
  const label = esc(title);

  if (typeof asset === 'string') {
    return `<img class="adf-detail-media" title="${label}" alt="${label}" src="${esc(asset)}">`;
  }

  if (asset.type === 'video') {
    const poster = esc(asset.poster || '');
    return `<video class="adf-detail-media" poster="${poster}" controls playsinline preload="metadata"><source src="${esc(asset.src)}" type="${esc(asset.mime || 'video/mp4')}">Your browser does not support the video tag.</video>`;
  }

  return `<img class="adf-detail-media" title="${label}" alt="${label}" src="${esc(asset.src || asset)}">`;
}

function renderGallery(item) {
  return item.gallery.map((asset) => renderGalleryAsset(asset, item.title)).join('    ');
}

function renderHeader(options = {}) {
  const {
    categories,
    activeCategory = null,
    activeHome = false,
    activeContact = false,
    activeAbout = false,
    searchTags = [],
    detailStats = null,
    shareUrl = SITE.url,
    itemCount = null,
    contactPage = false,
    aboutPage = false,
  } = options;

  const homeActive = activeHome ? ' active ' : ' ';
  const contactActive = activeContact ? ' active ' : ' ';
  const aboutActive = activeAbout ? ' active ' : ' ';
  const categoryLinks = renderCategoryLinks(categories, activeCategory);
  const searchTagLinks = searchTags
    .map((tag) => `<li class=nav-item><a class=nav-link href="/search?q=${encodeURIComponent(tag)}">${esc(tag)}</a></li>`)
    .join('');

  const shareNav = `<li class=nav-item><a class="nav-link nav-share-txt" href=# onclick=return!1>Share this page</a></li><li class="nav-item nav-share-wrp dropdown"><a class="nav-link nav-share dropdown-toggle" href=# id=shareLink data-toggle=dropdown aria-haspopup=true aria-expanded=false></a><div class=dropdown-menu aria-labelledby=shareLink><a class=dropdown-item href="https://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}" target=_blank><img src=/resources/images/facebook-icon.png></a><a class=dropdown-item href="mailto:?subject=${encodeURIComponent(SITE.brand)}&body=${encodeURIComponent(shareUrl)}" target=_blank><img src=/resources/images/mail-icon.png></a><a class="dropdown-item mob-wh" href="whatsapp://send?text=${encodeURIComponent(shareUrl)}" target=_blank><img src=/resources/images/whatsapp-icon.png></a><a class="dropdown-item web-wh" href="https://web.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}" target=_blank><img src=/resources/images/whatsapp-icon.png></a></div></li>`;

  const rightNav = contactPage || aboutPage
    ? shareNav
    : detailStats
    ? `<li class=nav-item><a class="nav-link nav-view" href=# onclick=return!1><img src=/resources/images/Enlarge-Eye-icon.png>${detailStats.views}</a></li><li class=nav-item><a id=nav-like class="nav-link nav-like" href=#><img src=/resources/images/1x1.png>${detailStats.likes}</a></li> <li class=nav-item><a class="nav-link nav-share-txt" href=# onclick=return!1>Share this page</a></li><li class="nav-item nav-share-wrp dropdown"><a class="nav-link nav-share dropdown-toggle" href=# id=shareLink data-toggle=dropdown aria-haspopup=true aria-expanded=false></a><div class=dropdown-menu aria-labelledby=shareLink><a class=dropdown-item href="https://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}" target=_blank><img src=/resources/images/facebook-icon.png></a><a class=dropdown-item href="mailto:?subject=${encodeURIComponent(SITE.brand)}&body=${encodeURIComponent(shareUrl)}" target=_blank><img src=/resources/images/mail-icon.png></a><a class="dropdown-item mob-wh" href="whatsapp://send?text=${encodeURIComponent(shareUrl)}" target=_blank><img src=/resources/images/whatsapp-icon.png></a><a class="dropdown-item web-wh" href="https://web.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}" target=_blank><img src=/resources/images/whatsapp-icon.png></a></div></li>`
    : `<li class=nav-item><a class="nav-link nav-count" href=# onclick=return!1>Showing ${itemCount} items</a></li><li class=nav-item><a class="nav-link nav-share-txt" href=# onclick=return!1>Share this page</a></li><li class=nav-item nav-share-wrp dropdown><a class="nav-link nav-share dropdown-toggle" href=# id=shareLink data-toggle=dropdown aria-haspopup=true aria-expanded=false></a><div class=dropdown-menu aria-labelledby=shareLink><a class=dropdown-item href="https://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}" target=_blank><img src=/resources/images/facebook-icon.png></a><a class=dropdown-item href="mailto:?subject=${encodeURIComponent(SITE.brand)}&body=${encodeURIComponent(shareUrl)}" target=_blank><img src=/resources/images/mail-icon.png></a><a class="dropdown-item mob-wh" href="whatsapp://send?text=${encodeURIComponent(shareUrl)}" target=_blank><img src=/resources/images/whatsapp-icon.png></a><a class="dropdown-item web-wh" href="https://web.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}" target=_blank><img src=/resources/images/whatsapp-icon.png></a></div></li>`;

  const brandLogo = `<a class="navbar-brand movedown" href=/ ><img class=logo-text alt="${esc(SITE.brand)}" title="${esc(SITE.brand)}" src=/resources/images/logo.png></a>`;

  return `<header><div id=header> <div id=hd-top><nav class="navbar navbar-expand-lg navbar-light">${brandLogo}<div class=nav-search><form action=/search id=search-form1 class=navbar-form role=search><div class="form-group mb0"><div class=input-group><div id=search-prod class="input-group-append clicked"><img src=/resources/images/search-icon.png></div><input autocomplete=off type=text class="nav-search-input form-control" placeholder="Search product" name=q id=search_term1></div></div></form></div><ul class="navbar-nav ml-auto"><li class="nav-item nav-item-home"><a class="nav-link nav-home${homeActive}" href=/ ><img src=/resources/images/1x1.png></a></li><li class="nav-item"><a class="nav-link nav-about${aboutActive}" href=/about><span>About</span></a></li><li class="nav-item dropdown nav-item-search"><a class="nav-search-icon nav-link dropdown-toggle" href=# id=navbarDropdownSearchLink data-toggle=dropdown aria-haspopup=true aria-expanded=false><img src=/resources/images/1x1.png></a><div class=dropdown-menu aria-labelledby=navbarDropdownSearchLink><div class=nav-search-form><form action=/search id=search-form2 class=navbar-form role=search><div class="form-group mb0"><div class=input-group><input autocomplete=off type=text class="nav-search-input form-control" placeholder="Search product" name=q id=search_term2><div id=search-prod2 class="input-group-append clicked"><img src=/resources/images/search-icon.png></div></div></div></form></div></div></li><li class="nav-item nav-item-wh"><a class=nav-link href="https://wa.me/${SITE.whatsapp}?text=Hi,+interested+to+work+with+you.+Please+send+me+your+general+tariff+and+working+terms." target=_blank><img src=/resources/images/1x1.png></a></li><li class="nav-item"><a class="nav-link nav-follow" href="${esc(SITE.instagram)}" target=_blank rel=noopener noreferrer><span>Follow us</span></a></li><li class="nav-item"><a class="nav-link nav-contact${contactActive}" href=/contact><span>Contact us</span></a></li><li class="nav-item nav-item-dp dropdown"><a class="nav-link nav-link-category dropdown-toggle" href=# id=categoryLink data-toggle=dropdown aria-haspopup=true aria-expanded=false></a><div class=dropdown-menu aria-labelledby=categoryLink> ${categoryLinks} </div><div class=dropdown-uparrow><img src=/resources/images/catagory-uparrow.png></div></li></ul></nav></div><div id=hd-bot><nav class="navbar navbar-expand-lg navbar-light"><button class=navbar-toggler type=button data-toggle=collapse data-target=#navbar_top aria-controls=navbar_top aria-expanded=false aria-label="Toggle navigation"><span class=navbar-toggler-icon></span></button><div class="collapse navbar-collapse mr-auto" id=navbar_top><ul class=navbar-nav><li class="nav-item dropdown"><a class="nav-link nav-category dropdown-toggle" href=# id=categoryLink data-toggle=dropdown aria-haspopup=true aria-expanded=false>Choose Category</a><div class=dropdown-menu aria-labelledby=categoryLink> ${categoryLinks} <div class=dropdown-uparrow><img src=/resources/images/catagory-uparrow.png></div></div></li>   ${searchTagLinks} </ul></div><ul class="navbar-nav nav-right">${rightNav}</ul></nav></div></div></header>`;
}

function renderFooter() {
  const waFooter = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hi, interested to work with you. Please send me your general tariff and working terms.')}`;
  return `<footer><div id=footer><ul class="socials adf-footer-socials"><li class="adf-ft-insta"><a href="${esc(SITE.instagram)}" target=_blank rel=noopener noreferrer aria-label="Instagram"><span class="adf-ft-icon"></span></a></li><li class="adf-ft-maps"><a href="${esc(SITE.googleMaps)}" target=_blank rel=noopener noreferrer aria-label="Google Maps"><span class="adf-ft-icon"></span></a></li><li class="adf-ft-wh"><a href="${waFooter}" target=_blank rel=noopener noreferrer aria-label="WhatsApp"><span class="adf-ft-icon"></span></a></li><li class="adf-ft-gbiz"><a href="${esc(SITE.googleBusiness)}" target=_blank rel=noopener noreferrer aria-label="Google Business"><span class="adf-ft-icon"></span></a></li></ul><p>Copyright &copy; ${esc(SITE.copyright)}</p><p>Website by <a href="${esc(SITE.instagram)}" target=_blank>Adfinity Designs</a></p></div></footer>`;
}

function renderFloatingSocial() {
  const waText = encodeURIComponent(
    'Hi, interested to work with you. Please send me your general tariff and working terms.',
  );
  return `<aside class="adf-quick-links" aria-label="Quick contact"><a class="adf-quick-btn adf-quick-call" href="tel:${SITE.phoneTel}" data-tip="Call us" aria-label="Call us"><span class="adf-quick-icon"></span></a><a class="adf-quick-btn adf-quick-email" href="mailto:${esc(SITE.email)}" data-tip="Email us" aria-label="Email us"><span class="adf-quick-icon"></span></a><a class="adf-quick-btn adf-quick-maps" href="${esc(SITE.googleMaps)}" target=_blank rel=noopener noreferrer data-tip="Get directions" aria-label="Get directions"><span class="adf-quick-icon"></span></a><a class="adf-quick-btn adf-quick-insta" href="${esc(SITE.instagram)}" target=_blank rel=noopener noreferrer data-tip="Instagram" aria-label="Instagram"><span class="adf-quick-icon"></span></a><a class="adf-quick-btn adf-quick-wa" href="https://wa.me/${SITE.whatsapp}?text=${waText}" target=_blank rel=noopener noreferrer data-tip="WhatsApp" aria-label="WhatsApp"><img src="/resources/images/whatsapp-icon.png" alt="" class="adf-quick-wa-img"></a></aside>`;
}

function renderPageHead(pageTitle, description, shareImage, canonicalPath = '/', extraCss = '', keywords = null) {
  const title = pageTitle || SITE.title;
  const desc = description || SITE.description;
  const kw = keywords || SITE.keywords;
  const image = shareImage || `${SITE.url}/resources/images/logo.png`;
  const canonical = `${SITE.url}${canonicalPath}`;
  const fontLinks =
    '<link rel=preconnect href=https://fonts.googleapis.com><link rel=preconnect href=https://fonts.gstatic.com crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel=stylesheet>';

  return `<!DOCTYPE html><html lang=en><head><meta charset=utf-8><meta http-equiv=X-UA-Compatible content="IE=edge"><meta name=viewport content="width=device-width,initial-scale=1"><meta name=author content="${esc(SITE.brand)}"><link rel=canonical href="${esc(canonical)}"><title>${esc(title)}</title><meta name=description content="${esc(desc)}"><meta name=keywords content="${esc(kw)}"><meta property=og:url content="${esc(canonical)}"><meta property=og:type content=website><meta property=og:title content="${esc(title)}"><meta property=og:description content="${esc(desc)}"><meta property=og:image content="${esc(image)}"><meta property=og:image:width content=1200><meta property=og:image:height content=630><link rel="shortcut icon" href=/resources/images/favicon.png><link rel=apple-touch-icon href=/resources/images/apple-touch-icon.png>${fontLinks}<link href="/resources/css/main-1234581.css" rel=stylesheet type=text/css><link href="/resources/css/adfinity.css" rel=stylesheet type=text/css>${extraCss}</head>`;
}

function renderTail(extraJs = '') {
  return `<script type=text/javascript src="/resources/js/main-1234570.js"></script>${extraJs}</html>`;
}

function renderListingPage(options) {
  const {
    categories,
    activeCategory = null,
    total,
    page = 0,
    activeHome = false,
    shareUrl = SITE.url,
    searchTags = [],
  } = options;

  const isHome = activeHome && !activeCategory;
  const pageKeywords = isHome
    ? `${SITE.keywords}, ${SITE.seo.portfolio.keywords}`
    : SITE.keywords;

  return `${renderPageHead(SITE.title, SITE.description, null, activeCategory ? `/${activeCategory}` : '/', '', pageKeywords)}<body><div id=wrapper>${renderHeader({ categories, activeCategory, activeHome, itemCount: total, shareUrl, searchTags })} <div id=main-wrp class=mt140><div id=masonry-wrp data-masonry='{"itemSelector": ".items", "transitionDuration": 0, "columnWidth": ".items"}'><div class=items></div></div><input type=hidden id=page value="${page}"> <input type=hidden id=total value="${total}"></div>  ${renderFooter()} ${renderFloatingSocial()} </div></body>${renderTail()}`;
}

function renderDetailPage(item, options) {
  const { categories, stats, prev, next } = options;
  const itemPath = `/${item.category}/${item.slug}`;
  const shareUrl = `${SITE.url}${itemPath}`;
  const pageTitle = `${item.title} | ${SITE.brand}`;
  const description = `${item.title} - ${item.subtitle} design by ${SITE.brand}`;
  const shareImage = `${SITE.url}${item.gallery[0] || item.thumbnail}`;
  const prevArrow = prev
    ? `<div id="page-prev-arrow" class="page-arrows adf-detail-arrow adf-detail-arrow-prev"><a href="/${prev.category}/${prev.slug}" aria-label="Previous project"><img src="/resources/images/enlarge-page-prev-arrow.png" alt=""></a></div>`
    : '';
  const nextArrow = next
    ? `<div id="page-next-arrow" class="page-arrows adf-detail-arrow adf-detail-arrow-next"><a href="/${next.category}/${next.slug}" aria-label="Next project"><img src="/resources/images/enlarge-page-next-arrow.png" alt=""></a></div>`
    : '';

  return `${renderPageHead(pageTitle, description, shareImage, itemPath)}<body><div id=wrapper>${renderHeader({ categories, activeCategory: item.category, detailStats: stats, shareUrl, searchTags: item.tags || [] })} <div id="main-wrp"><div class="enlarge-wrp"><div class="adf-detail-frame">${prevArrow}<div class="enlarge-icons text-center">      ${renderGallery(item)}   </div>${nextArrow}</div></div></div> ${renderFloatingSocial()} </div></body>${renderTail()}`;
}

function renderContactActionCard(label, title, sub, href, external = true) {
  const target = external ? ' target=_blank rel=noopener noreferrer' : '';
  return `<a class="adf-contact-card adf-contact-card-text" href="${esc(href)}"${target}><div class="adf-contact-card-body"><div class="adf-contact-card-label">${esc(label)}</div><div class="adf-contact-card-title">${esc(title)}</div><div class="adf-contact-card-sub">${esc(sub)}</div></div></a>`;
}

function renderContactPage(options) {
  const { categories } = options;
  const pageTitle = SITE.seo.contact.title;
  const description = SITE.seo.contact.description;
  const shareUrl = `${SITE.url}/contact`;
  const extraCss = '<link href="/resources/css/contact.css?v=13" rel=stylesheet type=text/css>';
  const extraJs =
    '<script type=text/javascript src="/resources/js/contact.js"></script>';
  const waLink = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hi, I would like to discuss a design project with Adfinity.')}`;

  const actionCards = [
    renderContactActionCard('Instagram', '@weadfinity', 'Follow our latest work', SITE.instagram),
    renderContactActionCard('Google Business', 'Adfinity Designs', 'Reviews and feedback', SITE.googleBusiness),
    renderContactActionCard('Call Now', SITE.phoneDisplay, SITE.hours, `tel:${SITE.phoneTel}`, false),
    renderContactActionCard('WhatsApp', 'Chat with us', 'Quick replies during hours', waLink),
  ].join('');

  const body = `<div id=main-wrp class="mt140 adf-contact-page">
    <div class="adf-contact-hero">
      <div class="adf-contact-hero-glow adf-hero-glow-1"></div>
      <div class="adf-contact-hero-glow adf-hero-glow-2"></div>
      <div class="adf-contact-hero-inner">
        <span class="adf-contact-tag">Get In Touch</span>
        <h1 class="adf-contact-title">Let's Create Something<br><span>Amazing Together</span></h1>
        <p class="adf-contact-lead">Ready to grow your brand? Contact Adfinity Graphic Design &amp; Print Media for creative design, branding, website design, and print media solutions across Vijayawada and Andhra Pradesh.</p>
        <div class="adf-hero-actions">
          <a class="adf-hero-btn adf-hero-btn-call" href="tel:${SITE.phoneTel}">Call Now: ${esc(SITE.phoneDisplay)}</a>
          <a class="adf-hero-btn adf-hero-btn-wa" href="${waLink}" target=_blank rel=noopener noreferrer><span class="adf-wa-badge"><img src="/resources/images/whatsapp-icon.png" alt="" class="adf-wa-icon"></span> WhatsApp Now: ${esc(SITE.phoneDisplay)}</a>
        </div>
      </div>
    </div>
    <div class="adf-contact-wrap">
    <div class="adf-contact-shell">
    <div class="adf-contact-grid">
      <div class="adf-contact-main">
        <h2 class="adf-section-title">Contact Details</h2>
        <div class="adf-contact-details-grid">
          <div class="adf-contact-detail"><div class="adf-contact-detail-icon adf-ico-phone"></div><div><div class="adf-contact-detail-label">Phone</div><div class="adf-contact-detail-val"><a href="tel:${SITE.phoneTel}">${esc(SITE.phone)}</a></div></div></div>
          <div class="adf-contact-detail"><div class="adf-contact-detail-icon adf-ico-email"></div><div><div class="adf-contact-detail-label">Email</div><div class="adf-contact-detail-val"><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></div></div></div>
          <div class="adf-contact-detail adf-contact-detail-wide"><div class="adf-contact-detail-icon adf-ico-pin"></div><div><div class="adf-contact-detail-label">Address</div><div class="adf-contact-detail-val">${esc(SITE.address)}</div></div></div>
          <div class="adf-contact-detail"><div class="adf-contact-detail-icon adf-ico-clock"></div><div><div class="adf-contact-detail-label">Working Hours</div><div class="adf-contact-detail-val">${esc(SITE.hours)}</div></div></div>
        </div>

        <h2 class="adf-section-title">Send a Message</h2>
        <div class="adf-contact-form-card">
          <div class="adf-form-card-head"><h2>We reply fast on WhatsApp</h2><p>Fill in your details and choose WhatsApp or Email - no signup required.</p></div>
          <form id="adf-contact-form" class="adf-contact-form" novalidate>
            <div class="adf-form-row">
              <div class="adf-form-field"><label for="adf-name">Name *</label><input type=text id=adf-name name=name minlength=2 maxlength=100 required placeholder="Your name"></div>
              <div class="adf-form-field"><label for="adf-mobile">Phone *</label><input type=tel id=adf-mobile name=mobile minlength=9 maxlength=15 required placeholder="Your phone number"></div>
            </div>
            <div class="adf-form-field"><label for="adf-email">Email *</label><input type=email id=adf-email name=email maxlength=100 required placeholder="you@example.com"></div>
            <div class="adf-form-field"><label for="adf-message">Message *</label><textarea id=adf-message name=message maxlength=500 required rows=5 placeholder="Tell us about your project..."></textarea></div>
            <div class="adf-form-actions">
              <button type=button id=adf-send-whatsapp class="adf-btn adf-btn-whatsapp"><span class="adf-wa-badge"><img src="/resources/images/whatsapp-icon.png" alt="" class="adf-wa-icon"></span> Send via WhatsApp</button>
              <button type=button id=adf-send-email class="adf-btn adf-btn-email"><span class="adf-btn-icon adf-btn-icon-mail"></span> Send via Email</button>
            </div>
            <p class="adf-form-note" id=adf-form-note hidden></p>
          </form>
        </div>
      </div>

      <div class="adf-contact-side">
        <h2 class="adf-section-title adf-section-title-side">Visit and Connect</h2>
        <div class="adf-office-card">
          <div class="adf-office-img-wrap">
            <img src="${esc(SITE.officeImage)}" alt="${esc(SITE.brand)} studio" class="adf-office-img">
            <div class="adf-office-overlay"></div>
          </div>
          <div class="adf-office-caption"><strong>${esc(SITE.brand)}</strong><span>Design and Print and Digital &mdash; Since 2012</span></div>
        </div>
        <div class="adf-map-card">
          <div class="adf-map-label">Find us on the map</div>
          <iframe title="Adfinity Designs on Google Maps" src="${esc(SITE.mapsEmbed)}" loading=lazy referrerpolicy=no-referrer-when-downgrade allowfullscreen></iframe>
          <a class="adf-map-link" href="${esc(SITE.googleMaps)}" target=_blank rel=noopener noreferrer>Open in Google Maps</a>
        </div>
        <div class="adf-contact-cards">${actionCards}</div>
      </div>
    </div>
    </div>
  </div></div></div>`;

  return `${renderPageHead(pageTitle, description, null, '/contact', extraCss, SITE.seo.contact.keywords)}<body><div id=wrapper>${renderHeader({ categories, activeContact: true, contactPage: true, shareUrl })} ${body} ${renderFooter()} ${renderFloatingSocial()} </div></body>${renderTail(extraJs)}`;
}

const ABOUT_CAT_ICONS = {
  'packaging-designs':
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  'logo-designs':
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  'brochure-designs':
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  'business-cards':
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  'book-titles':
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  hoardings:
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
};

const ABOUT_FEATURE_ICONS = {
  exp: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>',
  fast: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  clients:
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
};

const ABOUT_TESTIMONIALS = [
  {
    quote:
      'A Designer with a Lot Of Patience, Responsive on phone. Tries to understand the clients requirements and provides inputs accordingly. Outstanding Work. Highly Recommended.',
    name: 'Dr Ravi Kishore Vankayala',
  },
  {
    quote:
      'Adfinity is pretty cutting edge for Vijayawada. The staff are attentive and are able to deliver good quality design work within requested time frames. I highly recommend their service of design and print. Give them a call to discuss your requirements.',
    name: 'Sophie Akkineni',
  },
  {
    quote:
      'Ameer, Team Leader of Adfinity Graphic Designer, has very patience and is polite with handling customers. In designing he has great innovative and creative ideas which are very suitable and eye-catching. He did all our school work like brochures, students fee register, preschool progress reports and primary school report cards. I think he is the best designer in Vijayawada. Thank you Ameer bro and team of Adfinity.',
    name: 'Alhuda International',
  },
  {
    quote:
      'I had an excellent experience working with the Adfinity team. Ameer was consistently approachable and handled all of my requests with the utmost patience. His professionalism and dedication greatly contributed to the success of our brochure design.',
    name: 'Sri Hriti',
  },
  {
    quote:
      'This company does great work in creating company logos, visiting cards, and letter pads. Staff cooperation is good.',
    name: 'Ravi Teja',
  },
  {
    quote:
      'Adfinity delivers impactful designs before the promised time. They are heavily customer oriented and they do not close a project until the customer is 100% satisfied. Very humble people with great customer centricity.',
    name: 'Twisha Upadhyay',
  },
  {
    quote:
      'One of the best designers I have ever seen. His commitment towards work is very exciting. On-time delivery with client satisfactory requirements.',
    name: 'Bhargavi Venkat',
  },
  {
    quote:
      'I approached them for logo designing and captions. They are professional, experienced, skilled and deliver exactly what the client needs. I am really happy with their services.',
    name: 'Gouse Pasha Mohammed',
  },
  {
    quote:
      'Very good creativity in designing brochures and ads. Mostly support clients with urgent work — staff complete the work overtime too and have a friendly nature.',
    name: 'Reddy Nagella',
  },
];

function testimonialInitial(name) {
  const trimmed = name.replace(/^Dr\s+/i, '').trim();
  return trimmed.charAt(0).toUpperCase();
}

function renderAboutTestimonials() {
  const avatarClasses = [
    '',
    'adf-t-av-2',
    'adf-t-av-3',
    'adf-t-av-4',
    'adf-t-av-5',
    'adf-t-av-6',
    'adf-t-av-7',
    'adf-t-av-8',
    'adf-t-av-9',
  ];
  const slides = ABOUT_TESTIMONIALS.map((item, index) => {
    const active = index === 0 ? ' adf-t-active' : '';
    const avClass = avatarClasses[index] || '';
    const avAttr = avClass ? ` ${avClass}` : '';
    return `<div class="adf-t-slide${active}"><div class="adf-t-stars">★★★★★</div><p>"${esc(item.quote)}"</p><div class="adf-t-author"><span class="adf-t-avatar${avAttr}">${esc(testimonialInitial(item.name))}</span><strong>${esc(item.name)}</strong></div></div>`;
  }).join('');
  const dots = ABOUT_TESTIMONIALS.map((_, index) => {
    const active = index === 0 ? ' adf-t-dot-active' : '';
    return `<button type=button class="adf-t-dot${active}" data-i=${index} aria-label="Review ${index + 1}"></button>`;
  }).join('');
  return `<div class="adf-t-slider" id="adf-t-slider"><div class="adf-t-track">${slides}</div><div class="adf-t-dots" id="adf-t-dots">${dots}</div></div>`;
}

function renderAboutCategoryTiles(categories) {
  return categories
    .map((cat) => {
      const icon = ABOUT_CAT_ICONS[cat.id] || ABOUT_CAT_ICONS['logo-designs'];
      const count = cat.itemSlugs ? cat.itemSlugs.length : 0;
      return `<a class="adf-about-cat" href="/${esc(cat.id)}"><span class="adf-about-cat-icon">${icon}</span><span class="adf-about-cat-label">${esc(cat.navLabel)}</span><span class="adf-about-cat-count">${count} projects</span></a>`;
    })
    .join('');
}

function renderAboutShowcase(showcase) {
  return showcase
    .map(
      (item) =>
        `<a class="adf-hero-show-item" href="${esc(item.href)}" title="View ${esc(item.title)}"><img src="${esc(item.thumbnail)}" alt="${esc(item.title)}"><span class="adf-hero-show-cap">${esc(item.title)}</span></a>`,
    )
    .join('');
}

function renderAboutPage(options) {
  const { categories, showcase } = options;
  const pageTitle = SITE.seo.about.title;
  const description = SITE.seo.about.description;
  const shareUrl = `${SITE.url}/about`;
  const extraCss = '<link href="/resources/css/about.css?v=15" rel=stylesheet type=text/css>';
  const extraJs = '<script type=text/javascript src="/resources/js/about.js"></script>';
  const catTiles = renderAboutCategoryTiles(categories);
  const showItems = renderAboutShowcase(showcase);
  const testimonials = renderAboutTestimonials();

  const body = `<div id=main-wrp class="mt140 adf-about-page">
    <section class="adf-about-hero">
      <div class="adf-about-hero-glow adf-glow-1"></div>
      <div class="adf-about-hero-glow adf-glow-2"></div>
      <div class="adf-about-hero-inner">
        <div class="adf-about-hero-grid">
          <div class="adf-about-hero-copy">
            <div class="adf-express-block adf-express-block-hero">
              <p class="adf-express-headline">Expressing <span class="adf-express-word">Ideas<span class="adf-red-dot">.</span></span></p>
              <span class="adf-express-rule" aria-hidden="true"></span>
            </div>
            <span class="adf-about-tag">Creative Designs. Powerful Brands.</span>
            <h1 class="adf-about-title">Best Graphic Design &amp;<br><span>Branding Services in Vijayawada</span></h1>
            <p class="adf-about-lead">Welcome to Adfinity Graphic Design &amp; Print Media, your trusted partner for professional graphic design services in Vijayawada and across Andhra Pradesh. We specialize in logo design, branding, website design, brochure design, packaging design, social media creatives, print media solutions, and photography services.</p>
            <p class="adf-about-lead">We help businesses build strong brand identities through creative, high-quality designs that attract customers and leave a lasting impression.</p>
            <p class="adf-about-services-line">Creative Logo Design &bull; Brand Identity &bull; Website Design &bull; Print Media Solutions &bull; Packaging Design</p>
            <div class="adf-about-hero-actions">
              <a class="adf-about-btn adf-about-btn-primary" href="#adf-services">View Our Work</a>
              <a class="adf-about-btn adf-about-btn-ghost" href="/contact">Contact Us</a>
            </div>
            <div class="adf-about-stats">
              <div class="adf-about-stat"><strong>50<sup>+</sup></strong><span>Happy Clients</span></div>
              <div class="adf-about-stat"><strong>13<sup>+</sup></strong><span>Years Experience</span></div>
              <div class="adf-about-stat"><strong>150<sup>+</sup></strong><span>Projects Delivered</span></div>
            </div>
          </div>
          <div class="adf-about-hero-visual">
            <p class="adf-hero-recent-label">Recent projects</p>
            <div class="adf-hero-showcase">${showItems}</div>
            <div class="adf-hero-rating"><span class="adf-hero-rating-num">★ 4.9</span><span>Client Rating</span></div>
          </div>
        </div>
      </div>
    </section>

    <div class="adf-about-marquee" aria-hidden=true><div class="adf-marquee-track"><span>Logo &amp; Branding</span><span>Brand Identity</span><span>Brochure Design</span><span>Packaging Design</span><span>Business Cards</span><span>Hoardings</span><span>Website Design</span><span>Print Media</span><span>Logo &amp; Branding</span><span>Brand Identity</span><span>Brochure Design</span><span>Packaging Design</span><span>Business Cards</span><span>Hoardings</span><span>Website Design</span><span>Print Media</span></div></div>

    <section class="adf-about-band adf-about-band-light" id="adf-services">
      <div class="adf-about-inner">
        <div class="adf-about-section-head">
          <span class="adf-about-tag adf-about-tag-light">What We Do</span>
          <h2 class="adf-about-section-title">Professional Graphic Design &amp; Print Media Services</h2>
          <p class="adf-about-section-sub"><strong>Everything Your Brand Needs — Designed to Impress, Built to Perform.</strong> Click a category to explore our portfolio.</p>
        </div>
        <div class="adf-about-cats">${catTiles}</div>
      </div>
    </section>

    <section class="adf-about-band adf-about-band-white adf-about-story">
      <div class="adf-about-inner">
        <div class="adf-about-story-grid">
          <div class="adf-about-story-visual">
            <img src="${esc(SITE.logoImage)}" alt="${esc(SITE.brand)} logo" class="adf-about-story-img adf-about-story-logo">
            <div class="adf-about-story-badge"><strong>50<sup>+</sup></strong><span>Clients across Vijayawada</span></div>
            <div class="adf-about-since">Since 2012</div>
          </div>
          <div class="adf-about-story-copy">
            <span class="adf-about-tag">Our Story</span>
            <h2 class="adf-about-section-title">Passion for Design.<br>Commitment to Excellence.</h2>
            <p class="adf-about-section-sub">A Vijayawada design studio helping brands across Andhra Pradesh with logo design, branding, print, web, and marketing creatives.</p>
            <div class="adf-about-features">
              <div class="adf-about-feature"><div class="adf-af-icon">${ABOUT_FEATURE_ICONS.exp}</div><div><strong>Industry-Wide Experience</strong><p>Food, pharma, education, retail and more.</p></div></div>
              <div class="adf-about-feature"><div class="adf-af-icon">${ABOUT_FEATURE_ICONS.fast}</div><div><strong>Fast Turnaround</strong><p>Quality designs, delivered on time.</p></div></div>
              <div class="adf-about-feature"><div class="adf-af-icon">${ABOUT_FEATURE_ICONS.clients}</div><div><strong>Trusted Clientele</strong><p>SMEs to enterprises in Vijayawada and beyond.</p></div></div>
            </div>
            <a class="adf-about-btn adf-about-btn-primary" href="/contact">Work With Us →</a>
          </div>
        </div>
      </div>
    </section>

    <section class="adf-about-band adf-about-band-dark adf-about-process">
      <div class="adf-about-inner">
        <div class="adf-about-section-head adf-about-section-head-center">
          <span class="adf-about-tag">How We Work</span>
          <h2 class="adf-about-section-title">Our Creative Process</h2>
          <p class="adf-about-section-sub">Simple, collaborative, and results-oriented — here's how we turn your brief into finished design.</p>
        </div>
        <div class="adf-process-flow">
          <div class="adf-process-line" aria-hidden="true"></div>
          <div class="adf-process-flow-steps">
            <div class="adf-flow-step"><div class="adf-flow-node"><span>1</span></div><h3>Discovery</h3><p>We learn your business, target audience, competitors, and goals through a detailed brief and discovery call.</p></div>
            <div class="adf-flow-step"><div class="adf-flow-node"><span>2</span></div><h3>Concept</h3><p>Our designers develop multiple creative directions, exploring colors, typography, and visual language.</p></div>
            <div class="adf-flow-step"><div class="adf-flow-node"><span>3</span></div><h3>Refine</h3><p>You review, provide feedback, and we refine until the design perfectly represents your brand.</p></div>
            <div class="adf-flow-step"><div class="adf-flow-node"><span>4</span></div><h3>Deliver</h3><p>Final files delivered in all required formats — print-ready, web-optimized, and fully yours.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section class="adf-about-band adf-about-band-light adf-about-testimonials">
      <div class="adf-about-inner">
        <div class="adf-about-section-head adf-about-section-head-center">
          <span class="adf-about-tag">Client Love</span>
          <h2 class="adf-about-section-title">What Our Clients Say</h2>
          <p class="adf-about-section-sub">Real feedback from real businesses we've helped grow.</p>
        </div>
        ${testimonials}
      </div>
    </section>

    <section class="adf-about-band adf-about-band-dark adf-about-band-cta">
      <div class="adf-about-inner">
        <div class="adf-about-cta">
          <div class="adf-about-cta-glow adf-cta-glow-1" aria-hidden="true"></div>
          <div class="adf-about-cta-glow adf-cta-glow-2" aria-hidden="true"></div>
          <div class="adf-about-cta-inner">
            <span class="adf-about-tag">Get Started</span>
            <h2>Ready to grow <span>your brand?</span></h2>
            <p>Let's create something amazing together — logo design, branding, print and digital, all from Vijayawada.</p>
            <div class="adf-about-cta-actions">
              <a class="adf-about-btn adf-about-btn-primary" href="/contact">Contact Us</a>
              <a class="adf-about-btn adf-about-btn-ghost" href="/">Browse Portfolio</a>
            </div>
            <ul class="adf-about-cta-trust" aria-label="Adfinity highlights">
              <li><span class="adf-cta-trust-icon">★</span> 4.9 Google rating</li>
              <li><span class="adf-cta-trust-icon">✓</span> 50+ happy clients</li>
              <li><span class="adf-cta-trust-icon">◆</span> Since 2012</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>`;

  return `${renderPageHead(pageTitle, description, null, '/about', extraCss, `${SITE.seo.about.keywords}, ${SITE.seo.services.keywords}`)}<body><div id=wrapper>${renderHeader({ categories, activeAbout: true, aboutPage: true, shareUrl })} ${body} ${renderFooter()} ${renderFloatingSocial()} </div></body>${renderTail(extraJs)}`;
}

module.exports = {
  SITE,
  esc,
  renderGridItems,
  renderListingPage,
  renderDetailPage,
  renderContactPage,
  renderAboutPage,
};
