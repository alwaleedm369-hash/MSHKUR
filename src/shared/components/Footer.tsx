import { Link } from 'react-router-dom';
import { Sparkles, Twitter, Instagram, Linkedin, Github, Mail, Phone, MapPin, Heart, Shield, Zap, Globe } from 'lucide-react';
import { cn } from '@utils/cn';

const footerLinks = {
  المنتج: [
    { name: 'استوديو الصور', href: '/photo-studio' },
    { name: 'استوديو الإعلان', href: '/ad-studio' },
    { name: 'المعرض والتاجر', href: '/dealer-portal' },
    { name: 'المساعد الذكي', href: '/ai-assistant' },
  ],
  الشركة: [
    { name: 'من نحن', href: '/about' },
    { name: 'المدونة', href: '/blog' },
    { name: 'الوظائف', href: '/careers' },
    { name: 'صحافة', href: '/press' },
  ],
  الدعم: [
    { name: 'مركز المساعدة', href: '/help' },
    { name: 'التوثيق', href: '/docs' },
    { name: 'واجهة برمجة التطبيقات', href: '/api-docs' },
    { name: 'حالة النظام', href: '/status' },
  ],
  القانوني: [
    { name: 'الخصوصية', href: '/privacy' },
    { name: 'الشروط', href: '/terms' },
    { name: 'ملفات تعريف الارتباط', href: '/cookies' },
    { name: 'الأمان', href: '/security' },
  ],
};

const socialLinks = [
  { name: 'تويتر', href: 'https://twitter.com/mshkur', icon: Twitter },
  { name: 'إنستغرام', href: 'https://instagram.com/mshkur', icon: Instagram },
  { name: 'لينكد إن', href: 'https://linkedin.com/company/mshkur', icon: Linkedin },
  { name: 'جيت هاب', href: 'https://github.com/aimshkur', icon: Github },
];

export const Footer = () => {
  return (
    <footer className="bg-surface-50 border-t border-surface-200" role="contentinfo">
      <div className="container-mshkur py-12 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="مشكور - الصفحة الرئيسية">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
                <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-heading-lg font-bold text-surface-900 dark:text-white">مشكور</span>
            </Link>
            <p className="text-body-md text-surface-600 dark:text-surface-400 mb-6 max-w-xs line-clamp-3">
              منصة ذكية متخصصة للسيارات: معالجة الصور، إنشاء الإعلانات، إدارة المعارض. أنت تطلب، مشكور يساعدك.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-icon text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-labelledby={`footer-${category}`}>
              <h3 id={`footer-${category}`} className="text-heading-sm font-semibold text-surface-900 dark:text-white mb-4">
                {category}
              </h3>
              <ul className="space-y-3" role="list">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-body-sm text-surface-600 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contact & Newsletter */}
          <div className="lg:col-span-2">
            <h3 className="text-heading-sm font-semibold text-surface-900 dark:text-white mb-4">تواصل معنا</h3>
            <address className="space-y-3 text-body-sm text-surface-600 dark:text-surface-400 not-italic mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-surface-400" aria-hidden="true" />
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-surface-400" aria-hidden="true" />
                <a href="tel:+966500000000" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  +966 50 000 0000
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-surface-400" aria-hidden="true" />
                <a href="mailto:hello@mshkur.ai" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  hello@mshkur.ai
                </a>
              </div>
            </address>

            {/* Newsletter */}
            <form className="flex gap-2" aria-label="الاشتراك في النشرة البريدية">
              <label htmlFor="email" className="sr-only">البريد الإلكتروني</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="بريدك الإلكتروني"
                className="input flex-1"
                aria-describedby="newsletter-hint"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                اشتراك
              </button>
            </form>
            <p id="newsletter-hint" className="form-hint mt-2">سنرسل لك تحديثات المنتج والنصائح الأسبوعية</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-surface-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-body-sm text-surface-500 dark:text-surface-400">
            © {new Date().getFullYear()} مشكور. جميع الحقوق محفوظة.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 text-body-xs text-surface-500 dark:text-surface-400">
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-error-DEFAULT" aria-hidden="true" />
              صنع في السعودية
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" aria-hidden="true" /> آمن وموثوق
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" /> سريع وفعال
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" /> يدعم RTL/LTR
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};