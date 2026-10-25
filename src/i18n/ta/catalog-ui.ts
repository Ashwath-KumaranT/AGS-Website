// Tamil — catalogue UI: product cards, filters, sorting, catalogue & wishlist pages, delivery.
const ta: Record<string, string> = {
  // product card / grid / sections
  '{title} in {color}': '{color} நிறத்தில் {title}',
  'Sold out': 'விற்றுத் தீர்ந்தது',
  'Close quick add': 'விரைவுச் சேர்ப்பை மூடு',
  'Quick add {title}': '{title} — விரைவாகச் சேர்',
  'Quick add — {color}': 'விரைவாகச் சேர் — {color}',
  'Add size {size} to cart': '{size} அளவைப் பையில் சேர்',
  'Add size {size} to cart, sold out': '{size} அளவைப் பையில் சேர், விற்றுத் தீர்ந்தது',
  'Loading products': 'தயாரிப்புகள் ஏற்றப்படுகின்றன',
  'View all': 'அனைத்தையும் காண்க',

  // colour & size pickers
  Colour: 'நிறம்',
  Colours: 'நிறங்கள்',
  '{color}, sold out': '{color}, விற்றுத் தீர்ந்தது',
  Size: 'அளவு',
  'Size {size}': 'அளவு {size}',
  'Size {size}, sold out': 'அளவு {size}, விற்றுத் தீர்ந்தது',
  'Size {size}, only {count} left': 'அளவு {size}, {count} மட்டுமே உள்ளன',

  // filters
  Availability: 'கிடைக்கும் நிலை',
  'In stock only': 'கையிருப்பில் உள்ளவை மட்டும்',
  'In stock': 'கையிருப்பில் உள்ளது',
  'On sale': 'தள்ளுபடியில்',
  Price: 'விலை',
  Brand: 'பிராண்ட்',
  'Clear all filters': 'அனைத்து வடிகட்டிகளையும் நீக்கு',
  'Clear all': 'அனைத்தையும் நீக்கு',
  'Any price': 'எந்த விலையும்',
  'Under ₹1,500': '₹1,500-க்குக் கீழ்',
  '₹1,500 – ₹3,000': '₹1,500 – ₹3,000',
  '₹3,000 – ₹6,000': '₹3,000 – ₹6,000',
  '₹6,000 & over': '₹6,000 மற்றும் அதற்கு மேல்',
  'Under ₹{amount}': '₹{amount}-க்குக் கீழ்',

  // sorting ('Featured' and 'Top rated' live in header.ts)
  'Sort by': 'வரிசைப்படுத்து',
  Newest: 'புதியவை முதலில்',
  'Price: low to high': 'விலை: குறைவிலிருந்து அதிகம்',
  'Price: high to low': 'விலை: அதிகத்திலிருந்து குறைவு',
  'Biggest discount': 'அதிகத் தள்ளுபடி',

  // catalogue page
  Home: 'முகப்பு',
  Shop: 'கடை',
  'Shop all': 'அனைத்துப் பொருட்களும்',
  'Everything in the ASG collection.': 'ASG தொகுப்பில் உள்ள அனைத்தும்.',
  'Results for “{q}”': '“{q}” க்கான முடிவுகள்',
  'The latest drops — fresh for the season.': 'சமீபத்திய வரவுகள் — இந்தப் பருவத்திற்குப் புதியவை.',
  'Considered essentials at considered prices.':
    'கவனமாகத் தேர்ந்தெடுத்த அத்தியாவசியப் பொருட்கள், நியாயமான விலையில்.',
  'Browse {title} at ASG.': 'ASG-இல் {title} பொருட்களைப் பாருங்கள்.',
  '{count} product': '{count} தயாரிப்பு',
  '{count} products': '{count} தயாரிப்புகள்',
  Filters: 'வடிகட்டிகள்',
  'Filters ({count})': 'வடிகட்டிகள் ({count})',
  'Loading…': 'ஏற்றுகிறது…',
  Products: 'தயாரிப்புகள்',
  'Active filters': 'செயலில் உள்ள வடிகட்டிகள்',
  'Remove filter {label}': '{label} வடிகட்டியை நீக்கு',
  'What are you looking for?': 'நீங்கள் எதைத் தேடுகிறீர்கள்?',
  'Type in the search bar to find dresses, jeans, knitwear and more.':
    'ஆடைகள், ஜீன்ஸ், பின்னலாடைகள் மற்றும் பலவற்றைக் கண்டறிய தேடல் பட்டியில் தட்டச்சு செய்யுங்கள்.',
  'Browse everything': 'அனைத்தையும் பாருங்கள்',
  'No results for “{q}”': '“{q}” க்கு முடிவுகள் எதுவும் இல்லை',
  'No products match your filters': 'உங்கள் வடிகட்டிகளுக்குப் பொருந்தும் தயாரிப்புகள் இல்லை',
  'Try removing a filter or two.': 'ஓரிரு வடிகட்டிகளை நீக்கிப் பாருங்கள்.',
  'Try a different search or browse our categories.':
    'வேறு தேடலை முயற்சிக்கவும் அல்லது எங்கள் வகைகளைப் பாருங்கள்.',
  'Show {count} product': '{count} தயாரிப்பைக் காட்டு',
  'Show {count} products': '{count} தயாரிப்புகளைக் காட்டு',
  'You might like': 'உங்களுக்குப் பிடிக்கலாம்',
  'Popular right now': 'இப்போது பிரபலமானவை',

  // wishlist
  'Add {title} to wishlist': '{title} — விருப்பப்பட்டியலில் சேர்',
  'Remove {title} from wishlist': '{title} — விருப்பப்பட்டியலிலிருந்து நீக்கு',
  'Saved to wishlist': 'விருப்பப்பட்டியலில் சேமிக்கப்பட்டது',
  'Removed from wishlist': 'விருப்பப்பட்டியலிலிருந்து நீக்கப்பட்டது',
  'View wishlist': 'விருப்பப்பட்டியலைக் காண்க',
  '{count} saved item': '{count} சேமித்த பொருள்',
  'Your wishlist is empty': 'உங்கள் விருப்பப்பட்டியல் காலியாக உள்ளது',
  'Tap the heart on any product to save it here for later.':
    'பின்னர் பார்க்க, எந்தத் தயாரிப்பிலும் உள்ள இதயக் குறியைத் தட்டி இங்கே சேமிக்கவும்.',
  'Discover new arrivals': 'புதிய வரவுகளைக் கண்டறியுங்கள்',
  'Start here': 'இங்கிருந்து தொடங்குங்கள்',
  'Best sellers': 'அதிகம் விற்பனையாகுபவை',

  // delivery checker + delivery options (src/lib/pricing.ts, src/lib/delivery.ts)
  'Check delivery': 'டெலிவரியைச் சரிபார்க்கவும்',
  'Postal code': 'அஞ்சல் குறியீடு',
  'Enter postal code': 'அஞ்சல் குறியீட்டை உள்ளிடவும்',
  Check: 'சரிபார்',
  'Couldn’t check right now. Please try again.':
    'இப்போது சரிபார்க்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
  Free: 'இலவசம்',
  'Standard delivery': 'சாதாரண டெலிவரி',
  'Express delivery': 'விரைவு டெலிவரி',
  'Next-day delivery': 'அடுத்த நாள் டெலிவரி',
  'Free over ₹1,999': '₹1,999-க்கு மேல் இலவசம்',
  'Tracked, signature on delivery': 'கண்காணிக்கப்படும், டெலிவரியின்போது கையொப்பம் தேவை',
  'Order before 2pm': 'மதியம் 2 மணிக்கு முன் ஆர்டர் செய்யுங்கள்',
  'Enter a valid postal code.': 'சரியான அஞ்சல் குறியீட்டை உள்ளிடவும்.',
  "Sorry, we don't deliver to this area yet.":
    'மன்னிக்கவும், இந்தப் பகுதிக்கு நாங்கள் இன்னும் டெலிவரி செய்வதில்லை.',
  'Delivery available.': 'டெலிவரி கிடைக்கும்.',
};

export default ta;
