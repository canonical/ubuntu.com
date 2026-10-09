"""
Dummy Developer diaries articles, to QA the topic filters and pagination of
/community/developer-diaries while few real articles exist. Served at
/community/developer-diaries/dummy outside production only.
"""

from datetime import datetime, timedelta

# Every topic filter's tags, alone and combined, plus tags no filter matches
# and no tags at all
TAG_SETS = [
    ["snap"],
    ["rock", "docker"],
    ["ai"],
    ["foundations"],
    ["lxd"],
    ["snapcraft", "chisel"],
    ["container", "security"],
    ["multipass", "ai"],
    ["rockcraft"],
    ["workshop", "foundations"],
    ["python"],
    [],
]

AUTHORS = [
    "Alejandro Santisteban Corchos",
    "Juan Luis Cano",
    "Jon Seager",
    "Aaron J Prisk",
]

# Asset manager images, and none to show the default card image
IMAGES = [
    "https://assets.ubuntu.com/v1/9624938b-hero_img.jpg",
    None,
    "https://assets.ubuntu.com/v1/6feb3ff1-community-booths.jpg",
    "https://assets.ubuntu.com/v1/b129df29-community.jpg",
]

TITLES = [
    "Hardening old Docker images",
    "How does packaging really work?",
    (
        "A very long title that wraps over more than three lines on the "
        "card, so we can check it gets truncated"
    ),
    "Crafting your software",
]


class DummyDeveloperDiaries:
    """
    Stands in for canonicalwebteam.discourse.Articles with the same
    get_index behaviour: newest first, filtered by any of the given tags
    """

    def __init__(self, count=40):
        self.count = count

    def _articles(self):
        newest = datetime(2026, 6, 30)
        articles = []

        for index in range(self.count):
            number = index + 1
            author = AUTHORS[index % len(AUTHORS)]
            username = author.split()[0].lower()
            tags = TAG_SETS[index % len(TAG_SETS)]

            articles.append(
                {
                    "id": number,
                    "title": (
                        f"Dummy article {number}: "
                        f"{TITLES[index % len(TITLES)]}"
                    ),
                    "slug": f"dummy-article-{number}",
                    "path": "#articles",
                    "image": IMAGES[index % len(IMAGES)],
                    "tags": tags,
                    "created": newest - timedelta(days=7 * index),
                    "forum_url": "https://discourse.ubuntu.com",
                    "likes": (number * 7) % 30,
                    "author": {
                        "name": author,
                        "username": username,
                        "avatar_url": "",
                        "url": f"https://discourse.ubuntu.com/u/{username}",
                    },
                }
            )

        return articles

    def get_index(self, limit=12, offset=0, tags=None):
        articles = self._articles()

        if tags:
            articles = [
                article
                for article in articles
                if set(tags) & set(article["tags"])
            ]

        end = offset + limit
        return articles[offset:end], len(articles)
