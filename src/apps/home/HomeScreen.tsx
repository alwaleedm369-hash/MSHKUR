import { Link } from 'react-router-dom';
import { Camera, Megaphone, Store, Sparkles, Zap, Shield, ArrowRight, Check, Image, Palette, Megaphone as MegaphoneIcon, Users, TrendingUp, BarChart3, Settings, Smartphone, Globe, Layers, Wand2, Scissors, Brush, Sun, Moon, Star, Diamond, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';

interface AppCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  features: string[];
  gradient: string;
  accentColor: string;
  badge?: string;
  stats?: { label: string; value: string }[];
}

const appCards: AppCardProps[] = [
  {
    title: 'استوديو الصور',
    description: 'معالجة صور السيارات باحترافية: إزالة الخلفية، طمس اللوحة، تضليل الزجاج، الإضاءة، الظلال، التوسيط، توحيد الصور',
    icon: <Camera className="h-8 w-8" />,
    href: '/photo-studio',
    features: [
      'إزالة الخلفية واستبدالها',
      'طمس لوحة السيارة تلقائياً',
      'تضليل الزجاج بذكاء',
      'تحسين الإضاءة والألوان',
      'إضافة ظلال واقعية',
      'توسيط وقص ذكي',
      'توحيد دفعات صور متعددة',
      'حفظ الأصل (KeepOriginal)',
    ],
    gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    accentColor: 'emerald',
    badge: 'الأكثر استخداماً',
    stats: [
      { label: 'صور معالجة', value: '50K+' },
      { label: 'معارض نشطة', value: '200+' },
      { label: 'دقة المعالجة', value: '99.2%' },
    ],
  },
  {
    title: 'استوديو الإعلان',
    description: 'إنشاء إعلانات سيارات احترافية: بيانات السيارة، الصور، نصوص ذكية، قوالب جاهزة، تصدير ومشاركة فورية',
    icon: <MegaphoneIcon className="h-8 w-8" />,
    href: '/ad-studio',
    features: [
      'إدخال بيانات السيارة المنظمة',
      'كتابة عنوان ووصف ذكي',
      'قوالب إعلانات متعددة',
      'مقاسات منصات مختلفة',
      'مشاركة وتصدير فوري',
      'تكامل مع استوديو الصور',
      'معاينة قبل النشر',
      'حفظ مسودات الإعلانات',
    ],
    gradient: 'from-amber-500 via-orange-600 to-red-600',
    accentColor: 'amber',
    badge: 'جديد',
    stats: [
      { label: 'إعلانات منشأة', value: '15K+' },
      { label: 'قوالب متاحة', value: '25+' },
      { label: 'منصات مدعومة', value: '8+' },
    ],
  },
  {
    title: 'المعرض والتاجر',
    description: 'مساحة متكاملة لإدارة المعرض: الهوية، المخزون، السيارات، العملاء، التسويق، مساعد التاجر الذكي',
    icon: <Store className="h-8 w-8" />,
    href: '/dealer-portal',
    features: [
      'ملف تعريفي للمعرض',
      'إدارة مخزون السيارات',
      'إضافة وتعديل السيارات',
      'تنظيم الإعلانات',
      'إدارة العملاء والاستفسارات',
      'أدوات تسويق مدمجة',
      'مساعد تاجر ذكي',
      'تقارير وإحصائيات',
    ],
    gradient: 'from-violet-500 via-purple-600 to-indigo-700',
    accentColor: 'violet',
    stats: [
      { label: 'معارض مسجلة', value: '100+' },
      { label: 'سيارات في المخزون', value: '5K+' },
      { label: 'عملاء نشطين', value: '2K+' },
    ],
  },
];

const trustIndicators = [
  { icon: Shield, label: 'آمن ومشفر', description: 'حماية البيانات بمعايير بنكية' },
  { icon: Zap, label: 'سريع وفوري', description: 'معالجة في ثوانٍ معدودة' },
  { icon: Smartphone, label: 'يعمل على الجوال', description: 'تجربة مثالية على جميع الأجهزة' },
  { icon: Globe, label: 'عربي وإنجليزي', description: 'دعم RTL/LTR كامل' },
];

const aiAssistantCard = {
  title: 'المساعد الذكي',
  description: 'نسختك. سكرتيرك. صديقك. مساعد عام يعمل داخل جميع التطبيقات، يفهم السياق وينفذ المهام',
  icon: <Sparkles className="h-8 w-8" />,
  href: '/ai-assistant',
  features: [
    'دردشة سياقية ذكية',
    'تنفيذ مهام عبر التطبيقات',
    'كتابة إعلانات احترافية',
    'تحليل ومعالجة صور',
    'إدارة مهام المعرض',
    'بحث ومقارنة سيارات',
    'تذكيرات ومواعيد',
    'تكامل واتساب (قريباً)',
  ],
  gradient: 'from-brand-500 via-brand-600 to-brand-700',
  accentColor: 'brand',
  badge: 'مدمج في كل التطبيقات',
};

