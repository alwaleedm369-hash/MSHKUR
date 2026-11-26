import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ==================== SETTINGS ====================
  const settings = [
    {
      key: 'maintenance_mode',
      value: JSON.stringify({ enabled: false, message: 'System under maintenance. Please try again later.' }),
      description: 'Maintenance mode toggle',
      isPublic: true,
    },
    {
      key: 'max_file_size',
      value: '52428800',
      description: 'Maximum file upload size in bytes (50MB)',
      isPublic: true,
    },
    {
      key: 'default_image_quality',
      value: '90',
      description: 'Default image export quality (1-100)',
      isPublic: true,
    },
    {
      key: 'max_images_per_upload',
      value: '20',
      description: 'Maximum images per upload batch',
      isPublic: true,
    },
    {
      key: 'default_ad_template',
      value: 'modern',
      description: 'Default ad template',
      isPublic: true,
    },
    {
      key: 'max_ads_per_user',
      value: '100',
      description: 'Maximum ads per user (free tier)',
      isPublic: true,
    },
    {
      key: 'max_vehicles_per_dealer',
      value: '500',
      description: 'Maximum vehicles per dealer',
      isPublic: true,
    },
    {
      key: 'ai_assistant_enabled',
      value: 'true',
      description: 'Enable AI Assistant feature',
      isPublic: true,
    },
    {
      key: 'image_processing_enabled',
      value: 'true',
      description: 'Enable image processing features',
      isPublic: true,
    },
    {
      key: 'watermark_enabled',
      value: 'false',
      description: 'Add watermark to processed images',
      isPublic: false,
    },
    {
      key: 'watermark_text',
      value: 'MSHKUR',
      description: 'Watermark text',
      isPublic: false,
    },
    {
      key: 'haraj_enabled',
      value: 'true',
      description: 'Enable Haraj integration',
      isPublic: true,
    },
    {
      key: 'google_workspace_enabled',
      value: 'true',
      description: 'Enable Google Workspace integration',
      isPublic: true,
    },
    {
      key: 'whatsapp_enabled',
      value: 'true',
      description: 'Enable WhatsApp integration',
      isPublic: true,
    },
    {
      key: 'github_enabled',
      value: 'true',
      description: 'Enable GitHub integration',
      isPublic: true,
    },
    {
      key: 'push_notifications_enabled',
      value: 'true',
      description: 'Enable push notifications',
      isPublic: true,
    },
    {
      key: 'email_notifications_enabled',
      value: 'true',
      description: 'Enable email notifications',
      isPublic: true,
    },
    {
      key: 'max_images_per_ad',
      value: '20',
      description: 'Maximum images per ad',
      isPublic: true,
    },
    {
      key: 'ad_expiry_days',
      value: '30',
      description: 'Ad expiry in days',
      isPublic: true,
    },
    {
      key: 'inquiry_auto_assign',
      value: 'true',
      description: 'Auto-assign inquiries to dealers',
      isPublic: false,
    },
    {
      key: 'default_language',
      value: 'ar',
      description: 'Default language (ar/en)',
      isPublic: true,
    },
    {
      key: 'timezone',
      value: 'Asia/Riyadh',
      description: 'Default timezone',
      isPublic: true,
    },
    {
      key: 'currency',
      value: 'SAR',
      description: 'Default currency',
      isPublic: true,
    },
    {
      key: 'date_format',
      value: 'DD/MM/YYYY',
      description: 'Date format',
      isPublic: true,
    },
    {
      key: 'number_format',
      value: 'ar-SA',
      description: 'Number format locale',
      isPublic: true,
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description, isPublic: setting.isPublic },
      create: setting,
    });
  }
  console.log('✅ Settings seeded');

  // ==================== AD TEMPLATES ====================
  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      nameAr: 'عصري',
      description: 'Clean, modern design with focus on images',
      previewUrl: '/templates/modern.png',
      html: `<div class="modern-template">{{content}}</div>`,
      css: '.modern-template { font-family: system-ui; }',
      platforms: ['haraj', 'facebook', 'instagram', 'web'],
    },
    {
      id: 'classic',
      name: 'Classic',
      nameAr: 'كلاسيكي',
      description: 'Traditional listing format with detailed specs',
      previewUrl: '/templates/classic.png',
      html: `<div class="classic-template">{{content}}</div>`,
      css: '.classic-template { font-family: serif; }',
      platforms: ['haraj', 'facebook', 'web'],
    },
    {
      id: 'minimal',
      name: 'Minimal',
      nameAr: 'بسيط',
      description: 'Minimalist design with essential info only',
      previewUrl: '/templates/minimal.png',
      html: `<div class="minimal-template">{{content}}</div>`,
      css: '.minimal-template { font-family: sans-serif; }',
      platforms: ['instagram', 'snapchat', 'web'],
    },
    {
      id: 'bold',
      name: 'Bold',
      nameAr: 'جريء',
      description: 'Bold design with strong visual hierarchy',
      previewUrl: '/templates/bold.png',
      html: `<div class="bold-template">{{content}}</div>`,
      css: '.bold-template { font-family: system-ui; font-weight: bold; }',
      platforms: ['facebook', 'instagram', 'web'],
    },
    {
      id: 'luxury',
      name: 'Luxury',
      nameAr: 'فاخر',
      description: 'Premium design for luxury vehicles',
      previewUrl: '/templates/luxury.png',
      html: `<div class="luxury-template">{{content}}</div>`,
      css: '.luxury-template { font-family: serif; color: #1a1a2e; }',
      platforms: ['haraj', 'facebook', 'web'],
    },
    {
      id: 'sporty',
      name: 'Sporty',
      nameAr: 'رياضي',
      description: 'Dynamic design for sports cars',
      previewUrl: '/templates/sporty.png',
      html: `<div class="sporty-template">{{content}}</div>`,
      css: '.sporty-template { font-family: sans-serif; text-transform: uppercase; }',
      platforms: ['instagram', 'snapchat', 'web'],
    },
  ];

  for (const template of templates) {
    await prisma.adTemplate.upsert({
      where: { id: template.id },
      update: template,
      create: template,
    });
  }
  console.log('✅ Ad templates seeded');

  // ==================== AI MODELS ====================
  const aiModels = [
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      modelId: 'gemini-1.5-pro',
      description: 'Most capable model for complex reasoning, code, and multimodal tasks',
      capabilities: ['text', 'vision', 'code', 'reasoning', 'function-calling', 'json'],
      pricing: { input: 0.0035, output: 0.0105 },
      isActive: true,
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'google',
      modelId: 'gemini-1.5-flash',
      description: 'Fast and efficient model for high-volume tasks',
      capabilities: ['text', 'vision', 'code', 'function-calling', 'json'],
      pricing: { input: 0.000075, output: 0.0003 },
      isActive: true,
    },
    {
      id: 'gemini-1.5-flash-8b',
      name: 'Gemini 1.5 Flash 8B',
      provider: 'google',
      modelId: 'gemini-1.5-flash-8b',
      description: 'Lightweight model for simple tasks',
      capabilities: ['text', 'vision', 'code', 'function-calling', 'json'],
      pricing: { input: 0.0000375, output: 0.00015 },
      isActive: true,
    },
    {
      id: 'gemini-1.0-pro',
      name: 'Gemini 1.0 Pro',
      provider: 'google',
      modelId: 'gemini-1.0-pro',
      description: 'Balanced performance for text and code',
      capabilities: ['text', 'code', 'function-calling', 'json'],
      pricing: { input: 0.0005, output: 0.0015 },
      isActive: true,
    },
    {
      id: 'gemini-1.0-pro-vision',
      name: 'Gemini 1.0 Pro Vision',
      provider: 'google',
      modelId: 'gemini-1.0-pro-vision',
      description: 'Multimodal model for image understanding',
      capabilities: ['vision', 'text'],
      pricing: { input: 0.00025, output: 0.0005 },
      isActive: true,
    },
    {
      id: 'text-embedding-004',
      name: 'Text Embedding 004',
      provider: 'google',
      modelId: 'text-embedding-004',
      description: 'High-quality text embeddings for similarity search',
      capabilities: ['embeddings'],
      pricing: { input: 0.00001, output: 0 },
      isActive: true,
    },
  ];

  for (const model of aiModels) {
    await prisma.aIModel.upsert({
      where: { id: model.id },
      update: model,
      create: model,
    });
  }
  console.log('✅ AI models seeded');

  // ==================== AI PROMPTS ====================
  const prompts = [
    {
      id: 'ad-generation',
      name: 'Ad Generation',
      description: 'Generate compelling car advertisements',
      template: `You are a professional car listing copywriter for the Saudi Arabian market. Generate compelling car advertisements in Arabic.

Given vehicle data, create:
1. A compelling title (max 80 chars)
2. A detailed description highlighting key features
3. Relevant tags for search

Tone: Professional, trustworthy, appealing to buyers
Language: Arabic
Format: JSON with title, description, tags`,
      variables: { vehicleData: 'object', tone: 'string', language: 'string' },
      category: 'ad-generation',
      isSystem: true,
    },
    {
      id: 'vehicle-analysis',
      name: 'Vehicle Analysis',
      description: 'Analyze car images to extract vehicle data',
      template: `You are an automotive expert analyzing car images. Identify:
1. Make, model, year
2. Color, body type
3. Visible features (sunroof, wheels, etc.)
4. Condition assessment
5. Any visible damage

Return structured JSON with confidence scores`,
      variables: { imageData: 'string' },
      category: 'image-analysis',
      isSystem: true,
    },
    {
      id: 'marketing-content',
      name: 'Marketing Content',
      description: 'Create social media marketing content',
      template: `You are a social media marketing expert for car dealerships in Saudi Arabia.
Create engaging content for:
- Instagram posts/stories
- Facebook marketplace listings
- WhatsApp broadcast messages
- TikTok video scripts

Tone: Engaging, professional, culturally appropriate
Language: Arabic with English terms where appropriate`,
      variables: { vehicleData: 'object', platform: 'string', campaignType: 'string' },
      category: 'marketing',
      isSystem: true,
    },
    {
      id: 'customer-response',
      name: 'Customer Response',
      description: 'Generate professional customer responses',
      template: `You are a professional car sales assistant responding to customer inquiries.
Guidelines:
- Be polite, helpful, and professional
- Provide accurate information
- Encourage test drives
- Handle objections gracefully
- Language: Arabic (with English if customer uses English)`,
      variables: { inquiry: 'string', vehicleData: 'object', customerName: 'string' },
      category: 'customer-service',
      isSystem: true,
    },
    {
      id: 'image-processing-guide',
      name: 'Image Processing Guide',
      description: 'Guide users on image processing tools',
      template: `You are an AI assistant helping users with car image processing.
Available tools:
1. Background removal (transparent, white, studio, outdoor)
2. License plate blur (auto-detect, pixelate, gaussian)
3. Glass tinting (level 0-1, color selection)
4. Lighting enhancement (exposure, contrast, highlights, shadows)
5. Shadow generation (intensity, direction, softness)
6. Centering & crop (aspect ratios, multi-size output)
7. Image enhancement (sharpen, denoise, clarity, vibrance)
8. Batch unify (background, lighting, dimensions)

Help users choose the right tools and settings for their needs.`,
      variables: { userRequest: 'string', availableTools: 'array' },
      category: 'image-processing',
      isSystem: true,
    },
  ];

  for (const prompt of prompts) {
    await prisma.aIPrompt.upsert({
      where: { id: prompt.id },
      update: prompt,
      create: prompt,
    });
  }
  console.log('✅ AI prompts seeded');

  // ==================== DEFAULT ADMIN USER ====================
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@mshkur.ai' },
    update: {},
    create: {
      email: 'admin@mshkur.ai',
      passwordHash: adminPassword,
      name: 'MSHKUR Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      preferences: { theme: 'light', language: 'ar', notifications: true },
    },
  });
  console.log('✅ Admin user seeded');

  // ==================== DEMO DEALER ====================
  const dealerPassword = await bcrypt.hash('dealer123', 12);
  const dealerUser = await prisma.user.upsert({
    where: { email: 'dealer@demo.mshkur.ai' },
    update: {},
    create: {
      email: 'dealer@demo.mshkur.ai',
      passwordHash: dealerPassword,
      name: 'Demo Dealer',
      role: 'DEALER',
      status: 'ACTIVE',
      emailVerified: true,
      phone: '+966501234567',
      preferences: { theme: 'light', language: 'ar', notifications: true },
    },
  });

  const dealer = await prisma.dealer.upsert({
    where: { slug: 'demo-dealer' },
    update: {},
    create: {
      name: 'Demo Auto Showroom',
      slug: 'demo-dealer',
      nameAr: 'معرض تجريبي للسيارات',
      description: 'معرض تجريبي للسيارات في الرياض',
      descriptionAr: 'معرض تجريبي للسيارات في الرياض',
      address: 'King Fahd Road, Al Nakheel',
      city: 'Riyadh',
      phone: '+966112345678',
      email: 'demo@mshkur.ai',
      website: 'https://demo.mshkur.ai',
      socialLinks: { twitter: '@demoautos', instagram: '@demoautos', snapchat: 'demoautos' },
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    },
  });

  await prisma.user.update({
    where: { id: dealerUser.id },
    data: { dealerId: dealer.id },
  });

  await prisma.dealerProfile.upsert({
    where: { dealerId: dealer.id },
    update: {},
    create: {
      dealerId: dealer.id,
      businessName: 'Demo Auto Showroom LLC',
      commercialReg: '1010123456',
      taxId: '300012345600003',
      address: 'King Fahd Road, Al Nakheel',
      city: 'Riyadh',
      country: 'SA',
      workingHours: { sunday: '9:00-21:00', monday: '9:00-21:00', tuesday: '9:00-21:00', wednesday: '9:00-21:00', thursday: '9:00-21:00', friday: '16:00-21:00', saturday: '9:00-21:00' },
      paymentMethods: ['cash', 'transfer', 'installment'],
      verifiedAt: new Date(),
    },
  });

  console.log('✅ Demo dealer seeded');

  // ==================== SAMPLE VEHICLES ====================
  const vehicles = [
    {
      dealerId: dealer.id,
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      trim: 'LE',
      mileage: 15000,
      price: 125000,
      color: 'White',
      fuelType: 'gasoline',
      transmission: 'automatic',
      engineSize: '2.5L',
      cylinders: 4,
      color: 'White',
      fuelType: 'gasoline',
      transmission: 'automatic',
      engineSize: '2.5L',
      cylinders: 4,
      bodyType: 'sedan',
      doors: 4,
      seats: 5,
      driveType: 'fwd',
      condition: 'EXCELLENT',
      warranty: true,
      warrantyDetails: 'Manufacturer warranty until 2026',
      serviceHistory: true,
      features: ['Backup Camera', 'Bluetooth', 'Apple CarPlay', 'Lane Assist', 'Adaptive Cruise Control'],
      options: ['Alloy Wheels', 'LED Headlights', 'Sunroof'],
      description: 'Excellent condition Toyota Camry 2023 with low mileage. Full service history, non-smoker, no accidents.',
      status: 'AVAILABLE',
    },
    {
      dealerId: dealer.id,
      make: 'Hyundai',
      model: 'Elantra',
      year: 2022,
      trim: 'Smart',
      mileage: 28000,
      price: 85000,
      color: 'Silver',
      fuelType: 'gasoline',
      transmission: 'automatic',
      engineSize: '1.6L',
      cylinders: 4,
      bodyType: 'sedan',
      doors: 4,
      seats: 5,
      driveType: 'fwd',
      condition: 'GOOD',
      warranty: false,
      serviceHistory: true,
      features: ['Backup Camera', 'Bluetooth', 'Android Auto', 'Cruise Control'],
      options: ['Alloy Wheels', 'Fog Lights'],
      description: 'Well-maintained Hyundai Elantra 2022. Regular service records available.',
      status: 'AVAILABLE',
    },
    {
      dealerId: dealer.id,
      make: 'Nissan',
      model: 'Altima',
      year: 2024,
      trim: 'Platinum',
      mileage: 5000,
      price: 145000,
      color: 'Black',
      fuelType: 'gasoline',
      transmission: 'automatic',
      engineSize: '2.5L',
      cylinders: 4,
      bodyType: 'sedan',
      doors: 4,
      seats: 5,
      driveType: 'fwd',
      condition: 'EXCELLENT',
      warranty: true,
      warrantyDetails: 'Full manufacturer warranty',
      serviceHistory: true,
      features: ['360 Camera', 'Bose Audio', 'Leather Seats', 'Heated Seats', 'Wireless Charging', 'ProPILOT Assist'],
      options: ['19-inch Alloy Wheels', 'LED Headlights', 'Panoramic Sunroof'],
      description: 'Brand new Nissan Altima 2024 Platinum. Fully loaded with all premium features.',
      status: 'AVAILABLE',
    },
  ];

  for (const vehicleData of vehicles) {
    await prisma.vehicle.create({
      data: vehicleData,
    });
  }
  console.log('✅ Sample vehicles seeded');

  // ==================== SAMPLE ADS ====================
  const ads = [
    {
      userId: dealerUser.id,
      dealerId: dealer.id,
      title: 'Toyota Camry 2023 - Excellent Condition - 125,000 SAR',
      titleAr: 'تويوتا كامري 2023 - حالة ممتازة - 125,000 ريال',
      description: 'Excellent condition Toyota Camry 2023 with low mileage. Full service history, non-smoker, no accidents. Features: Backup Camera, Bluetooth, Apple CarPlay, Lane Assist, Adaptive Cruise Control.',
      descriptionAr: 'حالة ممتازة تويوتا كامري 2023 بعداد منخفض. سجل صيانة كامل، غير مدخن، بدون حوادث. المميزات: كاميرا خلفية، بلوتوث، آبل كاربلاي، مساعد المسار، مثبت سرعة تكيفي.',
      vehicleData: { make: 'Toyota', model: 'Camry', year: 2023, trim: 'LE', mileage: 15000, price: 125000, color: 'White', fuelType: 'gasoline', transmission: 'automatic' },
      templateId: 'modern',
      platform: 'haraj',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    {
      userId: dealerUser.id,
      dealerId: dealer.id,
      title: 'Hyundai Elantra 2022 - Well Maintained - 85,000 SAR',
      titleAr: 'هيونداي إلنترا 2022 - صيانة دورية - 85,000 ريال',
      description: 'Well-maintained Hyundai Elantra 2022. Regular service records available. Features: Backup Camera, Bluetooth, Android Auto, Cruise Control.',
      descriptionAr: 'هيونداي إلنترا 2022 بصيانة دورية. سجلات صيانة متاحة. المميزات: كاميرا خلفية، بلوتوث، أندرويد أوتو، مثبت سرعة.',
      vehicleData: { make: 'Hyundai', model: 'Elantra', year: 2022, trim: 'Smart', mileage: 28000, price: 85000, color: 'Silver', fuelType: 'gasoline', transmission: 'automatic' },
      templateId: 'classic',
      platform: 'facebook',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  ];

  for (const adData of ads) {
    await prisma.ad.create({ data: adData });
  }
  console.log('✅ Sample ads seeded');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });