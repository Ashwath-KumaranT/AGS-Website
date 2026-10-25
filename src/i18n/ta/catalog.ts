// Tamil — catalogue content (products, categories, colours, care, reviews, coupons).
// Keys must match src/services/mock/seed.ts exactly.
const ta: Record<string, string> = {
  // categories ('Men', 'Women', 'Kids' live in header.ts)
  'Tailored basics and weekend staples.':
    'நேர்த்தியாகத் தைக்கப்பட்ட அடிப்படை உடைகளும் வார இறுதிக்கான அத்தியாவசியங்களும்.',
  'Fluid silhouettes in natural fibres.': 'இயற்கை இழைகளில் மென்மையாகப் பாயும் வடிவமைப்புகள்.',
  'Soft, durable and made to play in.':
    'மென்மையானவை, நீடித்து உழைப்பவை, விளையாடுவதற்கென்றே உருவானவை.',
  'T-shirts': 'டீ-ஷர்ட்கள்',
  Shirts: 'ஷர்ட்கள்',
  Knitwear: 'பின்னலாடைகள்',
  Jackets: 'ஜாக்கெட்டுகள்',
  'Trousers & Jeans': 'டிரவுசர்கள் & ஜீன்ஸ்',
  Dresses: 'டிரஸ்கள்',
  'Tops & Tees': 'டாப்ஸ் & டீ-ஷர்ட்கள்',
  'Skirts & Trousers': 'ஸ்கர்ட்கள் & டிரவுசர்கள்',
  Outerwear: 'மேலங்கிகள்',
  'Tops & Hoodies': 'டாப்ஸ் & ஹூடிகள்',
  Bottoms: 'கீழாடைகள்',

  // colours
  Ivory: 'தந்த வெள்ளை',
  Black: 'கருப்பு',
  Navy: 'கடற்படை நீலம்',
  Sage: 'சேஜ் பச்சை',
  Sand: 'மணல் நிறம்',
  Rust: 'துரு சிவப்பு',
  Olive: 'ஆலிவ் பச்சை',
  Charcoal: 'கரி சாம்பல்',
  Sky: 'வான நீலம்',
  Stone: 'கல் சாம்பல்',
  Blush: 'இளஞ்சிவப்பு',
  Camel: 'ஒட்டகப் பழுப்பு',
  Indigo: 'அவுரி நீலம்',
  'Washed Blue': 'மங்கிய நீலம்',
  Mustard: 'கடுகு மஞ்சள்',
  Forest: 'காட்டுப் பச்சை',
  Cream: 'க்ரீம்',
  Berry: 'பெர்ரி சிவப்பு',

  // products — titles
  'Heavyweight Crew Tee': 'கனமான க்ரூ நெக் டீ-ஷர்ட்',
  'Everyday Pocket Tee': 'தினசரி பாக்கெட் டீ-ஷர்ட்',
  'Oxford Button-Down Shirt': 'ஆக்ஸ்போர்டு பட்டன்-டவுன் ஷர்ட்',
  'Linen Camp-Collar Shirt': 'லினன் கேம்ப்-காலர் ஷர்ட்',
  'Merino Crewneck Sweater': 'மெரினோ கம்பளி க்ரூ நெக் ஸ்வெட்டர்',
  'Chunky Cable-Knit Sweater': 'தடித்த கேபிள்-பின்னல் ஸ்வெட்டர்',
  'Quilted Field Jacket': 'குவில்டட் ஃபீல்டு ஜாக்கெட்',
  'Waxed Cotton Jacket': 'மெழுகு பூசிய பருத்தி ஜாக்கெட்',
  'Straight-Fit Selvedge Jeans': 'ஸ்ட்ரெயிட்-ஃபிட் செல்வெட்ஜ் ஜீன்ஸ்',
  'Pleated Cotton Chino': 'ப்ளீட்டட் பருத்தி சினோ',
  'Hybrid Travel Shorts': 'ஹைப்ரிட் பயண ஷார்ட்ஸ்',
  'Wrap Midi Dress': 'ரேப் மிடி டிரஸ்',
  'Linen Slip Dress': 'லினன் ஸ்லிப் டிரஸ்',
  'Ribbed Knit Column Dress': 'ரிப்-பின்னல் காலம் டிரஸ்',
  'Boxy Cotton Tee': 'பாக்ஸி பருத்தி டீ-ஷர்ட்',
  'Relaxed Poplin Shirt': 'தளர்வான பாப்ளின் ஷர்ட்',
  'Cashmere-Blend Sweater': 'காஷ்மீர் கலவை ஸ்வெட்டர்',
  'Oversized Wool Cardigan': 'ஓவர்சைஸ் கம்பளி கார்டிகன்',
  'Pleated Midi Skirt': 'ப்ளீட்டட் மிடி ஸ்கர்ட்',
  'Wide-Leg Tailored Trousers': 'வைட்-லெக் டெய்லர்டு டிரவுசர்',
  'High-Rise Straight Jeans': 'ஹை-ரைஸ் ஸ்ட்ரெயிட் ஜீன்ஸ்',
  'Belted Trench Coat': 'பெல்ட்டுடன் ட்ரெஞ்ச் கோட்',
  'Cropped Puffer Vest': 'க்ராப்டு பஃபர் வெஸ்ட்',
  'Kids Organic Cotton Hoodie': 'குழந்தைகளுக்கான ஆர்கானிக் பருத்தி ஹூடி',
  'Kids Everyday Tee': 'குழந்தைகளுக்கான தினசரி டீ-ஷர்ட்',
  'Kids Pull-On Shorts': 'குழந்தைகளுக்கான புல்-ஆன் ஷார்ட்ஸ்',
  'Kids Stretch Jeans': 'குழந்தைகளுக்கான ஸ்ட்ரெச் ஜீன்ஸ்',
  'Kids Twirl Dress': 'குழந்தைகளுக்கான சுழல் டிரஸ்',

  // products — descriptions
  'A dense, drapey tee cut slightly boxy with a ribbed collar that holds its shape wash after wash. Garment-dyed for a lived-in softness from day one.':
    'அடர்த்தியான, அழகாகத் தொங்கும் துணியில் சற்று பாக்ஸி வெட்டுடன் கூடிய டீ-ஷர்ட்; ரிப் காலர் ஒவ்வொரு துவைப்பிற்குப் பிறகும் வடிவம் மாறாது. தைத்த பின் சாயமிடப்பட்டதால் முதல் நாளிலிருந்தே பழகிய மென்மை.',
  'The easy, no-fuss pocket tee. Mid-weight jersey, relaxed through the body, finished with a single chest pocket.':
    'எளிமையான, சிரமமில்லாத பாக்கெட் டீ-ஷர்ட். நடுத்தர எடை ஜெர்சி, உடலுக்குத் தளர்வான பொருத்தம், மார்பில் ஒற்றை பாக்கெட்.',
  'A washed oxford with a soft roll collar and a natural, slightly textured hand. Wears well tucked or open over a tee.':
    'மென்மையான ரோல் காலரும், இயற்கையான, லேசான நயமுடைய தொடுவுணர்வும் கொண்ட துவைக்கப்பட்ட ஆக்ஸ்போர்டு. டக் செய்தும் அணியலாம், டீ-ஷர்ட் மேல் திறந்தபடியும் அணியலாம்.',
  'Breezy short-line camp shirt in washed linen. Relaxed shoulders, shell buttons and a gentle drape made for warm days.':
    'துவைக்கப்பட்ட லினனில் காற்றோட்டமான, குட்டையான கேம்ப் ஷர்ட். தளர்வான தோள்கள், சிப்பி பட்டன்கள், வெயில் நாட்களுக்கேற்ற மென்மையான தொங்கல்.',
  'Fine-gauge merino that layers under a jacket yet is warm enough on its own. Naturally temperature regulating and itch-free.':
    'ஜாக்கெட்டின் கீழ் அணிய ஏற்ற, தனியாக அணிந்தாலும் போதுமான கதகதப்பு தரும் நுண்ணிய மெரினோ கம்பளி. இயல்பாகவே வெப்பநிலையைச் சீராக்கும், அரிப்பு இல்லாதது.',
  'A heritage cable pattern knitted in a generous, cosy gauge. Roomy fit with ribbed trims.':
    'தாராளமான, கதகதப்பான பின்னலில் பாரம்பரிய கேபிள் வடிவம். விசாலமான பொருத்தம், ரிப் ஓரங்கள்.',
  'Lightly quilted, water-repellent and packed with four utility pockets. The jacket you reach for from October to March.':
    'லேசாக குவில்ட் செய்யப்பட்டது, நீர் ஒட்டாதது, நான்கு பயனுள்ள பாக்கெட்டுகளுடன். அக்டோபர் முதல் மார்ச் வரை நீங்கள் தேடி அணியும் ஜாக்கெட்.',
  'Weather-ready waxed canvas that ages beautifully. Corduroy collar, storm flap and a full cotton lining.':
    'எந்த வானிலைக்கும் தயாரான, காலப்போக்கில் இன்னும் அழகாகும் மெழுகு பூசிய கேன்வாஸ். கார்டுராய் காலர், புயல் மடிப்பு, முழு பருத்தி உள்புறணி.',
  'A classic straight leg in rigid selvedge that softens and fades to you. Mid rise, five-pocket, cut to sit just above the ankle.':
    'அணிய அணிய உங்களுக்கேற்ப மென்மையாகி நிறம் மங்கும் உறுதியான செல்வெட்ஜில் கிளாசிக் ஸ்ட்ரெயிட் லெக். மிட் ரைஸ், ஐந்து பாக்கெட்டுகள், கணுக்காலுக்குச் சற்று மேலே முடியும் வெட்டு.',
  'A relaxed single-pleat chino with a tapered leg and a touch of stretch for easy movement.':
    'கீழே குறுகும் கால் அமைப்பும், எளிதாக அசைய லேசான நெகிழ்வும் கொண்ட தளர்வான ஒற்றை-ப்ளீட் சினோ.',
  'Land-to-water shorts that dry in minutes. Drawcord waist, zip pocket and a 7" inseam.':
    'நிலத்திலும் நீரிலும் அணியலாம், நிமிடங்களில் உலரும் ஷார்ட்ஸ். நாடா இடுப்பு, ஜிப் பாக்கெட், 7" உள்தையல் நீளம்.',
  'A fluid wrap silhouette with a defined waist and a swishy midi hem. Easily goes from desk to dinner.':
    'தெளிவான இடுப்பு அமைப்பும், அசைந்தாடும் மிடி ஓரமும் கொண்ட மென்மையான ரேப் வடிவம். அலுவலகத்திலிருந்து இரவு விருந்து வரை எளிதாகப் பொருந்தும்.',
  'Minimal, cool and just a little undone. Adjustable straps and a bias-cut skirt that moves.':
    'எளிமையானது, குளுமையானது, சற்றே இயல்பான தோற்றம். சரிசெய்யக்கூடிய ஸ்ட்ராப்கள், அசைவுடன் ஆடும் பயஸ்-கட் ஸ்கர்ட்.',
  'A close but comfortable rib that skims the body, finishing just below the knee.':
    'உடலை ஒட்டியும் வசதியாகவும் தழுவும் ரிப் பின்னல், முழங்காலுக்குச் சற்று கீழே முடிகிறது.',
  'A cropped-at-the-hip, boxy tee with a clean neckline. The one you will wear on repeat.':
    'இடுப்பு வரை நீளம், பாக்ஸி வெட்டு, நேர்த்தியான கழுத்துப் பகுதி. மீண்டும் மீண்டும் அணிய விரும்பும் டீ-ஷர்ட்.',
  'Crisp, oversized and endlessly versatile. Drop shoulders and a curved hem for tucking or wearing loose.':
    'மிருதுவான, ஓவர்சைஸ், பல விதமாக அணியக்கூடியது. டிராப் ஷோல்டர்கள், டக் செய்யவோ தளர்வாக விடவோ ஏற்ற வளைந்த ஓரம்.',
  'Featherlight and luxuriously soft. A slightly cropped fit with a wide funnel neck.':
    'இறகு போல் லேசானது, ஆடம்பரமான மென்மை. அகலமான ஃபனல் நெக்குடன் சற்று குட்டையான பொருத்தம்.',
  'A slouchy cardigan with deep pockets and horn-effect buttons.':
    'ஆழமான பாக்கெட்டுகளும் கொம்பு போன்ற தோற்றமுடைய பட்டன்களும் கொண்ட தளர்வான கார்டிகன்.',
  'Knife pleats that fall beautifully and travel without creasing. Elasticated back waist.':
    'அழகாக விழும், பயணத்திலும் கசங்காத நைஃப் ப்ளீட்கள். பின்புறம் எலாஸ்டிக் இடுப்பு.',
  'High-rise, fluid and full-length. Hidden zip, front pleats and slanted pockets.':
    'ஹை-ரைஸ், மென்மையாகப் பாயும், முழு நீளம். மறைவான ஜிப், முன்புற ப்ளீட்கள், சாய்வான பாக்கெட்டுகள்.',
  'Rigid-feel denim in a flattering high-rise with a straight, ankle-skimming leg.':
    'உறுதியான உணர்வுடைய டெனிம்; அழகு சேர்க்கும் ஹை-ரைஸ், கணுக்கால் வரை நேரான கால் அமைப்பு.',
  'The modern trench: relaxed through the shoulder, double-breasted, finished with a storm flap and removable belt.':
    'நவீன ட்ரெஞ்ச்: தோள்களில் தளர்வானது, டபுள்-பிரெஸ்டட், புயல் மடிப்பும் கழற்றக்கூடிய பெல்ட்டும் கொண்டது.',
  'Lightweight warmth with zero bulk. A cropped hem that layers over everything.':
    'கனமில்லாத கதகதப்பு, பருமன் சிறிதும் இல்லை. எதன் மேலும் அணியக்கூடிய குட்டையான ஓரம்.',
  'Brushed-back fleece, a roomy kangaroo pocket and reinforced seams for rough-and-tumble days.':
    'உள்புறம் மென்மையாக்கப்பட்ட ஃப்ளீஸ், விசாலமான கங்காரு பாக்கெட், ஓடியாடும் நாட்களுக்காக வலுவூட்டப்பட்ட தையல்கள்.',
  'Soft, stretchy and tagless. Colour-fast so it survives the school year.':
    'மென்மையானது, நெகிழ்வானது, டேக் இல்லாதது. நிறம் மங்காததால் பள்ளி ஆண்டு முழுவதும் தாங்கும்.',
  'Elastic waist, deep pockets and a durable twill built for climbing.':
    'எலாஸ்டிக் இடுப்பு, ஆழமான பாக்கெட்டுகள், ஏறி விளையாட ஏற்ற உறுதியான ட்வில்.',
  'Adjustable inner waistband and extra-flexible denim for growing kids.':
    'வளரும் குழந்தைகளுக்காக சரிசெய்யக்கூடிய உள் இடுப்புப்பட்டை, கூடுதல் நெகிழ்வான டெனிம்.',
  'A swingy cotton dress with pockets, naturally. Soft enough for all-day wear.':
    'சுழன்றாடும் பருத்தி டிரஸ் — பாக்கெட்டுகளுடன், நிச்சயமாக. நாள் முழுவதும் அணியும் அளவுக்கு மென்மையானது.',

  // products — materials
  '100% organic cotton, 220gsm': '100% ஆர்கானிக் பருத்தி, 220gsm',
  '100% combed cotton jersey': '100% சீவப்பட்ட பருத்தி ஜெர்சி',
  '100% cotton oxford': '100% பருத்தி ஆக்ஸ்போர்டு',
  '100% European flax linen': '100% ஐரோப்பிய ஆளி லினன்',
  '100% extra-fine merino wool': '100% மிக நுண்ணிய மெரினோ கம்பளி',
  '70% wool, 30% recycled nylon': '70% கம்பளி, 30% மறுசுழற்சி செய்யப்பட்ட நைலான்',
  'Recycled nylon shell, recycled polyester fill':
    'மறுசுழற்சி செய்யப்பட்ட நைலான் வெளிப்புறம், மறுசுழற்சி செய்யப்பட்ட பாலியெஸ்டர் நிரப்பு',
  'Waxed 100% cotton canvas': 'மெழுகு பூசிய 100% பருத்தி கேன்வாஸ்',
  '13oz Japanese selvedge denim': '13oz ஜப்பானிய செல்வெட்ஜ் டெனிம்',
  '98% cotton twill, 2% elastane': '98% பருத்தி ட்வில், 2% எலாஸ்டேன்',
  'Quick-dry stretch nylon': 'விரைவில் உலரும் ஸ்ட்ரெச் நைலான்',
  '100% viscose crepe': '100% விஸ்கோஸ் க்ரேப்',
  '100% washed linen': '100% துவைக்கப்பட்ட லினன்',
  '55% cotton, 45% viscose': '55% பருத்தி, 45% விஸ்கோஸ்',
  '100% organic cotton': '100% ஆர்கானிக் பருத்தி',
  '100% cotton poplin': '100% பருத்தி பாப்ளின்',
  '30% cashmere, 70% merino': '30% காஷ்மீர், 70% மெரினோ கம்பளி',
  '80% wool, 20% nylon': '80% கம்பளி, 20% நைலான்',
  'Recycled polyester satin': 'மறுசுழற்சி செய்யப்பட்ட பாலியெஸ்டர் சாடின்',
  '64% recycled polyester, 34% viscose, 2% elastane':
    '64% மறுசுழற்சி செய்யப்பட்ட பாலியெஸ்டர், 34% விஸ்கோஸ், 2% எலாஸ்டேன்',
  '100% organic cotton denim': '100% ஆர்கானிக் பருத்தி டெனிம்',
  'Cotton-blend gabardine': 'பருத்திக் கலவை கேபர்டின்',
  'Recycled nylon, recycled fill': 'மறுசுழற்சி செய்யப்பட்ட நைலான், மறுசுழற்சி செய்யப்பட்ட நிரப்பு',
  '100% organic cotton fleece': '100% ஆர்கானிக் பருத்தி ஃப்ளீஸ்',
  '100% organic cotton jersey': '100% ஆர்கானிக் பருத்தி ஜெர்சி',
  '100% cotton twill': '100% பருத்தி ட்வில்',
  '98% cotton, 2% elastane': '98% பருத்தி, 2% எலாஸ்டேன்',
  '100% organic cotton poplin': '100% ஆர்கானிக் பருத்தி பாப்ளின்',

  // care
  'Machine wash cold, inside out':
    'உட்புறம் வெளியே திருப்பி, குளிர்ந்த நீரில் மெஷினில் துவைக்கவும்',
  'Tumble dry low': 'குறைந்த வெப்பத்தில் டம்பிள் ட்ரை செய்யவும்',
  'Warm iron if needed': 'தேவைப்பட்டால் மிதமான சூட்டில் இஸ்திரி செய்யவும்',
  'Machine wash cold, gentle cycle': 'குளிர்ந்த நீரில், மென்மையான சுழற்சியில் மெஷினில் துவைக்கவும்',
  'Line dry': 'கொடியில் உலர்த்தவும்',
  'Iron while slightly damp': 'லேசான ஈரம் இருக்கும்போதே இஸ்திரி செய்யவும்',
  'Hand wash cool or dry clean': 'குளிர்ந்த நீரில் கையால் துவைக்கவும் அல்லது டிரை க்ளீன் செய்யவும்',
  'Dry flat, reshape while damp':
    'தட்டையாக வைத்து உலர்த்தவும்; ஈரமாக இருக்கும்போதே வடிவத்தைச் சரிசெய்யவும்',
  'Do not tumble dry': 'டம்பிள் ட்ரை செய்ய வேண்டாம்',
  'Spot clean or dry clean':
    'கறை உள்ள இடத்தை மட்டும் சுத்தம் செய்யவும் அல்லது டிரை க்ளீன் செய்யவும்',
  'Cool iron on reverse side': 'பின்பக்கத்தில் குறைந்த சூட்டில் இஸ்திரி செய்யவும்',
  'Wash cold, inside out, infrequently':
    'அடிக்கடி துவைக்க வேண்டாம்; உட்புறம் வெளியே திருப்பி, குளிர்ந்த நீரில் துவைக்கவும்',
  'Do not bleach': 'ப்ளீச் செய்ய வேண்டாம்',

  // details
  'True to size — see our size guide': 'சரியான அளவு — எங்கள் அளவு வழிகாட்டியைப் பார்க்கவும்',
  'Sized for ages 4–12': '4–12 வயதினருக்கான அளவுகள்',
  'Responsibly sourced materials': 'பொறுப்புடன் பெறப்பட்ட மூலப்பொருட்கள்',
  'Designed in-house, ethically made':
    'எங்கள் குழுவால் வடிவமைக்கப்பட்டது, நெறிமுறையுடன் தயாரிக்கப்பட்டது',

  // reviews
  'Exactly what I wanted': 'நான் எதிர்பார்த்தது இதுதான்',
  'The quality is excellent and the fit is spot on. Washes beautifully and has not lost its shape.':
    'தரம் அருமை, பொருத்தமும் கச்சிதம். அழகாகத் துவைபடுகிறது, வடிவமும் மாறவில்லை.',
  'Worth every penny': 'கொடுத்த ஒவ்வொரு ரூபாய்க்கும் மதிப்பு',
  'Fabric feels premium and the colour is even better in person. Already ordered a second one.':
    'துணி பிரீமியமாக இருக்கிறது, நிறம் நேரில் இன்னும் அழகு. ஏற்கனவே இன்னொன்று ஆர்டர் செய்துவிட்டேன்.',
  'Great, runs slightly large': 'அருமை, ஆனால் அளவு சற்று பெரியது',
  'Love the cut and the weight of the fabric. I would size down if you are between sizes.':
    'வெட்டும் துணியின் கனமும் மிகவும் பிடித்திருக்கிறது. இரண்டு அளவுகளுக்கு இடையில் இருந்தால், ஒரு அளவு சிறியதைத் தேர்ந்தெடுங்கள்.',
  'Lovely and well made': 'அழகானது, நேர்த்தியாகத் தயாரிக்கப்பட்டது',
  'Stitching is neat and it feels substantial. Delivery was quick too.':
    'தையல் நேர்த்தியாக உள்ளது, உறுதியாகவும் இருக்கிறது. டெலிவரியும் விரைவாக வந்தது.',
  'Good but not perfect': 'நல்லது, ஆனால் முழுமையானதல்ல',
  'Nice material, though the length was a bit shorter than I expected. Still a good buy.':
    'நல்ல துணி, ஆனால் நான் எதிர்பார்த்ததை விட நீளம் சற்று குறைவு. இருந்தாலும் வாங்கத் தகுந்தது.',
  'My new favourite': 'என் புதிய விருப்பம்',
  'Comfortable from the first wear. Have had many compliments already.':
    'முதல் முறை அணிந்ததிலிருந்தே வசதியாக இருக்கிறது. ஏற்கனவே பலர் பாராட்டியுள்ளனர்.',

  // coupons
  '10% off your order': 'உங்கள் ஆர்டருக்கு 10% தள்ளுபடி',
  '₹500 off orders over ₹3,999': '₹3,999-க்கு மேற்பட்ட ஆர்டர்களுக்கு ₹500 தள்ளுபடி',
  'Free shipping on orders over ₹999': '₹999-க்கு மேற்பட்ட ஆர்டர்களுக்கு இலவச டெலிவரி',
  '25% off orders over ₹4,999': '₹4,999-க்கு மேற்பட்ட ஆர்டர்களுக்கு 25% தள்ளுபடி',
  'Fully redeemed': 'முழுமையாகப் பயன்படுத்தப்பட்டது',
};

export default ta;
