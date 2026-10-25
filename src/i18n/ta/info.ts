// Tamil — info pages (privacy, terms, shipping & returns, not found).
const ta: Record<string, string> = {
  // privacy
  'Privacy policy': 'தனியுரிமைக் கொள்கை',
  'We collect only what we need to fulfil your orders and improve your experience: your name, contact details, delivery addresses and order history.':
    'உங்கள் ஆர்டர்களை நிறைவேற்றவும் உங்கள் அனுபவத்தை மேம்படுத்தவும் தேவையானவற்றை மட்டுமே நாங்கள் சேகரிக்கிறோம்: உங்கள் பெயர், தொடர்பு விவரங்கள், டெலிவரி முகவரிகள் மற்றும் ஆர்டர் வரலாறு.',
  Payments: 'கட்டணங்கள்',
  'Card details are sent directly to our PCI-DSS compliant payment provider. ASG never sees or stores your full card number.':
    'அட்டை விவரங்கள் PCI-DSS இணக்கமான எங்கள் கட்டண வழங்குநருக்கு நேரடியாக அனுப்பப்படுகின்றன. ASG உங்கள் முழு அட்டை எண்ணைப் பார்ப்பதோ சேமிப்பதோ இல்லை.',
  Cookies: 'குக்கீகள்',
  'We use essential storage to remember your bag, wishlist and preferences. Analytics cookies are only set with your consent.':
    'உங்கள் பை, விருப்பப்பட்டியல் மற்றும் விருப்பத்தேர்வுகளை நினைவில் கொள்ள அத்தியாவசிய சேமிப்பகத்தைப் பயன்படுத்துகிறோம். பகுப்பாய்வு குக்கீகள் உங்கள் ஒப்புதலுடன் மட்டுமே அமைக்கப்படும்.',
  'Your rights': 'உங்கள் உரிமைகள்',
  'You can request a copy of your data or ask us to delete your account at any time by contacting {email}.':
    '{email} என்ற முகவரியைத் தொடர்புகொண்டு, எப்போது வேண்டுமானாலும் உங்கள் தரவின் நகலைக் கோரலாம் அல்லது உங்கள் கணக்கை நீக்குமாறு கேட்கலாம்.',

  // terms
  'Terms of service': 'சேவை விதிமுறைகள்',
  'By placing an order you agree to these terms. Prices include applicable discounts and are confirmed at checkout; taxes and delivery are shown before you pay.':
    'ஆர்டர் செய்வதன் மூலம் இந்த விதிமுறைகளை நீங்கள் ஏற்றுக்கொள்கிறீர்கள். விலைகளில் பொருந்தும் தள்ளுபடிகள் அடங்கும், அவை செக்அவுட்டில் உறுதிப்படுத்தப்படும்; வரிகளும் டெலிவரி கட்டணமும் நீங்கள் பணம் செலுத்தும் முன் காட்டப்படும்.',
  'An order is accepted once payment is confirmed by our payment provider. If an item becomes unavailable we will refund you in full.':
    'எங்கள் கட்டண வழங்குநர் கட்டணத்தை உறுதிப்படுத்தியவுடன் ஆர்டர் ஏற்றுக்கொள்ளப்படும். ஏதேனும் பொருள் கிடைக்காமல் போனால், முழுத் தொகையையும் திருப்பித் தருவோம்.',
  'Pricing errors': 'விலைப் பிழைகள்',
  'Prices are verified on our servers at the moment you pay. If a price changes during checkout, we will ask you to review the new total before charging you.':
    'நீங்கள் பணம் செலுத்தும் தருணத்தில் விலைகள் எங்கள் சர்வர்களில் சரிபார்க்கப்படுகின்றன. செக்அவுட்டின் போது விலை மாறினால், கட்டணம் வசூலிக்கும் முன் புதிய மொத்தத்தைச் சரிபார்க்குமாறு உங்களிடம் கேட்போம்.',

  // shipping & returns
  'Delivery options': 'டெலிவரி விருப்பங்கள்',
  'Standard (4–6 business days): ₹99, free on orders over ₹1,999':
    'நிலையானது (4–6 வேலை நாட்கள்): ₹99, ₹1,999-க்கு மேற்பட்ட ஆர்டர்களுக்கு இலவசம்',
  'Express (2–3 business days): ₹199': 'விரைவு (2–3 வேலை நாட்கள்): ₹199',
  'Next day (order before 2pm): ₹349': 'அடுத்த நாள் (மதியம் 2 மணிக்கு முன் ஆர்டர் செய்யவும்): ₹349',
  Returns: 'திருப்பி அனுப்புதல்',
  'Return unworn items with tags within 7 days of delivery for a full refund. Start a return from your order in My account and we’ll email a prepaid label.':
    'டெலிவரியான 7 நாட்களுக்குள், அணியாத பொருட்களை டேக்குகளுடன் திருப்பி அனுப்பினால் முழுத் தொகையும் திருப்பித் தரப்படும். என் கணக்கு பகுதியில் உள்ள உங்கள் ஆர்டரிலிருந்து திருப்பி அனுப்புதலைத் தொடங்குங்கள்; முன்கட்டணம் செலுத்திய லேபிளை மின்னஞ்சலில் அனுப்புவோம்.',
  Refunds: 'பணத்தைத் திருப்பித் தருதல்',
  'Refunds are issued to your original payment method within 5 business days of us receiving your return.':
    'நீங்கள் திருப்பி அனுப்பிய பொருள் எங்களுக்குக் கிடைத்த 5 வேலை நாட்களுக்குள், நீங்கள் பணம் செலுத்திய அசல் முறைக்கே பணம் திருப்பித் தரப்படும்.',

  // not found
  'Page not found': 'பக்கம் கிடைக்கவில்லை',
  'We can’t find that page': 'அந்தப் பக்கத்தைக் கண்டுபிடிக்க முடியவில்லை',
  'The link may be broken or the page may have moved.':
    'இணைப்பு உடைந்திருக்கலாம் அல்லது பக்கம் இடம் மாறியிருக்கலாம்.',
  'Back to home': 'முகப்புக்குத் திரும்பு',
};

export default ta;
