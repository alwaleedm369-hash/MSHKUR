import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight, Aperture, Box, Brush, Camera, Check, ChevronRight,
  CircleHelp, Compass, FileImage, FolderOpen, Globe2, ImagePlus,
  Layers3, Library, MoreHorizontal, Palette, Plus, Settings2,
  Sparkles, WandSparkles, X, Zap
} from 'lucide-react';

type Locale = 'en' | 'ar';
type View = 'create' | 'library' | 'agents' | 'profile';
type Project = { id: string; title: string; prompt: string; createdAt: number; sourceName?: string };

const copy = {
  en: {
    create:'Create', library:'Library', agents:'Creative team', profile:'Settings',
    studio:'MSHKUR / CREATIVE STUDIO', headlineA:'Make something', headlineB:'worth keeping.',
    intro:'A visual workspace for ideas, images and everything you want to bring to life.',
    yourCanvas:'YOUR CANVAS', ready:'Ready when you are',
    describe:'Describe what you want to create…', addImage:'Add image', camera:'Camera',
    prepare:'Prepare my brief', directions:'A few places to begin', directionsHint:'Pick a direction. Make it your own.',
    product:'Product imagery', productDesc:'A considered studio look for an object or product.',
    campaign:'Campaign visual', campaignDesc:'A bold image with a clear visual point of view.',
    identity:'Brand direction', identityDesc:'Color, type and a visual language that belong together.',
    icons:'Icon family', iconsDesc:'A coherent set of icons with a shared visual rhythm.',
    creativeTeam:'Your creative team', creativeTeamHint:'Specialists ready to shape the work with you.',
    meetTeam:'Meet the team', openLibrary:'Open library', noProjects:'Your next favourite thing starts here.',
    noProjectsHint:'Create a brief or bring in an image. Your work will collect here.',
    projects:'Projects', source:'Source image', briefReady:'Brief prepared',
    briefReadyText:'Your direction is saved in this workspace.',
    providerNote:'Image rendering is not connected yet. Your brief and source stay here while provider connections are being built.',
    workflow:'Suggested workflow', stepOne:'Shape the direction', stepTwo:'Choose the visual language',
    stepThree:'Create and refine', stepFour:'Export the final work', switchLang:'العربية',
    profileTitle:'Your workspace', language:'Language', providers:'Creative providers',
    notConnected:'Not connected', coming:'Connection setup is next', account:'Account & preferences',
    light:'Light appearance', lightHint:'The studio is designed around a bright, calm canvas.',
    agentRole:'SPECIALIST', available:'Ready for a brief',
    creativeDirector:'Creative Director', creativeDirectorDesc:'Turns your intention into a focused plan and brings the right specialists together.',
    artDirector:'Art Director', artDirectorDesc:'Shapes composition, mood, references and the visual point of view.',
    brandDesigner:'Brand Designer', brandDesignerDesc:'Builds a connected language of color, type and identity.',
    photographer:'Product Photographer', photographerDesc:'Creates lighting, scene and product-image direction.',
    retoucher:'Image Retoucher', retoucherDesc:'Refines details, backgrounds, masks and image quality.',
    graphicDesigner:'Graphic Designer', graphicDesignerDesc:'Creates campaign, editorial and social compositions.',
    uiDesigner:'UI Systems Designer', uiDesignerDesc:'Builds thoughtful screens, reusable components and design tokens.',
    iconDesigner:'Icon Designer', iconDesignerDesc:'Creates consistent icon families and export-ready SVG assets.',
    motionDesigner:'Motion Designer', motionDesignerDesc:'Plans motion, storyboards and short-form visual sequences.',
    threeDArtist:'3D Artist', threeDArtistDesc:'Creates scenes, materials, camera and lighting plans.',
    savedLocally:'Saved in this workspace', removeImage:'Remove image', imageAdded:'Image added',
    allWork:'All work', newProject:'New project', sourceReady:'Reference ready',
    sourceHint:'Your original image stays untouched. Edits will become new versions.',
    workspace:'Private workspace', direction:'Use a direction', empty:'Nothing here yet',
    saved:'Saved locally', reference:'Reference', assistantNote:'Skills are reusable capabilities. Agents combine the right skills for each brief.',
  },
  ar: {
    create:'إنشاء', library:'المكتبة', agents:'الفريق الإبداعي', profile:'الإعدادات',
    studio:'مشكور / الاستوديو الإبداعي', headlineA:'اصنع شيئاً', headlineB:'يستحق أن يبقى.',
    intro:'مساحة إبداعية تجمع أفكارك وصورك وكل ما تريد تحويله إلى عمل بصري.',
    yourCanvas:'مساحة عملك', ready:'جاهز عندما تكون أنت جاهزاً',
    describe:'صف ما تريد إنشاءه…', addImage:'إضافة صورة', camera:'الكاميرا',
    prepare:'جهّز موجز العمل', directions:'بدايات ممكنة', directionsHint:'اختر اتجاهاً واجعله يعبر عنك.',
    product:'صور المنتجات', productDesc:'مظهر استوديو متقن لمنتج أو قطعة.',
    campaign:'تصميم حملة', campaignDesc:'صورة جريئة بفكرة بصرية واضحة.',
    identity:'هوية العلامة', identityDesc:'ألوان وخطوط ولغة بصرية متناسقة.',
    icons:'مجموعة أيقونات', iconsDesc:'أيقونات متناسقة بإيقاع بصري موحّد.',
    creativeTeam:'فريقك الإبداعي', creativeTeamHint:'متخصصون يساعدونك في تشكيل العمل.',
    meetTeam:'اكتشف الفريق', openLibrary:'افتح المكتبة', noProjects:'عملك القادم المفضّل يبدأ هنا.',
    noProjectsHint:'أنشئ موجزاً أو أضف صورة. ستجد أعمالك هنا.',
    projects:'المشاريع', source:'الصورة الأصلية', briefReady:'تم تجهيز موجز العمل',
    briefReadyText:'تم حفظ توجهك في مساحة العمل هذه.',
    providerNote:'توليد الصور غير متصل بعد. سيبقى موجزك وصورتك هنا حتى تجهيز ربط مزودي التوليد.',
    workflow:'مسار العمل المقترح', stepOne:'تحديد التوجه', stepTwo:'اختيار اللغة البصرية',
    stepThree:'الإنشاء والتحسين', stepFour:'تصدير العمل النهائي', switchLang:'English',
    profileTitle:'مساحة عملك', language:'اللغة', providers:'مزودو الإبداع',
    notConnected:'غير متصل', coming:'إعداد الربط هو الخطوة التالية', account:'الحساب والتفضيلات',
    light:'المظهر الفاتح', lightHint:'صُمم الاستوديو حول مساحة عمل مشرقة وهادئة.',
    agentRole:'متخصص', available:'جاهز لاستقبال موجز',
    creativeDirector:'Creative Director', creativeDirectorDesc:'يحوّل فكرتك إلى خطة مركزة ويجمع المتخصصين المناسبين.',
    artDirector:'Art Director', artDirectorDesc:'يحدد التكوين والمزاج والمراجع والاتجاه البصري.',
    brandDesigner:'Brand Designer', brandDesignerDesc:'يبني لغة متناسقة للألوان والخطوط والهوية.',
    photographer:'Product Photographer', photographerDesc:'يضع اتجاه الإضاءة والمشهد وتصوير المنتجات.',
    retoucher:'Image Retoucher', retoucherDesc:'يحسن التفاصيل والخلفيات والأقنعة وجودة الصور.',
    graphicDesigner:'Graphic Designer', graphicDesignerDesc:'ينشئ تصاميم الحملات والمحتوى الاجتماعي والتحريري.',
    uiDesigner:'UI Systems Designer', uiDesignerDesc:'يبني الشاشات والمكونات القابلة لإعادة الاستخدام.',
    iconDesigner:'Icon Designer', iconDesignerDesc:'ينشئ مجموعات أيقونات متناسقة وملفات SVG جاهزة.',
    motionDesigner:'Motion Designer', motionDesignerDesc:'يخطط للحركة ولوحات المشاهد والمقاطع القصيرة.',
    threeDArtist:'3D Artist', threeDArtistDesc:'ينشئ المشاهد والخامات والكاميرا والإضاءة.',
    savedLocally:'محفوظ في مساحة العمل', removeImage:'إزالة الصورة', imageAdded:'تمت إضافة الصورة',
    allWork:'كل الأعمال', newProject:'مشروع جديد', sourceReady:'المرجع جاهز',
    sourceHint:'تبقى صورتك الأصلية دون تغيير، وتُحفظ التعديلات كإصدارات جديدة.',
    workspace:'مساحة خاصة', direction:'اختر توجهاً', empty:'لا يوجد محتوى بعد',
    saved:'محفوظ محلياً', reference:'مرجع', assistantNote:'المهارات قدرات قابلة لإعادة الاستخدام، ويجمع المساعد المتخصص المهارات المناسبة لكل موجز.',
  },
} as const;

