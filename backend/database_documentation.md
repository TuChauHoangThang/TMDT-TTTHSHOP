# Project Database Documentation

**Database Name:** ttth_furniture

## Table: `cart_items`

### Structure

| Field | Type | Null | Key | Default | Extra |
| --- | --- | --- | --- | --- | --- |
| quantity | int | NO |  | NULL |  |
| created_at | datetime(6) | YES |  | NULL |  |
| id | bigint | NO | PRI | NULL | auto_increment |
| product_id | bigint | NO | MUL | NULL |  |
| updated_at | datetime(6) | YES |  | NULL |  |
| customer_id | varchar(255) | NO |  | NULL |  |

### Data

*No data available in this table.*


---

## Table: `categories`

### Structure

| Field | Type | Null | Key | Default | Extra |
| --- | --- | --- | --- | --- | --- |
| created_at | datetime(6) | YES |  | NULL |  |
| id | bigint | NO | PRI | NULL | auto_increment |
| icon | varchar(100) | YES |  | NULL |  |
| slug | varchar(100) | NO | UNI | NULL |  |
| image_url | varchar(500) | YES |  | NULL |  |
| description | text | YES |  | NULL |  |
| name | varchar(255) | NO |  | NULL |  |

### Data

| created_at | id | icon | slug | image_url | description | name |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-05-05 00:08:06.514406 | 1 | fa fa-couch | sofa-ghe | https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80 | Sofa & Gh? ch?t l??ng cao. | Sofa & Gh? |
| 2026-05-05 00:08:06.591125 | 2 | fa fa-chair | ban-ghe | https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80 | Bàn Gh? ch?t l??ng cao. | Bàn Gh? |
| 2026-05-05 00:08:06.601114 | 3 | fa fa-bed | giuong-ngu | https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80 | Gi??ng Ng? ch?t l??ng cao. | Gi??ng Ng? |
| 2026-05-05 00:08:06.611325 | 4 | fa fa-box | tu-ke | https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80 | T? & K? ch?t l??ng cao. | T? & K? |
| 2026-05-05 00:08:06.622564 | 5 | fa fa-lightbulb | den-trang-tri | https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80 | ?èn Trang Trí ch?t l??ng cao. | ?èn Trang Trí |

---

## Table: `custom_order_images`

### Structure

| Field | Type | Null | Key | Default | Extra |
| --- | --- | --- | --- | --- | --- |
| id | bigint | NO | PRI | NULL | auto_increment |
| request_id | bigint | NO | MUL | NULL |  |
| image_url | text | NO |  | NULL |  |

### Data

| id | request_id | image_url |
| --- | --- | --- |
| 1 | 7 | /uploads/custom-orders/7/9f2a21a1-cc01-4396-b890-c7b21d710e10_1-thiet-ke-phong-khach-biet-thu-nha-pho.jpg |

---

## Table: `custom_order_quotes`

### Structure

| Field | Type | Null | Key | Default | Extra |
| --- | --- | --- | --- | --- | --- |
| estimated_days | int | NO |  | NULL |  |
| quoted_price | decimal(15,2) | NO |  | NULL |  |
| contractor_id | bigint | NO |  | NULL |  |
| created_at | datetime(6) | YES |  | NULL |  |
| id | bigint | NO | PRI | NULL | auto_increment |
| request_id | bigint | NO | MUL | NULL |  |
| shop_id | bigint | NO |  | NULL |  |
| updated_at | datetime(6) | YES |  | NULL |  |
| note | text | YES |  | NULL |  |
| status | enum('ACCEPTED','PENDING','REJECTED','WITHDRAWN') | YES |  | NULL |  |

### Data

| estimated_days | quoted_price | contractor_id | created_at | id | request_id | shop_id | updated_at | note | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | 18000000.00 | 2 | 2026-05-06 09:54:05.725974 | 1 | 4 | 1 | 2026-05-06 09:54:05.725974 | Tôi s? hoàn thành s?m nh?t  | PENDING |
| 31 | 6000000.00 | 2 | 2026-05-06 10:01:50.711423 | 2 | 6 | 1 | 2026-05-06 10:02:03.278563 | Tôi s? l?t ?á làm m?t bàn | ACCEPTED |
| 24 | 8000000.00 | 2 | 2026-05-06 10:13:57.983034 | 3 | 7 | 1 | 2026-05-06 10:26:28.604804 | Tôi s? hoàn thi?n s?m nh?t  | ACCEPTED |
| 25 | 5000000.00 | 2 | 2026-05-06 10:32:58.271475 | 4 | 8 | 1 | 2026-05-06 10:34:22.367880 | Tôi s? hoàn thành s?m  | ACCEPTED |

