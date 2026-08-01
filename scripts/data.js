/* ============================================================
   Marsa Moments — excursion catalogue + site config
   Bilingual (EN / AR). Single source of truth for the site
   and the static tour-page / sitemap build (scripts/build.js).
   Runs in the browser (window.*) and in Node (module.exports).
   ============================================================ */
(function (root) {
  "use strict";

  /* ---- Business & site config — EDIT THESE TO GO LIVE ---- */
  var CONFIG = {
    // Public site URL (used for canonical links, sitemap, OG). No trailing slash.
    siteUrl: "https://seifabas33-pixel.github.io/marsa-moments",

    // WhatsApp number — digits only, incl. country code. Replace with the real one.
    whatsapp: "201000000000",
    whatsappGreeting: {
      en: "Hi Marsa Moments! I'd love to plan some excursions in Marsa Alam.",
      ar: "مرحبًا مرسى مومنتس! أودّ التخطيط لبعض الرحلات في مرسى علم."
    },
    email: "hello@marsamoments.com",

    // Lead backend: paste a Formspree form endpoint (or any URL that accepts
    // a JSON/form POST) to store & email leads. Leave "" to use WhatsApp only.
    // e.g. "https://formspree.io/f/xxxxxxxx"
    formEndpoint: "",

    // Currency — prices in the catalogue are in USD (base). Edit rates any time.
    currency: {
      base: "USD",
      default: "USD",
      rates:   { USD: 1, EUR: 0.92, EGP: 49 },
      symbols: { USD: "$", EUR: "€", EGP: "E£" },
      // round each currency to the nearest step
      step:    { USD: 1, EUR: 1, EGP: 50 }
    },

    defaultLang: "en"
  };

  /* ---- Excursions ----
     Top-level: id, category, priceUSD, img.
     Per-language: title, tag, duration, unit, short, long, includes[], highlights[] */
  var EXCURSIONS = [
    {
      id: "dolphin-house", category: "sea", priceUSD: 55,
      img: "https://images.unsplash.com/photo-1607153333879-c174d265f1d2?auto=format&fit=crop&w=1000&q=80",
      en: {
        title: "Dolphin House — Sha'ab Samadai", tag: "Most loved", duration: "Full day", unit: "per person",
        short: "Snorkel the horseshoe reef where wild spinner dolphins rest and play.",
        long: "Sha'ab Samadai — 'Dolphin House' — is a crescent-shaped reef where pods of wild spinner dolphins gather in the sheltered lagoon. We time our arrival with the calm hours, cruise past three coral pinnacles, and give you plenty of water time to snorkel the shallow gardens. A protected marine zone, so numbers are limited and respect for the dolphins comes first.",
        includes: ["Boat trip & 2–3 snorkel stops", "Snorkel gear & life jacket", "Marine-park fee", "Lunch, soft drinks & water", "Hotel pickup & drop-off"],
        highlights: ["Wild spinner dolphins", "Coral pinnacles & lagoon", "Great for families"]
      },
      ar: {
        title: "بيت الدلافين — شعب سمداي", tag: "الأكثر تفضيلاً", duration: "يوم كامل", unit: "للفرد",
        short: "غطس سطحي في الشعاب على شكل حدوة الحصان حيث تستريح الدلافين البرية وتلعب.",
        long: "شعب سمداي — «بيت الدلافين» — شعاب مرجانية هلالية الشكل تتجمّع فيها قطعان الدلافين الدوّارة البرية داخل البحيرة المحمية. نصل في ساعات الهدوء، ونمرّ بثلاث قمم مرجانية، ونمنحك وقتًا وافرًا للغطس فوق الحدائق الضحلة. منطقة بحرية محمية، لذا الأعداد محدودة واحترام الدلافين أولوية.",
        includes: ["رحلة بحرية و2–3 محطات غطس", "معدات الغطس وسترة نجاة", "رسوم المحمية البحرية", "غداء ومشروبات ومياه", "توصيل من وإلى الفندق"],
        highlights: ["دلافين دوّارة برية", "قمم مرجانية وبحيرة", "مثالية للعائلات"]
      }
    },
    {
      id: "abu-dabbab-turtles", category: "sea", priceUSD: 35,
      img: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1000&q=80",
      en: {
        title: "Turtles & Dugong — Abu Dabbab", tag: "Wildlife", duration: "Half / full day", unit: "per person",
        short: "Glide over seagrass meadows grazed by green turtles and the rare dugong.",
        long: "Abu Dabbab bay is famous for its shallow seagrass beds — the feeding grounds of large green turtles and, if luck is with you, the elusive dugong (sea cow). Entry is straight off the beach, so it suits every level, and guides point out guitarfish, moray eels and the resident turtles. A gentle, magical snorkel just south of Marsa Alam.",
        includes: ["Beach-entry snorkeling", "Snorkel gear & guide", "Bay access fee", "Sun beds & shade", "Hotel pickup & drop-off"],
        highlights: ["Green sea turtles", "Chance of dugong", "Easy beach entry"]
      },
      ar: {
        title: "السلاحف وبقر البحر — أبو دباب", tag: "حياة برية", duration: "نصف / يوم كامل", unit: "للفرد",
        short: "انسَب فوق مروج الأعشاب البحرية حيث ترعى السلاحف الخضراء وبقر البحر النادر.",
        long: "يشتهر خليج أبو دباب بمروجه الضحلة من الأعشاب البحرية — موطن تغذية السلاحف الخضراء الكبيرة، وإن حالفك الحظ، بقر البحر (الأطوم) النادر. الدخول مباشرة من الشاطئ فيناسب كل المستويات، ويرشدك المرشدون إلى سمك الجيتار وثعابين المورَي والسلاحف المقيمة. غطس لطيف وساحر جنوب مرسى علم مباشرة.",
        includes: ["غطس سطحي من الشاطئ", "معدات الغطس ومرشد", "رسوم دخول الخليج", "كراسي ومظلات", "توصيل من وإلى الفندق"],
        highlights: ["سلاحف بحرية خضراء", "فرصة لرؤية الأطوم", "دخول سهل من الشاطئ"]
      }
    },
    {
      id: "elphinstone-dive", category: "dive", priceUSD: 95,
      img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80",
      en: {
        title: "Elphinstone Reef Diving", tag: "Certified divers", duration: "Full day · 2 dives", unit: "per person",
        short: "Two boat dives on the legendary drop-off — walls, corals and big pelagics.",
        long: "Elphinstone is Marsa Alam's crown jewel: a slender offshore reef falling into the blue on both sides, draped in soft corals and gorgonians. Drift the plateaus and walls with the current and keep your eyes on the blue for barracuda, trevally, reef sharks and — in season — the oceanic whitetip. Two guided boat dives for certified divers (AOW recommended).",
        includes: ["2 guided boat dives", "Full scuba equipment", "Tanks, weights & Nitrox on request", "Lunch & drinks on board", "Hotel pickup & drop-off"],
        highlights: ["Dramatic wall dive", "Pelagic action", "World-famous reef"]
      },
      ar: {
        title: "الغوص في شعاب إلفنستون", tag: "غوّاصون معتمدون", duration: "يوم كامل · غوصتان", unit: "للفرد",
        short: "غوصتان بحريتان على الجدار الأسطوري — جدران وشعاب وأسماك مفتوحة كبيرة.",
        long: "إلفنستون جوهرة مرسى علم: شعاب بحرية نحيلة تنحدر إلى الأزرق من الجانبين، مكسوّة بالمرجان الليّن والغورغونيا. انسَب مع التيار على الهضاب والجدران وراقب الأزرق بحثًا عن الباراكودا والتريفالي وأسماك القرش الشعابية — وفي موسمها، القرش المحيطي أبيض الأطراف. غوصتان بحريتان بإرشاد للغوّاصين المعتمدين (يُفضَّل مستوى AOW).",
        includes: ["غوصتان بحريتان بإرشاد", "معدات غوص كاملة", "أسطوانات وأوزان ونيتروكس عند الطلب", "غداء ومشروبات على المركب", "توصيل من وإلى الفندق"],
        highlights: ["غوص جداري مذهل", "حركة أسماك مفتوحة", "شعاب شهيرة عالميًا"]
      }
    },
    {
      id: "sataya-reef", category: "sea", priceUSD: 70,
      img: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1000&q=80",
      en: {
        title: "Sataya Reef — Dolphin Snorkel Safari", tag: "Full day south", duration: "Long day", unit: "per person",
        short: "Head south to a vast reef where hundreds of dolphins roam.",
        long: "Sataya, in the Fury Shoals down south, is one of the Red Sea's great dolphin encounters — a huge reef system with a resident population of spinner dolphins and pristine coral gardens far from the crowds. A longer day on a comfortable boat, rewarded with multiple snorkel stops and some of the clearest water you'll ever float in.",
        includes: ["Full-day boat safari", "Multiple snorkel stops", "Gear, guide & life jacket", "Breakfast & lunch on board", "Hotel pickup & drop-off"],
        highlights: ["Large dolphin pods", "Pristine Fury Shoals", "Away from crowds"]
      },
      ar: {
        title: "شعاب ساتايا — سفاري الدلافين", tag: "يوم كامل جنوبًا", duration: "يوم طويل", unit: "للفرد",
        short: "اتجه جنوبًا إلى شعاب شاسعة تجوبها مئات الدلافين.",
        long: "ساتايا، في منطقة فيوري شولز جنوبًا، من أروع لقاءات الدلافين في البحر الأحمر — منظومة شعاب ضخمة يقطنها سرب مقيم من الدلافين الدوّارة وحدائق مرجانية بكر بعيدًا عن الزحام. يوم أطول على مركب مريح، تكافئه محطات غطس متعددة ومياه من أصفى ما تسبح فيه.",
        includes: ["سفاري بحري ليوم كامل", "محطات غطس متعددة", "معدات ومرشد وسترة نجاة", "إفطار وغداء على المركب", "توصيل من وإلى الفندق"],
        highlights: ["أسراب دلافين كبيرة", "شعاب فيوري شولز البكر", "بعيدًا عن الزحام"]
      }
    },
    {
      id: "wadi-el-gemal", category: "desert", priceUSD: 60,
      img: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=80",
      en: {
        title: "Wadi El Gemal National Park", tag: "Nature", duration: "Full day", unit: "per person",
        short: "Mangroves, gazelles and ancient valleys in a protected wilderness.",
        long: "The 'Valley of the Camels' stretches from mountain to sea — a national park of mangrove lagoons, desert plains and Roman-era emerald mines. By 4x4 we explore Wadi and Qulaan's mangrove islands, watch for gazelles and migratory birds, sip tea with Ababda Bedouin, and finish with a snorkel over untouched shallows.",
        includes: ["4x4 park safari", "Licensed park guide", "Park entry permit", "Bedouin tea & lunch", "Hotel pickup & drop-off"],
        highlights: ["Mangrove lagoons", "Desert wildlife", "Bedouin culture"]
      },
      ar: {
        title: "محمية وادي الجمال", tag: "طبيعة", duration: "يوم كامل", unit: "للفرد",
        short: "أشجار المانغروف والغزلان والأودية القديمة في بريّة محمية.",
        long: "يمتد «وادي الجمال» من الجبل إلى البحر — محمية طبيعية من بحيرات المانغروف والسهول الصحراوية ومناجم الزمرّد الرومانية. بسيارات الدفع الرباعي نستكشف جزر المانغروف في القلعان، ونراقب الغزلان والطيور المهاجرة، ونحتسي الشاي مع بدو العبابدة، ونختم بغطسة فوق مياه ضحلة بكر.",
        includes: ["سفاري بالدفع الرباعي", "مرشد محمية مرخّص", "تصريح دخول المحمية", "شاي بدوي وغداء", "توصيل من وإلى الفندق"],
        highlights: ["بحيرات المانغروف", "حياة برية صحراوية", "ثقافة بدوية"]
      }
    },
    {
      id: "desert-safari", category: "desert", priceUSD: 45,
      img: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=1000&q=80",
      en: {
        title: "Desert Safari & Bedouin Night", tag: "Sunset", duration: "Afternoon → night", unit: "per person",
        short: "Quad bikes, camels, a Bedouin feast and a sky full of stars.",
        long: "As the heat softens, we head into the dunes: ride a quad bike across the sand, meet the camels, and roll into a Bedouin camp for grilled dinner, sweet tea and live tabla drumming. Then the lights go out and the desert sky ignites — one of the darkest, starriest skies you'll ever stand under.",
        includes: ["Quad bike ride", "Camel ride", "Bedouin dinner & tea", "Stargazing session", "Hotel pickup & drop-off"],
        highlights: ["Dune quad biking", "Bedouin feast", "Incredible stargazing"]
      },
      ar: {
        title: "سفاري الصحراء وليلة بدوية", tag: "غروب", duration: "بعد الظهر ← ليلاً", unit: "للفرد",
        short: "دراجات رباعية وجِمال ومأدبة بدوية وسماء مليئة بالنجوم.",
        long: "مع اعتدال الحرارة نتوجّه إلى الكثبان: قُد دراجة رباعية فوق الرمال، وتعرّف على الجِمال، وادخل مخيمًا بدويًا لعشاء مشوي وشاي وإيقاع الطبلة الحيّ. ثم تنطفئ الأضواء وتشتعل سماء الصحراء — من أصفى وأكثر السماوات نجومًا التي ستقف تحتها.",
        includes: ["جولة دراجة رباعية", "ركوب الجِمال", "عشاء وشاي بدوي", "جلسة رصد النجوم", "توصيل من وإلى الفندق"],
        highlights: ["دراجات رباعية على الكثبان", "مأدبة بدوية", "رصد نجوم مذهل"]
      }
    },
    {
      id: "house-reef-snorkel", category: "sea", priceUSD: 30,
      img: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=1000&q=80",
      en: {
        title: "Marsa Mubarak Bay Snorkel", tag: "Half day", duration: "Half day", unit: "per person",
        short: "A gentle bay of seagrass and coral — turtles, rays and a shipwreck feel.",
        long: "Marsa Mubarak is a horseshoe bay where seagrass meadows meet fringing reef — an easy, sheltered snorkel rich with turtles, stingrays, and the occasional dugong. Perfect as a relaxed half-day or a first taste of the Red Sea before the bigger trips.",
        includes: ["Guided bay snorkel", "Gear & life jacket", "Bay access fee", "Water & fruit", "Hotel pickup & drop-off"],
        highlights: ["Turtles & rays", "Calm, shallow bay", "Beginner friendly"]
      },
      ar: {
        title: "غطس خليج مرسى مبارك", tag: "نصف يوم", duration: "نصف يوم", unit: "للفرد",
        short: "خليج لطيف من الأعشاب البحرية والمرجان — سلاحف وأسماك راي وأجواء ساحرة.",
        long: "مرسى مبارك خليج على شكل حدوة حصان تلتقي فيه مروج الأعشاب البحرية بالشعاب — غطس سهل ومحمي غني بالسلاحف وأسماك الراي، وأحيانًا الأطوم. مثالي لنصف يوم هادئ أو لتذوّق البحر الأحمر لأول مرة قبل الرحلات الأكبر.",
        includes: ["غطس بالخليج بإرشاد", "معدات وسترة نجاة", "رسوم دخول الخليج", "مياه وفاكهة", "توصيل من وإلى الفندق"],
        highlights: ["سلاحف وأسماك راي", "خليج هادئ وضحل", "مناسب للمبتدئين"]
      }
    },
    {
      id: "discover-scuba", category: "dive", priceUSD: 65,
      img: "https://images.unsplash.com/photo-1682687982501-1e58ab814714?auto=format&fit=crop&w=1000&q=80",
      en: {
        title: "Discover Scuba Diving", tag: "First timers", duration: "Half day", unit: "per person",
        short: "Never dived before? Breathe underwater safely with a PADI pro.",
        long: "Your first breath underwater, guided one-on-one by a PADI instructor. After a relaxed briefing and a shallow warm-up, you'll descend the house reef among clouds of anthias, clownfish and coral. No certification or experience needed — just the willingness to try something unforgettable.",
        includes: ["Instructor-led first dive", "All scuba equipment", "Safety briefing & shallow practice", "Underwater photos on request", "Hotel pickup & drop-off"],
        highlights: ["No experience needed", "One-on-one PADI pro", "Full gear included"]
      },
      ar: {
        title: "اكتشف الغوص", tag: "لأول مرة", duration: "نصف يوم", unit: "للفرد",
        short: "لم تغُص من قبل؟ تنفّس تحت الماء بأمان مع مدرّب PADI.",
        long: "أول أنفاسك تحت الماء بإرشاد فردي من مدرّب PADI. بعد شرح مريح وإحماء في المياه الضحلة، تنزل إلى شعاب النُّزُل بين أسراب الأنثياس وسمك المهرّج والمرجان. لا حاجة لشهادة أو خبرة — فقط الرغبة في تجربة لا تُنسى.",
        includes: ["أول غوصة بإشراف مدرّب", "كل معدات الغوص", "شرح أمان وتدريب في الضحل", "صور تحت الماء عند الطلب", "توصيل من وإلى الفندق"],
        highlights: ["لا حاجة لخبرة", "مدرّب PADI فردي", "المعدات كاملة مشمولة"]
      }
    },
    {
      id: "port-ghalib", category: "culture", priceUSD: 20,
      img: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1000&q=80",
      en: {
        title: "Port Ghalib Marina Evening", tag: "Relaxed", duration: "Evening", unit: "per person",
        short: "Stroll the marina, browse the souk and dine by the water.",
        long: "A laid-back evening around Port Ghalib's palm-lined marina: wander the promenade, haggle for spices and lanterns in the little souk, watch the yachts light up, and settle in for dinner by the water. A gentle, culture-rich evening — great for the day you keep dry.",
        includes: ["Return transfer", "Guided marina orientation", "Free time for souk & dining", "Local tips & recommendations"],
        highlights: ["Marina promenade", "Souk shopping", "Waterfront dining"]
      },
      ar: {
        title: "أمسية مرسى بورت غالب", tag: "هادئة", duration: "مساءً", unit: "للفرد",
        short: "تجوّل في المارينا وتسوّق في السوق وتناول العشاء على الماء.",
        long: "أمسية هادئة حول مارينا بورت غالب المحاطة بالنخيل: تمشَّ على الممشى، وساوم على التوابل والفوانيس في السوق الصغير، وشاهد اليخوت تتلألأ، واستقرّ لعشاء على الماء. أمسية لطيفة غنية بالثقافة — مثالية ليومك بعيدًا عن البحر.",
        includes: ["انتقال ذهابًا وإيابًا", "تعريف بالمارينا بإرشاد", "وقت حر للسوق والعشاء", "نصائح وتوصيات محلية"],
        highlights: ["ممشى المارينا", "تسوّق السوق", "عشاء على الواجهة البحرية"]
      }
    },
    {
      id: "luxor-day", category: "culture", priceUSD: 110,
      img: "https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&fit=crop&w=1000&q=80",
      en: {
        title: "Luxor — Valley of the Kings", tag: "Icon", duration: "Long day", unit: "per person",
        short: "A grand day trip to ancient Thebes — tombs, temples and the Nile.",
        long: "Trade the reef for the river. An early start carries you to Luxor, the world's greatest open-air museum: descend into the painted tombs of the Valley of the Kings, stand before the colossi of Karnak and Hatshepsut's terraced temple, and glimpse the timeless Nile. A big, rewarding day with an expert Egyptologist guide.",
        includes: ["Air-conditioned transfer", "Egyptologist guide", "Entry to key sites", "Lunch en route", "Hotel pickup & drop-off"],
        highlights: ["Valley of the Kings", "Karnak Temple", "Expert guide"]
      },
      ar: {
        title: "الأقصر — وادي الملوك", tag: "أيقونة", duration: "يوم طويل", unit: "للفرد",
        short: "رحلة يوم كبرى إلى طيبة القديمة — مقابر ومعابد والنيل.",
        long: "بدّل الشعاب بالنهر. تنطلق مبكرًا إلى الأقصر، أعظم متحف مفتوح في العالم: انزل إلى مقابر وادي الملوك المزخرفة، وقف أمام تماثيل الكرنك ومعبد حتشبسوت المدرّج، وألقِ نظرة على النيل الخالد. يوم كبير ومُجزٍ مع مرشد مصريّات خبير.",
        includes: ["انتقال مكيّف", "مرشد مصريّات", "دخول المواقع الرئيسية", "غداء في الطريق", "توصيل من وإلى الفندق"],
        highlights: ["وادي الملوك", "معبد الكرنك", "مرشد خبير"]
      }
    },
    {
      id: "hamata-islands", category: "sea", priceUSD: 75,
      img: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1000&q=80",
      en: {
        title: "Hamata Islands & Qulaan Mangroves", tag: "Hidden gem", duration: "Full day", unit: "per person",
        short: "Sandbanks, birdlife and glassy shallows in the deep south.",
        long: "Far south near Hamata, a scatter of sandy islands and mangrove channels sits in impossibly clear, shallow water. We cruise between the banks, snorkel vivid coral gardens, watch ospreys and flamingos over the Qulaan mangroves, and picnic on a private stretch of sand. Remote, serene and rarely busy.",
        includes: ["Full-day boat trip", "Island & mangrove stops", "Snorkel gear & guide", "Lunch & drinks", "Hotel pickup & drop-off"],
        highlights: ["Desert-island sandbanks", "Mangrove birdlife", "Crystal shallows"]
      },
      ar: {
        title: "جزر حماطة ومانغروف القلعان", tag: "جوهرة خفية", duration: "يوم كامل", unit: "للفرد",
        short: "جزر رملية وطيور ومياه ضحلة زجاجية في أقصى الجنوب.",
        long: "في أقصى الجنوب قرب حماطة، تتناثر جزر رملية وقنوات مانغروف في مياه ضحلة صافية بشكل لا يُصدَّق. نبحر بين الجزر، ونغطس فوق حدائق مرجانية زاهية، ونراقب العقاب النسّاري والفلامنغو فوق مانغروف القلعان، ونتنزّه على شاطئ رملي خاص. نائية وهادئة ونادرًا ما تزدحم.",
        includes: ["رحلة بحرية ليوم كامل", "محطات جزر ومانغروف", "معدات غطس ومرشد", "غداء ومشروبات", "توصيل من وإلى الفندق"],
        highlights: ["جزر رملية معزولة", "طيور المانغروف", "مياه ضحلة صافية"]
      }
    },
    {
      id: "fishing-trip", category: "sea", priceUSD: 50,
      img: "https://images.unsplash.com/photo-1445208989003-f203bd5e8a4b?auto=format&fit=crop&w=1000&q=80",
      en: {
        title: "Red Sea Fishing Trip", tag: "Small groups", duration: "Half / full day", unit: "per person",
        short: "Troll and bottom-fish the offshore reefs with a local captain.",
        long: "Head out with a seasoned captain to troll the blue and bottom-fish the reef edges for barracuda, trevally, snapper and more. All tackle provided, tips freely given, and — if you like — the crew will grill your catch on board. A calm, sociable day on the water for anglers and first-timers alike.",
        includes: ["Private-style boat & captain", "Rods, tackle & bait", "Soft drinks & water", "Catch grilled on request", "Hotel pickup & drop-off"],
        highlights: ["Troll & bottom fishing", "All gear included", "Grill your catch"]
      },
      ar: {
        title: "رحلة صيد في البحر الأحمر", tag: "مجموعات صغيرة", duration: "نصف / يوم كامل", unit: "للفرد",
        short: "صيد بالجرّ وعلى القاع عند الشعاب البحرية مع قبطان محلي.",
        long: "انطلق مع قبطان محنّك للصيد بالجرّ في الأزرق وعلى حواف الشعاب بحثًا عن الباراكودا والتريفالي والسنابر وغيرها. كل العُدّة متوفرة، والنصائح مبذولة، وإن رغبت يشوي لك الطاقم صيدك على المركب. يوم هادئ واجتماعي على الماء للصيادين والمبتدئين معًا.",
        includes: ["مركب خاص وقبطان", "صنانير وعُدّة وطُعم", "مشروبات ومياه", "شيّ الصيد عند الطلب", "توصيل من وإلى الفندق"],
        highlights: ["صيد بالجرّ وعلى القاع", "كل المعدات مشمولة", "اشوِ صيدك"]
      }
    }
  ];

  root.MARSA_CONFIG = CONFIG;
  root.MARSA_EXCURSIONS = EXCURSIONS;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { CONFIG: CONFIG, EXCURSIONS: EXCURSIONS };
  }
})(typeof window !== "undefined" ? window : globalThis);