type CopyKey = keyof typeof copy.en;
const directions = [
  { id:'product', icon:Aperture, title:'product', description:'productDesc', prompt:'Create a premium product photograph with soft directional studio lighting, refined materials and a clean editorial composition.' },
  { id:'campaign', icon:Sparkles, title:'campaign', description:'campaignDesc', prompt:'Create a distinctive campaign visual with expressive art direction, bold composition and a clear visual idea.' },
  { id:'identity', icon:Palette, title:'identity', description:'identityDesc', prompt:'Develop a cohesive brand direction with a thoughtful color palette, typography pairing and visual language.' },
  { id:'icons', icon:Layers3, title:'icons', description:'iconsDesc', prompt:'Design a coherent icon family using one grid, consistent geometry and a unified stroke system.' },
] as const;
const agentData = [
  { id:'creative-director', icon:Sparkles, name:'creativeDirector', description:'creativeDirectorDesc' },
  { id:'art-director', icon:Compass, name:'artDirector', description:'artDirectorDesc' },
  { id:'brand-designer', icon:Palette, name:'brandDesigner', description:'brandDesignerDesc' },
  { id:'product-photographer', icon:Camera, name:'photographer', description:'photographerDesc' },
  { id:'image-retoucher', icon:WandSparkles, name:'retoucher', description:'retoucherDesc' },
  { id:'graphic-designer', icon:Brush, name:'graphicDesigner', description:'graphicDesignerDesc' },
  { id:'ui-systems-designer', icon:Settings2, name:'uiDesigner', description:'uiDesignerDesc' },
  { id:'icon-designer', icon:Layers3, name:'iconDesigner', description:'iconDesignerDesc' },
  { id:'motion-designer', icon:Zap, name:'motionDesigner', description:'motionDesignerDesc' },
  { id:'three-d-artist', icon:Box, name:'threeDArtist', description:'threeDArtistDesc' },
] as const;