---

## Table: `custom_order_requests`

### Structure

| Field | Type | Null | Key | Default | Extra |
| --- | --- | --- | --- | --- | --- |
| budget_max | decimal(15,2) | YES |  | NULL |  |
| budget_min | decimal(15,2) | YES |  | NULL |  |
| deadline | date | YES |  | NULL |  |
| created_at | datetime(6) | YES |  | NULL |  |
| customer_id | bigint | NO |  | NULL |  |
| id | bigint | NO | PRI | NULL | auto_increment |
| selected_quote_id | bigint | YES |  | NULL |  |
| updated_at | datetime(6) | YES |  | NULL |  |
| title | varchar(500) | NO |  | NULL |  |
| color_style | varchar(255) | YES |  | NULL |  |
| description | text | NO |  | NULL |  |
| dimensions | varchar(255) | YES |  | NULL |  |
| furniture_type | varchar(255) | YES |  | NULL |  |
| material | varchar(255) | YES |  | NULL |  |
| status | enum('CANCELLED','COMPLETED','IN_PROGRESS','OPEN','QUOTED') | YES |  | NULL |  |

### Data

| budget_max | budget_min | deadline | created_at | customer_id | id | selected_quote_id | updated_at | title | color_style | description | dimensions | furniture_type | material | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 150000.00 | 50000.00 | 2026-05-14 | 2026-05-05 23:35:59.416711 | 1 | 1 | NULL | 2026-05-05 23:35:59.416711 | Sofa | Màu be | Tôi mu?n Sofa làm b?ng gh? da , Cao 10m | 2,5m | T? & K? | Da | OPEN |
| 80000.00 | 50000.00 | 2026-05-31 | 2026-05-06 09:44:52.248100 | 2 | 2 | NULL | 2026-05-06 09:44:52.248100 | Sofa | Màu xám | Mu?n m?t chi?c sofa êm ái g?n nh?  | Dài 2.5m , r?ng 0.8m , cao 1.8m | Sofa & Gh? | Da  | OPEN |
| 80000.00 | 50000.00 | 2026-05-31 | 2026-05-06 09:44:53.954619 | 2 | 3 | NULL | 2026-05-06 09:44:53.954619 | Sofa | Màu xám | Mu?n m?t chi?c sofa êm ái g?n nh?  | Dài 2.5m , r?ng 0.8m , cao 1.8m | Sofa & Gh? | Da  | OPEN |
| 80000.00 | 50000.00 | 2026-05-31 | 2026-05-06 09:44:55.825005 | 2 | 4 | NULL | 2026-05-06 09:54:05.734553 | Sofa | Màu xám | Mu?n m?t chi?c sofa êm ái g?n nh?  | Dài 2.5m , r?ng 0.8m , cao 1.8m | Sofa & Gh? | Da  | QUOTED |
| 8000000.00 | 2000000.00 | 2026-05-31 | 2026-05-06 10:00:17.269767 | 1 | 5 | NULL | 2026-05-06 10:00:17.269767 | Bàn  | Màu ?en c?m th?ch | Tôi c?n m?t chi?c bàn ?á ?? trong b?p | Dài 1m , r?ng 2m , cao 1.5m | Bàn & Gh? | ?á , g? | OPEN |
| 8000000.00 | 2000000.00 | 2026-05-31 | 2026-05-06 10:00:37.704215 | 1 | 6 | 2 | 2026-05-06 10:02:03.278563 | Bàn  | Màu ?en c?m th?ch | Tôi c?n m?t chi?c bàn ?á ?? trong b?p | Dài 1m , r?ng 2m , cao 1.5m | Bàn & Gh? | ?á , g? | IN_PROGRESS |
| 10000000.00 | 5000000.00 | 2026-05-31 | 2026-05-06 10:11:47.736467 | 1 | 7 | 3 | 2026-05-06 10:26:28.596223 | T? kính  | Màu nâu ?en | Tôi mu?n làm t? ??ng ly | Dài 1m , cao 2m , r?ng 0.5m | T? & K? | G? , kính  | IN_PROGRESS |
| 5000000.00 | 3000000.00 | 2026-05-28 | 2026-05-06 10:28:07.267332 | 1 | 8 | 4 | 2026-05-06 10:34:22.367880 | Tôi c?n m?t k? ??ng d?ng c? nhà b?p | Màu tr?ng | Mu?n m?t k? ??ng g?n gàng và ti?n l?i , có nhi?u ng?n | Dài 2m , r?ng 1m , cao 1m | N?i th?t nhà b?p | G? , ?á c?m th?ch | IN_PROGRESS |

