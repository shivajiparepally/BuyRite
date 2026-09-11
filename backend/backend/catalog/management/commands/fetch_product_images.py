"""
Fill Product.image_url with a real photo for each product, sourced from the
Openverse API (openly-licensed images, mostly Flickr-hosted).

Run with:  python manage.py fetch_product_images [--force]

Brand-exact matches aren't guaranteed; the query falls back to a
category-level search so every product still gets a real bottle photo.
"""

import json
import time
import urllib.parse
import urllib.request

from django.core.management.base import BaseCommand

from catalog.models import Product

OPENVERSE = "https://api.openverse.org/v1/images/"
UA = "north-brunswick-bottle-shop/1.0 (local dev seed script)"
IMG_EXTS = (".jpg", ".jpeg", ".png", ".webp")
# Wikimedia now blocks image hotlinking from browsers, so skip those results.
BLOCKED_HOSTS = ("wikimedia.org", "wikipedia.org")


def search(query, page_size=12):
    qs = urllib.parse.urlencode(
        {"q": query, "page_size": page_size, "mature": "false", "license_type": "all"}
    )
    req = urllib.request.Request(OPENVERSE + "?" + qs, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.load(resp).get("results", [])


def candidates(results):
    out = []
    for r in results:
        url = (r.get("url") or "").split("?")[0]
        if not url.lower().endswith(IMG_EXTS) or len(url) > 500:
            continue
        if any(h in url for h in BLOCKED_HOSTS):
            continue
        out.append(url)
    return out


class Command(BaseCommand):
    help = "Populate Product.image_url from the Openverse image API."

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", help="Overwrite products that already have an image.")
        parser.add_argument(
            "--by-category",
            action="store_true",
            help="Fill every product in a category from a small rotating pool of that category's photos "
                 "(more coherent than per-product brand searches).",
        )

    def handle(self, *args, **options):
        if options["by_category"]:
            return self._by_category(options["force"])
        return self._per_product(options["force"])

    def _by_category(self, force):
        from catalog.models import Category

        queries = {
            "Whiskey & Bourbon": "whiskey bourbon bottle",
            "Vodka": "vodka bottle",
            "Rum": "rum bottle",
            "Tequila": "tequila bottle",
            "Gin": "gin bottle",
            "Wine": "red wine bottle",
            "Beer": "beer bottle",
            "Champagne & Sparkling": "champagne bottle",
            "Cognac & Brandy": "cognac brandy bottle",
            "Liqueurs & Cordials": "liqueur bottle",
        }
        filled = 0
        for cat in Category.objects.all():
            pool = []
            for q in (queries.get(cat.name, f"{cat.name} bottle"), f"{cat.name} liquor bottle"):
                try:
                    pool += candidates(search(q, page_size=20))
                except Exception as exc:
                    self.stderr.write(f"  {cat.name}: {exc}")
                time.sleep(0.4)
            # de-dupe, keep order
            seen = set()
            pool = [u for u in pool if not (u in seen or seen.add(u))][:6]
            if not pool:
                self.stderr.write(f"  {cat.name}: no images")
                continue
            products = list(cat.products.all())
            for i, p in enumerate(products):
                if p.image_url and not force:
                    continue
                p.image_url = pool[i % len(pool)]
                p.save(update_fields=["image_url"])
                filled += 1
            self.stdout.write(f"  {cat.name}: {len(pool)} photos -> {len(products)} products")
        self.stdout.write(self.style.SUCCESS(f"Filled {filled} products from category pools."))

    def _per_product(self, force):
        products = Product.objects.select_related("category").all()
        filled = skipped = missed = 0
        used = set()

        for p in products:
            if p.image_url and not force:
                skipped += 1
                used.add(p.image_url)
                continue
            options_list = []
            for query in (f"{p.name}", f"{p.name} bottle", f"{p.category.name} bottle"):
                try:
                    options_list += candidates(search(query))
                except Exception as exc:  # network hiccup — keep going
                    self.stderr.write(f"  {p.name}: {exc}")
                time.sleep(0.4)
            # prefer a photo not already used by another product
            url = next((u for u in options_list if u not in used), None) or (
                options_list[0] if options_list else None
            )
            if url:
                p.image_url = url
                p.save(update_fields=["image_url"])
                used.add(url)
                filled += 1
                self.stdout.write(f"  {p.name} -> {url}")
            else:
                missed += 1
                self.stderr.write(f"  {p.name}: no image found")
            time.sleep(0.4)

        self.stdout.write(self.style.SUCCESS(
            f"Filled {filled}, skipped {skipped} (already had one), {missed} with no match."
        ))