function readProjects(): Project[] {
  try {
    const value = localStorage.getItem('mshkur.projects.v1');
    return value ? JSON.parse(value) as Project[] : [];
  } catch { return []; }
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => localStorage.getItem('mshkur.locale') === 'ar' ? 'ar' : 'en');
  const [view, setView] = useState<View>('create');
  const [prompt, setPrompt] = useState('');
  const [projects, setProjects] = useState<Project[]>(readProjects);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('creative-director');
  const galleryInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const isArabic = locale === 'ar';
  const t = (key: CopyKey) => copy[locale][key];

  useEffect(() => {
    localStorage.setItem('mshkur.locale', locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }, [locale, isArabic]);

  useEffect(() => {
    localStorage.setItem('mshkur.projects.v1', JSON.stringify(projects));
  }, [projects]);

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setNotice('Please choose an image file.'); return; }
    if (file.size > 20 * 1024 * 1024) { setNotice('Choose an image smaller than 20 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { setSourcePreview(String(reader.result)); setSourceName(file.name); setNotice(t('imageAdded')); };
    reader.onerror = () => setNotice('Could not read this image. Please try another file.');
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function prepareBrief() {
    if (!prompt.trim() && !sourcePreview) { setNotice('Add a short brief or an image to get started.'); return; }
    const cleanPrompt = prompt.trim() || 'Refine the imported image into a polished creative direction.';
    const project: Project = {
      id: crypto.randomUUID(),
      title: cleanPrompt.length > 48 ? cleanPrompt.slice(0, 48).trimEnd() + '…' : cleanPrompt,
      prompt: cleanPrompt,
      createdAt: Date.now(),
      sourceName: sourceName || undefined,
    };
    setProjects(current => [project, ...current]);
    setActiveProject(project);
    setNotice(t('briefReady'));
  }

  function openProject(project: Project) {
    setActiveProject(project);
    setPrompt(project.prompt);
    setView('create');
  }

  function NavButton({ target, icon: Icon, label }: { target: View; icon: LucideIcon; label: string }) {
    return <button className={'nav-item ' + (view === target ? 'active' : '')} onClick={() => setView(target)} type="button"><Icon size={19} strokeWidth={1.8} /><span>{label}</span></button>;
  }

  return (
    <div className={'app-shell ' + (isArabic ? 'is-rtl' : '')} dir={isArabic ? 'rtl' : 'ltr'}>
      <aside className="side-rail">
        <button className="brand-lockup" type="button" onClick={() => setView('create')} aria-label="MSHKUR home">
          <span className="brand-mark"><span /></span><span className="brand-name">mshkur<span>.</span></span>
        </button>
        <div className="rail-caption">WORKSPACE</div>
        <nav className="primary-nav">
          <NavButton target="create" icon={WandSparkles} label={t('create')} />
          <NavButton target="library" icon={Library} label={t('library')} />
          <NavButton target="agents" icon={Layers3} label={t('agents')} />
        </nav>
        <div className="rail-spacer" />
        <div className="rail-projects"><div className="rail-caption">{t('projects').toUpperCase()}</div>
          {projects.slice(0, 3).map(project => <button className="rail-project" key={project.id} onClick={() => openProject(project)} type="button"><span className="project-dot" /><span>{project.title}</span></button>)}
        </div>
        <div className="rail-footer"><NavButton target="profile" icon={Settings2} label={t('profile')} /><div className="profile-chip"><span className="avatar">M</span><span>My workspace</span><MoreHorizontal size={17} /></div></div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><span /></span><span className="brand-name">mshkur<span>.</span></span></div>
          <div className="breadcrumb"><span>Studio</span><ChevronRight size={14} /><strong>{t(view)}</strong></div>
          <div className="top-actions"><span className="status-pill"><span />{t('workspace')}</span><button className="language-button" onClick={() => setLocale(isArabic ? 'en' : 'ar')} type="button"><Globe2 size={16} />{t('switchLang')}</button></div>
        </header>

        <main className="page-content">
          {view === 'create' && <>
            <section className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" />{t('studio')}</div><h1>{t('headlineA')}<br /><em>{t('headlineB')}</em></h1><p>{t('intro')}</p></section>
            <section className="workspace-grid">
              <div className="canvas-column">
                <div className="canvas-head"><span>{t('yourCanvas')}</span><span className="canvas-status"><i />{t('ready')}</span></div>
                <div className={'canvas-stage ' + (sourcePreview ? 'has-source' : '')}>
                  {sourcePreview ? <img className="source-preview" src={sourcePreview} alt="Uploaded creative reference" /> :
                    <div className="sample-art" aria-label="Abstract sample artwork">
                      <div className="sample-orbit orbit-one" /><div className="sample-orbit orbit-two" /><div className="sample-sun" /><div className="sample-disc" />
                      <div className="sample-copy"><span>FORM / 001</span><strong>Shape<br />the idea.</strong><small>AN OPEN CREATIVE CANVAS</small></div><div className="sample-index">01 — 04</div>
                    </div>}
                  <div className="stage-bottom"><span className="stage-indicator"><span />{sourcePreview ? t('sourceReady') : 'Creative space 01'}</span>
                    {sourcePreview && <button className="stage-remove" type="button" onClick={() => { setSourcePreview(null); setSourceName(''); }}><X size={14} />{t('removeImage')}</button>}
                  </div>
                </div>
                <div className="composer">
                  <div className="composer-label"><Sparkles size={15} /><span>{t('describe')}</span></div>
                  <textarea value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={t('describe')} rows={3} />
                  <div className="composer-actions"><div className="attach-actions">
                    <button className="attach-button" type="button" onClick={() => galleryInput.current?.click()}><ImagePlus size={16} />{t('addImage')}</button>
                    <button className="attach-button camera-action" type="button" onClick={() => cameraInput.current?.click()}><Camera size={16} />{t('camera')}</button>
                    <input ref={galleryInput} className="visually-hidden" type="file" accept="image/*" onChange={handleImage} />
                    <input ref={cameraInput} className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={handleImage} />
                  </div><button className="primary-action" type="button" onClick={prepareBrief}><span>{t('prepare')}</span><ArrowUpRight size={17} /></button></div>
                  {sourcePreview && <div className="source-file"><FileImage size={14} /><span>{sourceName}</span><span className="source-size">{t('source')}</span></div>}
                  {notice && <p className="notice-line" role="status">{notice}</p>}
                </div>
                {activeProject && <div className="brief-result">
                  <div className="brief-result-top"><span className="success-icon"><Check size={15} /></span><div><strong>{t('briefReady')}</strong><small>{t('briefReadyText')}</small></div><span className="brief-saved">{t('savedLocally')}</span></div>
                  <p>{activeProject.prompt}</p><div className="workflow-title">{t('workflow')}</div>
                  <div className="workflow-steps">{[t('stepOne'),t('stepTwo'),t('stepThree'),t('stepFour')].map((step,index) => <div className="workflow-step" key={step}><span>{String(index + 1).padStart(2,'0')}</span>{step}</div>)}</div>
                  <p className="provider-note"><CircleHelp size={15} />{t('providerNote')}</p>
                </div>}
              </div>

              <aside className="direction-column">
                <div className="direction-heading"><div><span className="section-kicker">{t('direction')}</span><h2>{t('directions')}</h2></div><span className="heading-spark"><Sparkles size={18} /></span></div>
                <p className="section-description">{t('directionsHint')}</p>
                <div className="direction-list">{directions.map((direction,index) => { const Icon = direction.icon; return <button className="direction-item" type="button" key={direction.id} onClick={() => { setPrompt(direction.prompt); setNotice('Direction selected'); }}>
                  <span className={'direction-icon direction-icon-' + index}><Icon size={20} strokeWidth={1.7} /></span><span className="direction-text"><strong>{t(direction.title)}</strong><small>{t(direction.description)}</small></span><ArrowUpRight size={16} className="direction-arrow" />
                </button>; })}</div>
                <div className="team-callout"><div className="team-avatars"><span>AD</span><span>BD</span><span>PD</span><span>+7</span></div><div className="team-copy"><strong>{t('creativeTeam')}</strong><small>{t('creativeTeamHint')}</small></div><button className="text-link" type="button" onClick={() => setView('agents')}>{t('meetTeam')} <ArrowUpRight size={14} /></button></div>
                <div className="mini-library"><div className="mini-library-head"><span>{t('allWork')}</span><button type="button" onClick={() => setView('library')}>{t('openLibrary')} <ArrowUpRight size={14} /></button></div>
                  {projects.length === 0 ? <div className="mini-empty"><FolderOpen size={17} /><span>{t('empty')}</span></div> : projects.slice(0,2).map(project => <button className="mini-project" key={project.id} onClick={() => openProject(project)} type="button"><span className="mini-project-mark"><FileImage size={15} /></span><span>{project.title}</span><ChevronRight size={15} /></button>)}
                </div>
              </aside>
            </section>
          </>}

          {view === 'library' && <section className="secondary-view">
            <div className="secondary-heading"><div className="eyebrow"><span className="eyebrow-line" />YOUR WORKSPACE</div><h1>{t('library')}<br /><em>{t('allWork').toLowerCase()}.</em></h1><p>{t('noProjectsHint')}</p></div>
            {projects.length ? <div className="project-grid">{projects.map((project,index) => <button className="project-card" key={project.id} onClick={() => openProject(project)} type="button"><div className={'project-art project-art-' + (index % 3)}><span>MSHKUR / {String(index + 1).padStart(2,'0')}</span><strong>{project.title}</strong><ArrowUpRight size={20} /></div><div className="project-card-meta"><strong>{project.title}</strong><small>{new Date(project.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}</small></div></button>)}</div> : <div className="empty-library"><div className="empty-symbol"><FolderOpen size={27} /></div><h2>{t('noProjects')}</h2><p>{t('noProjectsHint')}</p><button className="primary-action" type="button" onClick={() => setView('create')}>{t('newProject')} <Plus size={17} /></button></div>}
          </section>}

          {view === 'agents' && <section className="secondary-view">
            <div className="secondary-heading"><div className="eyebrow"><span className="eyebrow-line" />SPECIALIST WORKFLOWS</div><h1>{t('creativeTeam')}<br /><em>not just assistants.</em></h1><p>{t('creativeTeamHint')}</p></div>
            <div className="agent-grid">{agentData.map((agent,index) => { const Icon = agent.icon; return <button className={'agent-card ' + (selectedAgent === agent.id ? 'selected' : '')} key={agent.id} type="button" onClick={() => setSelectedAgent(agent.id)}>
              <div className="agent-card-top"><span className={'agent-icon agent-icon-' + (index % 5)}><Icon size={19} /></span><span className="agent-role">{t('agentRole')}</span></div><h3>{t(agent.name)}</h3><p>{t(agent.description)}</p><div className="agent-card-foot"><span><i />{t('available')}</span><ArrowUpRight size={16} /></div>
            </button>; })}</div>
            <div className="agent-note"><Sparkles size={17} /><p>{t('assistantNote')}</p></div>
          </section>}

          {view === 'profile' && <section className="secondary-view settings-view">
            <div className="secondary-heading"><div className="eyebrow"><span className="eyebrow-line" />WORKSPACE PREFERENCES</div><h1>{t('profileTitle')}<br /><em>{t('profile').toLowerCase()}.</em></h1><p>{t('account')}</p></div>
            <div className="settings-card">
              <div className="settings-row"><div><strong>{t('language')}</strong><small>English is the primary product language. Arabic is fully supported.</small></div><button className="language-button" onClick={() => setLocale(isArabic ? 'en' : 'ar')} type="button"><Globe2 size={16} />{t('switchLang')}</button></div>
              <div className="settings-row"><div><strong>{t('light')}</strong><small>{t('lightHint')}</small></div><span className="setting-value"><span className="sun-dot" />LIGHT</span></div>
              <div className="settings-row"><div><strong>{t('providers')}</strong><small>Higgsfield API · 3D and render tools</small></div><span className="provider-state">{t('notConnected')}</span></div>
              <div className="provider-footer">{t('coming')}</div>
            </div>
            <p className="settings-footnote">Provider API keys should be stored securely on the server. They must never be exposed in the mobile client.</p>
          </section>}
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Primary navigation">
        <NavButton target="create" icon={WandSparkles} label={t('create')} />
        <NavButton target="library" icon={Library} label={t('library')} />
        <NavButton target="agents" icon={Layers3} label={t('agents')} />
        <NavButton target="profile" icon={Settings2} label={t('profile')} />
      </nav>
    </div>
  );
}
