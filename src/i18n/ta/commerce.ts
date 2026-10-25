// Tamil — cart, checkout, order confirmation, order status/tracking and address components.
const ta: Record<string, string> = {
  // cart drawer / page
  'Your bag': 'உங்கள் பை',
  'Your bag ({count})': 'உங்கள் பை ({count})',
  '({count} item)': '({count} பொருள்)',
  '({count} items)': '({count} பொருட்கள்)',
  Subtotal: 'துணைத்தொகை',
  'Shipping and taxes are calculated at checkout.':
    'டெலிவரி கட்டணமும் வரிகளும் செக்அவுட்டில் கணக்கிடப்படும்.',
  Checkout: 'செக்அவுட்',
  'Checkout · {amount}': 'செக்அவுட் · {amount}',
  'View bag': 'பையைக் காண்க',
  'Loading your bag': 'உங்கள் பை ஏற்றப்படுகிறது',
  'Your bag is empty': 'உங்கள் பை காலியாக உள்ளது',
  'Find something you love.': 'உங்களுக்குப் பிடித்த ஒன்றைக் கண்டறியவும்.',
  'Start shopping': 'ஷாப்பிங்கைத் தொடங்கவும்',
  'Keep shopping': 'ஷாப்பிங்கைத் தொடரவும்',
  'Items in your bag': 'உங்கள் பையில் உள்ள பொருட்கள்',
  'Move a saved item back to your bag when you’re ready.':
    'நீங்கள் தயாரானதும் சேமித்த பொருளை மீண்டும் உங்கள் பைக்கு நகர்த்தவும்.',
  'Saved for later': 'பின்னர் வாங்க சேமித்தவை',
  'Saved for later ({count})': 'பின்னர் வாங்க சேமித்தவை ({count})',
  'We couldn’t load your bag': 'உங்கள் பையை ஏற்ற முடியவில்லை',
  'Looks like you haven’t added anything yet.':
    'நீங்கள் இன்னும் எதையும் சேர்க்கவில்லை போலத் தெரிகிறது.',
  'Some items in your bag need attention before you can check out.':
    'செக்அவுட் செய்வதற்கு முன் உங்கள் பையில் உள்ள சில பொருட்களைக் கவனிக்க வேண்டும்.',
  'Nothing in your bag right now.': 'இப்போது உங்கள் பையில் எதுவும் இல்லை.',
  'Resolve the highlighted items to continue.': 'தொடர, குறிக்கப்பட்ட பொருட்களைச் சரிசெய்யவும்.',
  'Final delivery cost and tax are confirmed at checkout.':
    'இறுதி டெலிவரி கட்டணமும் வரியும் செக்அவுட்டில் உறுதிசெய்யப்படும்.',
  'Customers also bought': 'வாடிக்கையாளர்கள் இவற்றையும் வாங்கினர்',
  'Recommended for you': 'உங்களுக்குப் பரிந்துரைக்கப்படுபவை',

  // cart line item
  'This item is no longer available.': 'இந்தப் பொருள் இனி கிடைக்காது.',
  Remove: 'நீக்கு',
  '{color} · Size {size}': '{color} · அளவு {size}',
  '{price} each': 'ஒன்றுக்கு {price}',
  'This item is currently sold out.': 'இந்தப் பொருள் தற்போது விற்றுத் தீர்ந்துவிட்டது.',
  'This item is sold out. Remove it or save it for later to continue.':
    'இந்தப் பொருள் விற்றுத் தீர்ந்துவிட்டது. தொடர, இதை நீக்கவும் அல்லது பின்னர் வாங்க சேமிக்கவும்.',
  'Only {count} left — quantity adjusted.':
    '{count} மட்டுமே மீதமுள்ளன — எண்ணிக்கை சரிசெய்யப்பட்டது.',
  'Only {count} left': '{count} மட்டுமே மீதமுள்ளன',
  'Price changed from {from} to {to}.': 'விலை {from} இலிருந்து {to} ஆக மாறியுள்ளது.',
  'Got it': 'சரி',
  'Quantity for {title}': '{title} — எண்ணிக்கை',
  'Moved back to your bag': 'மீண்டும் உங்கள் பைக்கு நகர்த்தப்பட்டது',
  '{title} is in “Saved for later” below.':
    '{title} கீழே உள்ள “பின்னர் வாங்க சேமித்தவை” பகுதியில் உள்ளது.',
  'Move to bag': 'பைக்கு நகர்த்து',
  'Save for later': 'பின்னர் வாங்க சேமி',
  'Remove {title} from cart': '{title}-ஐ பையிலிருந்து நீக்கு',
  '{title} in {color}, {size} is unavailable.': '{color}, {size} அளவில் {title} கிடைக்கவில்லை.',
  'Quantity adjusted': 'எண்ணிக்கை சரிசெய்யப்பட்டது',
  'Only {count} available for this size.': 'இந்த அளவில் {count} மட்டுமே கிடைக்கின்றன.',

  // free shipping bar, coupon form, totals
  "You've unlocked free standard shipping": 'இலவச சாதாரண டெலிவரி உங்களுக்குக் கிடைத்துவிட்டது',
  'Add {amount} for free standard shipping': 'இலவச சாதாரண டெலிவரிக்கு மேலும் {amount} சேர்க்கவும்',
  'Progress to free shipping': 'இலவச டெலிவரிக்கான முன்னேற்றம்',
  '{code} applied': '{code} பயன்படுத்தப்பட்டது',
  'Remove coupon {code}': '{code} கூப்பனை நீக்கு',
  'Apply coupon': 'கூப்பனைப் பயன்படுத்து',
  'Coupon code': 'கூப்பன் குறியீடு',
  'Enter code': 'குறியீட்டை உள்ளிடவும்',
  Apply: 'பயன்படுத்து',
  'Sale savings': 'தள்ளுபடி சேமிப்பு',
  Discount: 'தள்ளுபடி',
  'Discount ({code})': 'தள்ளுபடி ({code})',
  Shipping: 'டெலிவரி',
  'Shipping (standard)': 'டெலிவரி (சாதாரணம்)',
  'Shipping (express)': 'டெலிவரி (விரைவு)',
  'Shipping (next-day)': 'டெலிவரி (அடுத்த நாள்)',
  'Estimated tax': 'மதிப்பிடப்பட்ட வரி',
  Total: 'மொத்தம்',
  'Order summary': 'ஆர்டர் சுருக்கம்',

  // checkout page
  'Checkout progress': 'செக்அவுட் நிலை',
  Address: 'முகவரி',
  Delivery: 'டெலிவரி',
  Payment: 'கட்டணம்',
  completed: 'முடிந்தது',
  'Back to bag': 'பைக்குத் திரும்பு',
  'Secure checkout': 'பாதுகாப்பான செக்அவுட்',
  'Loading order summary': 'ஆர்டர் சுருக்கம் ஏற்றப்படுகிறது',
  'There’s a problem with your bag': 'உங்கள் பையில் ஒரு சிக்கல் உள்ளது',
  'Review your bag': 'உங்கள் பையைச் சரிபார்க்கவும்',
  'Order details': 'ஆர்டர் விவரங்கள்',
  'Ship to': 'அனுப்ப வேண்டிய முகவரி',
  'Back to delivery': 'டெலிவரிக்குத் திரும்பு',
  'Totals are re-verified on our servers before you’re charged.':
    'பணம் எடுக்கப்படும் முன் மொத்தத் தொகைகள் எங்கள் சர்வர்களில் மீண்டும் சரிபார்க்கப்படும்.',
  'Processing payment': 'கட்டணம் செயலாக்கப்படுகிறது',
  'Securing your order…': 'உங்கள் ஆர்டர் பாதுகாக்கப்படுகிறது…',
  'Processing payment…': 'கட்டணம் செயலாக்கப்படுகிறது…',
  'Confirming your payment…': 'உங்கள் கட்டணம் உறுதிசெய்யப்படுகிறது…',
  'Please don’t close or refresh this page.':
    'தயவுசெய்து இந்தப் பக்கத்தை மூடவோ புதுப்பிக்கவோ வேண்டாம்.',
  'You appear to be offline. Reconnect and try again — you have not been charged.':
    'நீங்கள் ஆஃப்லைனில் இருப்பதாகத் தெரிகிறது. மீண்டும் இணைந்து முயற்சிக்கவும் — உங்களிடமிருந்து பணம் எடுக்கப்படவில்லை.',
  '{reason} You have not been charged. Try another card or retry.':
    '{reason} உங்களிடமிருந்து பணம் எடுக்கப்படவில்லை. வேறு அட்டையைப் பயன்படுத்தவும் அல்லது மீண்டும் முயற்சிக்கவும்.',
  '{reason} You have not been charged.': '{reason} உங்களிடமிருந்து பணம் எடுக்கப்படவில்லை.',
  'Payment failed.': 'கட்டணம் தோல்வியடைந்தது.',
  'Prices changed while you were checking out. Please review your updated total and place your order again.':
    'நீங்கள் செக்அவுட் செய்துகொண்டிருந்தபோது விலைகள் மாறிவிட்டன. புதுப்பிக்கப்பட்ட மொத்தத் தொகையைச் சரிபார்த்து, உங்கள் ஆர்டரை மீண்டும் செய்யவும்.',
  '{message} Please update your bag.': '{message} உங்கள் பையைப் புதுப்பிக்கவும்.',
  'Session expired': 'அமர்வு காலாவதியானது',
  'Please sign in again to finish your order.': 'உங்கள் ஆர்டரை முடிக்க மீண்டும் உள்நுழையவும்.',
  'We couldn’t reach the server. Check your connection and try again — you have not been charged.':
    'சர்வரை அணுக முடியவில்லை. உங்கள் இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும் — உங்களிடமிருந்து பணம் எடுக்கப்படவில்லை.',

  // address step
  Contact: 'தொடர்பு',
  'Email for order updates': 'ஆர்டர் தகவல்களுக்கான மின்னஞ்சல்',
  'Shipping address': 'டெலிவரி முகவரி',
  'Couldn’t load your addresses': 'உங்கள் முகவரிகளை ஏற்ற முடியவில்லை',
  'Ship to {name}, {line1}': '{name}, {line1} — இந்த முகவரிக்கு அனுப்பு',
  'Use a new address': 'புதிய முகவரியைப் பயன்படுத்து',
  'Continue to delivery': 'டெலிவரிக்குத் தொடரவும்',
  'Save this address to my account': 'இந்த முகவரியை என் கணக்கில் சேமி',

  // delivery step
  'Couldn’t check delivery': 'டெலிவரியைச் சரிபார்க்க முடியவில்லை',
  'We can’t deliver to {postalCode} yet.':
    '{postalCode} பகுதிக்கு எங்களால் இன்னும் டெலிவரி செய்ய இயலாது.',
  'Change address': 'முகவரியை மாற்று',
  'Delivery method': 'டெலிவரி முறை',
  'Arrives {dates}': 'வந்து சேரும் நாள்: {dates}',
  Back: 'பின் செல்',
  'Continue to payment': 'கட்டணத்துக்குத் தொடரவும்',

  // payment form
  'Secure payment': 'பாதுகாப்பான கட்டணம்',
  'You’ll be redirected to our payment partner to enter your card details safely.':
    'உங்கள் அட்டை விவரங்களைப் பாதுகாப்பாக உள்ளிட, எங்கள் கட்டணக் கூட்டாளரின் பக்கத்துக்கு நீங்கள் திருப்பி அனுப்பப்படுவீர்கள்.',
  'Continue to payment · {amount}': 'கட்டணத்துக்குத் தொடரவும் · {amount}',
  'Payment details': 'கட்டண விவரங்கள்',
  'Card number': 'அட்டை எண்',
  'Name on card': 'அட்டையில் உள்ள பெயர்',
  'Expiry (MM/YY)': 'காலாவதி (MM/YY)',
  'Security code': 'பாதுகாப்புக் குறியீடு',
  'Test cards (demo mode)': 'சோதனை அட்டைகள் (டெமோ பயன்முறை)',
  succeeds: 'வெற்றிபெறும்',
  declined: 'நிராகரிக்கப்படும்',
  'insufficient funds': 'போதுமான இருப்பு இல்லை',
  'Any future expiry and any 3-digit CVC.':
    'எதிர்காலத்தில் உள்ள எந்தக் காலாவதி தேதியும், எந்த 3 இலக்க CVC-யும்.',
  'Pay {amount}': '{amount} செலுத்து',
  'Encrypted payment. Card details go straight to our payment provider and are never stored by ASG.':
    'மறையாக்கம் செய்யப்பட்ட கட்டணம். அட்டை விவரங்கள் நேரடியாக எங்கள் கட்டண வழங்குநருக்குச் செல்லும்; ASG அவற்றை ஒருபோதும் சேமிக்காது.',

  // order summary
  'Items in your order': 'உங்கள் ஆர்டரில் உள்ள பொருட்கள்',
  'Quantity {count}': 'எண்ணிக்கை {count}',

  // order confirmation
  'Loading your order': 'உங்கள் ஆர்டர் ஏற்றப்படுகிறது',
  'Order not found': 'ஆர்டர் கிடைக்கவில்லை',
  'We couldn’t find that order in your account.':
    'அந்த ஆர்டரை உங்கள் கணக்கில் கண்டறிய முடியவில்லை.',
  'View my orders': 'என் ஆர்டர்களைக் காண்க',
  'Confirming payment': 'கட்டணம் உறுதிசெய்யப்படுகிறது',
  'We’re waiting for confirmation from your bank. This usually takes a few seconds — you can safely stay on this page.':
    'உங்கள் வங்கியின் உறுதிப்படுத்தலுக்காகக் காத்திருக்கிறோம். இதற்கு வழக்கமாகச் சில வினாடிகளே ஆகும் — நீங்கள் இந்தப் பக்கத்திலேயே பாதுகாப்பாக இருக்கலாம்.',
  'This is taking longer than usual. Your payment is safe — if it went through, the order will appear in your account shortly.':
    'இது வழக்கத்தை விட அதிக நேரம் எடுக்கிறது. உங்கள் கட்டணம் பாதுகாப்பானது — அது நிறைவடைந்திருந்தால், ஆர்டர் விரைவில் உங்கள் கணக்கில் தோன்றும்.',
  'Payment failed': 'கட்டணம் தோல்வியடைந்தது',
  'Payment didn’t go through': 'கட்டணம் நிறைவடையவில்லை',
  'Your payment could not be completed.': 'உங்கள் கட்டணத்தை முடிக்க முடியவில்லை.',
  'Thank you': 'நன்றி',
  'Your order is confirmed': 'உங்கள் ஆர்டர் உறுதிசெய்யப்பட்டது',
  Order: 'ஆர்டர்',
  'A confirmation has been sent to {email}.':
    'உறுதிப்படுத்தல் {email} முகவரிக்கு அனுப்பப்பட்டுள்ளது.',
  'Track order': 'ஆர்டரைக் கண்காணி',
  Items: 'பொருட்கள்',
  'Estimated {dates}': 'மதிப்பிடப்பட்ட டெலிவரி: {dates}',
  Card: 'அட்டை',
  'Paid in full': 'முழுமையாகச் செலுத்தப்பட்டது',
  // "Questions? Visit your [orders] any time." — fragments read in Tamil order
  'Questions? Visit your': 'கேள்விகள் உள்ளதா? எப்போது வேண்டுமானாலும் உங்கள்',
  orders: 'ஆர்டர்கள்',
  'any time.': 'பக்கத்தைப் பார்வையிடவும்.',

  // order status badge + tracking timeline
  'Awaiting payment': 'கட்டணத்திற்காகக் காத்திருக்கிறது',
  Confirmed: 'உறுதிசெய்யப்பட்டது',
  Processing: 'செயலாக்கத்தில் உள்ளது',
  Shipped: 'அனுப்பப்பட்டது',
  'Out for delivery': 'டெலிவரிக்குப் புறப்பட்டுள்ளது',
  Delivered: 'டெலிவரி செய்யப்பட்டது',
  Cancelled: 'ரத்துசெய்யப்பட்டது',
  Refunded: 'பணம் திருப்பித் தரப்பட்டது',
  'Order confirmed': 'ஆர்டர் உறுதிசெய்யப்பட்டது',
  Packed: 'பேக் செய்யப்பட்டது',
  'Order progress': 'ஆர்டர் நிலை',
  'This order was cancelled and your payment has been refunded.':
    'இந்த ஆர்டர் ரத்துசெய்யப்பட்டது, உங்கள் பணம் திருப்பித் தரப்பட்டது.',

  // address form / card
  'Address form': 'முகவரிப் படிவம்',
  Phone: 'தொலைபேசி',
  'Address line 1': 'முகவரி வரி 1',
  'Apartment, suite, etc. (optional)': 'அடுக்குமாடி, வீட்டு எண் முதலியன (விருப்பத்தேர்வு)',
  Country: 'நாடு',
  'State / region': 'மாநிலம் / பகுதி',
  City: 'நகரம்',
  'Set as my default address': 'என் இயல்புநிலை முகவரியாக அமை',
  'Save address': 'முகவரியைச் சேமி',
  Default: 'இயல்புநிலை',

  // countries (src/lib/validation.ts COUNTRIES)
  'United States': 'அமெரிக்கா',
  Canada: 'கனடா',
  'United Kingdom': 'ஐக்கிய இராச்சியம்',
  India: 'இந்தியா',
  Australia: 'ஆஸ்திரேலியா',
  Germany: 'ஜெர்மனி',
  France: 'பிரான்ஸ்',
  'United Arab Emirates': 'ஐக்கிய அரபு அமீரகம்',
  Singapore: 'சிங்கப்பூர்',
};

export default ta;