export const HomeScreen = () => {
  return (
    <div className="min-h-screen bg-surface-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24 lg:pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 md:w-[400px] md:h-[400px] bg-gradient-to-bl from-brand-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[400px] md:h-[400px] bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand-500/5 to-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="container-mshkur relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Brand Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 mb-6 border border-brand-100"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 h-full w-full rounded-full bg-brand-500 animate-ping" />
                <span className="relative h-full w-full rounded-full bg-brand-500" />
              </span>
              <span className="text-body-sm font-medium text-brand-700 dark:text-brand-300">
                منصة ذكية للسيارات — معالجة صور، إعلانات، إدارة معارض
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-display-xl font-bold text-surface-900 dark:text-white mb-6 text-balance"
            >
              أنت تطلب. <span className="text-gradient">مشكور يساعدك.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-body-lg text-surface-600 dark:text-surface-400 mb-10 max-w-2xl mx-auto text-pretty"
            >
              ثلاث تطبيقات متخصصة، مساعد ذكي واحد، محرك مركزي قوي. ابدأ من المهمة، احصل على النتيجة فوراً.
            </motion.p>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/photo-studio"
                className="btn btn-xl w-full sm:w-auto gap-3 bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 shadow-lg shadow-brand-500/25"
              >
                <Zap className="h-6 w-6" />
                <span>جرب استوديو الصور الآن</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/ai-assistant"
                className="btn btn-xl w-full sm:w-auto gap-2 btn-outline border-2 border-surface-300 hover:border-brand-500"
              >
                <Sparkles className="h-5 w-5" />
                <span>تحدث مع المساعد</span>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-body-sm text-surface-500"
            >
              {trustIndicators.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1, duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-9 w-9 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-brand-500">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="text-start hidden sm:block">
                    <p className="font-medium text-surface-700 dark:text-surface-300">{item.label}</p>
                    <p className="text-body-xs text-surface-400">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Apps Grid Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-white">
        <div className="container-mshkur">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-display-md font-bold text-surface-900 dark:text-white mb-4">
              تطبيقاتك الثلاثة
            </h2>
            <p className="text-body-lg text-surface-600 dark:text-surface-400">
              كل تطبيق مستقل ومتخصص. ادخل، أنجز، اخرج. لا تعقيد، لا منحنى تعلم.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {appCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <AppCard card={card} />
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-surface-50 to-white">
        <div className="container-mshkur">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <AppCard card={aiAssistantCard as AppCardProps} isAssistant={true} />
          </motion.div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-mshkur">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-display-md font-bold text-surface-900 dark:text-white mb-4">
              قدرات محرك مشكور
            </h2>
            <p className="text-body-lg text-surface-600 dark:text-surface-400">
              تقنيات متقدمة تعمل في الخلفية لتقدم لك أفضل النتائج
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Wand2, title: 'إزالة خلفية ذكية', desc: 'نماذج متطورة تفصل السيارة بدقة بيكسل' },
              { icon: Scissors, title: 'طمس اللوحة التلقائي', desc: 'كشف وإخفاء اللوحات دون تدخل يدوي' },
              { icon: Sun, title: 'إضاءة احترافية', desc: 'معادلة الإضاءة وإزالة الظلال غير المرغوبة' },
              { icon: Moon, title: 'ظلال واقعية', desc: 'ربط السيارة بالأرض بظلال فيزيائية صحيحة' },
              { icon: Brush, title: 'توحيد الدفعات', desc: 'إضاءة وخلفية وأبعاد موحدة لمجموعة صور' },
              { icon: Palette, title: 'خلفيات متنوعة', desc: 'استوديو، خارجية، بيضاء، واقعية، مخصصة' },
              { icon: Layers, title: 'KeepOriginal', desc: 'الأصل محفوظ دائماً، كل معالجة نسخة مستقلة' },
              { icon: Diamond, title: 'جودة تجارية', desc: 'مخرجات تنافس carflowai.com و spyne.ai' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="card p-6 text-center hover:border-brand-300"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-heading-md font-semibold text-surface-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-body-sm text-surface-500 dark:text-surface-400">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-surface-50">
        <div className="container-mshkur">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-display-md font-bold text-surface-900 dark:text-white mb-4">
              كيف يعمل مشكور
            </h2>
            <p className="text-body-lg text-surface-600 dark:text-surface-400">
              ثلاث خطوات بسيطة من الفكرة للنتيجة
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: '01', title: 'اختر مهمتك', desc: 'استوديو الصور، استوديو الإعلان، أو المعرض والتاجر', icon: Sparkles },
              { step: '02', title: 'نفذ مباشرة', desc: 'ارفع الصور، أدخل البيانات، اكتب النص — الأداة تعمل فوراً', icon: Zap },
              { step: '03', title: 'احصل على النتيجة', desc: 'صور معالجة، إعلان جاهز، مخزون منظم — حفظ، مشاركة، تصدير', icon: Check },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className="card p-6 h-full relative overflow-hidden">
                  <div className="absolute top-4 left-4 text-heading-xs font-bold text-brand-500/50">{step.step}</div>
                  <div className="relative z-10">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 mb-4">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-heading-lg font-semibold text-surface-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-body-md text-surface-600 dark:text-surface-400">
                      {step.desc}
                    </p>
                  </div>
                </div>
                {i < 2 && (
                  <div className="hidden lg:block absolute top-10 -right-2 w-4 h-4 border-t-2 border-r-2 border-brand-200 rotate-45" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container-mshkur">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-8 md:p-16 text-center"
          >
            {/* Decorative elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 mb-6 backdrop-blur border border-white/20">
                <Star className="h-4 w-4 text-amber-300" />
                <span className="text-body-sm font-medium text-white">مجاني للبدء • لا بطاقة مطلوبة • إلغاء في أي وقت</span>
              </div>
              <h2 className="text-display-lg font-bold text-white mb-4 text-balance">
                ابدأ مع مشكور اليوم
              </h2>
              <p className="text-body-lg text-brand-100 mb-8 max-w-xl mx-auto">
                انضم لمئات المعارض والمصورين الذين يستخدمون مشكور لمعالجة صور سياراتهم وإنشاء إعلانات احترافية
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/photo-studio"
                  className="btn btn-xl w-full sm:w-auto gap-3 bg-white text-brand-700 hover:bg-brand-50 shadow-lg"
                >
                  <Camera className="h-6 w-6" />
                  <span>جرب استوديو الصور مجاناً</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/ai-assistant"
                  className="btn btn-xl w-full sm:w-auto gap-2 border-2 border-white/30 text-white hover:bg-white/10"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>تحدث مع المساعد</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const AppCard = ({ card, isAssistant = false }: { card: AppCardProps; isAssistant?: boolean }) => {
  const { title, description, icon, href, features, gradient, accentColor, badge, stats } = card;

  return (
    <Link
      to={href}
      className="card-interactive group h-full flex flex-col overflow-hidden relative"
      style={{
        '--card-gradient': `linear-gradient(135deg, ${gradient.replace('from-', '').replace('via-', '').replace('to-', '')})`,
      }}
    >
      {/* Gradient Top Border */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to))` }}
      >
        <div className="w-full h-full bg-gradient-to-r" style={{ background: `linear-gradient(90deg, ${gradient})` }} />
      </div>

      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${gradient})` }}>
              {icon}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          {badge && (
            <span className="flex-shrink-0 badge badge-primary text-body-xs px-2 py-1">
              {badge}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="mb-6">
          <h3 className="text-heading-lg font-bold text-surface-900 dark:text-white mb-2 group-hover:text-brand-600 transition-colors">
            {title}
          </h3>
          <p className="text-body-sm text-surface-500 dark:text-surface-400 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Features */}
        <ul className="flex-1 space-y-2 mb-6" role="list">
          {features.slice(0, 4).map((feature, i) => (
            <motion.li
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2 text-body-sm text-surface-600 dark:text-surface-400 group-hover:text-surface-700 dark:group-hover:text-surface-300 transition-colors"
            >
              <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{feature}</span>
            </motion.li>
          ))}
          {features.length > 4 && (
            <motion.li
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-body-sm text-brand-600 font-medium"
            >
              +{features.length - 4} ميزة أخرى
            </motion.li>
          )}
        </ul>

        {/* Stats */}
        {stats && (
          <div className="border-t border-surface-200 pt-4 flex items-center justify-between">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="text-center flex-1"
              >
                <p className="text-heading-md font-bold text-surface-900 dark:text-white">{stat.value}</p>
                <p className="text-body-xs text-surface-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer Action */}
        <div className="mt-auto pt-4">
          <div className="btn w-full justify-center gap-2 bg-surface-100 text-surface-700 hover:bg-brand-50 hover:text-brand-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:bg-brand-900/30 dark:group-hover:text-brand-400 transition-all">
            <span className="font-medium">ابدأ الآن</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};