INSERT INTO public.categories (slug,name,description,display_order) VALUES
('podi','Podulu (Podi)','Stone-ground spice powders, roasted fresh in small batches.',0),
('snacks','Savoury Snacks','Crisp Andhra teatime classics, fried in clean groundnut oil.',1),
('sweets','Sweets','Jaggery-sweetened festive favourites made the family way.',2)
ON CONFLICT DO NOTHING;

INSERT INTO public.products (slug,name,description,category_id,image_url,display_order) VALUES
('karivepaku-podi','Karivepaku Podi','కరివేపాకు పొడి',(SELECT id FROM public.categories WHERE slug='podi'),'/__l5e/assets-v1/9598ad20-a353-4e33-8ece-335ec02ee002/karivepaku_podi.png',0),
('vellulli-podi','Vellulli Podi','వెల్లుల్లి పొడి',(SELECT id FROM public.categories WHERE slug='podi'),'/__l5e/assets-v1/adb943dd-8785-4101-bc91-9e54fbe8d265/velluli_podi.png',1),
('kandi-podi','Kandi Podi','కంది పొడి',(SELECT id FROM public.categories WHERE slug='podi'),'/__l5e/assets-v1/0469f791-6532-4b08-8ce6-4a39b77cfb37/Kandi_podi.png',2),
('munagaku-podi','Munagaku Podi','మునగాకు పొడి',(SELECT id FROM public.categories WHERE slug='podi'),'/__l5e/assets-v1/67ea17b4-fab6-4e23-987f-a286ebca27ea/Munagaku_podi.png',3),
('kakarakaya-podi','Kakarakaya Podi','కాకరకాయ పొడి',(SELECT id FROM public.categories WHERE slug='podi'),'/__l5e/assets-v1/08b14dd8-941c-4e5e-92f7-ff1f6d1e2895/kakarakaya_podi.png',4),
('idli-karam-podi','Idli Karam Podi','ఇడ్లీ కారం పొడి',(SELECT id FROM public.categories WHERE slug='podi'),'/__l5e/assets-v1/734143b7-99eb-4b17-b0c0-f8972c6a1736/idly_karam_podi.png',5),
('putnala-podi','Putnala Podi','పుట్నాల పొడి',(SELECT id FROM public.categories WHERE slug='podi'),'/__l5e/assets-v1/722b2a37-2ef6-48e6-9da4-dd39737e8c50/putnala_podi.png',6),
('karappusa','Karappusa',NULL,(SELECT id FROM public.categories WHERE slug='snacks'),NULL,7),
('chegodilu','Chegodilu',NULL,(SELECT id FROM public.categories WHERE slug='snacks'),'/__l5e/assets-v1/e5209b5b-2299-4527-a271-ca31546081ba/chegodilu.png',8),
('murukulu','Murukulu',NULL,(SELECT id FROM public.categories WHERE slug='snacks'),'/__l5e/assets-v1/78082059-9846-4d85-9c10-dd39e6add618/murukulu.jpeg',9),
('pappu-chekkalu','Pappu Chekkalu','Karappalu',(SELECT id FROM public.categories WHERE slug='snacks'),'/__l5e/assets-v1/be565988-df64-422c-928c-acd46f94202f/pappu_chekkalu.png',10),
('atukula-chuduva','Atukula Chuduva',NULL,(SELECT id FROM public.categories WHERE slug='snacks'),'/__l5e/assets-v1/dcf1592a-1d46-4bd5-b5ed-c6756268be7d/chuduva.png',11),
('sakinalu','Sakinalu',NULL,(SELECT id FROM public.categories WHERE slug='snacks'),'/__l5e/assets-v1/cae24d4b-4a08-4b5f-ae08-56466d59e569/sakinalu.png',12),
('mixture','Mixture',NULL,(SELECT id FROM public.categories WHERE slug='snacks'),'/__l5e/assets-v1/bfdd9137-2565-447a-98f8-2f90b763b368/mixture.png',13),
('namak-pare','Namak Pare',NULL,(SELECT id FROM public.categories WHERE slug='snacks'),'/__l5e/assets-v1/e15fb5df-c11e-4c83-912d-b4910c208ade/namak_pare.png',14),
('ragi-laddulu','Ragi Laddulu',NULL,(SELECT id FROM public.categories WHERE slug='sweets'),'/__l5e/assets-v1/4999daa6-a337-4d9f-989a-d8ec7492d8c5/laddu.jpeg',15),
('bellam-kajjikayalu','Bellam Kajjikayalu',NULL,(SELECT id FROM public.categories WHERE slug='sweets'),'/__l5e/assets-v1/fba324fc-e248-47e9-89d1-1804b70e26f9/bellam_kajjikayalu.png',16),
('bellam-gavvalu','Bellam Gavvalu',NULL,(SELECT id FROM public.categories WHERE slug='sweets'),'/__l5e/assets-v1/258cea16-93f1-4579-8489-f49c419b41d0/bellam_gavvalu.png',17),
('sunnundalu','Sunnundalu',NULL,(SELECT id FROM public.categories WHERE slug='sweets'),'/__l5e/assets-v1/0b276a23-2a66-4e92-80ad-61eeda96d614/sunnunda.jpeg',18),
('soft-kova-kajjikayalu','Soft Kova Kajjikayalu',NULL,(SELECT id FROM public.categories WHERE slug='sweets'),'/__l5e/assets-v1/fba324fc-e248-47e9-89d1-1804b70e26f9/bellam_kajjikayalu.png',19),
('crispy-poori-kova-kajjikayalu','Crispy Poori Kova Kajjikayalu',NULL,(SELECT id FROM public.categories WHERE slug='sweets'),'/__l5e/assets-v1/fba324fc-e248-47e9-89d1-1804b70e26f9/bellam_kajjikayalu.png',20),
('poornam-boorelu','Poornam Boorelu',NULL,(SELECT id FROM public.categories WHERE slug='sweets'),'/__l5e/assets-v1/680cac30-b93b-42ed-9469-644d9d21bc0e/poornam_boorelu.png',21),
('boondi-laddo','Boondi Laddo',NULL,(SELECT id FROM public.categories WHERE slug='sweets'),'/__l5e/assets-v1/4f8beb15-bce6-4e0f-bf70-19301873ba21/boondi_laddu.png',22)
ON CONFLICT DO NOTHING;

