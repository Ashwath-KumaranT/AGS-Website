// Tamil — validation, coupon, server/API, payment and notification messages.
// The English stays in the service code; these entries are matched with tm() /
// translateMessage(), and {placeholders} let built sentences match too.
const ta: Record<string, string> = {
  /* ---------- zod validation (src/lib/validation.ts) ---------- */
  'Email is required': 'மின்னஞ்சல் தேவை',
  'Enter a valid email address': 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்',
  'Enter a valid email': 'சரியான மின்னஞ்சலை உள்ளிடவும்',
  'Use at least 8 characters': 'குறைந்தது 8 எழுத்துகளைப் பயன்படுத்தவும்',
  'Include at least one letter': 'குறைந்தது ஒரு எழுத்தையாவது சேர்க்கவும்',
  'Include at least one number': 'குறைந்தது ஒரு எண்ணையாவது சேர்க்கவும்',
  'Phone number is required': 'தொலைபேசி எண் தேவை',
  'Enter a valid phone number': 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்',
  'Password is required': 'கடவுச்சொல் தேவை',
  'Enter your full name': 'உங்கள் முழுப் பெயரை உள்ளிடவும்',
  'Confirm your password': 'உங்கள் கடவுச்சொல்லை உறுதிப்படுத்தவும்',
  'Passwords do not match': 'கடவுச்சொற்கள் பொருந்தவில்லை',
  'Enter the recipient name': 'பெறுநரின் பெயரை உள்ளிடவும்',
  'Enter your street address': 'உங்கள் தெரு முகவரியை உள்ளிடவும்',
  'Enter your city': 'உங்கள் நகரத்தை உள்ளிடவும்',
  'Enter your state / region': 'உங்கள் மாநிலம் / பகுதியை உள்ளிடவும்',
  'Enter your postal code': 'உங்கள் அஞ்சல் குறியீட்டை உள்ளிடவும்',
  'Select a country': 'ஒரு நாட்டைத் தேர்ந்தெடுக்கவும்',
  'Enter a valid postal code for the selected country':
    'தேர்ந்தெடுத்த நாட்டுக்கான சரியான அஞ்சல் குறியீட்டை உள்ளிடவும்',
  'Enter a valid card number': 'சரியான அட்டை எண்ணை உள்ளிடவும்',
  'Enter the name on the card': 'அட்டையில் உள்ள பெயரை உள்ளிடவும்',
  'Use MM/YY': 'MM/YY வடிவத்தைப் பயன்படுத்தவும்',
  'This card has expired': 'இந்த அட்டை காலாவதியாகிவிட்டது',
  'Enter the 3 or 4 digit code': '3 அல்லது 4 இலக்கக் குறியீட்டை உள்ளிடவும்',
  'Choose a rating': 'ஒரு மதிப்பீட்டைத் தேர்ந்தெடுக்கவும்',
  'Add a short title': 'ஒரு சிறிய தலைப்பைச் சேர்க்கவும்',
  'Tell us a little more (10+ characters)': 'இன்னும் சற்று விரிவாகச் சொல்லுங்கள் (10+ எழுத்துகள்)',
  // zod's built-in messages (max length on line2 / review / return note)
  'Too big: expected string to have <={max} characters':
    'மிக நீளமானது: அதிகபட்சம் {max} எழுத்துகள் மட்டுமே அனுமதிக்கப்படும்',
  'Invalid input: expected {expected}, received {received}':
    'தவறான உள்ளீடு: {expected} எதிர்பார்க்கப்பட்டது, {received} பெறப்பட்டது',
  'Invalid option: expected one of {options}':
    'தவறான தேர்வு: {options} — இவற்றில் ஒன்றைத் தேர்ந்தெடுக்கவும்',

  // checkout address step
  'This saved address is incomplete. Edit it in your account or choose another.':
    'இந்தச் சேமித்த முகவரி முழுமையாக இல்லை. உங்கள் கணக்கில் அதைத் திருத்தவும் அல்லது வேறொன்றைத் தேர்ந்தெடுக்கவும்.',
  'Could not save your address.': 'உங்கள் முகவரியைச் சேமிக்க முடியவில்லை.',

  /* ---------- coupons (src/lib/pricing.ts checkCoupon + seed descriptions) ---------- */
  'That code is not valid.': 'அந்தக் குறியீடு செல்லாது.',
  'Code {code} has expired.': '{code} குறியீடு காலாவதியாகிவிட்டது.',
  'Code {code} has reached its usage limit.':
    '{code} குறியீடு அதன் பயன்பாட்டு வரம்பை எட்டிவிட்டது.',
  'Add {amount} more to use {code}.': '{code} குறியீட்டைப் பயன்படுத்த மேலும் {amount} சேர்க்கவும்.',
  '10% off your order': 'உங்கள் ஆர்டருக்கு 10% தள்ளுபடி',
  '₹500 off orders over ₹3,999': '₹3,999-க்கு மேற்பட்ட ஆர்டர்களுக்கு ₹500 தள்ளுபடி',
  'Free shipping on orders over ₹999': '₹999-க்கு மேற்பட்ட ஆர்டர்களுக்கு இலவச டெலிவரி',
  '25% off orders over ₹4,999': '₹4,999-க்கு மேற்பட்ட ஆர்டர்களுக்கு 25% தள்ளுபடி',
  'Fully redeemed': 'முழுமையாகப் பயன்படுத்தப்பட்டது',

  /* ---------- delivery check (src/lib/delivery.ts) ---------- */
  'Enter a valid postal code.': 'சரியான அஞ்சல் குறியீட்டை உள்ளிடவும்.',
  "Sorry, we don't deliver to this area yet.":
    'மன்னிக்கவும், இந்தப் பகுதிக்கு நாங்கள் இன்னும் டெலிவரி செய்வதில்லை.',
  'Delivery available.': 'டெலிவரி கிடைக்கும்.',

  /* ---------- quote issues + order API errors (mock server / supabase) ---------- */
  'An item is no longer available.': 'ஒரு பொருள் இனி கிடைக்காது.',
  '{title} ({color}, {size}) is sold out.': '{title} ({color}, {size}) விற்றுத் தீர்ந்துவிட்டது.',
  'Only {count} left of {title} ({color}, {size}).':
    '{title} ({color}, {size}) — {count} மட்டுமே மீதமுள்ளன.',
  'Enter a valid contact email.': 'சரியான தொடர்பு மின்னஞ்சலை உள்ளிடவும்.',
  'The delivery address is invalid.': 'டெலிவரி முகவரி தவறானது.',
  'Your cart is empty.': 'உங்கள் பை காலியாக உள்ளது.',
  "We don't deliver to this postal code yet.":
    'இந்த அஞ்சல் குறியீட்டுக்கு நாங்கள் இன்னும் டெலிவரி செய்வதில்லை.',
  'Prices changed since you last reviewed your order.':
    'நீங்கள் கடைசியாக ஆர்டரைச் சரிபார்த்த பிறகு விலைகள் மாறிவிட்டன.',
  'Item not found': 'பொருள் கிடைக்கவில்லை',
  'Order not found.': 'ஆர்டர் கிடைக்கவில்லை.',
  'This order can no longer be paid.': 'இந்த ஆர்டருக்கு இனி பணம் செலுத்த முடியாது.',
  'Invalid webhook signature': 'செல்லாத webhook கையொப்பம்',
  'This order has already shipped and can no longer be cancelled.':
    'இந்த ஆர்டர் ஏற்கனவே அனுப்பப்பட்டுவிட்டதால் இனி ரத்துசெய்ய முடியாது.',
  'Returns can be requested once an order has been delivered.':
    'ஆர்டர் டெலிவரி செய்யப்பட்ட பிறகே திருப்பி அனுப்புதலைக் கோர முடியும்.',
  'Select at least one item.': 'குறைந்தது ஒரு பொருளைத் தேர்ந்தெடுக்கவும்.',
  'Please sign in to write a review.': 'மதிப்புரை எழுத உள்நுழையவும்.',
  'Invalid address': 'தவறான முகவரி',
  'Address not found': 'முகவரி கிடைக்கவில்லை',

  /* ---------- auth / session ---------- */
  'Could not start a session.': 'அமர்வைத் தொடங்க முடியவில்லை.',
  'This reset link is invalid or has expired.':
    'இந்த மீட்டமைப்பு இணைப்பு செல்லாது அல்லது காலாவதியாகிவிட்டது.',
  'Your session has expired. Please sign in again.':
    'உங்கள் அமர்வு காலாவதியாகிவிட்டது. மீண்டும் உள்நுழையவும்.',
  'Please sign in to continue.': 'தொடர உள்நுழையவும்.',
  'Check your inbox to confirm your email, then sign in.':
    'உங்கள் மின்னஞ்சலை உறுதிப்படுத்த இன்பாக்ஸைப் பார்த்து, பிறகு உள்நுழையவும்.',
  'Could not load your profile.': 'உங்கள் சுயவிவரத்தை ஏற்ற முடியவில்லை.',

  /* ---------- payments ---------- */
  'Your card was declined.': 'உங்கள் அட்டை நிராகரிக்கப்பட்டது.',
  'Your card has insufficient funds.': 'உங்கள் அட்டையில் போதுமான இருப்பு இல்லை.',
  'Your card has expired.': 'உங்கள் அட்டை காலாவதியாகிவிட்டது.',
  'Your card security code is incorrect.': 'உங்கள் அட்டையின் பாதுகாப்புக் குறியீடு தவறானது.',
  'Enter your card details.': 'உங்கள் அட்டை விவரங்களை உள்ளிடவும்.',
  'Your card number is invalid.': 'உங்கள் அட்டை எண் தவறானது.',
  'Payment provider unavailable.': 'கட்டண வழங்குநர் தற்போது கிடைக்கவில்லை.',

  /* ---------- tracking events (labels + locations stored on orders) ---------- */
  'Packed and ready to ship': 'பேக் செய்யப்பட்டு அனுப்பத் தயாராக உள்ளது',
  'ASG Fulfilment Centre': 'ASG விநியோக மையம்',
  'Shipped with carrier': 'கூரியர் மூலம் அனுப்பப்பட்டது',
  'Regional Hub': 'பிராந்திய மையம்',
  'Local Depot': 'உள்ளூர் கிடங்கு',
  'Delivery address': 'டெலிவரி முகவரி',
  'Order cancelled — refund issued': 'ஆர்டர் ரத்துசெய்யப்பட்டது — பணம் திருப்பித் தரப்பட்டது',

  /* ---------- notifications ---------- */
  'Order {number} confirmed': 'ஆர்டர் {number} உறுதிசெய்யப்பட்டது',
  'Thanks for your order — we are getting it ready to ship.':
    'உங்கள் ஆர்டருக்கு நன்றி — அதை அனுப்பத் தயார் செய்கிறோம்.',
  'Order {number}: {label}': 'ஆர்டர் {number}: {label}',
  'Tap to track your parcel.': 'உங்கள் பார்சலைக் கண்காணிக்கத் தட்டவும்.',
  'Order {number} cancelled': 'ஆர்டர் {number} ரத்துசெய்யப்பட்டது',
  'Your refund is on its way.': 'உங்கள் பணம் திருப்பித் தரப்படுகிறது.',
  // demo notifications (seedDemo.ts)
  'Order {number} has shipped': 'ஆர்டர் {number} அனுப்பப்பட்டது',
  'Your {title} is on its way.': 'உங்கள் {title} உங்களை நோக்கி வந்துகொண்டிருக்கிறது.',
  'Welcome gift': 'வரவேற்புப் பரிசு',
  'Use code WELCOME10 for 10% off your next order.':
    'உங்கள் அடுத்த ஆர்டருக்கு 10% தள்ளுபடி பெற WELCOME10 குறியீட்டைப் பயன்படுத்தவும்.',

  'The 7-day return window for this order has closed.':
    'இந்த ஆர்டருக்கான 7 நாள் திருப்பி அனுப்பும் காலம் முடிந்துவிட்டது.',
  'Those items are not part of this order.':
    'அந்தப் பொருட்கள் இந்த ஆர்டரில் இல்லை.',
  'A return has already been requested for one of those items.':
    'அந்தப் பொருட்களில் ஒன்றுக்கு ஏற்கெனவே திருப்பி அனுப்பும் கோரிக்கை வைக்கப்பட்டுள்ளது.',
  'That payment attempt did not go through.': 'அந்தக் கட்டண முயற்சி நிறைவடையவில்லை.',
  'Payment was not completed in time.': 'கட்டணம் குறித்த நேரத்தில் முடிக்கப்படவில்லை.',
};

export default ta;
