/**
 * Privacy policy content, kept as data so both languages stay in lockstep and
 * the "last updated" date cannot drift between them.
 *
 * DRAFT — needs review by someone qualified in UAE data protection law before
 * it is relied on. It is written from the actual data model (see the tables
 * and third parties named below), not from a template, so it should be
 * accurate about what happens; whether it is *sufficient* under Federal
 * Decree-Law No. 45 of 2021 is a legal judgement, not an engineering one.
 *
 * Two things make this policy higher-stakes than a normal site policy:
 *  - profiles.medical_conditions and profiles.allergies are health data, the
 *    most protected category under the PDPL.
 *  - Google Play requires the Data Safety declaration to match this document.
 *    If the two disagree, the listing can be pulled.
 */

export const PRIVACY_LAST_UPDATED = '2026-08-17'

export type LegalSection = {
  id: string
  titleEn: string
  titleAr: string
  bodyEn: string[]
  bodyAr: string[]
  /** Rendered as a definition list rather than paragraphs. */
  rowsEn?: [string, string][]
  rowsAr?: [string, string][]
}

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'who-we-are',
    titleEn: 'Who we are',
    titleAr: 'من نحن',
    bodyEn: [
      'Lover Diet Center is a nutrition and wellness practice operating in the United Arab Emirates, founded by Dr. Wael Mousa. This policy covers loversdc.com, the client dashboard, and the Lover Diet Center mobile application.',
      'It explains what personal data we collect, why we hold it, who else can see it, and what you can ask us to do with it.',
    ],
    bodyAr: [
      'مركز Lover Diet Center مركز تغذية وعافية يعمل في دولة الإمارات العربية المتحدة، أسّسه الدكتور وائل موسى. هذه السياسة تغطي موقع loversdc.com ولوحة تحكم العميل وتطبيق الهاتف.',
      'وتوضّح ما البيانات الشخصية التي نجمعها، ولماذا نحتفظ بها، ومن غيرنا يمكنه الاطّلاع عليها، وما الذي يمكنك مطالبتنا بفعله بها.',
    ],
  },

  {
    id: 'health-data',
    titleEn: 'Health data — read this part',
    titleAr: 'البيانات الصحية — اقرأ هذا الجزء',
    bodyEn: [
      'To build a nutrition plan we ask for information about your body and your health: your weight over time, height, age, sex, activity level, goal, and — if you choose to give them — medical conditions, allergies and food preferences.',
      'Under UAE Federal Decree-Law No. 45 of 2021 this is sensitive personal data. We collect it only because you asked us for a nutrition service that cannot be delivered without it, and we use it for nothing else. We do not sell it, we do not use it for advertising, and we do not share it with anyone outside the people named in this policy.',
      'Medical conditions and allergies are optional. You can use the service without them; your plan will simply be less tailored.',
    ],
    bodyAr: [
      'لبناء خطة تغذية نطلب معلومات عن جسمك وصحتك: وزنك عبر الوقت، والطول، والعمر، والجنس، ومستوى النشاط، والهدف، وإن اخترت مشاركتها: الحالات المرضية والحساسية وتفضيلات الطعام.',
      'بموجب المرسوم بقانون اتحادي رقم 45 لسنة 2021 تُعدّ هذه بيانات شخصية حسّاسة. نجمعها فقط لأنك طلبت خدمة تغذية لا يمكن تقديمها بدونها، ولا نستخدمها لأي غرض آخر. لا نبيعها، ولا نستخدمها في الإعلانات، ولا نشاركها مع أي جهة خارج المذكورين في هذه السياسة.',
      'الحالات المرضية والحساسية اختيارية. تقدر تستخدم الخدمة بدونها، وستكون خطتك أقل تخصيصًا فقط.',
    ],
  },

  {
    id: 'what-we-collect',
    titleEn: 'What we collect',
    titleAr: 'ما الذي نجمعه',
    bodyEn: ['Everything below is either given by you or created by your use of the service. We do not buy data about you from anyone.'],
    bodyAr: ['كل ما يلي إمّا تعطيه لنا أنت أو ينشأ من استخدامك للخدمة. نحن لا نشتري بيانات عنك من أي جهة.'],
    rowsEn: [
      ['Account', 'Name, email address, phone number, country and city, and a profile photo if you upload one.'],
      ['Body & health', 'Age, sex, height, starting / current / target weight, activity level, goal, and optionally medical conditions, allergies and food preferences.'],
      ['Progress', 'Weight entries with their dates and any note you attach, body-fat percentage if you record it, and daily water intake.'],
      ['Plan & sessions', 'The meal plan prepared for you, and appointments including type, date, time, location and the practitioner’s notes.'],
      ['Orders', 'Items ordered, amounts, and the delivery details you enter: recipient name, phone, address, emirate, postal code and delivery notes.'],
      ['Payments', 'Payment status, amount, currency and the transaction reference returned by our payment provider. Card numbers never reach our servers.'],
      ['Technical', 'Sign-in session cookies, your language and currency choice, and the IP address of requests to our sign-in and password-reset endpoints, used only to limit abuse.'],
    ],
    rowsAr: [
      ['الحساب', 'الاسم والبريد الإلكتروني ورقم الهاتف والدولة والمدينة، وصورة شخصية إن رفعتها.'],
      ['الجسم والصحة', 'العمر والجنس والطول والوزن الابتدائي والحالي والمستهدف ومستوى النشاط والهدف، واختياريًا الحالات المرضية والحساسية وتفضيلات الطعام.'],
      ['التقدّم', 'تسجيلات الوزن بتواريخها وأي ملاحظة ترفقها، ونسبة الدهون إن سجّلتها، وشرب الماء اليومي.'],
      ['الخطة والجلسات', 'خطة الوجبات المُعدّة لك، والمواعيد شاملةً النوع والتاريخ والوقت والمكان وملاحظات الأخصائي.'],
      ['الطلبات', 'المنتجات المطلوبة والمبالغ وبيانات التوصيل التي تدخلها: اسم المستلم والهاتف والعنوان والإمارة والرمز البريدي وملاحظات التوصيل.'],
      ['المدفوعات', 'حالة الدفع والمبلغ والعملة ومرجع العملية من مزوّد الدفع. أرقام البطاقات لا تصل إلى خوادمنا إطلاقًا.'],
      ['تقنية', 'كوكيز جلسة الدخول، واختيارك للغة والعملة، وعنوان IP لطلبات تسجيل الدخول واستعادة كلمة المرور — لغرض الحد من إساءة الاستخدام فقط.'],
    ],
  },

  {
    id: 'why',
    titleEn: 'Why we hold it',
    titleAr: 'لماذا نحتفظ بها',
    bodyEn: [
      'To prepare and adjust your nutrition plan, and to let your practitioner follow your progress between visits.',
      'To run your account: signing you in, keeping you signed in, and letting you recover access.',
      'To fulfil orders you place and to handle the payment, delivery and any refund.',
      'To send you messages that are part of the service — plan updates, session reminders, order status, password resets. We do not send marketing email unless you ask for it.',
      'To keep the service secure: limiting repeated sign-in attempts, and recording administrative actions so changes to your record can be traced.',
    ],
    bodyAr: [
      'لإعداد خطة تغذيتك وتعديلها، ولتمكين أخصائيك من متابعة تقدّمك بين الزيارات.',
      'لتشغيل حسابك: تسجيل دخولك وإبقاؤك مسجّلًا واستعادة وصولك.',
      'لتنفيذ طلباتك ومعالجة الدفع والتوصيل وأي استرجاع.',
      'لإرسال رسائل هي جزء من الخدمة — تحديثات الخطة وتذكير الجلسات وحالة الطلب واستعادة كلمة المرور. لا نرسل رسائل تسويقية إلا إذا طلبتها.',
      'للحفاظ على أمان الخدمة: الحد من محاولات الدخول المتكررة، وتسجيل الإجراءات الإدارية بحيث يمكن تتبّع أي تغيير على سجلّك.',
    ],
  },

  {
    id: 'who-sees-it',
    titleEn: 'Who can see it',
    titleAr: 'من يمكنه الاطّلاع عليها',
    bodyEn: [
      'Inside the practice, your record is visible to Dr. Wael Mousa and to authorised staff who need it to deliver your plan. Every administrative action on your record is logged.',
      'Outside the practice, we use the following providers. Each receives only what it needs to do its job, and none of them is permitted to use your data for their own purposes.',
    ],
    bodyAr: [
      'داخل المركز، سجلّك مرئي للدكتور وائل موسى وللموظفين المخوّلين الذين يحتاجونه لتقديم خطتك. وكل إجراء إداري على سجلّك مسجَّل.',
      'خارج المركز، نستعين بالمزوّدين التالين. كل واحد منهم يستلم فقط ما يلزمه لأداء عمله، ولا يُسمح لأي منهم باستخدام بياناتك لأغراضه الخاصة.',
    ],
    rowsEn: [
      ['Supabase', 'Stores the database, your account credentials and uploaded images.'],
      ['Vercel', 'Hosts the website and application, and provides aggregate traffic statistics that do not identify you.'],
      ['Paymob', 'Processes card payments. Card details go to Paymob directly and are never stored by us.'],
      ['Resend', 'Delivers service email — receipts, password resets and notifications.'],
      ['Upstash', 'Holds short-lived counters used to rate-limit sign-in and password-reset attempts.'],
      ['Google', 'Only if you choose "Continue with Google" to sign in.'],
      ['YouTube', 'Only when you press play on a video on our About page. Until then YouTube receives nothing.'],
    ],
    rowsAr: [
      ['Supabase', 'يخزّن قاعدة البيانات وبيانات دخولك والصور المرفوعة.'],
      ['Vercel', 'يستضيف الموقع والتطبيق، ويوفّر إحصاءات زيارات مجمّعة لا تحدّد هويتك.'],
      ['Paymob', 'يعالج مدفوعات البطاقات. بيانات البطاقة تذهب إلى Paymob مباشرة ولا نخزّنها نحن إطلاقًا.'],
      ['Resend', 'يوصّل بريد الخدمة — الإيصالات واستعادة كلمة المرور والإشعارات.'],
      ['Upstash', 'يحتفظ بعدّادات قصيرة العمر للحد من محاولات الدخول واستعادة كلمة المرور.'],
      ['Google', 'فقط إذا اخترت «المتابعة عبر Google» لتسجيل الدخول.'],
      ['YouTube', 'فقط عند ضغطك على تشغيل فيديو في صفحة «من نحن». قبل ذلك لا يستلم YouTube أي شيء.'],
    ],
  },

  {
    id: 'where',
    titleEn: 'Where your data is stored',
    titleAr: 'أين تُخزَّن بياناتك',
    bodyEn: [
      'Our database is hosted in the European Union and the application is served from infrastructure in the United States. This means your data is transferred outside the UAE.',
      'We rely on providers that offer contractual data-protection commitments for these transfers. If you would prefer your data not to leave the UAE, we cannot currently offer that, and you should not use the service.',
    ],
    bodyAr: [
      'قاعدة بياناتنا مستضافة في الاتحاد الأوروبي، والتطبيق يُقدَّم من بنية تحتية في الولايات المتحدة. وهذا يعني أن بياناتك تُنقَل خارج دولة الإمارات.',
      'نعتمد على مزوّدين يقدّمون التزامات تعاقدية لحماية البيانات في عمليات النقل هذه. وإن كنت تفضّل ألّا تغادر بياناتك الدولة، فهذا غير متاح لدينا حاليًا، ولا يناسبك استخدام الخدمة.',
    ],
  },

  {
    id: 'retention',
    titleEn: 'How long we keep it',
    titleAr: 'مدة الاحتفاظ',
    bodyEn: [
      'We keep your account and health record for as long as you have an account with us, because your history is what makes the plan work — a weight trend is meaningless without its past.',
      'If you close your account we delete your profile and health data. Order and payment records are kept longer where we are required to retain them for accounting and tax purposes, reduced to what those obligations need.',
      'Rate-limiting counters expire within hours. Administrative action logs are kept so changes to client records remain auditable.',
    ],
    bodyAr: [
      'نحتفظ بحسابك وسجلّك الصحي طالما لديك حساب معنا، لأن تاريخك هو ما يجعل الخطة تعمل — فمنحنى الوزن بلا ماضيه بلا معنى.',
      'إذا أغلقت حسابك نحذف ملفك وبياناتك الصحية. أما سجلات الطلبات والمدفوعات فتُحفَظ مدة أطول حيث يُلزمنا القانون بحفظها لأغراض محاسبية وضريبية، ومُختصرة على ما تتطلّبه تلك الالتزامات.',
      'عدّادات الحد من المحاولات تنتهي خلال ساعات. وسجلات الإجراءات الإدارية تُحفَظ لتبقى التغييرات على سجلات العملاء قابلة للتدقيق.',
    ],
  },

  {
    id: 'rights',
    titleEn: 'Your rights',
    titleAr: 'حقوقك',
    bodyEn: [
      'You can ask us to show you the data we hold about you, correct anything wrong, delete your account and health record, or send you a copy in a portable format.',
      'You can withdraw consent for the optional health fields at any time by clearing them in your profile, and you can unsubscribe from any non-essential message.',
      'Write to us at the address below. We will respond within 30 days. If you are not satisfied with our answer, you may complain to the UAE Data Office.',
    ],
    bodyAr: [
      'يمكنك أن تطلب الاطّلاع على البيانات التي نحتفظ بها عنك، أو تصحيح أي خطأ، أو حذف حسابك وسجلّك الصحي، أو الحصول على نسخة بصيغة قابلة للنقل.',
      'ويمكنك سحب موافقتك على الحقول الصحية الاختيارية في أي وقت بمسحها من ملفك، كما يمكنك إلغاء الاشتراك في أي رسالة غير ضرورية.',
      'راسلنا على العنوان أدناه، وسنردّ خلال 30 يومًا. وإن لم يُرضِك ردّنا، يمكنك التقدّم بشكوى إلى مكتب البيانات في الإمارات.',
    ],
  },

  {
    id: 'children',
    titleEn: 'Children',
    titleAr: 'الأطفال',
    bodyEn: [
      'The service is not intended for anyone under 18. We do not knowingly create accounts for children. A nutrition plan for a child should be arranged directly with the clinic by a parent or guardian, not through this app.',
      'If you believe a child has created an account, contact us and we will remove it.',
    ],
    bodyAr: [
      'الخدمة غير موجّهة لمن هم دون 18 عامًا، ولا ننشئ حسابات للأطفال عن علم. وخطة تغذية الطفل يجب ترتيبها مع العيادة مباشرة عبر ولي الأمر، لا عبر هذا التطبيق.',
      'إذا كنت تعتقد أن طفلًا أنشأ حسابًا، تواصل معنا وسنزيله.',
    ],
  },

  {
    id: 'security',
    titleEn: 'Security',
    titleAr: 'الأمان',
    bodyEn: [
      'Your record is protected by row-level access rules in the database, so one client\'s data cannot be read by another. Connections are encrypted in transit. Sign-in and password-reset attempts are rate-limited on our servers. Sessions expire after inactivity.',
      'No system is perfect. If a breach affects your personal data we will notify you and the relevant authority as required by law.',
    ],
    bodyAr: [
      'سجلّك محمي بقواعد وصول على مستوى الصف في قاعدة البيانات، فلا يمكن لعميل قراءة بيانات عميل آخر. والاتصالات مشفّرة أثناء النقل. ومحاولات الدخول واستعادة كلمة المرور محدودة على خوادمنا. والجلسات تنتهي بعد فترة خمول.',
      'لا يوجد نظام كامل. وإذا وقع اختراق يمسّ بياناتك الشخصية سنُبلغك ونُبلغ الجهة المختصة وفق ما يقتضيه القانون.',
    ],
  },

  {
    id: 'changes',
    titleEn: 'Changes to this policy',
    titleAr: 'تغييرات هذه السياسة',
    bodyEn: [
      'When we change this policy we update the date at the top. If a change materially affects how we use your health data, we will tell you in the app before it takes effect rather than relying on you to re-read this page.',
    ],
    bodyAr: [
      'عند تغيير هذه السياسة نحدّث التاريخ في أعلاها. وإذا كان التغيير يمسّ جوهريًا طريقة استخدامنا لبياناتك الصحية، سنُخطرك داخل التطبيق قبل سريانه بدلًا من انتظار أن تعيد قراءة هذه الصفحة.',
    ],
  },

  {
    id: 'contact',
    titleEn: 'Contact us',
    titleAr: 'تواصل معنا',
    bodyEn: [
      'For any privacy question or to exercise any of the rights above, email support@loversdc.com or message us on WhatsApp at +971 52 903 3110.',
      'Lover Diet Center, United Arab Emirates.',
    ],
    bodyAr: [
      'لأي استفسار عن الخصوصية أو لممارسة أي من الحقوق أعلاه، راسلنا على support@loversdc.com أو عبر واتساب على ‎+971 52 903 3110.',
      'Lover Diet Center، الإمارات العربية المتحدة.',
    ],
  },
]