INSERT INTO public.product_variants (product_id,variant_name,weight,price,stock_quantity,display_order)
SELECT p.id, v.w, v.w, v.price, 100, v.ord
FROM (VALUES
('karivepaku-podi',160,260,500),
('vellulli-podi',160,260,500),
('kandi-podi',160,260,500),
('munagaku-podi',160,260,500),
('kakarakaya-podi',160,260,500),
('idli-karam-podi',160,260,500),
('putnala-podi',160,260,500),
('karappusa',125,250,500),
('chegodilu',125,250,500),
('murukulu',100,200,400),
('pappu-chekkalu',125,250,500),
('atukula-chuduva',100,200,400),
('sakinalu',125,250,500),
('mixture',200,400,800),
('namak-pare',113,225,450),
('ragi-laddulu',200,400,800),
('bellam-kajjikayalu',130,260,520),
('bellam-gavvalu',120,240,480),
('sunnundalu',200,400,800),
('soft-kova-kajjikayalu',250,500,1000),
('crispy-poori-kova-kajjikayalu',200,400,800),
('poornam-boorelu',150,300,600),
('boondi-laddo',300,600,1200)
) AS s(slug,p250,p500,p1000)
JOIN public.products p ON p.slug = s.slug
CROSS JOIN LATERAL (VALUES ('250g',s.p250,0),('500g',s.p500,1),('1kg',s.p1000,2)) AS v(w,price,ord);