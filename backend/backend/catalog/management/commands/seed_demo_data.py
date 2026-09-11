"""
Temporary stand-in for CSV import, which isn't built yet.

Run with: python manage.py seed_demo_data

Loads a realistic ~80-product catalog across all 10 standard liquor-store
categories so the site has something real to look at while the CSV import
feature is being built.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from catalog.models import Category, Product, ProductVariant
from storehours.models import StoreHours

# day_of_week: 0=Sun .. 6=Sat  ->  (open, close, is_closed)
STORE_HOURS = {
    0: ("12:00", "19:00", False),  # Sunday
    1: ("10:00", "21:00", False),  # Monday
    2: ("10:00", "21:00", False),  # Tuesday
    3: ("10:00", "21:00", False),  # Wednesday
    4: ("10:00", "21:00", False),  # Thursday
    5: ("10:00", "21:50", False),  # Friday
    6: ("10:00", "21:50", False),  # Saturday
}

CATEGORIES = [
    "Whiskey & Bourbon", "Vodka", "Rum", "Tequila", "Gin",
    "Wine", "Beer", "Champagne & Sparkling", "Cognac & Brandy", "Liqueurs & Cordials",
]

# name, category, size, price, stock, sale_price
RAW = [
    ("Jack Daniel's Old No. 7", "Whiskey & Bourbon", "750ml", 24.99, 40, None),
    ("Jameson Irish Whiskey", "Whiskey & Bourbon", "750ml", 26.99, 35, None),
    ("Maker's Mark Bourbon", "Whiskey & Bourbon", "750ml", 29.99, 20, 24.99),
    ("Crown Royal", "Whiskey & Bourbon", "750ml", 27.99, 30, None),
    ("Johnnie Walker Black Label", "Whiskey & Bourbon", "750ml", 34.99, 18, None),
    ("Buffalo Trace Bourbon", "Whiskey & Bourbon", "750ml", 23.99, 0, None),
    ("Woodford Reserve Bourbon", "Whiskey & Bourbon", "750ml", 32.99, 22, None),
    ("Bulleit Bourbon", "Whiskey & Bourbon", "750ml", 25.99, 28, None),
    ("Jim Beam White Label", "Whiskey & Bourbon", "1L", 19.99, 45, None),

    ("Grey Goose", "Vodka", "750ml", 34.99, 25, None),
    ("Tito's Handmade Vodka", "Vodka", "750ml", 22.99, 50, None),
    ("Absolut Original", "Vodka", "750ml", 18.99, 40, 15.99),
    ("Smirnoff No. 21", "Vodka", "1L", 14.99, 60, None),
    ("Ketel One", "Vodka", "750ml", 23.99, 30, None),
    ("Belvedere", "Vodka", "750ml", 29.99, 15, None),
    ("Ciroc", "Vodka", "750ml", 31.99, 0, None),
    ("Stolichnaya", "Vodka", "750ml", 17.99, 35, None),
    ("New Amsterdam Vodka", "Vodka", "1L", 13.99, 55, None),

    ("Bacardi Superior White", "Rum", "750ml", 15.99, 45, None),
    ("Captain Morgan Original Spiced", "Rum", "750ml", 16.99, 40, None),
    ("Malibu Coconut Rum", "Rum", "750ml", 15.49, 35, None),
    ("Mount Gay Eclipse", "Rum", "750ml", 21.99, 20, None),
    ("Kraken Black Spiced Rum", "Rum", "750ml", 22.99, 18, 19.99),
    ("Bumbu Original", "Rum", "750ml", 26.99, 12, None),
    ("Diplomatico Reserva", "Rum", "750ml", 34.99, 10, None),
    ("Sailor Jerry Spiced Rum", "Rum", "750ml", 17.99, 30, None),

    ("Don Julio Blanco", "Tequila", "750ml", 44.99, 20, None),
    ("Patron Silver", "Tequila", "750ml", 42.99, 22, None),
    ("Jose Cuervo Especial", "Tequila", "750ml", 19.99, 40, None),
    ("Casamigos Blanco", "Tequila", "750ml", 47.99, 15, None),
    ("1800 Reposado", "Tequila", "750ml", 29.99, 18, 24.99),
    ("Espolon Blanco", "Tequila", "750ml", 23.99, 25, None),
    ("Herradura Silver", "Tequila", "750ml", 34.99, 0, None),
    ("Milagro Silver", "Tequila", "750ml", 26.99, 20, None),

    ("Hendrick's Gin", "Gin", "750ml", 34.99, 20, None),
    ("Tanqueray London Dry", "Gin", "750ml", 22.99, 30, None),
    ("Bombay Sapphire", "Gin", "750ml", 23.99, 28, None),
    ("Beefeater London Dry", "Gin", "750ml", 20.99, 25, None),
    ("Aviation American Gin", "Gin", "750ml", 27.99, 15, None),
    ("The Botanist Islay Dry", "Gin", "750ml", 36.99, 10, None),
    ("Gordon's London Dry", "Gin", "1L", 16.99, 35, None),
    ("Plymouth Gin", "Gin", "750ml", 29.99, 12, None),

    ("Kendall-Jackson Chardonnay", "Wine", "750ml", 13.99, 40, None),
    ("Josh Cellars Cabernet Sauvignon", "Wine", "750ml", 14.99, 35, None),
    ("La Marca Prosecco", "Wine", "750ml", 15.99, 30, None),
    ("Barefoot Moscato", "Wine", "750ml", 8.99, 50, None),
    ("Yellow Tail Shiraz", "Wine", "750ml", 9.99, 45, 7.99),
    ("Meiomi Pinot Noir", "Wine", "750ml", 19.99, 20, None),
    ("Apothic Red Blend", "Wine", "750ml", 12.99, 32, None),
    ("Santa Margherita Pinot Grigio", "Wine", "750ml", 24.99, 15, None),
    ("Beringer White Zinfandel", "Wine", "750ml", 8.49, 0, None),

    ("Corona Extra", "Beer", "12-pack", 15.99, 40, None),
    ("Heineken Lager", "Beer", "12-pack", 16.99, 35, None),
    ("Budweiser", "Beer", "12-pack", 13.99, 50, None),
    ("Modelo Especial", "Beer", "12-pack", 16.49, 38, None),
    ("Stella Artois", "Beer", "12-pack", 17.99, 25, None),
    ("Blue Moon Belgian White", "Beer", "12-pack", 16.99, 20, 14.99),
    ("Guinness Draught", "Beer", "4-pack", 11.99, 30, None),
    ("Sam Adams Boston Lager", "Beer", "12-pack", 15.49, 22, None),
    ("Coors Light", "Beer", "12-pack", 13.49, 45, None),

    ("Moet & Chandon Imperial", "Champagne & Sparkling", "750ml", 54.99, 10, None),
    ("Veuve Clicquot Yellow Label", "Champagne & Sparkling", "750ml", 64.99, 8, None),
    ("Dom Perignon Vintage", "Champagne & Sparkling", "750ml", 219.99, 3, None),
    ("Chandon Brut", "Champagne & Sparkling", "750ml", 19.99, 20, None),
    ("Freixenet Cordon Negro", "Champagne & Sparkling", "750ml", 11.99, 25, 9.99),
    ("Korbel Brut", "Champagne & Sparkling", "750ml", 13.99, 22, None),
    ("Mumm Napa Brut Prestige", "Champagne & Sparkling", "750ml", 22.99, 0, None),

    ("Hennessy VS", "Cognac & Brandy", "750ml", 44.99, 18, None),
    ("Remy Martin VSOP", "Cognac & Brandy", "750ml", 54.99, 12, None),
    ("Courvoisier VS", "Cognac & Brandy", "750ml", 34.99, 15, None),
    ("Martell VS", "Cognac & Brandy", "750ml", 32.99, 14, None),
    ("E&J Brandy", "Cognac & Brandy", "750ml", 12.99, 30, None),
    ("Christian Brothers Brandy", "Cognac & Brandy", "750ml", 14.99, 25, None),

    ("Baileys Irish Cream", "Liqueurs & Cordials", "750ml", 22.99, 30, None),
    ("Kahlua", "Liqueurs & Cordials", "750ml", 19.99, 25, None),
    ("Jagermeister", "Liqueurs & Cordials", "750ml", 24.99, 28, None),
    ("Grand Marnier", "Liqueurs & Cordials", "750ml", 34.99, 15, None),
    ("Disaronno Amaretto", "Liqueurs & Cordials", "750ml", 23.99, 18, None),
    ("Cointreau", "Liqueurs & Cordials", "750ml", 32.99, 12, None),
    ("St-Germain Elderflower", "Liqueurs & Cordials", "750ml", 29.99, 10, None),
    ("Fireball Cinnamon Whisky", "Liqueurs & Cordials", "1L", 17.99, 40, 14.99),
]


IMAGE_URLS = {
    "1800 Reposado": "https://live.staticflickr.com/32/45212058_12eaedf9f9.jpg",
    "Absolut Original": "https://live.staticflickr.com/29/102878244_d40e1e1a97_b.jpg",
    "Apothic Red Blend": "https://live.staticflickr.com/1125/1103938984_17c606ea19_b.jpg",
    "Aviation American Gin": "https://live.staticflickr.com/6215/6300252080_ebfe6fcd72_b.jpg",
    "Bacardi Superior White": "https://live.staticflickr.com/8777/28272606035_785277c9d3_b.jpg",
    "Baileys Irish Cream": "https://live.staticflickr.com/8074/8324192143_7c0661d9da_b.jpg",
    "Barefoot Moscato": "https://live.staticflickr.com/2164/2395163408_207c10c5ae_b.jpg",
    "Beefeater London Dry": "https://live.staticflickr.com/65535/50192431928_f417ea7e66_b.jpg",
    "Belvedere": "https://live.staticflickr.com/2089/2237754240_54eecc120a_b.jpg",
    "Beringer White Zinfandel": "https://live.staticflickr.com/6001/5953990970_45613c77e7.jpg",
    "Blue Moon Belgian White": "https://live.staticflickr.com/45/151419584_98b8f77295_b.jpg",
    "Bombay Sapphire": "https://live.staticflickr.com/65535/48767071562_9ec22b8fcb_b.jpg",
    "Budweiser": "https://live.staticflickr.com/3151/2854340861_0687d20ed4_b.jpg",
    "Buffalo Trace Bourbon": "https://live.staticflickr.com/2365/2317827650_f098840d74_b.jpg",
    "Bulleit Bourbon": "https://live.staticflickr.com/6078/6086379676_248cc24515_b.jpg",
    "Bumbu Original": "https://live.staticflickr.com/6160/6264606340_1b6cc6f8ae_b.jpg",
    "Captain Morgan Original Spiced": "https://live.staticflickr.com/148/373799155_ff0a1a765a_b.jpg",
    "Casamigos Blanco": "https://live.staticflickr.com/7171/6631301325_7c5aeb38c2_b.jpg",
    "Chandon Brut": "https://live.staticflickr.com/5174/5427320487_61e9e6c59d_b.jpg",
    "Christian Brothers Brandy": "https://live.staticflickr.com/6158/6163946527_e11343935d_b.jpg",
    "Ciroc": "https://live.staticflickr.com/3274/5729020694_9c6ce2ea9d_b.jpg",
    "Cointreau": "https://live.staticflickr.com/5503/12767465694_19202f8b61_b.jpg",
    "Coors Light": "https://live.staticflickr.com/3555/3797775113_9493454735_b.jpg",
    "Corona Extra": "https://live.staticflickr.com/22/30479922_0aef0a028a_b.jpg",
    "Courvoisier VS": "https://live.staticflickr.com/65535/52213745114_8811e76bfb_b.jpg",
    "Crown Royal": "https://live.staticflickr.com/119/301243232_2e00b8801a_b.jpg",
    "Diplomatico Reserva": "https://live.staticflickr.com/7431/11750748126_8617c76eae_b.jpg",
    "Disaronno Amaretto": "https://live.staticflickr.com/3846/14864402834_78e4f683a2_b.jpg",
    "Dom Perignon Vintage": "https://live.staticflickr.com/147/339996940_62812ae285.jpg",
    "Don Julio Blanco": "https://live.staticflickr.com/5717/32226687395_fa7fb97405_b.jpg",
    "E&J Brandy": "https://live.staticflickr.com/4059/4524692351_f4371d56aa_b.jpg",
    "Espolon Blanco": "https://live.staticflickr.com/4142/4736812059_2bb1856829_b.jpg",
    "Fireball Cinnamon Whisky": "https://live.staticflickr.com/7486/15692206507_092fe269e0_b.jpg",
    "Freixenet Cordon Negro": "https://live.staticflickr.com/7522/15554059164_b13c6bcfb6_b.jpg",
    "Gordon's London Dry": "https://live.staticflickr.com/7496/15899951926_2fbcf2a5af_b.jpg",
    "Grand Marnier": "https://live.staticflickr.com/5583/14680179090_286a2e8de6_b.jpg",
    "Grey Goose": "https://live.staticflickr.com/2035/2453361527_8122321c07_b.jpg",
    "Guinness Draught": "https://live.staticflickr.com/3426/3359933186_b81e5b3cb3_b.jpg",
    "Heineken Lager": "https://live.staticflickr.com/5260/5494586649_1ff9060ef0_b.jpg",
    "Hendrick's Gin": "https://live.staticflickr.com/2831/12295865254_957e8e744c_b.jpg",
    "Hennessy VS": "https://live.staticflickr.com/8142/7419259542_6e544e5fcc_b.jpg",
    "Herradura Silver": "https://live.staticflickr.com/8404/8613354441_8dc3b4865b_b.jpg",
    "Jack Daniel's Old No. 7": "https://live.staticflickr.com/8501/8424925440_1a6aa5e53b_b.jpg",
    "Jagermeister": "https://live.staticflickr.com/5/9139540_87df150e90.jpg",
    "Jameson Irish Whiskey": "https://live.staticflickr.com/7464/15561483507_095d320602_b.jpg",
    "Jim Beam White Label": "https://live.staticflickr.com/5350/9273663783_29447d389a_b.jpg",
    "Johnnie Walker Black Label": "https://live.staticflickr.com/2365/2317827650_f098840d74_b.jpg",
    "Jose Cuervo Especial": "https://live.staticflickr.com/185/371268575_5e9596c1d9_b.jpg",
    "Josh Cellars Cabernet Sauvignon": "https://live.staticflickr.com/145/354421924_aedb3946da_b.jpg",
    "Kahlua": "https://live.staticflickr.com/8074/8324192143_7c0661d9da_b.jpg",
    "Kendall-Jackson Chardonnay": "https://live.staticflickr.com/1302/1152404671_a079e692bc_b.jpg",
    "Ketel One": "https://live.staticflickr.com/7171/6711384629_0079a27f39_b.jpg",
    "Korbel Brut": "https://live.staticflickr.com/8652/16175668362_5c9151083f_b.jpg",
    "Kraken Black Spiced Rum": "https://live.staticflickr.com/174/379520896_4e635c8a4b_b.jpg",
    "La Marca Prosecco": "https://live.staticflickr.com/4392/35968783350_547823ebf1_b.jpg",
    "Maker's Mark Bourbon": "https://live.staticflickr.com/6078/6086379676_248cc24515_b.jpg",
    "Malibu Coconut Rum": "https://live.staticflickr.com/42/78209665_a254080eb0_b.jpg",
    "Martell VS": "https://live.staticflickr.com/5003/5224994642_74cbdd26d5_m.jpg",
    "Meiomi Pinot Noir": "https://live.staticflickr.com/1125/1103938984_17c606ea19_b.jpg",
    "Milagro Silver": "https://live.staticflickr.com/32/45212058_12eaedf9f9.jpg",
    "Modelo Especial": "https://live.staticflickr.com/45/151419584_98b8f77295_b.jpg",
    "Moet & Chandon Imperial": "https://live.staticflickr.com/7497/15927635619_94565fc16c_b.jpg",
    "Mount Gay Eclipse": "https://live.staticflickr.com/8777/28272606035_785277c9d3_b.jpg",
    "Mumm Napa Brut Prestige": "https://live.staticflickr.com/6183/6152769685_5706323a79_b.jpg",
    "New Amsterdam Vodka": "https://live.staticflickr.com/7161/6569450901_066484472f_b.jpg",
    "Patron Silver": "https://live.staticflickr.com/7171/6631301325_7c5aeb38c2_b.jpg",
    "Plymouth Gin": "https://live.staticflickr.com/65535/47967570741_3c6ef21ac7_b.jpg",
    "Remy Martin VSOP": "https://live.staticflickr.com/7202/6845786409_46301bd455_b.jpg",
    "Sailor Jerry Spiced Rum": "https://live.staticflickr.com/6160/6264606340_1b6cc6f8ae_b.jpg",
    "Sam Adams Boston Lager": "https://live.staticflickr.com/3151/2854340861_0687d20ed4_b.jpg",
    "Santa Margherita Pinot Grigio": "https://live.staticflickr.com/2164/2395163408_207c10c5ae_b.jpg",
    "Smirnoff No. 21": "https://live.staticflickr.com/29/102878244_d40e1e1a97_b.jpg",
    "St-Germain Elderflower": "https://live.staticflickr.com/5503/12767465694_19202f8b61_b.jpg",
    "Stella Artois": "https://live.staticflickr.com/3555/3797775113_9493454735_b.jpg",
    "Stolichnaya": "https://live.staticflickr.com/2089/2237754240_54eecc120a_b.jpg",
    "Tanqueray London Dry": "https://live.staticflickr.com/6215/6300252080_ebfe6fcd72_b.jpg",
    "The Botanist Islay Dry": "https://live.staticflickr.com/65535/50192431928_f417ea7e66_b.jpg",
    "Tito's Handmade Vodka": "https://live.staticflickr.com/3274/5729020694_9c6ce2ea9d_b.jpg",
    "Veuve Clicquot Yellow Label": "https://live.staticflickr.com/5174/5427320487_61e9e6c59d_b.jpg",
    "Woodford Reserve Bourbon": "https://live.staticflickr.com/119/301243232_2e00b8801a_b.jpg",
    "Yellow Tail Shiraz": "https://live.staticflickr.com/6001/5953990970_45613c77e7.jpg",
}

class Command(BaseCommand):
    help = "Seed the database with sample categories and ~80 products (temporary stand-in for CSV import)."

    @transaction.atomic
    def handle(self, *args, **options):
        cat_objs = {}
        for name in CATEGORIES:
            cat, _ = Category.objects.get_or_create(name=name)
            cat_objs[name] = cat

        sku_counter = {}
        created = 0
        for name, cat_name, size, price, stock, sale_price in RAW:
            category = cat_objs[cat_name]
            img = IMAGE_URLS.get(name, "")
            product, _ = Product.objects.get_or_create(
                name=name, category=category, defaults={"image_url": img}
            )
            if img and product.image_url != img:
                product.image_url = img
                product.save(update_fields=["image_url"])

            prefix = cat_name[:3].upper()
            sku_counter[prefix] = sku_counter.get(prefix, 999) + 1
            sku = f"{prefix}-{sku_counter[prefix]}"

            ProductVariant.objects.get_or_create(
                product=product,
                size=size,
                defaults=dict(sku=sku, price=price, sale_price=sale_price, stock=stock),
            )
            created += 1

        for dow, (open_time, close_time, is_closed) in STORE_HOURS.items():
            StoreHours.objects.update_or_create(
                day_of_week=dow,
                defaults=dict(open_time=open_time, close_time=close_time, is_closed=is_closed),
            )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded {len(CATEGORIES)} categories, {created} product variants, "
            f"and {len(STORE_HOURS)} days of store hours."
        ))
