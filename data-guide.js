/* DeenBondhu BD — Learning guides (Wudu, Ghusl, Salah, FAQ) + kids quiz.
   Tags: fard = obligatory (broad agreement), sunnah = prophetic practice / recommended, diff = schools of fiqh differ, tip = practical note.
   These are beginner summaries, not fatwas. Details differ between Hanafi, Maliki, Shafi'i and Hanbali schools; consult a qualified scholar. */
window.GUIDES = [
  { id: 'wudu', icon: 'check',
    title: { bn: 'ওযুর ধাপসমূহ', en: 'Steps of Wudu', ar: 'خطوات الوضوء' },
    ref: 'Qur\'an 5:6; Sahih al-Bukhari 159; Sahih Muslim 226',
    items: [
      { tag: 'sunnah', t: { bn: 'অন্তরে নিয়ত করুন এবং “বিসমিল্লাহ” বলুন। (নিয়ত ফরয কি সুন্নাহ—মাযহাবভেদে ভিন্নমত আছে।)', en: 'Make the intention in your heart and say Bismillah. (Whether intention is obligatory or sunnah differs between schools.)', ar: 'انوِ بقلبك وسَمِّ الله. (حكم النية يختلف بين المذاهب.)' } },
      { tag: 'sunnah', t: { bn: 'দুই হাত কবজি পর্যন্ত তিনবার ধুয়ে নিন।', en: 'Wash both hands up to the wrists three times.', ar: 'اغسل كفيك ثلاث مرات.' } },
      { tag: 'sunnah', t: { bn: 'তিনবার কুলি করুন এবং নাকে পানি দিয়ে ঝেড়ে ফেলুন। (কিছু মাযহাবে এটি ওযুতে ওয়াজিব/ফরয ধরা হয়; অন্যদের মতে সুন্নাহ।)', en: 'Rinse the mouth and sniff water into the nose and blow it out, three times. (Some schools treat this as obligatory, others as sunnah.)', ar: 'تمضمض واستنشق واستنثر ثلاثًا. (اختلف الفقهاء في وجوبهما.)' } },
      { tag: 'fard', t: { bn: 'পুরো মুখমণ্ডল ধৌত করুন (কপালের চুলের গোড়া থেকে থুতনির নিচ পর্যন্ত, এক কানের লতি থেকে অন্য কান পর্যন্ত)। সুন্নাহ হলো তিনবার।', en: 'Wash the whole face (hairline to chin, ear to ear). Three times is sunnah.', ar: 'اغسل الوجه كله. والتثليث سنة.' } },
      { tag: 'fard', t: { bn: 'দুই হাত কনুইসহ ধৌত করুন—আগে ডান, পরে বাম।', en: 'Wash both arms including the elbows — right first, then left.', ar: 'اغسل اليدين مع المرفقين، اليمنى ثم اليسرى.' } },
      { tag: 'fard', t: { bn: 'মাথা মাসাহ করুন (মাসাহের পরিমাণ নিয়ে মাযহাবভেদে মতভেদ আছে)।', en: 'Wipe the head (the required extent differs between schools).', ar: 'امسح رأسك. (قدر المسح فيه خلاف بين المذاهب.)' } },
      { tag: 'sunnah', t: { bn: 'দুই কান মাসাহ করুন।', en: 'Wipe the ears.', ar: 'امسح أذنيك.' } },
      { tag: 'fard', t: { bn: 'দুই পা টাখনুসহ ধৌত করুন—আগে ডান, পরে বাম।', en: 'Wash both feet including the ankles — right first, then left.', ar: 'اغسل القدمين مع الكعبين، اليمنى ثم اليسرى.' } },
      { tag: 'diff', t: { bn: 'ধারাবাহিকতা (তারতীব) ও বিরতিহীনতা (মুয়ালাত) বজায় রাখা বিষয়ে মাযহাবে মতভেদ আছে; সাধারণভাবে ধারাবাহিকভাবে করাই উত্তম।', en: 'Order and continuity are strictly required in some schools and only recommended in others; doing them in order is always best.', ar: 'الترتيب والموالاة فيهما خلاف بين المذاهب، والأفضل مراعاتهما.' } },
      { tag: 'tip', t: { bn: 'ওযু ভাঙার সাধারণ কারণ: প্রস্রাব-পায়খানা বা বায়ু নির্গমন, গভীর ঘুম, জ্ঞান হারানো। অন্য কিছু বিষয়ে (যেমন স্পর্শ, রক্ত) মাযহাবভেদে মতভেদ আছে।', en: 'Commonly agreed wudu-breakers: natural discharges, deep sleep, loss of consciousness. Other matters (touch, bleeding) are disputed between schools.', ar: 'من نواقض الوضوء المتفق عليها: الخارج من السبيلين، والنوم المستغرق، وزوال العقل. وغيرها فيه خلاف.' } }
    ] },
  { id: 'ghusl', icon: 'check',
    title: { bn: 'গোসল ও পবিত্রতা', en: 'Ghusl and Purification', ar: 'الغسل والطهارة' },
    ref: 'Qur\'an 5:6; Sahih al-Bukhari 248; Sahih Muslim 316',
    items: [
      { tag: 'fard', t: { bn: 'গোসল ফরয হয়: বীর্যপাত বা সহবাসের পর, এবং হায়েয ও নিফাস শেষ হলে।', en: 'Ghusl becomes obligatory after sexual relations/emission, and at the end of menstruation and postnatal bleeding.', ar: 'يجب الغسل بعد الجنابة وعند انقطاع الحيض والنفاس.' } },
      { tag: 'sunnah', t: { bn: 'নিয়ত ও বিসমিল্লাহ বলে দুই হাত ধুয়ে নিন, তারপর লজ্জাস্থান ও শরীরের নাপাকি পরিষ্কার করুন।', en: 'Make the intention, say Bismillah, wash the hands, then clean the private parts and any impurity.', ar: 'انوِ وسَمِّ واغسل يديك ثم نظّف موضع الأذى.' } },
      { tag: 'sunnah', t: { bn: 'নামাযের ওযুর মতো ওযু করুন।', en: 'Perform wudu as for prayer.', ar: 'توضأ وضوءك للصلاة.' } },
      { tag: 'fard', t: { bn: 'মাথায় ও পুরো শরীরে পানি পৌঁছে দিন—ডান দিক, তারপর বাম দিক। কুলি ও নাকে পানি দেওয়া হানাফী মতে ফরয; অন্য মাযহাবে মতভেদ আছে।', en: 'Pour water over the head and the whole body, right side then left. Rinsing mouth and nose is obligatory in Hanafi fiqh; other schools differ.', ar: 'أفض الماء على رأسك وسائر جسدك، الأيمن ثم الأيسر. وفي المضمضة والاستنشاق خلاف.' } },
      { tag: 'tip', t: { bn: 'গোসলের জন্য আলাদা কোনো নির্দিষ্ট সহীহ দু‘আ প্রতিষ্ঠিত নয় (দু‘আ বিভাগ দেখুন)।', en: 'No specific authentic dua is established for ghusl (see the Duas section).', ar: 'لا يثبت دعاء مخصوص للغسل (انظر قسم الأدعية).' } }
    ] },
  { id: 'salah', icon: 'clock',
    title: { bn: 'পাঁচ ওয়াক্ত নামায ও নামাযের ধাপ', en: 'The Five Prayers and Prayer Steps', ar: 'الصلوات الخمس وخطوات الصلاة' },
    ref: 'Sahih al-Bukhari 631, 757; Sahih Muslim 397',
    items: [
      { tag: 'fard', t: { bn: 'ফরয রাকআত (মুকীম অবস্থায়): ফজর ২, যোহর ৪, আসর ৪, মাগরিব ৩, ইশা ৪।', en: 'Obligatory units (resident): Fajr 2, Dhuhr 4, Asr 4, Maghrib 3, Isha 4.', ar: 'الفرائض للمقيم: الفجر 2، الظهر 4، العصر 4، المغرب 3، العشاء 4.' } },
      { tag: 'fard', t: { bn: 'প্রস্তুতি: পবিত্রতা, পবিত্র কাপড়/স্থান, সতর ঢাকা, কিবলামুখী হওয়া, নিয়ত।', en: 'Preparation: purity, clean clothes/place, covering the awrah, facing the qiblah, intention.', ar: 'الاستعداد: الطهارة، وستر العورة، واستقبال القبلة، والنية.' } },
      { tag: 'fard', t: { bn: 'তাকবীর “আল্লাহু আকবার” বলে নামায শুরু করুন। হাত তোলা ও হাত বাঁধার পদ্ধতিতে মাযহাবভেদে পার্থক্য আছে।', en: 'Begin with the takbir "Allahu Akbar". Raising the hands and where to place them differ between schools.', ar: 'ابدأ بتكبيرة الإحرام. ورفع اليدين ووضعهما فيه اختلاف مشروع.' } },
      { tag: 'sunnah', t: { bn: 'সানা পড়ুন (দু‘আ বিভাগে দেখুন), তারপর আউযুবিল্লাহ ও বিসমিল্লাহ।', en: 'Recite the opening supplication (see Duas), then seek refuge and say Bismillah.', ar: 'اقرأ دعاء الاستفتاح ثم الاستعاذة والبسملة.' } },
      { tag: 'fard', t: { bn: 'সূরা আল-ফাতিহা পড়ুন, এরপর কুরআনের অন্য কিছু অংশ (প্রথম দুই রাকআতে)। মুক্তাদির ফাতিহা পড়া নিয়ে মাযহাবভেদে মতভেদ আছে।', en: 'Recite Surah Al-Fatiha, then another portion of the Quran (in the first two units). Whether the follower recites behind the imam differs between schools.', ar: 'اقرأ الفاتحة ثم ما تيسر من القرآن. وقراءة المأموم فيها خلاف.' } },
      { tag: 'fard', t: { bn: 'রুকু করুন, স্থির হয়ে তাসবীহ পড়ুন; তারপর সোজা হয়ে দাঁড়ান।', en: 'Bow in ruku, remain still and glorify Allah; then stand upright.', ar: 'اركع مطمئنًا وسبّح ثم ارفع واعتدل قائمًا.' } },
      { tag: 'fard', t: { bn: 'সিজদা করুন (কপাল, নাক, দুই হাত, দুই হাঁটু, দুই পায়ের আঙুল মাটিতে), তাসবীহ পড়ুন; দুই সিজদার মাঝে স্থির হয়ে বসুন; আবার সিজদা করুন।', en: 'Prostrate (forehead, nose, hands, knees, toes on the ground), glorify Allah; sit calmly between two prostrations; prostrate again.', ar: 'اسجد على الأعضاء السبعة وسبّح، ثم اجلس مطمئنًا واسجد ثانية.' } },
      { tag: 'fard', t: { bn: 'শেষ বৈঠকে তাশাহহুদ, দরূদ ও দু‘আ পড়ে ডানে ও বামে সালাম ফেরান। প্রথম বৈঠকের বিধানে মাযহাবভেদে পার্থক্য আছে।', en: 'In the final sitting recite tashahhud, salawat and a dua, then give salam right and left. The ruling of the first sitting differs between schools.', ar: 'في الجلوس الأخير: التشهد والصلاة الإبراهيمية والدعاء ثم التسليم. وحكم التشهد الأول فيه خلاف.' } },
      { tag: 'tip', t: { bn: 'সাধারণ ভুল: তাড়াহুড়ো করে রুকু-সিজদায় স্থিরতা না রাখা, কিবলা ঠিক না করা, সতর ঠিকমতো না ঢাকা।', en: 'Common mistakes: rushing without stillness in ruku/sujud, not checking the qiblah, not covering properly.', ar: 'أخطاء شائعة: ترك الطمأنينة في الركوع والسجود، وعدم التحقق من القبلة.' } }
    ] },
  { id: 'faq', icon: 'guide',
    title: { bn: 'সাধারণ প্রশ্নোত্তর', en: 'Frequently Asked Questions', ar: 'أسئلة شائعة' },
    ref: 'General guidance',
    items: [
      { tag: 'tip', t: { bn: 'দাঁড়াতে না পারলে? যে ব্যক্তি দাঁড়াতে অক্ষম সে বসে এবং তাও না পারলে শুয়ে নামায পড়তে পারে (সহীহ বুখারী ১১১৭)। নিজের অবস্থা অনুযায়ী আলিমের পরামর্শ নিন।', en: 'Unable to stand? A person who cannot stand may pray sitting, and if unable, lying down (Sahih al-Bukhari 1117). Ask a scholar about your own situation.', ar: 'من عجز عن القيام صلى جالسًا، فإن عجز فعلى جنب (البخاري 1117).' } },
      { tag: 'tip', t: { bn: 'রাকআত ভুলে গেলে? এর বিধান (সাহু সিজদা ইত্যাদি) মাযহাবভেদে ভিন্ন; নিজ মাযহাবের আলিমের কাছ থেকে জেনে নিন।', en: 'Forgot the number of units? The remedy (e.g., prostration of forgetfulness) differs by school; ask a scholar of your school.', ar: 'نسيان عدد الركعات: حكمه يختلف باختلاف المذاهب، فاسأل أهل العلم.' } },
      { tag: 'tip', t: { bn: 'আরবি পড়তে না পারলে? ধীরে ধীরে শিখুন; শেখার সময় ভালো উচ্চারণে অভিজ্ঞ কারো কাছে শুনে অনুশীলন করুন।', en: 'Can\'t read Arabic yet? Learn gradually and practise listening to a competent reciter or teacher.', ar: 'إن لم تُحسن العربية فتعلّم تدريجيًا على يد معلم متقن.' } },
      { tag: 'tip', t: { bn: 'নামাযের সময় বিষয়ে: অ্যাপের সময় একটি গণনাপদ্ধতির ফল। স্থানীয় মসজিদের সময়সূচির সাথে মিলিয়ে নিন।', en: 'About prayer times: the app shows a calculation result. Compare with your local mosque timetable.', ar: 'أوقات الصلاة في التطبيق نتيجة حساب؛ قارنها بجدول مسجدك.' } }
    ] }
];