---

## Table: `product_badges`

### Structure

| Field | Type | Null | Key | Default | Extra |
| --- | --- | --- | --- | --- | --- |
| id | bigint | NO | PRI | NULL | auto_increment |
| product_id | bigint | NO | MUL | NULL |  |
| badge_label | varchar(50) | NO |  | NULL |  |

### Data

| id | product_id | badge_label |
| --- | --- | --- |
| 1 | 1 | HOT |
| 2 | 2 | HOT |
| 3 | 4 | -15% |
| 4 | 5 | BESTSELLER |
| 5 | 6 | CAO C?P |
| 6 | 7 | M?I |
| 7 | 10 | -20% |
| 8 | 12 | NGO╖I TR?I |
| 9 | 13 | -15% |
| 10 | 14 | HOT |
| 11 | 16 | TR? EM |
| 12 | 17 | GI╡ R? |
| 13 | 18 | CAO C?P |
| 14 | 20 | -10% |
| 15 | 21 | M?I |
| 16 | 23 | B╡N CH?Y |
| 17 | 24 | -15% |
| 18 | 25 | M?I |
| 19 | 26 | -30% |
| 20 | 29 | CAO C?P |
| 21 | 30 | SMARTHOME |

---

## Table: `product_images`

### Structure

| Field | Type | Null | Key | Default | Extra |
| --- | --- | --- | --- | --- | --- |
| is_primary | bit(1) | NO |  | NULL |  |
| sort_order | int | YES |  | NULL |  |
| id | bigint | NO | PRI | NULL | auto_increment |
| product_id | bigint | NO | MUL | NULL |  |
| image_url | varchar(500) | NO |  | NULL |  |

### Data

| is_primary | sort_order | id | product_id | image_url |
| --- | --- | --- | --- | --- |
|  | 0 | 1 | 1 | https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80 |
|  | 0 | 2 | 2 | https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80 |
|  | 0 | 3 | 3 | https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80 |
|  | 0 | 4 | 4 | https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80 |
|  | 0 | 5 | 5 | https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&q=80 |
|  | 0 | 6 | 6 | https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&q=80 |
|  | 0 | 7 | 7 | https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80 |
|  | 0 | 8 | 8 | https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=400&q=80 |
|  | 0 | 9 | 9 | https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80 |
|  | 0 | 10 | 10 | https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=80 |
|  | 0 | 11 | 11 | https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&q=80 |
|  | 0 | 12 | 12 | https://images.unsplash.com/photo-1416879598056-0c822e11f185?w=400&q=80 |
|  | 0 | 13 | 13 | https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80 |
|  | 0 | 14 | 14 | https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80 |
|  | 0 | 15 | 15 | https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=80 |
|  | 0 | 16 | 16 | https://images.unsplash.com/photo-1617325247661-675ab03407d3?w=400&q=80 |
|  | 0 | 17 | 17 | https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80 |
|  | 0 | 18 | 18 | https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80 |
|  | 0 | 19 | 19 | https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80 |
|  | 0 | 20 | 20 | https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&q=80 |
|  | 0 | 21 | 21 | https://images.unsplash.com/photo-1595526114101-1b9a1eb3d327?w=400&q=80 |
|  | 0 | 22 | 22 | https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&q=80 |
|  | 0 | 23 | 23 | https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=400&q=80 |
|  | 0 | 24 | 24 | https://images.unsplash.com/photo-1505069190533-da1c9af13346?w=400&q=80 |
|  | 0 | 25 | 25 | https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80 |
|  | 0 | 26 | 26 | https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80 |
|  | 0 | 27 | 27 | https://images.unsplash.com/photo-1524484485831-a92fa817e4bb?w=400&q=80 |
|  | 0 | 28 | 28 | https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&q=80 |
|  | 0 | 29 | 29 | https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&q=80 |
|  | 0 | 30 | 30 | https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&q=80 |

