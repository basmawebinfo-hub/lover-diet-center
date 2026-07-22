-- Run after 2026_07_12_body_services.sql
insert into public.service_categories (slug,name_en,name_ar,description_en,description_ar,sort_order) values
('body-shaping','Body Shaping','نحت وتشكيل الجسم','Advanced contouring treatments.','جلسات متطورة لنحت القوام.',1),
('beauty-care','Beauty Care','العناية والجمال','Skin and beauty treatments.','جلسات العناية بالبشرة والجمال.',2),
('wellness','Wellness','الصحة والاسترخاء','Restorative wellness sessions.','جلسات الصحة والاسترخاء.',3)
on conflict (slug) do update set name_en=excluded.name_en,name_ar=excluded.name_ar;

with c as (select id,slug from public.service_categories)
insert into public.body_services (category_id,slug,name_en,name_ar,short_description_en,short_description_ar,description_en,description_ar,benefits_en,benefits_ar,duration_minutes,price,compare_at_price,badge_en,badge_ar,image_url,gallery,is_featured,sort_order)
select c.id,v.slug,v.name_en,v.name_ar,v.short_en,v.short_ar,v.desc_en,v.desc_ar,v.ben_en::jsonb,v.ben_ar::jsonb,v.duration,v.price,v.old_price,v.badge_en,v.badge_ar,v.image_url,v.gallery::jsonb,v.featured,v.sort_order
from (values
('wellness','advanced-cupping','Advanced Medical Cupping','الحجامة الطبية المتقدمة','Premium cupping for circulation and recovery.','حجامة متقدمة للدورة الدموية والاستشفاء.','A carefully delivered session for circulation, muscular tension and relaxation.','جلسة مدروسة للدورة الدموية وتخفيف شد العضلات والاسترخاء.','["Supports circulation","Eases muscle tension","Encourages relaxation"]','["تحسين الدورة الدموية","تخفيف شد العضلات","تعزيز الاسترخاء"]',60,250,350,'VIP offer','عرض VIP','/images/body-sculpting/cupping-vip.jpeg','[]',true,1),
('beauty-care','hydra-facial','Hydra Facial','هيدرا فيشل','Deep cleansing, hydration and glow.','تنظيف عميق وترطيب ونضارة.','A multi-step facial selected for your skin needs.','جلسة متعددة الخطوات تناسب احتياجات بشرتك.','["Deep cleansing","Intensive hydration","Improves texture"]','["تنظيف عميق","ترطيب مكثف","تحسين ملمس البشرة"]',60,225,325,'VIP offer','عرض VIP','/images/body-sculpting/hydra-facial-vip.jpeg','[]',true,2),
('body-shaping','maderotherapy','Maderotherapy Wood Therapy','ماديروثيرابي - وود ثيرابي','Natural contouring and lymphatic support.','نحت طبيعي ودعم للتدفق اللمفاوي.','A complete specialist wood-therapy session.','جلسة وود ثيرابي متكاملة بأدوات متخصصة.','["Targets cellulite","Supports lymphatic flow","Promotes firmness"]','["تقليل السيلوليت","تحسين التدفق اللمفاوي","دعم شد الجلد"]',60,250,300,'Most popular','الأكثر طلبًا','/images/body-sculpting/maderotherapy-vip.jpeg','["/images/body-sculpting/wood-therapy-tools.jpeg"]',true,3),
('body-shaping','integrated-slimming','Integrated Slimming System','جهاز التخسيس المتكامل','Targeted contouring and circulation support.','نحت موجه ودعم للدورة الدموية.','An integrated device session for selected areas.','جلسة أجهزة متكاملة للمناطق المستهدفة.','["Supports contouring","Stimulates circulation","Reduces fluid retention"]','["دعم نحت القوام","تنشيط الدورة الدموية","تقليل احتباس السوائل"]',45,200,300,'Ladies only','للسيدات فقط','/images/body-sculpting/slimming-system-vip.jpeg','[]',true,4),
('wellness','volcanic-hot-stone','Volcanic Hot Stone Therapy','مساج الأحجار البركانية','Deep warmth and muscular relaxation.','دفء واسترخاء عميق للعضلات.','A calming treatment with evenly heated natural stones.','جلسة هادئة بأحجار طبيعية موزعة الحرارة.','["Deep relaxation","Supports circulation","Reduces stress"]','["استرخاء عميق","تحسين الدورة الدموية","تقليل التوتر"]',60,250,300,'VIP experience','تجربة VIP','/images/body-sculpting/hot-stone-vip.jpeg','[]',false,5),
('body-shaping','ems-body-toning','EMS Body Toning','نحت الجسم بتقنية EMS','Muscle stimulation for toning and contouring.','تحفيز العضلات للشد ونحت القوام.','A focused EMS session complementing a healthy lifestyle.','جلسة EMS موجهة تكمل نمط الحياة الصحي.','["Supports contouring","Stimulates muscles","Supports circulation"]','["دعم نحت القوام","تحفيز العضلات","تحسين الدورة الدموية"]',45,200,300,'VIP offer','عرض VIP','/images/body-sculpting/ems-vip.jpeg','[]',false,6)
) as v(category_slug,slug,name_en,name_ar,short_en,short_ar,desc_en,desc_ar,ben_en,ben_ar,duration,price,old_price,badge_en,badge_ar,image_url,gallery,featured,sort_order)
join c on c.slug=v.category_slug
on conflict (slug) do update set price=excluded.price,compare_at_price=excluded.compare_at_price,image_url=excluded.image_url,updated_at=now();

insert into public.service_gallery(service_id,image_url,title_en,title_ar,kind,sort_order)
select id,image_url,name_en,name_ar,'service',sort_order from public.body_services
on conflict do nothing;
insert into public.service_gallery(service_id,image_url,title_en,title_ar,kind,sort_order)
select id,'/images/body-sculpting/wood-therapy-tools.jpeg','Professional wood therapy tools','أدوات الوود ثيرابي الاحترافية','facility',20 from public.body_services where slug='maderotherapy';

insert into public.service_reviews(service_id,customer_name,rating,comment_en,comment_ar,is_approved)
select id,'Mariam A.',5,'The team explained every step and the session was very comfortable.','الفريق شرح كل خطوة والجلسة كانت مريحة جدًا.',true from public.body_services where slug='maderotherapy';
insert into public.service_reviews(service_id,customer_name,rating,comment_en,comment_ar,is_approved)
select id,'Sara M.',5,'My skin felt fresh and hydrated from the first session.','بشرتي بقت أنضر ومرطبة من أول جلسة.',true from public.body_services where slug='hydra-facial';
