// Tamil — account area (overview, orders, profile, addresses, payments, coupons, returns, notifications) and password reset.
const ta: Record<string, string> = {
  // account layout + nav
  Account: 'கணக்கு',
  Overview: 'மேலோட்டம்',
  Orders: 'ஆர்டர்கள்',
  Profile: 'சுயவிவரம்',
  Addresses: 'முகவரிகள்',
  'Payment methods': 'கட்டண முறைகள்',
  Coupons: 'கூப்பன்கள்',
  'Returns & refunds': 'திருப்பி அனுப்புதல் & பணத்திரும்பல்',
  Notifications: 'அறிவிப்புகள்',
  'Sign out': 'வெளியேறு',
  'You’ve been signed out': 'நீங்கள் வெளியேறிவிட்டீர்கள்',
  Loading: 'ஏற்றப்படுகிறது',

  // overview
  'Hello, {name}': 'வணக்கம், {name}',
  'Manage your orders, details and preferences.':
    'உங்கள் ஆர்டர்கள், விவரங்கள் மற்றும் விருப்பத்தேர்வுகளை நிர்வகிக்கவும்.',
  'Unread notifications': 'படிக்காத அறிவிப்புகள்',
  'Latest order': 'சமீபத்திய ஆர்டர்',
  'All orders': 'அனைத்து ஆர்டர்களும்',
  'No orders yet.': 'இதுவரை ஆர்டர்கள் இல்லை.',
  'Start shopping': 'ஷாப்பிங்கைத் தொடங்கு',

  // profile
  'Member since {date}': '{date} முதல் உறுப்பினர்',
  'Contact support to change your sign-in email.':
    'உங்கள் உள்நுழைவு மின்னஞ்சலை மாற்ற உதவியைத் தொடர்புகொள்ளவும்.',
  'Phone (optional)': 'தொலைபேசி (விருப்பத்தேர்வு)',
  'Save changes': 'மாற்றங்களைச் சேமி',
  'We’ll email you a secure link to set a new password.':
    'புதிய கடவுச்சொல்லை அமைக்க, பாதுகாப்பான இணைப்பை உங்களுக்கு மின்னஞ்சல் செய்வோம்.',
  'Reset password': 'கடவுச்சொல்லை மீட்டமை',
  'Profile updated': 'சுயவிவரம் புதுப்பிக்கப்பட்டது',
  'Could not update profile': 'சுயவிவரத்தைப் புதுப்பிக்க முடியவில்லை',

  // orders list
  'Loading orders': 'ஆர்டர்கள் ஏற்றப்படுகின்றன',
  'No orders yet': 'இதுவரை ஆர்டர்கள் இல்லை',
  'When you place an order, it’ll show up here.':
    'நீங்கள் ஆர்டர் செய்யும்போது, அது இங்கே காட்டப்படும்.',
  'Order {number}': 'ஆர்டர் {number}',
  'Placed {date}': '{date} அன்று ஆர்டர் செய்யப்பட்டது',
  '{count} item': '{count} பொருள்',
  '{count} items': '{count} பொருட்கள்',

  // order details
  'Order not found': 'ஆர்டர் கிடைக்கவில்லை',
  'Back to orders': 'ஆர்டர்களுக்குத் திரும்பு',
  'Payment for this order failed and you were not charged. Items were returned to stock.':
    'இந்த ஆர்டருக்கான கட்டணம் தோல்வியடைந்தது; உங்களிடம் கட்டணம் வசூலிக்கப்படவில்லை. பொருட்கள் மீண்டும் கையிருப்பில் சேர்க்கப்பட்டன.',
  'Track shipment': 'ஆர்டரைக் கண்காணி',
  'Buy again': 'மீண்டும் வாங்கு',
  'Return or refund': 'திருப்பி அனுப்புதல் அல்லது பணத்தைத் திருப்பித் தருதல்',
  'Cancel this order? You’ll receive a full refund.':
    'இந்த ஆர்டரை ரத்து செய்யவா? முழுத் தொகையும் உங்களுக்குத் திருப்பித் தரப்படும்.',
  'Cancel order': 'ஆர்டரை ரத்து செய்',
  'Contact support': 'உதவியைத் தொடர்புகொள்',
  'We’re here to help': 'உதவ நாங்கள் இருக்கிறோம்',
  'Email care@asg.example or call +1 800 555 0199.':
    'care@asg.example என்ற முகவரிக்கு மின்னஞ்சல் அனுப்பவும் அல்லது +1 800 555 0199 என்ற எண்ணில் அழைக்கவும்.',
  Items: 'பொருட்கள்',
  'Qty {quantity}': 'எண்ணிக்கை {quantity}',
  'Write a review': 'மதிப்புரை எழுது',
  Tax: 'வரி',
  Progress: 'முன்னேற்றம்',
  Delivery: 'டெலிவரி',
  'Est. {range}': 'மதிப்பிடப்பட்டது: {range}',
  Payment: 'கட்டணம்',
  Card: 'அட்டை',
  'Order cancelled': 'ஆர்டர் ரத்து செய்யப்பட்டது',
  'Your refund has been issued.': 'உங்கள் பணம் திருப்பி அனுப்பப்பட்டுள்ளது.',
  'Could not cancel': 'ரத்து செய்ய முடியவில்லை',
  'Items unavailable': 'பொருட்கள் கிடைக்கவில்லை',
  'None of these items are in stock right now.':
    'இவற்றில் எந்தப் பொருளும் தற்போது கையிருப்பில் இல்லை.',
  'Added to bag': 'பையில் சேர்க்கப்பட்டது',
  '{added} of {total} items were available.': '{total} பொருட்களில் {added} மட்டுமே கிடைத்தன.',
  'View bag': 'பையைக் காண்க',

  // payment status (order.payment.status with "_" replaced by a space)
  'requires payment': 'கட்டணம் தேவை',
  succeeded: 'வெற்றிகரமாகச் செலுத்தப்பட்டது',
  failed: 'தோல்வியடைந்தது',
  refunded: 'பணம் திருப்பித் தரப்பட்டது',

  // return dialog
  'Request a return': 'திருப்பி அனுப்பக் கோருங்கள்',
  'Which items?': 'எந்தப் பொருட்கள்?',
  '{title} — {color}, {size} (×{quantity})': '{title} — {color}, {size} (×{quantity})',
  'Select at least one item.': 'குறைந்தது ஒரு பொருளைத் தேர்ந்தெடுக்கவும்.',
  'I’d like a': 'எனக்கு வேண்டியது',
  'Refund to original payment': 'அசல் கட்டண முறைக்குப் பணத்திரும்பல்',
  'Exchange / store credit': 'மாற்றுப் பொருள் / ஸ்டோர் கிரெடிட்',
  Reason: 'காரணம்',
  'Too small': 'மிகச் சிறியது',
  'Too large': 'மிகப் பெரியது',
  'Damaged or defective': 'சேதமடைந்தது அல்லது குறைபாடுள்ளது',
  'Not as described': 'விவரித்தபடி இல்லை',
  'Changed my mind': 'மனம் மாறிவிட்டது',
  'Anything else? (optional)': 'வேறு ஏதேனும்? (விருப்பத்தேர்வு)',
  'Submit request': 'கோரிக்கையைச் சமர்ப்பி',
  'Return requested': 'திருப்பி அனுப்புதல் கோரப்பட்டது',
  'We’ll email you a prepaid label within 24 hours.':
    '24 மணி நேரத்திற்குள் முன்கட்டண லேபிளை உங்களுக்கு மின்னஞ்சல் செய்வோம்.',
  'Could not request return': 'திருப்பி அனுப்புதலைக் கோர முடியவில்லை',

  // tracking
  'Tracking not available': 'கண்காணிப்பு கிடைக்கவில்லை',
  'Tracking appears once your order is confirmed.':
    'உங்கள் ஆர்டர் உறுதிசெய்யப்பட்டதும் கண்காணிப்பு விவரங்கள் தோன்றும்.',
  'Track {number}': '{number} — கண்காணி',
  Track: 'கண்காணி',
  'Track your order': 'உங்கள் ஆர்டரைக் கண்காணிக்கவும்',
  'Tracking no.': 'கண்காணிப்பு எண்',
  Delivered: 'டெலிவரி செய்யப்பட்டது',
  'Estimated delivery': 'மதிப்பிடப்பட்ட டெலிவரி',
  History: 'வரலாறு',
  'Demo mode': 'டெமோ பயன்முறை',
  'There’s no real carrier in the demo — simulate the next tracking update.':
    'டெமோவில் உண்மையான கூரியர் இல்லை — அடுத்த கண்காணிப்பு புதுப்பிப்பை உருவகப்படுத்தவும்.',
  'Simulate next update': 'அடுத்த புதுப்பிப்பை உருவகப்படுத்து',

  // addresses
  'Add address': 'முகவரியைச் சேர்',
  'Edit address': 'முகவரியைத் திருத்து',
  'No saved addresses': 'சேமித்த முகவரிகள் இல்லை',
  'Add an address for faster checkout.': 'விரைவான செக்அவுட்டுக்கு ஒரு முகவரியைச் சேர்க்கவும்.',
  Edit: 'திருத்து',
  'Set as default': 'இயல்புநிலையாக அமை',
  'Remove this address?': 'இந்த முகவரியை நீக்கவா?',
  Remove: 'நீக்கு',
  'Address saved': 'முகவரி சேமிக்கப்பட்டது',
  'Could not save address': 'முகவரியைச் சேமிக்க முடியவில்லை',
  'Address removed': 'முகவரி நீக்கப்பட்டது',

  // payment methods
  'Cards are tokenised and stored by our payment provider — we only keep the brand and last four digits.':
    'அட்டைகள் டோக்கனாக்கப்பட்டு எங்கள் கட்டண வழங்குநரால் சேமிக்கப்படுகின்றன — அட்டை நிறுவனத்தின் பெயரையும் கடைசி நான்கு இலக்கங்களையும் மட்டுமே நாங்கள் வைத்திருக்கிறோம்.',
  'No saved cards': 'சேமித்த அட்டைகள் இல்லை',
  'Cards you choose to save at checkout appear here.':
    'செக்அவுட்டில் நீங்கள் சேமிக்கும் அட்டைகள் இங்கே தோன்றும்.',
  'Expires {date}': 'காலாவதி {date}',
  Default: 'இயல்புநிலை',
  'Make default': 'இயல்புநிலையாக்கு',

  // coupons
  'No coupons right now': 'தற்போது கூப்பன்கள் இல்லை',
  'Check back soon for new offers.': 'புதிய சலுகைகளுக்கு விரைவில் மீண்டும் பாருங்கள்.',
  'Min. spend {amount}': 'குறைந்தபட்சச் செலவு {amount}',
  'No expiry': 'காலாவதி இல்லை',
  '{code} added to your bag': '{code} உங்கள் பையில் சேர்க்கப்பட்டது',
  'It’ll be applied when eligible.': 'தகுதி பெறும்போது இது பயன்படுத்தப்படும்.',
  'Applied to bag': 'பையில் பயன்படுத்தப்பட்டது',
  'Apply to bag': 'பையில் பயன்படுத்து',

  // returns
  'Free returns within 7 days of delivery. Start a return from a delivered order.':
    'டெலிவரியிலிருந்து 7 நாட்களுக்குள் இலவசமாகத் திருப்பி அனுப்பலாம். டெலிவரி செய்யப்பட்ட ஆர்டரிலிருந்து திருப்பி அனுப்புதலைத் தொடங்கவும்.',
  'No returns': 'திருப்பி அனுப்புதல்கள் இல்லை',
  'Return requests you make will appear here.':
    'நீங்கள் செய்யும் திருப்பி அனுப்புதல் கோரிக்கைகள் இங்கே தோன்றும்.',
  'View orders': 'ஆர்டர்களைக் காண்க',
  Refund: 'பணத்திரும்பல்',
  Return: 'திருப்பி அனுப்புதல்',
  'Requested {date}': '{date} அன்று கோரப்பட்டது',
  // return status (ReturnRequest.status)
  requested: 'கோரப்பட்டது',
  approved: 'அங்கீகரிக்கப்பட்டது',
  received: 'பெறப்பட்டது',
  rejected: 'நிராகரிக்கப்பட்டது',
  // return reason (ReturnRequest.reason with "_" replaced by spaces)
  'too small': 'மிகச் சிறியது',
  'too large': 'மிகப் பெரியது',
  defective: 'குறைபாடுள்ளது',
  'not as described': 'விவரித்தபடி இல்லை',
  'changed mind': 'மனம் மாறிவிட்டது',

  // notifications
  'Mark all as read': 'அனைத்தையும் படித்ததாகக் குறி',
  'You’re all caught up': 'புதிய அறிவிப்புகள் எதுவும் இல்லை',
  'Order updates and offers will appear here.':
    'ஆர்டர் புதுப்பிப்புகளும் சலுகைகளும் இங்கே தோன்றும்.',
  unread: 'படிக்காதது',
  'Mark read': 'படித்ததாகக் குறி',

  // forgot / reset password
  'Enter your email and we’ll send you a reset link.':
    'உங்கள் மின்னஞ்சலை உள்ளிடவும்; மீட்டமைப்பு இணைப்பை உங்களுக்கு அனுப்புவோம்.',
  'Back to sign in': 'உள்நுழைவுக்குத் திரும்பு',
  'Forgot password': 'கடவுச்சொல் மறந்துவிட்டது',
  'Check your inbox': 'உங்கள் மின்னஞ்சலைச் சரிபார்க்கவும்',
  'If an account exists for {email}, a reset link is on its way.':
    '{email} என்ற மின்னஞ்சலுக்கு ஒரு கணக்கு இருந்தால், மீட்டமைப்பு இணைப்பு அனுப்பப்படுகிறது.',
  'No email is sent in the demo. Use this link instead:':
    'டெமோவில் மின்னஞ்சல் எதுவும் அனுப்பப்படாது. அதற்குப் பதிலாக இந்த இணைப்பைப் பயன்படுத்தவும்:',
  'Open reset link': 'மீட்டமைப்பு இணைப்பைத் திற',
  'Send reset link': 'மீட்டமைப்பு இணைப்பை அனுப்பு',
  'Something went wrong. Please try again.': 'ஏதோ தவறு நடந்துவிட்டது. மீண்டும் முயற்சிக்கவும்.',
  'Choose a new password': 'புதிய கடவுச்சொல்லைத் தேர்ந்தெடுக்கவும்',
  'This reset link is invalid or has expired.':
    'இந்த மீட்டமைப்பு இணைப்பு செல்லாதது அல்லது காலாவதியாகிவிட்டது.',
  'Request a new one': 'புதிய இணைப்பைக் கோருங்கள்',
  'New password': 'புதிய கடவுச்சொல்',
  'Confirm new password': 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்',
  'Update password': 'கடவுச்சொல்லைப் புதுப்பி',
  'Password updated': 'கடவுச்சொல் புதுப்பிக்கப்பட்டது',
  'Sign in with your new password.': 'உங்கள் புதிய கடவுச்சொல்லுடன் உள்நுழையவும்.',
  'Could not reset your password.': 'உங்கள் கடவுச்சொல்லை மீட்டமைக்க முடியவில்லை.',

  // 7-day return window
  'Free returns until {date} (7 days after delivery).':
    '{date} வரை இலவசமாகத் திருப்பி அனுப்பலாம் (டெலிவரிக்குப் பிறகு 7 நாட்கள்).',
  'The 7-day return window for this order closed on {date}.':
    'இந்த ஆர்டருக்கான 7 நாள் திருப்பி அனுப்பும் காலம் {date} அன்று முடிந்துவிட்டது.',
};

export default ta;
