import type { Section } from "../types";

const section: Section = {
  "slug": "oop-advanced",
  "title": "ООП: наслідування та магія",
  "short": "inheritance, dunder, dataclass",
  "icon": "🕷️",
  "group": "ООП",
  "summary": "Наслідування і super(), MRO, поліморфізм, dunder-методи (__str__, __repr__, __eq__, __len__), @classmethod/@staticmethod, dataclasses.",
  "hero": {
    "name": "Людина-павук (Майлз Моралес)",
    "universe": "Spider-Verse",
    "emoji": "🕷️",
    "quote": "Кожен Spider-Man наслідує class Spider, але перевизначає свій стиль.",
    "why": "Павуковсесвіт — це дерево наслідування: спільна база, різні override."
  },
  "theme": {
    "accent": "#ef4444",
    "accent2": "#3b82f6",
    "glow": "#dc2626"
  },
  "minutes": 18,
  "order": 15,
  "blocks": [
    {
      "type": "text",
      "md": "У Павуковсесвіті є десятки Людей-павуків: Пітер Паркер, Майлз Моралес, Гвен Стейсі, Пітер Порк, Спайдер-Нуар… У всіх **спільна база** — павуче чуття, липке павутиння, лазіння по стінах. Але кожен робить це *по-своєму*: Майлз ще й стає невидимим і б'є отруйним розрядом, а Нуар бореться лише в чорно-білому.\n\nЦе ідеальна модель трьох головних ідей «просунутого» ООП:\n\n- **наслідування** — новий клас отримує все від базового і додає своє;\n- **перевизначення (override)** і `super()` — змінюємо поведінку, не переписуючи базу;\n- **поліморфізм** — один виклик `hero.attack()`, а результат різний для кожного об'єкта.\n\nА далі — магія: **dunder-методи** (`__str__`, `__eq__`, `__len__`…), що вчать твої класи працювати з `print`, `==`, `len` і `+`, методи класу та статичні методи, і `@dataclass`, який пише шаблонний код за тебе."
    },
    {
      "type": "heading",
      "text": "Наслідування: class Miles(Spider)"
    },
    {
      "type": "text",
      "md": "Щоб створити клас-нащадок, передай базовий клас у дужках: `class Miles(Spider):`. Тепер `Miles` — **підклас** (дочірній клас), а `Spider` — **суперклас** (батьківський). Нащадок автоматично отримує всі атрибути й методи бази і може:\n\n- **додавати** нові методи (`venom_strike`);\n- **перевизначати** наявні — просто оголосивши метод з тим самим іменем.\n\nЗв'язок «нащадок **є** різновидом бази» (is-a): Майлз *є* Людиною-павуком. `isinstance(miles, Spider)` — `True`. Якщо ж зв'язок «**має**» (has-a: у костюма *є* реактор) — це композиція, а не наслідування."
    },
    {
      "type": "code",
      "code": "class Spider:\n    def __init__(self, name):\n        self.name = name\n\n    def web(self):\n        return f\"{self.name} стріляє павутиною 🕸️\"\n\n    def sense(self):\n        return f\"{self.name}: павуче чуття поколює!\"\n\n\nclass Miles(Spider):                 # Miles наслідує все від Spider\n    def venom_strike(self):          # і додає своє\n        return f\"{self.name}: ⚡ отруйний удар!\"\n\n\nmiles = Miles(\"Майлз\")\nprint(miles.web())                   # метод від батька\nprint(miles.venom_strike())          # власний метод\nprint(isinstance(miles, Miles), isinstance(miles, Spider))\nprint(issubclass(Miles, Spider), issubclass(Spider, Miles))\nprint(Miles.__bases__)",
      "title": "inheritance.py",
      "output": "Майлз стріляє павутиною 🕸️\nМайлз: ⚡ отруйний удар!\nTrue True\nTrue False\n(<class '__main__.Spider'>,)",
      "highlight": [
        12
      ]
    },
    {
      "type": "tip",
      "md": "Усі класи в Python 3 неявно наслідують `object`. Звідти беруться «безкоштовні» `__init__`, `__repr__`, `__eq__` і ще купа dunder-методів. Тому `class Spider:` і `class Spider(object):` — одне й те саме, писати `(object)` не треба.",
      "title": "object — прабатько всіх"
    },
    {
      "type": "heading",
      "text": "Перевизначення методів і super()"
    },
    {
      "type": "text",
      "md": "Якщо нащадок оголошує метод з тим самим ім'ям, що й у базі, — він **перевизначає** (override) його. Python спершу шукає метод у класі об'єкта, і лише не знайшовши — піднімається до батька.\n\nА що як треба не *замінити*, а *розширити* поведінку бази? Для цього є `super()` — він повертає «проксі» на наступний клас в ієрархії. Найчастіше використання — в `__init__`: нащадок додає свої атрибути, а решту ініціалізації делегує батьку через `super().__init__(...)`."
    },
    {
      "type": "code",
      "code": "class Spider:\n    def __init__(self, name, universe):\n        self.name = name\n        self.universe = universe\n        self.web_fluid = 100\n\n    def swing(self):\n        return f\"{self.name} гойдається на павутині\"\n\n    def intro(self):\n        return f\"Я {self.name} із всесвіту {self.universe}\"\n\n\nclass Miles(Spider):\n    def __init__(self, name, universe, camo=True):\n        super().__init__(name, universe)     # батько налаштує name, universe, web_fluid\n        self.camo = camo                     # а ми додамо своє\n\n    def swing(self):                         # повністю перевизначаємо\n        return f\"{self.name} стрибає з графіті-стилем 🎨\"\n\n    def intro(self):                         # розширюємо батьківський метод\n        base = super().intro()\n        return base + \" — і я ще вчуся бути Spider-Man!\"\n\n\nm = Miles(\"Майлз\", \"Earth-1610\")\nprint(m.swing())\nprint(m.intro())\nprint(m.web_fluid, m.camo)",
      "title": "override_super.py",
      "output": "Майлз стрибає з графіті-стилем 🎨\nЯ Майлз із всесвіту Earth-1610 — і я ще вчуся бути Spider-Man!\n100 True",
      "highlight": [
        16,
        23
      ]
    },
    {
      "type": "warning",
      "md": "Якщо нащадок має свій `__init__` і **не викликає** `super().__init__(...)`, батьківський ініціалізатор не виконається взагалі. Атрибути бази (`self.web_fluid`) не з'являться, і десь пізніше вилетить `AttributeError`. Правило: перевизначив `__init__` — одразу першим рядком виклич `super().__init__(...)`.",
      "title": "Забутий super().__init__()"
    },
    {
      "type": "code",
      "code": "class Spider:\n    def __init__(self, name):\n        self.name = name\n        self.web_fluid = 100\n\n\nclass Gwen(Spider):\n    def __init__(self, name, band):\n        self.band = band            # забули super().__init__(name)!\n\n\ngwen = Gwen(\"Гвен\", \"The Mary Janes\")\nprint(gwen.band)\nprint(gwen.web_fluid)",
      "title": "forgot_super.py",
      "output": "The Mary Janes\nTraceback (most recent call last):\n  File \"main.py\", line 14, in <module>\n    print(gwen.web_fluid)\n          ^^^^^^^^^^^^^^\nAttributeError: 'Gwen' object has no attribute 'web_fluid'"
    },
    {
      "type": "joke",
      "md": "Я виклика́в `super()`, щоб отримати силу батька. А отримав батька-поліцейського, який питає, чому я о третій ночі на даху. 🕷️👮"
    },
    {
      "type": "heading",
      "text": "Поліморфізм і duck typing"
    },
    {
      "type": "text",
      "md": "**Поліморфізм** («багато форм») — це коли код викликає *той самий метод* у різних об'єктів, а кожен об'єкт відповідає по-своєму. Коду, що керує командою, байдуже, хто саме перед ним — Пітер, Гвен чи Порк: він просто каже `hero.attack()`.\n\nУ Python поліморфізм ще й не вимагає спільного предка. Діє **duck typing**: *«якщо щось крякає як качка і ходить як качка — це качка»*. Будь-який об'єкт, у якого є метод `attack()`, підійде — навіть якщо він не наслідує `Spider`."
    },
    {
      "type": "code",
      "code": "class Spider:\n    def __init__(self, name):\n        self.name = name\n\n    def attack(self):\n        return f\"{self.name}: базовий удар павутиною\"\n\n\nclass Peter(Spider):\n    def attack(self):\n        return f\"{self.name}: 🕸️ павутиння в обличчя\"\n\n\nclass Gwen(Spider):\n    def attack(self):\n        return f\"{self.name}: 🩰 балетний удар ногою\"\n\n\nclass Porker(Spider):\n    def attack(self):\n        return f\"{self.name}: 🔨 велетенський молоток!\"\n\n\nclass Noir(Spider):\n    pass                                   # не перевизначив — візьме базовий\n\n\nclass Duck:                                # НЕ наслідує Spider\n    name = \"Качка\"\n\n    def attack(self):\n        return \"Качка: кря! 🦆\"\n\n\nteam = [Peter(\"Пітер\"), Gwen(\"Гвен\"), Porker(\"Пітер Порк\"), Noir(\"Нуар\"), Duck()]\nfor hero in team:\n    print(hero.attack())                   # один виклик — різна поведінка",
      "title": "polymorphism.py",
      "output": "Пітер: 🕸️ павутиння в обличчя\nГвен: 🩰 балетний удар ногою\nПітер Порк: 🔨 велетенський молоток!\nНуар: базовий удар павутиною\nКачка: кря! 🦆",
      "highlight": [
        36,
        37
      ]
    },
    {
      "type": "viz",
      "id": "multiverse-poly",
      "title": "3D-мультивсесвіт: один виклик — різні атаки",
      "caption": "Навколо порталу — об'єкти різних класів. Тисни **for hero in team: hero.attack()** і дивись, як цикл обходить команду: для кожного Python шукає `attack` у класі об'єкта, а якщо не знайшов — піднімається до `Spider`. Клацни по героєві, щоб побачити, звідки взявся його метод. Додай **Качку** — вона не павук, але метод має, тож duck typing її пропускає."
    },
    {
      "type": "tip",
      "md": "Хочеш «обов'язковий до перевизначення» метод? Базовий клас може зробити `raise NotImplementedError(\"перевизнач мене\")`. А ще суворіше — модуль `abc`: `class Hero(ABC)` з методом, позначеним `@abstractmethod`. Тоді навіть створити екземпляр нащадка, який забув реалізувати метод, не вийде — `TypeError` одразу при створенні, а не посеред бою.",
      "title": "Абстрактні методи"
    },
    {
      "type": "code",
      "code": "from abc import ABC, abstractmethod\n\n\nclass Hero(ABC):\n    @abstractmethod\n    def attack(self):\n        \"\"\"Кожен герой зобов'язаний уміти атакувати.\"\"\"\n\n    def entrance(self):                     # звичайний метод теж можна\n        return f\"{type(self).__name__} з'являється! \" + self.attack()\n\n\nclass Miles(Hero):\n    def attack(self):\n        return \"⚡ Venom Blast!\"\n\n\nclass Lazy(Hero):\n    pass                                    # забув attack\n\n\nprint(Miles().entrance())\ntry:\n    Lazy()\nexcept TypeError as e:\n    print(\"TypeError:\", e)",
      "title": "abc_hero.py",
      "output": "Miles з'являється! ⚡ Venom Blast!\nTypeError: Can't instantiate abstract class Lazy without an implementation for abstract method 'attack'"
    },
    {
      "type": "quiz",
      "question": "У `class Noir(Spider): pass` немає методу `attack`. Що станеться при `Noir(\"Нуар\").attack()`?",
      "options": [
        "`AttributeError`, бо в Noir немає `attack`",
        "Викличеться `Spider.attack` — пошук піде вгору по ієрархії",
        "Повернеться `None`",
        "`TypeError`: треба перевизначити метод"
      ],
      "answer": 1,
      "explain": "Не знайшовши атрибут у класі об'єкта, Python іде по ланцюжку батьків (MRO) і знаходить `attack` у `Spider`. `NotImplementedError` чи `TypeError` були б лише у випадку абстрактного методу."
    },
    {
      "type": "heading",
      "text": "Множинне наслідування і MRO"
    },
    {
      "type": "text",
      "md": "Клас може мати **кількох батьків**: `class SpiderHam(Spider, Cartoon):`. Тоді виникає питання: якщо метод є в обох — чий узяти? Відповідь дає **MRO** (Method Resolution Order) — порядок пошуку методів. Подивитися його можна через `Клас.__mro__` або `Клас.mro()`.\n\nPython будує MRO алгоритмом **C3-лінеаризації**, і на практиці це означає:\n\n- спочатку сам клас, потім батьки **зліва направо**, як у дужках;\n- нащадок завжди перевіряється **раніше** за свого предка;\n- спільний предок («ромб») — **один раз**, і лише після всіх своїх нащадків;\n- в кінці завжди `object`.\n\nГоловне: `super()` означає **не «мій батько»**, а «**наступний клас у MRO** того об'єкта, з яким працюємо». Саме тому в ромбі кожен `__init__` викликається рівно один раз."
    },
    {
      "type": "code",
      "code": "class Spider:\n    def power(self):\n        return \"павуче чуття\"\n\n\nclass Toon:\n    def power(self):\n        return \"мультяшна фізика\"\n\n    def boing(self):\n        return \"БОЇНГ! 💥\"\n\n\nclass SpiderHam(Toon, Spider):             # порядок батьків важливий!\n    pass\n\n\nclass PeterB(Spider, Toon):\n    pass\n\n\nham = SpiderHam()\nprint(ham.power(), \"|\", ham.boing())\nprint(PeterB().power())\nprint([c.__name__ for c in SpiderHam.__mro__])\nprint([c.__name__ for c in PeterB.__mro__])",
      "title": "mro_basics.py",
      "output": "мультяшна фізика | БОЇНГ! 💥\nпавуче чуття\n['SpiderHam', 'Toon', 'Spider', 'object']\n['PeterB', 'Spider', 'Toon', 'object']"
    },
    {
      "type": "flow",
      "title": "Пошук методу по MRO",
      "nodes": [
        {
          "id": "s",
          "kind": "start",
          "label": "obj.power()",
          "col": 0,
          "row": 0
        },
        {
          "id": "mro",
          "kind": "process",
          "label": "mro =\ntype(obj).__mro__",
          "col": 0,
          "row": 1
        },
        {
          "id": "more",
          "kind": "decision",
          "label": "є наступний\ncls у mro?",
          "col": 0,
          "row": 2
        },
        {
          "id": "has",
          "kind": "decision",
          "label": "'power' in\nvars(cls)?",
          "col": 0,
          "row": 3
        },
        {
          "id": "call",
          "kind": "call",
          "label": "cls.power(obj)",
          "col": 0,
          "row": 4
        },
        {
          "id": "e",
          "kind": "end",
          "label": "результат",
          "col": 0,
          "row": 5
        },
        {
          "id": "err",
          "kind": "end",
          "label": "AttributeError",
          "col": 1,
          "row": 5
        }
      ],
      "edges": [
        {
          "from": "s",
          "to": "mro"
        },
        {
          "from": "mro",
          "to": "more"
        },
        {
          "from": "more",
          "to": "has",
          "label": "Так"
        },
        {
          "from": "more",
          "to": "err",
          "label": "Ні",
          "side": "right"
        },
        {
          "from": "has",
          "to": "call",
          "label": "Так"
        },
        {
          "from": "has",
          "to": "more",
          "label": "Ні",
          "side": "left"
        },
        {
          "from": "call",
          "to": "e"
        }
      ],
      "scenarios": [
        {
          "name": "ham.power()",
          "steps": [
            {
              "node": "s",
              "note": "`ham = SpiderHam()`, викликаємо `ham.power()`"
            },
            {
              "node": "mro",
              "note": "`mro` → `SpiderHam, Toon, Spider, object`"
            },
            {
              "node": "more",
              "note": "`cls = SpiderHam`"
            },
            {
              "node": "has",
              "note": "у `SpiderHam` лише `pass` — `power` немає"
            },
            {
              "node": "more",
              "note": "`cls = Toon`"
            },
            {
              "node": "has",
              "note": "`'power' in vars(Toon)` → `True` — знайшли!"
            },
            {
              "node": "call",
              "note": "`Toon.power(ham)` — до `Spider` черга не дійшла"
            },
            {
              "node": "e",
              "note": "`'мультяшна фізика'`"
            }
          ]
        },
        {
          "name": "PeterB().power()",
          "steps": [
            {
              "node": "s",
              "note": "`PeterB().power()`"
            },
            {
              "node": "mro",
              "note": "`mro` → `PeterB, Spider, Toon, object`"
            },
            {
              "node": "more",
              "note": "`cls = PeterB`"
            },
            {
              "node": "has",
              "note": "у `PeterB` методу немає"
            },
            {
              "node": "more",
              "note": "`cls = Spider` — він стоїть першим у `class PeterB(Spider, Toon)`"
            },
            {
              "node": "has",
              "note": "`'power' in vars(Spider)` → `True`"
            },
            {
              "node": "call",
              "note": "`Spider.power(obj)`"
            },
            {
              "node": "e",
              "note": "`'павуче чуття'`"
            }
          ]
        },
        {
          "name": "ham.fly()",
          "steps": [
            {
              "node": "s",
              "note": "`ham.fly()` — такого методу ніде немає"
            },
            {
              "node": "mro",
              "note": "`mro` → `SpiderHam, Toon, Spider, object`"
            },
            {
              "node": "more",
              "note": "`cls = SpiderHam`"
            },
            {
              "node": "has",
              "note": "немає"
            },
            {
              "node": "more",
              "note": "`cls = Toon`"
            },
            {
              "node": "has",
              "note": "немає"
            },
            {
              "node": "more",
              "note": "`cls = Spider`"
            },
            {
              "node": "has",
              "note": "немає"
            },
            {
              "node": "more",
              "note": "`cls = object`"
            },
            {
              "node": "has",
              "note": "навіть в `object` немає"
            },
            {
              "node": "more",
              "note": "класи в `mro` закінчились"
            },
            {
              "node": "err",
              "note": "`AttributeError: 'SpiderHam' object has no attribute 'fly'`"
            }
          ]
        }
      ],
      "caption": "Пошук іде строго за `__mro__` і зупиняється на **першому** збігу. Тому порядок батьків у `class SpiderHam(Toon, Spider)` змінює результат."
    },
    {
      "type": "code",
      "code": "class Spider:\n    def __init__(self):\n        print(\"  Spider.__init__\")\n        super().__init__()\n\n\nclass Miles(Spider):\n    def __init__(self):\n        print(\"  Miles.__init__ → super()\")\n        super().__init__()\n\n\nclass Gwen(Spider):\n    def __init__(self):\n        print(\"  Gwen.__init__ → super()\")\n        super().__init__()\n\n\nclass Hybrid(Miles, Gwen):                 # класичний «ромб»\n    def __init__(self):\n        print(\"Hybrid.__init__ → super()\")\n        super().__init__()\n\n\nprint(\" → \".join(c.__name__ for c in Hybrid.__mro__))\nHybrid()                                   # Spider — лише ОДИН раз",
      "title": "diamond_super.py",
      "output": "Hybrid → Miles → Gwen → Spider → object\nHybrid.__init__ → super()\n  Miles.__init__ → super()\n  Gwen.__init__ → super()\n  Spider.__init__",
      "highlight": [
        19
      ]
    },
    {
      "type": "viz",
      "id": "mro-web",
      "title": "3D-павутина MRO: як Python шукає метод",
      "caption": "Кожен вузол — клас, нитки — наслідування. Обери клас об'єкта і метод: павук пробіжить по вузлах **у порядку MRO** і зупиниться на першому класі, де метод визначено. Зверни увагу на ромб: `Spider` відвідується лише після *обох* нащадків. Вузли можна клацати."
    },
    {
      "type": "viz",
      "id": "super-chain",
      "title": "super() у ромбі: покроково",
      "caption": "Крок за кроком дивись, як `super().__init__()` передає естафету **не батькові, а наступному в MRO** — тому з `Miles` виклик іде в `Gwen`, а не в `Spider`. Перемкни на «без super()» — і ланцюжок обірветься на `Miles`. А режим «Батько.__init__» покаже, чому явні виклики батьків у ромбі запускають `Spider.__init__` **двічі**."
    },
    {
      "type": "warning",
      "md": "Множинне наслідування — потужна, але гостра павутина. Якщо MRO неможливо побудувати (наприклад, `class X(Spider, Miles)` — база стоїть *перед* своїм нащадком), Python кине `TypeError: Cannot create a consistent method resolution order (MRO)`. На практиці його використовують для **міксинів** — маленьких класів з одним-двома методами (`JsonMixin`, `LogMixin`), а не для глибоких ромбів.",
      "title": "Не плети надто складну павутину"
    },
    {
      "type": "quiz",
      "question": "`class A: ...`, `class B(A): ...`, `class C(A): ...`, `class D(B, C): ...`. Який MRO у `D`?",
      "options": [
        "D, B, A, C, object",
        "D, B, C, A, object",
        "D, C, B, A, object",
        "D, A, B, C, object"
      ],
      "answer": 1,
      "explain": "Спершу сам клас, потім батьки зліва направо (B, C), а спільний предок A — лише після всіх своїх нащадків. У кінці — `object`."
    },
    {
      "type": "heading",
      "text": "Dunder-методи: __str__ і __repr__"
    },
    {
      "type": "text",
      "md": "**Dunder** = *double underscore*: методи на кшталт `__init__`, `__str__`, `__len__`. Ти майже ніколи не викликаєш їх напряму — їх викликає **Python**, коли ти користуєшся вбудованими функціями та операторами. `len(x)` → `x.__len__()`, `a + b` → `a.__add__(b)`, `print(x)` → `x.__str__()`.\n\nПочнемо з текстового подання об'єкта. Без нього `print(miles)` покаже щось на кшталт `<__main__.Spider object at 0x10f3a2b40>` — корисно, як павуче чуття без павука. Є два методи:\n\n- `__repr__` — **для розробника**: однозначне, в ідеалі таке, що можна скопіювати в код і отримати такий самий об'єкт. Його показують консоль, дебагер і контейнери (`print([hero])`).\n- `__str__` — **для людей**: гарний опис. Його використовують `print()`, `str()` і f-рядки. Якщо `__str__` немає — Python бере `__repr__`."
    },
    {
      "type": "code",
      "code": "class Spider:\n    def __init__(self, name, earth):\n        self.name = name\n        self.earth = earth\n\n    def __repr__(self):                      # для розробника\n        return f\"Spider(name={self.name!r}, earth={self.earth})\"\n\n    def __str__(self):                       # для людей\n        return f\"🕷️ {self.name} із Землі-{self.earth}\"\n\n\nmiles = Spider(\"Майлз\", 1610)\nprint(miles)                                 # __str__\nprint(repr(miles))                           # __repr__\nprint(f\"Знайомтесь: {miles}\")                # f-рядок → __str__\nprint(f\"Дебаг: {miles!r}\")                   # !r → __repr__\nprint([miles, Spider(\"Гвен\", 65)])           # у списку — __repr__",
      "title": "str_repr.py",
      "output": "🕷️ Майлз із Землі-1610\nSpider(name='Майлз', earth=1610)\nЗнайомтесь: 🕷️ Майлз із Землі-1610\nДебаг: Spider(name='Майлз', earth=1610)\n[Spider(name='Майлз', earth=1610), Spider(name='Гвен', earth=65)]",
      "highlight": [
        6,
        9
      ]
    },
    {
      "type": "flow",
      "title": "print(obj): __str__ чи __repr__?",
      "nodes": [
        {
          "id": "s",
          "kind": "start",
          "label": "print(obj)",
          "col": 0,
          "row": 0
        },
        {
          "id": "str",
          "kind": "call",
          "label": "str(obj)",
          "col": 0,
          "row": 1
        },
        {
          "id": "hasStr",
          "kind": "decision",
          "label": "клас має\n__str__?",
          "col": 0,
          "row": 2
        },
        {
          "id": "hasRepr",
          "kind": "decision",
          "label": "клас має\n__repr__?",
          "col": 1,
          "row": 2
        },
        {
          "id": "useStr",
          "kind": "call",
          "label": "obj.__str__()",
          "col": 0,
          "row": 3
        },
        {
          "id": "useRepr",
          "kind": "call",
          "label": "obj.__repr__()",
          "col": 1,
          "row": 4
        },
        {
          "id": "out",
          "kind": "io",
          "label": "вивести рядок",
          "col": 0,
          "row": 5
        },
        {
          "id": "def",
          "kind": "process",
          "label": "object.__repr__:\n<X object at 0x…>",
          "col": 2,
          "row": 5
        },
        {
          "id": "e",
          "kind": "end",
          "label": "Кінець",
          "col": 0,
          "row": 6
        }
      ],
      "edges": [
        {
          "from": "s",
          "to": "str"
        },
        {
          "from": "str",
          "to": "hasStr"
        },
        {
          "from": "hasStr",
          "to": "useStr",
          "label": "Так"
        },
        {
          "from": "hasStr",
          "to": "hasRepr",
          "label": "Ні"
        },
        {
          "from": "hasRepr",
          "to": "useRepr",
          "label": "Так"
        },
        {
          "from": "hasRepr",
          "to": "def",
          "label": "Ні",
          "side": "right"
        },
        {
          "from": "useStr",
          "to": "out"
        },
        {
          "from": "useRepr",
          "to": "out"
        },
        {
          "from": "def",
          "to": "out"
        },
        {
          "from": "out",
          "to": "e"
        }
      ],
      "scenarios": [
        {
          "name": "є __str__",
          "steps": [
            {
              "node": "s",
              "note": "`print(miles)`, де `Spider` має і `__str__`, і `__repr__`"
            },
            {
              "node": "str",
              "note": "`print` перетворює об'єкт на рядок через `str()`"
            },
            {
              "node": "hasStr",
              "note": "так, `Spider.__str__` визначено"
            },
            {
              "node": "useStr",
              "note": "повертає `'🕷️ Майлз із Землі-1610'`"
            },
            {
              "node": "out",
              "note": "вивід: `🕷️ Майлз із Землі-1610`"
            },
            {
              "node": "e"
            }
          ]
        },
        {
          "name": "лише __repr__",
          "steps": [
            {
              "node": "s",
              "note": "`print(gwen)`, у класі `Spider` визначено тільки `__repr__`"
            },
            {
              "node": "str",
              "note": "`str(gwen)`"
            },
            {
              "node": "hasStr",
              "note": "власного `__str__` немає — `object.__str__` передає справу `repr()`"
            },
            {
              "node": "hasRepr",
              "note": "`Spider.__repr__` є"
            },
            {
              "node": "useRepr",
              "note": "повертає `\"Spider(name='Гвен', earth=65)\"`"
            },
            {
              "node": "out",
              "note": "вивід: `Spider(name='Гвен', earth=65)`"
            },
            {
              "node": "e"
            }
          ]
        },
        {
          "name": "нічого немає",
          "steps": [
            {
              "node": "s",
              "note": "`print(ham)`, клас без жодного dunder-методу"
            },
            {
              "node": "str",
              "note": "`str(ham)`"
            },
            {
              "node": "hasStr",
              "note": "немає `__str__`"
            },
            {
              "node": "hasRepr",
              "note": "і `__repr__` немає"
            },
            {
              "node": "def",
              "note": "працює стандартний `object.__repr__`"
            },
            {
              "node": "out",
              "note": "вивід: `<__main__.Spider object at 0x10…>` — адреса щоразу інша"
            },
            {
              "node": "e"
            }
          ]
        }
      ],
      "caption": "Визнач хоча б `__repr__` — тоді й `print`, і списки, і дебагер покажуть щось зрозуміле. `__str__` — приємний бонус для людей."
    },
    {
      "type": "tip",
      "md": "Якщо реалізуєш лише **один** з двох — роби `__repr__`. Він працює скрізь (і в `print`, і в списках, і в дебагері), а `__str__` лише в `print`/`str`. Трюк `{self.name!r}` у f-рядку сам поставить лапки навколо рядків — `repr` вийде валідним Python-кодом.",
      "title": "Спершу __repr__"
    },
    {
      "type": "heading",
      "text": "Оператори для своїх класів"
    },
    {
      "type": "text",
      "md": "Dunder-методи дозволяють твоїм об'єктам поводитися як вбудовані типи — **перевантаження операторів**:\n\n- порівняння: `__eq__` (`==`), `__lt__` (`<`), `__le__`, `__gt__`… Порівняння «менше» відкриває дорогу до `sorted()`, `min()`, `max()`;\n- контейнери: `__len__` (`len`), `__getitem__` (`obj[i]`, а заразом і цикл `for`), `__contains__` (`in`), `__iter__`;\n- арифметика: `__add__` (`+`), `__mul__` (`*`)…;\n- `__bool__` — правдивість у `if obj:`; `__call__` — виклик об'єкта як функції `obj()`.\n\nЯкщо операція не підтримується для такого типу — поверни `NotImplemented` (не `False`!), і Python спробує дзеркальний метод іншого об'єкта або кине зрозумілу `TypeError`."
    },
    {
      "type": "code",
      "code": "class Spider:\n    def __init__(self, name, power):\n        self.name = name\n        self.power = power\n\n    def __repr__(self):\n        return f\"Spider({self.name!r}, {self.power})\"\n\n    def __eq__(self, other):                 # ==\n        if not isinstance(other, Spider):\n            return NotImplemented\n        return (self.name, self.power) == (other.name, other.power)\n\n    def __lt__(self, other):                 # <  → працюють sorted/min/max\n        return self.power < other.power\n\n    def __add__(self, other):                # +  → командний удар\n        return Spider(f\"{self.name}&{other.name}\", self.power + other.power)\n\n\na = Spider(\"Майлз\", 90)\nb = Spider(\"Майлз\", 90)\nprint(a == b, a is b)                        # однакові, але різні об'єкти\nprint(a == \"Майлз\")                          # NotImplemented → False\nteam = [Spider(\"Пітер\", 95), a, Spider(\"Порк\", 40), Spider(\"Гвен\", 88)]\nprint(sorted(team))\nprint(max(team).name)\nprint(a + Spider(\"Гвен\", 88))",
      "title": "operators.py",
      "output": "True False\nFalse\n[Spider('Порк', 40), Spider('Гвен', 88), Spider('Майлз', 90), Spider('Пітер', 95)]\nПітер\nSpider('Майлз&Гвен', 178)",
      "highlight": [
        9,
        14,
        17
      ]
    },
    {
      "type": "flow",
      "title": "Як Python обчислює a == b",
      "nodes": [
        {
          "id": "s",
          "kind": "start",
          "label": "a == b",
          "col": 0,
          "row": 0
        },
        {
          "id": "left",
          "kind": "call",
          "label": "a.__eq__(b)",
          "col": 0,
          "row": 1
        },
        {
          "id": "ni1",
          "kind": "decision",
          "label": "NotImplemented?",
          "col": 0,
          "row": 2
        },
        {
          "id": "right",
          "kind": "call",
          "label": "b.__eq__(a)",
          "col": 0,
          "row": 3
        },
        {
          "id": "ni2",
          "kind": "decision",
          "label": "NotImplemented?",
          "col": 0,
          "row": 4
        },
        {
          "id": "is",
          "kind": "process",
          "label": "a is b",
          "col": 0,
          "row": 5
        },
        {
          "id": "e",
          "kind": "end",
          "label": "True / False",
          "col": 0,
          "row": 6
        }
      ],
      "edges": [
        {
          "from": "s",
          "to": "left"
        },
        {
          "from": "left",
          "to": "ni1"
        },
        {
          "from": "ni1",
          "to": "right",
          "label": "Так"
        },
        {
          "from": "ni1",
          "to": "e",
          "label": "Ні",
          "side": "right"
        },
        {
          "from": "right",
          "to": "ni2"
        },
        {
          "from": "ni2",
          "to": "is",
          "label": "Так"
        },
        {
          "from": "ni2",
          "to": "e",
          "label": "Ні",
          "side": "right"
        },
        {
          "from": "is",
          "to": "e"
        }
      ],
      "scenarios": [
        {
          "name": "Spider == Spider",
          "steps": [
            {
              "node": "s",
              "note": "`a = Spider(\"Майлз\", 90)`, `b = Spider(\"Майлз\", 90)`"
            },
            {
              "node": "left",
              "note": "`isinstance(b, Spider)` → порівнюємо кортежі `('Майлз', 90) == ('Майлз', 90)`"
            },
            {
              "node": "ni1",
              "note": "отримали `True` — справжню відповідь"
            },
            {
              "node": "e",
              "note": "`a == b` → `True` (хоча `a is b` → `False`)"
            }
          ]
        },
        {
          "name": "Spider == \"Майлз\"",
          "steps": [
            {
              "node": "s",
              "note": "`a == \"Майлз\"`"
            },
            {
              "node": "left",
              "note": "`\"Майлз\"` не `Spider` → `return NotImplemented`"
            },
            {
              "node": "ni1",
              "note": "`a` не вміє — даємо шанс правому операнду"
            },
            {
              "node": "right",
              "note": "`str.__eq__(\"Майлз\", a)` → теж `NotImplemented`"
            },
            {
              "node": "ni2",
              "note": "ніхто не вміє порівнювати"
            },
            {
              "node": "is",
              "note": "запасний план — перевірка тотожності: `a is \"Майлз\"` → `False`"
            },
            {
              "node": "e",
              "note": "`a == \"Майлз\"` → `False`, без жодної помилки"
            }
          ]
        }
      ],
      "caption": "`NotImplemented` — не помилка, а сигнал «спитай іншого». Якщо `b` — екземпляр *підкласу* `type(a)`, Python спершу питає саме `b`. Так само працюють `+` (`__add__` → `__radd__`), `<` (`__lt__` → `__gt__`) тощо."
    },
    {
      "type": "code",
      "code": "class Team:\n    def __init__(self, name, *members):\n        self.name = name\n        self.members = list(members)\n\n    def __len__(self):                       # len(team)\n        return len(self.members)\n\n    def __getitem__(self, index):            # team[i], зрізи і навіть for\n        return self.members[index]\n\n    def __contains__(self, hero):            # \"Гвен\" in team\n        return hero in self.members\n\n    def __bool__(self):                      # if team:\n        return len(self.members) > 0\n\n    def __call__(self):                      # team() — об'єкт як функція\n        return f\"{self.name}, збір! 📣\"\n\n\nspiders = Team(\"Spider-Society\", \"Мігель\", \"Джессіка\", \"Гвен\", \"Хобі\")\nprint(len(spiders), spiders[0], spiders[-1])\nprint(spiders[1:3])\nprint(\"Гвен\" in spiders, \"Майлз\" in spiders)\nfor hero in spiders:                         # спрацював __getitem__\n    print(\" -\", hero)\nprint(spiders())\nprint(bool(Team(\"Порожня\")))",
      "title": "container_dunders.py",
      "output": "4 Мігель Хобі\n['Джессіка', 'Гвен']\nTrue False\n - Мігель\n - Джессіка\n - Гвен\n - Хобі\nSpider-Society, збір! 📣\nFalse"
    },
    {
      "type": "viz",
      "id": "dunder-lab",
      "title": "Лабораторія dunder-методів",
      "caption": "Вмикай і вимикай dunder-методи в класі `Spider`, а потім запускай операції: `print`, `repr`, `==`, `len`, `+`, `sorted`. Лабораторія покаже, **який метод викликає Python** і що буде, якщо його немає: дефолтний `<... object at 0x...>`, порівняння за ідентичністю чи `TypeError`."
    },
    {
      "type": "warning",
      "md": "Коли визначаєш `__eq__`, Python **автоматично вимикає** `__hash__` (ставить його в `None`) — такі об'єкти більше не можна класти в `set` чи робити ключами `dict`: `TypeError: unhashable type`. Якщо об'єкт незмінний і має бути хешованим — визнач і `__hash__`, наприклад `return hash((self.name, self.power))`. Або використай `@dataclass(frozen=True)`.",
      "title": "__eq__ без __hash__"
    },
    {
      "type": "joke",
      "md": "Мігель О'Хара визначив у `Spider.__eq__` порівняння лише за костюмом. Тепер для нього всі павуки однакові, і він ганяється за мною по всьому мультивсесвіту. Canon event, кажуть. 🙄",
      "hero": "Людина-павук (Майлз Моралес)"
    },
    {
      "type": "heading",
      "text": "@classmethod і @staticmethod"
    },
    {
      "type": "text",
      "md": "Звичайний метод отримує `self` — екземпляр. Але бувають методи, яким екземпляр не потрібен:\n\n- `@classmethod` отримує першим аргументом **сам клас** — `cls`. Головне застосування — **альтернативні конструктори**: `Spider.from_string(\"Майлз;1610\")`. Оскільки `cls` — це клас, з якого викликали, у нащадка такий метод створить *нащадка*.\n- `@staticmethod` не отримує ні `self`, ні `cls`. Це звичайна функція, яку поклали «в простір імен» класу, бо вона за змістом стосується його: валідатори, конвертери, утиліти."
    },
    {
      "type": "code",
      "code": "class Spider:\n    registry = []\n\n    def __init__(self, name, earth):\n        self.name = name\n        self.earth = earth\n        Spider.registry.append(name)\n\n    @classmethod\n    def from_string(cls, text):              # альтернативний конструктор\n        name, earth = text.split(\";\")\n        return cls(name.strip(), int(earth))  # cls, а не Spider!\n\n    @classmethod\n    def count(cls):\n        return len(cls.registry)\n\n    @staticmethod\n    def is_valid_earth(code):                # утиліта: ні self, ні cls\n        return isinstance(code, int) and code > 0\n\n    def __repr__(self):\n        return f\"{type(self).__name__}({self.name!r}, {self.earth})\"\n\n\nclass Noir(Spider):\n    pass\n\n\nprint(Spider.from_string(\"Майлз; 1610\"))\nprint(Noir.from_string(\"Нуар;90214\"))        # створився саме Noir\nprint(Spider.count())\nprint(Spider.is_valid_earth(616), Spider.is_valid_earth(-1))",
      "title": "class_static.py",
      "output": "Spider('Майлз', 1610)\nNoir('Нуар', 90214)\n2\nTrue False",
      "highlight": [
        9,
        10,
        12,
        18,
        19
      ]
    },
    {
      "type": "table",
      "head": [
        "Вид методу",
        "Перший аргумент",
        "Бачить екземпляр?",
        "Бачить клас?",
        "Типове застосування"
      ],
      "rows": [
        [
          "звичайний",
          "`self`",
          "так",
          "через `type(self)`",
          "поведінка конкретного об'єкта"
        ],
        [
          "`@classmethod`",
          "`cls`",
          "ні",
          "так",
          "альтернативні конструктори, фабрики, лічильники"
        ],
        [
          "`@staticmethod`",
          "—",
          "ні",
          "ні",
          "утиліти й валідатори, логічно пов'язані з класом"
        ]
      ]
    },
    {
      "type": "quiz",
      "question": "Чому в альтернативному конструкторі пишуть `return cls(...)`, а не `return Spider(...)`?",
      "options": [
        "`cls(...)` працює швидше",
        "Щоб виклик з нащадка (`Noir.from_string`) створював саме нащадка",
        "`Spider(...)` всередині класу викликати заборонено",
        "Це лише стиль, результат однаковий"
      ],
      "answer": 1,
      "explain": "`cls` — це клас, *з якого* викликали метод. `Noir.from_string(...)` передасть `cls=Noir`, і створиться `Noir`. Жорстко прописаний `Spider(...)` завжди повертав би базовий клас."
    },
    {
      "type": "heading",
      "text": "dataclasses: менше шаблонів — більше геройства"
    },
    {
      "type": "text",
      "md": "Помітив, скільки однакового коду: `__init__`, що копіює аргументи в `self`, `__repr__` з тими самими полями, `__eq__`, що порівнює ті самі поля… Декоратор `@dataclass` генерує все це **з анотацій типів** полів.\n\nЩо він уміє:\n\n- генерує `__init__`, `__repr__`, `__eq__` автоматично;\n- `order=True` — ще й `<`, `>`, `<=`, `>=` (порівняння кортежами полів по черзі);\n- `frozen=True` — незмінні об'єкти (присвоєння кидає помилку) + автоматичний `__hash__`;\n- `field(default_factory=list)` — безпечне змінюване значення за замовчуванням;\n- `__post_init__` — хук для перевірок і обчислюваних полів після згенерованого `__init__`."
    },
    {
      "type": "code",
      "code": "from dataclasses import dataclass, field\n\n\n@dataclass\nclass Spider:\n    name: str\n    earth: int\n    power: int = 50                              # значення за замовчуванням\n    gadgets: list[str] = field(default_factory=list)   # свій список у кожного\n\n\nmiles = Spider(\"Майлз\", 1610, 90)\ngwen = Spider(\"Гвен\", 65)\nmiles.gadgets.append(\"веб-шутери\")\n\nprint(miles)                                     # готовий __repr__\nprint(gwen)\nprint(miles == Spider(\"Майлз\", 1610, 90, [\"веб-шутери\"]))   # готовий __eq__",
      "title": "dataclass_basic.py",
      "output": "Spider(name='Майлз', earth=1610, power=90, gadgets=['веб-шутери'])\nSpider(name='Гвен', earth=65, power=50, gadgets=[])\nTrue",
      "highlight": [
        4,
        6,
        7,
        8,
        9
      ]
    },
    {
      "type": "code",
      "code": "from dataclasses import dataclass, field, asdict, replace\n\n\n@dataclass(order=True, frozen=True)\nclass Rank:\n    power: int                                   # порівнюється першим\n    name: str = field(compare=False)             # у порівнянні не бере участі\n\n\n@dataclass\nclass Mission:\n    title: str\n    heroes: int\n    danger: int = 1\n\n    def __post_init__(self):                     # перевірка після __init__\n        if not 1 <= self.danger <= 5:\n            raise ValueError(\"danger має бути 1–5\")\n\n\nranks = [Rank(95, \"Пітер\"), Rank(40, \"Порк\"), Rank(90, \"Майлз\")]\nprint([r.name for r in sorted(ranks)])           # order=True дав <, >\nprint({Rank(90, \"Майлз\")})                       # frozen → хешований, можна в set\n\ntry:\n    ranks[0].power = 100                         # frozen → змінювати не можна\nexcept Exception as e:\n    print(type(e).__name__, \"-\", e)\n\nm = Mission(\"Врятувати Мангеттен\", heroes=3)\nprint(asdict(m))                                 # у словник — зручно для JSON\nprint(replace(m, danger=5))                      # копія зі зміненим полем\ntry:\n    Mission(\"Collider\", 6, danger=9)\nexcept ValueError as e:\n    print(\"ValueError:\", e)",
      "title": "dataclass_power.py",
      "output": "['Порк', 'Майлз', 'Пітер']\n{Rank(power=90, name='Майлз')}\nFrozenInstanceError - cannot assign to field 'power'\n{'title': 'Врятувати Мангеттен', 'heroes': 3, 'danger': 1}\nMission(title='Врятувати Мангеттен', heroes=3, danger=5)\nValueError: danger має бути 1–5"
    },
    {
      "type": "viz",
      "id": "dataclass-gen",
      "title": "Генератор dataclass: що пише декоратор замість тебе",
      "caption": "Зліва — те, що пишеш ти: кілька анотованих полів. Справа — методи, які `@dataclass` **згенерує**. Перемикай `order`, `frozen`, `eq` і додавай поля — дивись, як з'являються `__lt__`, `__hash__` і `__setattr__`, що забороняє зміни."
    },
    {
      "type": "compare",
      "title": "Клас-«мішок даних»",
      "bad": {
        "code": "class Spider:\n    def __init__(self, name, earth, power=50, gadgets=None):\n        self.name = name\n        self.earth = earth\n        self.power = power\n        self.gadgets = gadgets if gadgets is not None else []\n\n    def __repr__(self):\n        return (f\"Spider(name={self.name!r}, earth={self.earth!r}, \"\n                f\"power={self.power!r}, gadgets={self.gadgets!r})\")\n\n    def __eq__(self, other):\n        if not isinstance(other, Spider):\n            return NotImplemented\n        return ((self.name, self.earth, self.power, self.gadgets) ==\n                (other.name, other.earth, other.power, other.gadgets))",
        "label": "Руками: 16 рядків шаблонів"
      },
      "good": {
        "code": "from dataclasses import dataclass, field\n\n@dataclass\nclass Spider:\n    name: str\n    earth: int\n    power: int = 50\n    gadgets: list[str] = field(default_factory=list)",
        "label": "@dataclass: 7 рядків"
      },
      "note": "Поведінка однакова, але в dataclass неможливо забути додати нове поле в `__repr__` чи `__eq__` — генератор завжди синхронний з полями. Методи з логікою (`attack`, `swing`) додаються в dataclass так само, як у звичайний клас."
    },
    {
      "type": "warning",
      "md": "У dataclass **не можна** писати `gadgets: list = []` — Python одразу кине `ValueError: mutable default <class 'list'> for field gadgets is not allowed: use default_factory`. Це захист від тієї самої пастки спільного списку, що й у функціях. Використовуй `field(default_factory=list)`.",
      "title": "Змінюване значення за замовчуванням"
    },
    {
      "type": "tip",
      "md": "Для dataclass з великою кількістю екземплярів додай `@dataclass(slots=True)` (Python 3.10+). Об'єкти займуть помітно менше пам'яті й швидше читатимуть атрибути, а випадкове `hero.nmae = ...` (одруківка) кине `AttributeError` замість тихого створення нового атрибута.",
      "title": "slots=True — швидше й економніше"
    },
    {
      "type": "tip",
      "md": "Наслідування — не єдиний шлях. Якщо хочеш дати класу поведінку «логера» чи «зберігача в JSON», часто краще **композиція**: `self.logger = Logger()` замість `class Hero(Logger)`. Принцип «composition over inheritance» рятує від заплутаних ієрархій і ромбів.",
      "title": "Композиція часто краща за наслідування"
    },
    {
      "type": "joke",
      "md": "— Скільки павуків треба, щоб написати `__init__`, `__repr__` і `__eq__`?\n— Жодного. `@dataclass` зробить це сам, поки ми гойдаємося Бруклином. 🏙️",
      "hero": "Гвен Стейсі"
    },
    {
      "type": "heading",
      "text": "Шпаргалка"
    },
    {
      "type": "table",
      "head": [
        "Що",
        "Синтаксис / метод",
        "Коли спрацьовує"
      ],
      "rows": [
        [
          "Наслідування",
          "`class Miles(Spider):`",
          "Нащадок отримує все від бази"
        ],
        [
          "Виклик бази",
          "`super().__init__(...)`",
          "Наступний клас у MRO"
        ],
        [
          "Порядок пошуку",
          "`Cls.__mro__`, `Cls.mro()`",
          "Клас → батьки зліва направо → `object`"
        ],
        [
          "Перевірка",
          "`isinstance(o, Cls)`, `issubclass(A, B)`",
          "Враховує наслідування"
        ],
        [
          "Абстракція",
          "`class H(ABC)` + `@abstractmethod`",
          "Не можна створити, доки не реалізовано"
        ],
        [
          "Текст",
          "`__str__` / `__repr__`",
          "`print`, `str`, f-рядок / консоль, списки, `!r`"
        ],
        [
          "Порівняння",
          "`__eq__`, `__lt__`…",
          "`==`, `<`, `sorted`, `max`"
        ],
        [
          "Контейнер",
          "`__len__`, `__getitem__`, `__contains__`",
          "`len(o)`, `o[i]`, `for`, `x in o`"
        ],
        [
          "Арифметика",
          "`__add__`, `__mul__`…",
          "`a + b`, `a * b`"
        ],
        [
          "Правдивість / виклик",
          "`__bool__` / `__call__`",
          "`if o:` / `o()`"
        ],
        [
          "Метод класу",
          "`@classmethod def f(cls)`",
          "Фабрики: `Cls.from_string(...)`"
        ],
        [
          "Статичний",
          "`@staticmethod def f()`",
          "Утиліта в просторі імен класу"
        ],
        [
          "Dataclass",
          "`@dataclass(order=, frozen=, slots=)`",
          "Генерує `__init__`, `__repr__`, `__eq__`…"
        ]
      ]
    },
    {
      "type": "joke",
      "md": "Мій тато каже: «Не наслідуй поганих звичок». Тож я перевизначив усі його методи, окрім `love_son()`. Той працює ідеально з коробки. ❤️"
    }
  ]
};

export default section;