/* Kids quiz — basic, widely agreed facts. a = index of correct option. */
window.QUIZ = [
  { q: { bn: 'দিনে কত ওয়াক্ত নামায ফরয?', en: 'How many daily prayers are obligatory?', ar: 'كم عدد الصلوات المفروضة يوميًا؟' }, o: ['৩ / 3 / ٣', '৫ / 5 / ٥', '৭ / 7 / ٧'], a: 1 },
  { q: { bn: 'কুরআনের প্রথম সূরা কোনটি?', en: 'Which is the first surah of the Quran?', ar: 'ما أول سورة في القرآن؟' }, o: ['Al-Fatiha', 'Al-Baqarah', 'Al-Ikhlas'], a: 0 },
  { q: { bn: 'কুরআনে মোট কতটি সূরা আছে?', en: 'How many surahs are in the Quran?', ar: 'كم عدد سور القرآن؟' }, o: ['99', '114', '120'], a: 1 },
  { q: { bn: 'রোযার মাসের নাম কী?', en: 'Which month do Muslims fast in?', ar: 'في أي شهر نصوم؟' }, o: ['Ramadan / রমযান / رمضان', 'Rajab / রজব / رجب', 'Muharram / মুহাররম / محرم'], a: 0 },
  { q: { bn: 'নামাযে আমরা কোন দিকে মুখ করি?', en: 'Which direction do we face in prayer?', ar: 'إلى أي جهة نتجه في الصلاة؟' }, o: ['Qibla (Kaaba) / কিবলা / القبلة', 'North / উত্তর / الشمال', 'Any / যেকোনো / أي جهة'], a: 0 },
  { q: { bn: 'খাওয়া শুরুর আগে কী বলি?', en: 'What do we say before eating?', ar: 'ماذا نقول قبل الأكل؟' }, o: ['Bismillah / বিসমিল্লাহ / بسم الله', 'Alhamdulillah / আলহামদুলিল্লাহ / الحمد لله', 'Assalamu alaikum'], a: 0 },
  { q: { bn: 'ইসলামের স্তম্ভ কয়টি?', en: 'How many pillars of Islam are there?', ar: 'كم أركان الإسلام؟' }, o: ['৪ / 4 / ٤', '৫ / 5 / ٥', '৬ / 6 / ٦'], a: 1 },
  { q: { bn: 'শেষ নবী কে?', en: 'Who is the final Prophet?', ar: 'من هو خاتم الأنبياء؟' }, o: ['Muhammad ﷺ / মুহাম্মাদ ﷺ / محمد ﷺ', 'Isa (AS)', 'Musa (AS)'], a: 0 },
  { q: { bn: 'সালাম দিলে কী বলি?', en: 'What greeting do Muslims give?', ar: 'ما تحية المسلمين؟' }, o: ['Assalamu alaikum / আসসালামু আলাইকুম / السلام عليكم', 'Good morning', 'Goodbye'], a: 0 }
];
