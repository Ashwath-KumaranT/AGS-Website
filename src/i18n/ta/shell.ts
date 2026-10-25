// Tamil — layout shell (mobile menu, bottom nav, footer, banners, search panel),
// shared UI primitives, router fallbacks and default SEO text.
const ta: Record<string, string> = {
  // mobile menu
  Menu: 'மெனு',
  Mobile: 'மொபைல் வழிசெலுத்தல்',
  'Shop all {label}': 'அனைத்து {label} பொருட்களையும் ஷாப்பிங் செய்க',
  'Hi, {name}': 'வணக்கம், {name}',
  'Sign in / Create account': 'உள்நுழை / கணக்கை உருவாக்கு',
  Orders: 'ஆர்டர்கள்',
  'Light theme': 'வெளிர் தீம்',
  'Dark theme': 'இருண்ட தீம்',
  'Sign out': 'வெளியேறு',
  'Signed out': 'வெளியேறிவிட்டீர்கள்',

  // bottom navigation
  'Quick navigation': 'விரைவு வழிசெலுத்தல்',
  Home: 'முகப்பு',
  Shop: 'கடை',
  Bag: 'பை',
  'Bag, {count} item': 'பை, {count} பொருள்',
  'Bag, {count} items': 'பை, {count} பொருட்கள்',
  Account: 'கணக்கு',

  // footer
  'Considered essentials, made to last. Join our list for early access to new arrivals and 10% off your first order.':
    'கவனமாகத் தேர்ந்தெடுக்கப்பட்ட, நீண்ட காலம் நீடிக்கும் அத்தியாவசிய ஆடைகள். புதிய வரவுகளை முன்கூட்டியே பெறவும், உங்கள் முதல் ஆர்டருக்கு 10% தள்ளுபடி பெறவும் எங்கள் பட்டியலில் இணையுங்கள்.',
  'Email address': 'மின்னஞ்சல் முகவரி',
  'Enter a valid email address': 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்',
  Subscribe: 'பதிவு செய்',
  'You’re on the list': 'நீங்கள் பட்டியலில் சேர்க்கப்பட்டீர்கள்',
  Footer: 'அடிக்குறிப்பு வழிசெலுத்தல்',
  Help: 'உதவி',
  'Track an order': 'ஆர்டரைக் கண்காணி',
  'Returns & refunds': 'திருப்பி அனுப்புதல் & பணத்தைத் திருப்பித் தருதல்',
  'Shipping information': 'டெலிவரி தகவல்',
  'Size guide': 'அளவு வழிகாட்டி',
  Addresses: 'முகவரிகள்',
  Coupons: 'கூப்பன்கள்',
  'Free shipping on orders over ₹1,999': '₹1,999-க்கு மேற்பட்ட ஆர்டர்களுக்கு இலவச டெலிவரி',
  'Free returns within 7 days': '7 நாட்களுக்குள் இலவசமாகத் திருப்பி அனுப்பலாம்',
  'Secure, encrypted payments': 'பாதுகாப்பான, குறியாக்கம் செய்யப்பட்ட கட்டணங்கள்',
  'Arun Sakthi Garments': 'அருண் சக்தி கார்மென்ட்ஸ்',
  '© {year} ASG — Arun Sakthi Garments. All rights reserved.':
    '© {year} ASG — அருண் சக்தி கார்மென்ட்ஸ். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  Privacy: 'தனியுரிமை',
  'Shipping & returns': 'டெலிவரி & திருப்பி அனுப்புதல்',

  // layout banners
  'New season arrivals — shop the edit':
    'புதிய சீசன் வரவுகள் — சிறப்புத் தொகுப்பை ஷாப்பிங் செய்யுங்கள்',
  Announcements: 'அறிவிப்புகள்',
  'Your session expired. {link} to continue.': 'உங்கள் அமர்வு காலாவதியானது. தொடர {link}.',
  'Sign in again': 'மீண்டும் உள்நுழையவும்',
  Dismiss: 'மூடு',
  'You’re offline. Some actions won’t work until you reconnect.':
    'நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். மீண்டும் இணைக்கும் வரை சில செயல்கள் வேலை செய்யாது.',
  'Skip to content': 'உள்ளடக்கத்திற்குச் செல்',

  // search panel
  'Search products': 'தயாரிப்புகளைத் தேடு',
  'Search for dresses, jeans, knitwear…': 'உடைகள், ஜீன்ஸ், பின்னலாடைகளைத் தேடுங்கள்…',
  'Clear search': 'தேடலை அழி',
  'Recent searches': 'சமீபத்திய தேடல்கள்',
  Clear: 'அழி',
  'Your recent searches will appear here.': 'உங்கள் சமீபத்திய தேடல்கள் இங்கே தோன்றும்.',
  'Remove {term}': '{term} — நீக்கு',
  Trending: 'பிரபலமானவை',
  'Linen shirt': 'லினன் சட்டை',
  'Wide-leg trousers': 'அகலக் கால் கால்சட்டை',
  'Merino sweater': 'மெரினோ ஸ்வெட்டர்',
  'Straight jeans': 'ஸ்ட்ரெய்ட் ஜீன்ஸ்',
  'Kids hoodie': 'குழந்தைகள் ஹூடி',
  'No results for “{term}”': '“{term}” என்பதற்கு முடிவுகள் இல்லை',
  'Check the spelling or try a broader term like “shirt” or “dress”.':
    'எழுத்துப்பிழையைச் சரிபார்க்கவும் அல்லது “சட்டை” அல்லது “உடை” போன்ற பொதுவான சொல்லை முயற்சிக்கவும்.',
  Categories: 'வகைகள்',
  Products: 'தயாரிப்புகள்',
  'See all results for “{term}”': '“{term}” க்கான அனைத்து முடிவுகளையும் காண்க',

  // primitives
  'Sale price': 'தள்ளுபடி விலை',
  Price: 'விலை',
  'Original price': 'அசல் விலை',
  '{pct}% off': '{pct}% தள்ளுபடி',
  'Rated {rating} out of 5': '5-க்கு {rating} மதிப்பீடு',
  'Rated {rating} out of 5 from {count} review':
    '{count} மதிப்புரையின் அடிப்படையில் 5-க்கு {rating} மதிப்பீடு',
  'Rated {rating} out of 5 from {count} reviews':
    '{count} மதிப்புரைகளின் அடிப்படையில் 5-க்கு {rating} மதிப்பீடு',
  Quantity: 'எண்ணிக்கை',
  'Decrease quantity': 'எண்ணிக்கையைக் குறை',
  'Increase quantity': 'எண்ணிக்கையை அதிகரி',
  'Something went wrong': 'ஏதோ தவறு நடந்துவிட்டது',
  'We could not load this. Check your connection and try again.':
    'இதை ஏற்ற முடியவில்லை. உங்கள் இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
  'Try again': 'மீண்டும் முயற்சி செய்',
  Breadcrumb: 'பக்க வழித்தடம்',
  Pagination: 'பக்க எண்கள்',
  Previous: 'முந்தையது',
  Next: 'அடுத்தது',
  'Page {page}': 'பக்கம் {page}',
  'Dismiss notification': 'அறிவிப்பை மூடு',
  Close: 'மூடு',

  // SEO defaults
  'ASG — Modern essentials for everyday wear': 'ASG — அன்றாட உடைகளுக்கான நவீன அத்தியாவசியங்கள்',
  'Considered essentials for men, women and kids. Free shipping over ₹1,999.':
    'ஆண்கள், பெண்கள் மற்றும் குழந்தைகளுக்கான கவனமாகத் தேர்ந்தெடுக்கப்பட்ட அத்தியாவசிய ஆடைகள். ₹1,999-க்கு மேல் இலவச டெலிவரி.',

  // router and route guard
  'Loading page': 'பக்கம் ஏற்றப்படுகிறது',
  'A new version is available': 'புதிய பதிப்பு கிடைக்கிறது',
  'Reload the page to get the latest version of the store.':
    'கடையின் சமீபத்திய பதிப்பைப் பெற பக்கத்தை மீண்டும் ஏற்றவும்.',
  'An unexpected error occurred. Please try again.':
    'எதிர்பாராத பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
  'Checking your session': 'உங்கள் அமர்வைச் சரிபார்க்கிறது',
};

export default ta;