---

## Table: `products`

### Structure

| Field | Type | Null | Key | Default | Extra |
| --- | --- | --- | --- | --- | --- |
| price_contact | bit(1) | NO |  | NULL |  |
| price_current | decimal(15,2) | YES |  | NULL |  |
| price_original | decimal(15,2) | YES |  | NULL |  |
| rating_count | int | YES |  | NULL |  |
| rating_stars | decimal(2,1) | YES |  | NULL |  |
| category_id | bigint | NO | MUL | NULL |  |
| created_at | datetime(6) | YES |  | NULL |  |
| id | bigint | NO | PRI | NULL | auto_increment |
| updated_at | datetime(6) | YES |  | NULL |  |
| slug | varchar(200) | NO | UNI | NULL |  |
| name | varchar(500) | NO |  | NULL |  |
| description | text | YES |  | NULL |  |
| status | enum('ACTIVE','INACTIVE') | NO |  | NULL |  |

### Data

| price_contact | price_current | price_original | rating_count | rating_stars | category_id | created_at | id | updated_at | slug | name | description | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| \0 | 18500000.00 | 22000000.00 | 48 | 4.5 | 1 | 2026-05-05 00:08:06.638428 | 1 | 2026-05-05 00:08:06.638428 | sf001-sofa-go-oc-cho | Sofa G? αc Chó 3 Ch? Ng?i | Mô t? chi ti?t cho s?n ph?m Sofa G? αc Chó 3 Ch? Ng?i. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 5800000.00 | NULL | 29 | 4.5 | 1 | 2026-05-05 00:08:06.656585 | 2 | 2026-05-05 00:08:06.656585 | gh011-ghe-armchair | Gh? Armchair G? Cao Su | Mô t? chi ti?t cho s?n ph?m Gh? Armchair G? Cao Su. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
|  | NULL | NULL | 41 | 5.0 | 1 | 2026-05-05 00:08:06.671954 | 3 | 2026-05-05 00:08:06.671954 | sf005-sofa-goc-l | Sofa Góc L V?i Nhung | Mô t? chi ti?t cho s?n ph?m Sofa Góc L V?i Nhung. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 4200000.00 | 4900000.00 | 12 | 4.0 | 1 | 2026-05-05 00:08:06.683940 | 4 | 2026-05-05 00:08:06.683940 | sf006-ghe-thu-gian | Gh? Th? Gi╞n Phong Cách Nh?t | Mô t? chi ti?t cho s?n ph?m Gh? Th? Gi╞n Phong Cách Nh?t. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 3500000.00 | NULL | 66 | 4.8 | 1 | 2026-05-05 00:08:06.697022 | 5 | 2026-05-05 00:08:06.697022 | sf007-sofa-don | Sofa ??n V?i B? Lanh | Mô t? chi ti?t cho s?n ph?m Sofa ??n V?i B? Lanh. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 32000000.00 | 35000000.00 | 8 | 4.9 | 1 | 2026-05-05 00:08:06.709338 | 6 | 2026-05-05 00:08:06.709338 | sf008-sofa-da | Sofa Da Th?t 2 Ch? Ng?i | Mô t? chi ti?t cho s?n ph?m Sofa Da Th?t 2 Ch? Ng?i. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 24900000.00 | NULL | 32 | 5.0 | 2 | 2026-05-05 00:08:06.722893 | 7 | 2026-05-05 00:08:06.722893 | ba006-bo-ban-an | B? Bàn ?n G? S?i 6 Gh? | Mô t? chi ti?t cho s?n ph?m B? Bàn ?n G? S?i 6 Gh?. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 3200000.00 | 3900000.00 | 15 | 5.0 | 2 | 2026-05-05 00:08:06.735686 | 8 | 2026-05-05 00:08:06.735686 | bt002-ban-tra | Bàn Trà M?t Kính Khung Thép | Mô t? chi ti?t cho s?n ph?m Bàn Trà M?t Kính Khung Thép. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 4500000.00 | NULL | 55 | 4.2 | 2 | 2026-05-05 00:08:06.747502 | 9 | 2026-05-05 00:08:06.747502 | blv01-ban-lam-viec | Bàn Làm Vi?c G? Tràm | Mô t? chi ti?t cho s?n ph?m Bàn Làm Vi?c G? Tràm. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 1200000.00 | 1500000.00 | 80 | 4.6 | 2 | 2026-05-05 00:08:06.759360 | 10 | 2026-05-05 00:08:06.759360 | ga02-ghe-an | Gh? ?n B?c N?m Da | Mô t? chi ti?t cho s?n ph?m Gh? ?n B?c N?m Da. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 2800000.00 | NULL | 10 | 4.1 | 2 | 2026-05-05 00:08:06.771442 | 11 | 2026-05-05 00:08:06.771442 | bc01-ban-cafe | Bàn Cafe Tròn M?t ?á | Mô t? chi ti?t cho s?n ph?m Bàn Cafe Tròn M?t ?á. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 15600000.00 | NULL | 5 | 4.8 | 2 | 2026-05-05 00:08:06.783263 | 12 | 2026-05-05 00:08:06.783263 | bg03-ban-ghe-san-vuon | B? Bàn Gh? Sân V??n Nhôm ?úc | Mô t? chi ti?t cho s?n ph?m B? Bàn Gh? Sân V??n Nhôm ?úc. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 15200000.00 | 17900000.00 | 21 | 4.0 | 3 | 2026-05-05 00:08:06.795436 | 13 | 2026-05-05 00:08:06.795436 | gn003-giuong-ngu-go-walnut | Gi??ng Ng? G? Walnut King Size | Mô t? chi ti?t cho s?n ph?m Gi??ng Ng? G? Walnut King Size. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 8500000.00 | NULL | 110 | 4.7 | 3 | 2026-05-05 00:08:06.808243 | 14 | 2026-05-05 00:08:06.808243 | gn004-giuong-go-soi | Gi??ng G? S?i Hi?n ??i 1m6 | Mô t? chi ti?t cho s?n ph?m Gi??ng G? S?i Hi?n ??i 1m6. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 12500000.00 | 14000000.00 | 34 | 4.3 | 3 | 2026-05-05 00:08:06.820286 | 15 | 2026-05-05 00:08:06.820286 | gn005-giuong-boc-nem | Gi??ng Ng? B?c N?m ??u Gi??ng | Mô t? chi ti?t cho s?n ph?m Gi??ng Ng? B?c N?m ??u Gi??ng. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 18000000.00 | NULL | 42 | 4.9 | 3 | 2026-05-05 00:08:06.832266 | 16 | 2026-05-05 00:08:06.832266 | gn006-giuong-tang | Gi??ng T?ng Tr? Em Ch?ng M?i M?t | Mô t? chi ti?t cho s?n ph?m Gi??ng T?ng Tr? Em Ch?ng M?i M?t. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 2500000.00 | 3000000.00 | 200 | 4.1 | 3 | 2026-05-05 00:08:06.844515 | 17 | 2026-05-05 00:08:06.844515 | gn007-giuong-pallet | Gi??ng Pallet G? Thông | Mô t? chi ti?t cho s?n ph?m Gi??ng Pallet G? Thông. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
|  | NULL | NULL | 3 | 5.0 | 3 | 2026-05-05 00:08:06.856749 | 18 | 2026-05-05 00:08:06.856749 | gn008-giuong-co-dien | Gi??ng Ng? C? ?i?n Hoàng Gia | Mô t? chi ti?t cho s?n ph?m Gi??ng Ng? C? ?i?n Hoàng Gia. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
|  | NULL | NULL | 67 | 4.5 | 4 | 2026-05-05 00:08:06.868774 | 19 | 2026-05-05 00:08:06.868774 | ks009-ke-sach | K? Sách ?a N?ng G? Thông | Mô t? chi ti?t cho s?n ph?m K? Sách ?a N?ng G? Thông. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 7100000.00 | 7900000.00 | 38 | 4.0 | 4 | 2026-05-05 00:08:06.879529 | 20 | 2026-05-05 00:08:06.879529 | ktv05-ke-tv | K? TV G? Thông Nguyên T?m | Mô t? chi ti?t cho s?n ph?m K? TV G? Thông Nguyên T?m. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 14500000.00 | NULL | 25 | 4.6 | 4 | 2026-05-05 00:08:06.895792 | 21 | 2026-05-05 00:08:06.896325 | tq01-tu-quan-ao | T? Qu?n ╡o C?a Lùa Cao C?p | Mô t? chi ti?t cho s?n ph?m T? Qu?n ╡o C?a Lùa Cao C?p. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 1200000.00 | 1500000.00 | 150 | 4.2 | 4 | 2026-05-05 00:08:06.908129 | 22 | 2026-05-05 00:08:06.908129 | tdg02-tu-dau-giuong | T? ??u Gi??ng 2 Ng?n | Mô t? chi ti?t cho s?n ph?m T? ??u Gi??ng 2 Ng?n. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 3500000.00 | NULL | 60 | 4.8 | 4 | 2026-05-05 00:08:06.919599 | 23 | 2026-05-05 00:08:06.919599 | tg03-tu-giay | T? Giày C?a Ch?p Thông H?i | Mô t? chi ti?t cho s?n ph?m T? Giày C?a Ch?p Thông H?i. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 850000.00 | 1000000.00 | 95 | 4.4 | 4 | 2026-05-05 00:08:06.930751 | 24 | 2026-05-05 00:08:06.930751 | ktt04-ke-trang-tri | K? Trang Trí Treo T??ng Khung Thép | Mô t? chi ti?t cho s?n ph?m K? Trang Trí Treo T??ng Khung Thép. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 1950000.00 | NULL | 22 | 4.5 | 5 | 2026-05-05 00:08:06.943727 | 25 | 2026-05-05 00:08:06.943727 | dt018-den-tha-tran | ?èn Th? Tr?n Mây Tre ?an | Mô t? chi ti?t cho s?n ph?m ?èn Th? Tr?n Mây Tre ?an. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 850000.00 | 1200000.00 | 120 | 4.7 | 5 | 2026-05-05 00:08:06.955161 | 26 | 2026-05-05 00:08:06.955161 | db02-den-ban | ?èn Bàn ??c Sách Ki?u Dáng Công Nghi?p | Mô t? chi ti?t cho s?n ph?m ?èn Bàn ??c Sách Ki?u Dáng Công Nghi?p. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 2100000.00 | NULL | 45 | 4.3 | 5 | 2026-05-05 00:08:06.967633 | 27 | 2026-05-05 00:08:06.967633 | dc03-den-cay | ?èn Cây ??ng Góc Sofa | Mô t? chi ti?t cho s?n ph?m ?èn Cây ??ng Góc Sofa. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 1100000.00 | NULL | 30 | 4.6 | 5 | 2026-05-05 00:08:06.977641 | 28 | 2026-05-05 00:08:06.977641 | dt04-den-tuong | ?èn T??ng Phong Cách C? ?i?n | Mô t? chi ti?t cho s?n ph?m ?èn T??ng Phong Cách C? ?i?n. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 8500000.00 | 9500000.00 | 15 | 4.9 | 5 | 2026-05-05 00:08:06.987173 | 29 | 2026-05-05 00:08:06.987173 | dc05-den-chum | ?èn Chùm Th?y Tinh Khung ??ng | Mô t? chi ti?t cho s?n ph?m ?èn Chùm Th?y Tinh Khung ??ng. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |
| \0 | 250000.00 | NULL | 500 | 4.1 | 5 | 2026-05-05 00:08:06.998701 | 30 | 2026-05-05 00:08:06.998701 | dl06-den-led | ?èn LED ╢m Tr?n Thông Minh | Mô t? chi ti?t cho s?n ph?m ?èn LED ╢m Tr?n Thông Minh. S?n ph?m ???c ch? tác t? nh?ng v?t li?u t?t nh?t, ??m b?o ?? b?n và tính th?m m? cao. Phù h?p cho nhi?u không gian ki?n trúc khác nhau, t? c? ?i?n ??n hi?n ??i. Ch? ?? b?o hành dài h?n mang l?i s? an tâm cho khách hàng. | ACTIVE |

---


