import type { Section } from "../types";

const section: Section = {
  "slug": "oop-basics",
  "title": "ООП: класи та об'єкти",
  "short": "class, self, __init__",
  "icon": "🦾",
  "group": "ООП",
  "summary": "Класи й екземпляри, __init__ і self, атрибути класу та екземпляра, методи, @property, інкапсуляція.",
  "hero": {
    "name": "Тоні Старк / Залізна Людина",
    "universe": "Marvel",
    "emoji": "🦾",
    "quote": "Клас — це креслення. Кожен костюм Mark — це екземпляр.",
    "why": "Старк створює десятки костюмів за одним кресленням — чистий приклад класу та його екземплярів."
  },
  "theme": {
    "accent": "#dc2626",
    "accent2": "#f59e0b",
    "glow": "#b91c1c"
  },
  "minutes": 18,
  "order": 14,
  "blocks": [
    {
      "type": "text",
      "md": "Тоні Старк не збирає кожен костюм з нуля. У нього є **креслення** — файл у JARVIS, де описано: які деталі має броня, скільки енергії дає реактор, що вміють репульсори. А далі з одного креслення виходять Mark I, Mark II, Mark XLII… Кожен костюм має *власний* колір, заряд і пошкодження, але всі вміють одне й те саме.\n\nЦе і є **об'єктно-орієнтоване програмування (ООП)**:\n\n- **клас** (`class`) — креслення: описує, які дані зберігає об'єкт і що він уміє робити;\n- **екземпляр** (об'єкт) — конкретний костюм, зібраний за кресленням;\n- **атрибути** — дані об'єкта (`name`, `energy`);\n- **методи** — функції всередині класу, дії об'єкта (`fly()`, `fire()`).\n\nНасправді ти вже весь курс працюєш з об'єктами: `\"hello\".upper()`, `[1, 2].append(3)`, `{}.get(\"k\")` — це методи вбудованих класів `str`, `list`, `dict`. Тепер навчимося створювати свої."
    },
    {
      "type": "heading",
      "text": "Клас і об'єкт: креслення та костюм"
    },
    {
      "type": "text",
      "md": "Клас оголошують ключовим словом `class`, ім'я пишуть у стилі `CamelCase` (з великої літери, без підкреслень). Щоб створити екземпляр — **викликаємо клас як функцію**: `Suit()`.\n\nКожен виклик створює **новий, окремий** об'єкт. Два костюми з одного креслення — це два різні об'єкти в пам'яті, навіть якщо вони поки однакові."
    },
    {
      "type": "code",
      "code": "class Suit:\n    \"\"\"Креслення броні Stark Industries.\"\"\"\n    pass            # поки що порожнє креслення\n\n\nmark1 = Suit()      # виклик класу = створення екземпляра\nmark2 = Suit()\n\nprint(type(mark1).__name__)\nprint(isinstance(mark1, Suit))\nprint(mark1 is mark2)        # це різні об'єкти\nprint(type(\"Jarvis\").__name__, type(42).__name__)  # усе в Python — об'єкти",
      "title": "first_class.py",
      "output": "Suit\nTrue\nFalse\nstr int"
    },
    {
      "type": "code",
      "code": "class Suit:\n    pass\n\n\nmark1 = Suit()\nmark1.name = \"Mark I\"          # атрибут можна «прикрутити» до об'єкта\nmark1.color = \"залізний\"\n\nmark2 = Suit()\nmark2.name = \"Mark II\"\n\nprint(mark1.name, \"-\", mark1.color)\nprint(mark2.name)\nprint(vars(mark1))             # усі атрибути екземпляра у словнику __dict__",
      "title": "attributes_by_hand.py",
      "output": "Mark I - залізний\nMark II\n{'name': 'Mark I', 'color': 'залізний'}"
    },
    {
      "type": "warning",
      "md": "Прикручувати атрибути ззовні, як у прикладі вище, — **погана звичка**. Легко забути якийсь атрибут в одного з об'єктів, і тоді `mark2.color` впаде з `AttributeError`. Усі атрибути треба задавати в одному місці — у методі `__init__`. Про нього далі.",
      "title": "Не збирай костюм «на колінці»"
    },
    {
      "type": "heading",
      "text": "__init__ і self: збираємо костюм"
    },
    {
      "type": "text",
      "md": "`__init__` — спеціальний метод-**ініціалізатор**. Python викликає його автоматично одразу після створення порожнього об'єкта, щоб заповнити його даними. Аргументи, які ти передаєш у `Suit(...)`, потрапляють саме сюди.\n\nА що таке `self`? Це **сам новостворений об'єкт**, якого ми налаштовуємо. `self.name = name` означає: «запиши в *цей* костюм атрибут `name`». Python передає `self` першим аргументом сам — тобі його передавати не треба.\n\nПослідовність `mark = Suit(\"Mark III\", 100)`:\n\n- Python створює порожній об'єкт (метод `__new__`, зазвичай його не чіпають);\n- викликає `Suit.__init__(об'єкт, \"Mark III\", 100)` — тут `self` = цей об'єкт;\n- `__init__` заповнює атрибути і повертає `None`;\n- змінна `mark` отримує посилання на готовий об'єкт."
    },
    {
      "type": "code",
      "code": "class Suit:\n    def __init__(self, name, energy=100):\n        self.name = name          # атрибут екземпляра\n        self.energy = energy\n        self.damage = 0           # не обов'язково брати з параметрів\n        print(f\"🛠  Зібрано {self.name}\")\n\n\nmark3 = Suit(\"Mark III\")\nmark42 = Suit(\"Mark XLII\", energy=80)\n\nprint(mark3.name, mark3.energy, mark3.damage)\nprint(mark42.name, mark42.energy)\nprint(vars(mark42))",
      "title": "init_self.py",
      "output": "🛠  Зібрано Mark III\n🛠  Зібрано Mark XLII\nMark III 100 0\nMark XLII 80\n{'name': 'Mark XLII', 'energy': 80, 'damage': 0}",
      "highlight": [
        2,
        3,
        4,
        5
      ]
    },
    {
      "type": "viz",
      "id": "init-stepper",
      "title": "Як народжується об'єкт: __new__ → __init__ → self",
      "caption": "Тисни **Крок**: Python спершу створює порожній об'єкт, потім передає його в `__init__` під ім'ям `self`, і кожен рядок `self.x = ...` додає запис у словник атрибутів. Наприкінці змінна отримує **посилання** на готовий костюм. Перемкни на виклик методу — і побачиш, що `mark.fire()` — це насправді `Suit.fire(mark)`."
    },
    {
      "type": "tip",
      "md": "Ім'я `self` — лише **домовленість**, а не ключове слово. Технічно можна написати `def __init__(this, name)`, і все запрацює. Але так не робить ніхто: будь-який Python-розробник, лінтер і автодоповнення в IDE очікують саме `self`. Не вигадуй — пиши `self`.",
      "title": "self — це просто перший параметр"
    },
    {
      "type": "warning",
      "md": "Класичні помилки новачка в `__init__`:\n\n- `def __init__(name):` — забув `self`. Виклик `Suit(\"Mark I\")` впаде з `TypeError: Suit.__init__() takes 1 positional argument but 2 were given` (бо Python передає ще й сам об'єкт).\n- `name = name` замість `self.name = name` — створюється локальна змінна, яка зникне після виходу з `__init__`. Об'єкт залишиться без атрибута.\n- `def __int__` або `def _init_` — одна літера чи одне підкреслення, і Python просто не впізнає ініціалізатор.\n- `return self` або `return 42` з `__init__` — заборонено: він має повертати `None`.",
      "title": "Чотири способи зламати __init__"
    },
    {
      "type": "code",
      "code": "class Suit:\n    def __init__(self, name):\n        name = name          # ой: забули self. — це просто локальна змінна\n\n\nmark = Suit(\"Mark I\")\nprint(hasattr(mark, \"name\"))\nprint(mark.name)",
      "title": "forgot_self.py",
      "output": "False\nTraceback (most recent call last):\n  File \"main.py\", line 8, in <module>\n    print(mark.name)\n          ^^^^^^^^^\nAttributeError: 'Suit' object has no attribute 'name'"
    },
    {
      "type": "joke",
      "md": "JARVIS, ініціалізуй новий костюм. — *Сер, ви знову написали `__int__` замість `__init__`. Я перетворив ваш костюм на ціле число.* 🤖"
    },
    {
      "type": "heading",
      "text": "Методи: що вміє костюм"
    },
    {
      "type": "text",
      "md": "**Метод** — це функція, оголошена всередині класу. Перший параметр — завжди `self`, щоб метод мав доступ до даних *конкретного* об'єкта і міг їх змінювати.\n\nКоли пишеш `mark.fire(20)`, Python робить `Suit.fire(mark, 20)`: знаходить функцію в класі і підставляє об'єкт першим аргументом. Тому один і той самий код методу працює з будь-яким екземпляром — кожен раз зі своїм `self`.\n\nМетоди можуть викликати інші методи через `self.метод()` — так складні дії збираються з простих."
    },
    {
      "type": "code",
      "code": "class Suit:\n    def __init__(self, name, energy=100):\n        self.name = name\n        self.energy = energy\n\n    def fire(self, cost=10):\n        if self.energy < cost:\n            return f\"{self.name}: недостатньо енергії!\"\n        self.energy -= cost              # метод змінює стан об'єкта\n        return f\"{self.name}: 💥 репульсор! Лишилось {self.energy}%\"\n\n    def recharge(self):\n        self.energy = 100\n        return f\"{self.name}: заряджено ⚡\"\n\n    def combo(self):\n        # метод викликає інші методи того самого об'єкта\n        return [self.fire(30), self.fire(30), self.fire(50)]\n\n\nmark = Suit(\"Mark VII\", energy=70)\nprint(mark.fire())\nfor line in mark.combo():\n    print(line)\nprint(mark.recharge())\nprint(Suit.fire(mark, 5))                # те саме, що mark.fire(5)",
      "title": "methods.py",
      "output": "Mark VII: 💥 репульсор! Лишилось 60%\nMark VII: 💥 репульсор! Лишилось 30%\nMark VII: 💥 репульсор! Лишилось 0%\nMark VII: недостатньо енергії!\nMark VII: заряджено ⚡\nMark VII: 💥 репульсор! Лишилось 95%",
      "highlight": [
        6,
        7,
        8,
        9,
        10,
        26
      ]
    },
    {
      "type": "tip",
      "md": "Методи, що **змінюють** об'єкт і нічого корисного не повертають, можуть `return self`. Тоді виклики можна ланцюжити: `suit.paint(\"gold\").upgrade().recharge()`. Такий стиль називають *fluent interface* — його люблять у бібліотеках на кшталт pandas і SQLAlchemy.",
      "title": "Ланцюжки методів"
    },
    {
      "type": "code",
      "code": "class Suit:\n    def __init__(self, name):\n        self.name = name\n        self.color = \"сірий\"\n        self.level = 1\n\n    def paint(self, color):\n        self.color = color\n        return self              # повертаємо сам об'єкт\n\n    def upgrade(self):\n        self.level += 1\n        return self\n\n\nmark = Suit(\"Mark II\").paint(\"червоно-золотий\").upgrade().upgrade()\nprint(mark.name, mark.color, mark.level)",
      "title": "fluent.py",
      "output": "Mark II червоно-золотий 3"
    },
    {
      "type": "quiz",
      "question": "Що насправді виконує Python, коли ти пишеш `mark.fire(5)`?",
      "options": [
        "`fire(5)`",
        "`Suit.fire(mark, 5)`",
        "`mark.fire(mark, 5)`",
        "`Suit.fire(5)`"
      ],
      "answer": 1,
      "explain": "Python шукає функцію `fire` у класі об'єкта і викликає її, передаючи сам об'єкт першим аргументом (`self`). Тому в оголошенні методу параметрів на один більше, ніж у виклику."
    },
    {
      "type": "heading",
      "text": "Атрибути класу vs атрибути екземпляра"
    },
    {
      "type": "text",
      "md": "Атрибути бувають двох видів:\n\n- **атрибут екземпляра** — задається через `self.x = ...`, живе у словнику конкретного об'єкта (`obj.__dict__`). У кожного костюма свій.\n- **атрибут класу** — оголошується прямо в тілі класу, поза методами. Він **один на всіх** і живе у словнику класу (`Suit.__dict__`). Зручно для констант і спільних лічильників.\n\nКоли ти читаєш `mark.maker`, Python шукає атрибут **спочатку в об'єкті, потім у класі**. Знайшов у класі — повертає звідти. А от **присвоєння** `mark.maker = ...` завжди пише в об'єкт, створюючи «тінь», що закриває атрибут класу лише для цього екземпляра."
    },
    {
      "type": "code",
      "code": "class Suit:\n    maker = \"Stark Industries\"   # атрибут класу — спільний\n    count = 0                    # лічильник усіх костюмів\n\n    def __init__(self, name):\n        self.name = name         # атрибут екземпляра — свій\n        Suit.count += 1          # змінюємо саме атрибут КЛАСУ\n\n\na = Suit(\"Mark I\")\nb = Suit(\"Mark II\")\nprint(a.maker, \"|\", b.maker, \"| створено:\", Suit.count)\n\nb.maker = \"Hammer Industries\"    # тінь лише для b\nprint(a.maker, \"|\", b.maker)\nprint(\"maker\" in vars(a), \"maker\" in vars(b))\n\nSuit.maker = \"Stark Tech\"        # змінили креслення\nprint(a.maker, \"|\", b.maker)     # b досі бачить свою тінь\n\ndel b.maker                      # прибрали тінь\nprint(b.maker)",
      "title": "class_vs_instance.py",
      "output": "Stark Industries | Stark Industries | створено: 2\nStark Industries | Hammer Industries\nFalse True\nStark Tech | Hammer Industries\nStark Tech",
      "highlight": [
        2,
        3,
        7,
        14,
        18
      ]
    },
    {
      "type": "viz",
      "id": "attr-lookup",
      "title": "Пошук атрибута: спершу об'єкт, потім клас",
      "caption": "Обирай операцію і дивись, куди Python «ходить». **Читання** піде по стрілці вгору до класу, якщо в об'єкті атрибута немає. **Присвоєння** через екземпляр завжди пише у сам об'єкт і створює тінь. А в режимі **спільний список** побачиш найпідступнішу пастку ООП: `append` не присвоює, а змінює спільний об'єкт класу."
    },
    {
      "type": "warning",
      "md": "Змінюваний атрибут класу (`list`, `dict`, `set`) **спільний для всіх екземплярів**. `self.upgrades.append(...)` не створює тінь — він знаходить список у класі і змінює саме його. У результаті апгрейд одного костюма «з'являється» в усіх. Змінювані дані завжди створюй у `__init__`: `self.upgrades = []`.",
      "title": "Спільний список — спільна біда"
    },
    {
      "type": "compare",
      "title": "Список апгрейдів",
      "bad": {
        "code": "class Suit:\n    upgrades = []            # один список на ВСІ костюми\n\n    def __init__(self, name):\n        self.name = name\n\n    def add(self, item):\n        self.upgrades.append(item)\n\na, b = Suit(\"Mark I\"), Suit(\"Mark II\")\na.add(\"ракети\")\nprint(b.upgrades)            # ['ракети'] 😱",
        "label": "Список у класі"
      },
      "good": {
        "code": "class Suit:\n    def __init__(self, name):\n        self.name = name\n        self.upgrades = []   # свій список у кожного\n\n    def add(self, item):\n        self.upgrades.append(item)\n\na, b = Suit(\"Mark I\"), Suit(\"Mark II\")\na.add(\"ракети\")\nprint(b.upgrades)            # [] ✅",
        "label": "Список в __init__"
      },
      "note": "Правило просте: **константи та лічильники** — в атрибути класу, **усе змінюване і персональне** — в `__init__` через `self`."
    },
    {
      "type": "viz",
      "id": "blueprint-forge",
      "title": "3D-кузня: одне креслення → багато костюмів",
      "caption": "У центрі — **клас** `Suit` із спільними атрибутами. Тисни **Зібрати костюм**, щоб створити екземпляр, клацай по костюму — побачиш його власний `__dict__`. Зміни `Suit.color` на кресленні: костюми без власного `color` перефарбуються, а ті, що мають тінь, — ні."
    },
    {
      "type": "quiz",
      "question": "Є `class A: x = 1`, `a = A()`, `a.x = 5`, `A.x = 10`. Що виведе `print(a.x, A().x)`?",
      "options": [
        "`10 10`",
        "`5 10`",
        "`5 1`",
        "`1 10`"
      ],
      "answer": 1,
      "explain": "`a.x = 5` створило атрибут у самому об'єкті `a` — він закриває атрибут класу. Новий об'єкт `A()` власного `x` не має, тож бере з класу, де вже `10`."
    },
    {
      "type": "heading",
      "text": "Інкапсуляція: _захищене і __приватне"
    },
    {
      "type": "text",
      "md": "**Інкапсуляція** — це ідея «сховати нутрощі». Користувачу костюма не треба знати, як влаштований реактор: він тисне кнопку `fly()`. Якщо хтось руками полізе в `suit.energy = -500`, об'єкт опиниться у неможливому стані.\n\nУ Python немає справжнього `private`, як у Java чи C#. Натомість — **домовленості**:\n\n- `name` — публічний атрибут, користуйся на здоров'я;\n- `_name` (одне підкреслення) — «внутрішнє, не чіпай»: технічно доступний, але це сигнал колегам і IDE;\n- `__name` (два підкреслення на початку) — Python робить **name mangling**: всередині класу `Suit` ім'я перетворюється на `_Suit__name`. Це захищає від *випадкових* конфліктів імен у спадкоємцях, але не від злому.\n\nPython-філософія: *«ми всі тут дорослі люди»* — захист від помилок, а не від зловмисників."
    },
    {
      "type": "code",
      "code": "class Suit:\n    def __init__(self, name, code):\n        self.name = name          # публічне\n        self._firmware = \"v7.2\"   # внутрішнє — «не чіпай»\n        self.__code = code        # «приватне» — ім'я буде змінене\n\n    def check(self, attempt):\n        return attempt == self.__code   # усередині класу — звичайне ім'я\n\n\nmark = Suit(\"Mark L\", code=\"PEPPER\")\nprint(mark.name, mark._firmware)\nprint(mark.check(\"PEPPER\"))\nprint(list(vars(mark)))           # подивись на справжні імена\nprint(mark._Suit__code)           # «злом» можливий, але так не роблять\n\ntry:\n    print(mark.__code)\nexcept AttributeError as e:\n    print(\"AttributeError:\", e)",
      "title": "encapsulation.py",
      "output": "Mark L v7.2\nTrue\n['name', '_firmware', '_Suit__code']\nPEPPER\nAttributeError: 'Suit' object has no attribute '__code'",
      "highlight": [
        4,
        5,
        14
      ]
    },
    {
      "type": "tip",
      "md": "Не зловживай `__подвійним` підкресленням «для надійності». У 95% випадків достатньо одного `_`: воно читається простіше, не ламає наслідування і чесно каже «це деталь реалізації». `__name` використовують, коли пишуть клас, від якого наслідуватимуть інші, і треба уникнути випадкового перезапису імені.",
      "title": "Одного _ зазвичай досить"
    },
    {
      "type": "joke",
      "md": "Мій пароль від костюма захищений name mangling! — *Сер, будь-хто може написати `mark._Suit__code`.* — Тихо, JARVIS. Це **домовленість**. Дорослі люди не читають чужі `__dict__`. 😎"
    },
    {
      "type": "heading",
      "text": "@property: розумні атрибути"
    },
    {
      "type": "text",
      "md": "Що, як ми хочемо, щоб `suit.energy` лишався простим атрибутом для користувача, але при присвоєнні **перевіряв значення**? Писати Java-стайл `get_energy()` / `set_energy()` — не по-пайтонівськи.\n\nДля цього є декоратор `@property`. Він перетворює метод на атрибут, який **читається без дужок**, а через `@<ім'я>.setter` можна додати перевірку при присвоєнні. Зовні — звичайне `suit.energy = 50`, всередині — твій код-охоронець.\n\nТипова схема: справжнє значення зберігаємо в `self._energy`, а `energy` — це «вітрина» з валідацією."
    },
    {
      "type": "code",
      "code": "class Reactor:\n    def __init__(self, energy=100):\n        self.energy = energy            # навіть тут спрацює setter!\n\n    @property\n    def energy(self):                   # getter: reactor.energy\n        return self._energy\n\n    @energy.setter\n    def energy(self, value):            # setter: reactor.energy = ...\n        if not 0 <= value <= 100:\n            raise ValueError(f\"енергія {value}% поза межами 0–100\")\n        self._energy = value\n\n\narc = Reactor()\narc.energy = 42                          # виглядає як звичайне присвоєння\nprint(arc.energy)\n\ntry:\n    arc.energy = 150\nexcept ValueError as e:\n    print(\"ValueError:\", e)\nprint(arc.energy)                        # старе значення вціліло\n\ntry:\n    Reactor(-5)\nexcept ValueError as e:\n    print(\"ValueError:\", e)",
      "title": "property_setter.py",
      "output": "42\nValueError: енергія 150% поза межами 0–100\n42\nValueError: енергія -5% поза межами 0–100",
      "highlight": [
        5,
        6,
        9,
        10,
        11,
        12
      ]
    },
    {
      "type": "viz",
      "id": "reactor-property",
      "title": "3D-реактор: @property як охоронець",
      "caption": "Тягни повзунок — це спроба виконати `arc.energy = значення`. Запит проходить крізь **setter**: у межах 0–100 реактор приймає нове значення і світиться яскравіше, поза межами — setter кидає `ValueError`, а `_energy` лишається старим. Перемкни на «без property», щоб побачити, як «сирий» атрибут приймає будь-яку дурницю."
    },
    {
      "type": "text",
      "md": "Ще одне суперкорисне застосування — **обчислювані атрибути**. Вони не зберігаються, а рахуються з інших даних щоразу при зверненні. Тоді вони ніколи не «розсинхронізуються». А якщо не додати setter, атрибут стане **тільки для читання**."
    },
    {
      "type": "code",
      "code": "class Suit:\n    def __init__(self, name, max_hp, damage=0):\n        self.name = name\n        self.max_hp = max_hp\n        self.damage = damage\n\n    @property\n    def hp(self):                          # рахується «на льоту»\n        return max(self.max_hp - self.damage, 0)\n\n    @property\n    def status(self):\n        ratio = self.hp / self.max_hp\n        if ratio > 0.6:\n            return \"🟢 бойова готовність\"\n        if ratio > 0.2:\n            return \"🟡 пошкоджено\"\n        return \"🔴 критично\"\n\n\nmark = Suit(\"Mark XLIII\", max_hp=500)\nprint(mark.hp, mark.status)\nmark.damage = 260\nprint(mark.hp, mark.status)                # оновилося саме\nmark.damage += 200\nprint(mark.hp, mark.status)\n\ntry:\n    mark.hp = 1000                         # setter немає — лише читання\nexcept AttributeError as e:\n    print(\"AttributeError:\", e)",
      "title": "computed_property.py",
      "output": "500 🟢 бойова готовність\n240 🟡 пошкоджено\n40 🔴 критично\nAttributeError: property 'hp' of 'Suit' object has no setter"
    },
    {
      "type": "tip",
      "md": "Почни з **простих публічних атрибутів**. Якщо згодом знадобиться перевірка — заміни атрибут на `@property` з тим самим ім'ям. Код, що використовує клас (`suit.energy = 50`), **не зміниться взагалі**. Саме тому в Python не пишуть гетери/сетери «про запас».",
      "title": "Спочатку атрибут — property потім"
    },
    {
      "type": "warning",
      "md": "Усередині getter/setter звертайся до `self._energy`, а **не** до `self.energy`. Рядок `self.energy = value` всередині setter-а знову викличе setter, той — знову себе… і так до `RecursionError: maximum recursion depth exceeded`.",
      "title": "Нескінченна рекурсія у property"
    },
    {
      "type": "quiz",
      "question": "Навіщо в setter-і писати `self._energy = value`, а не `self.energy = value`?",
      "options": [
        "Підкреслення робить атрибут швидшим",
        "`self.energy = value` знову викликав би setter — нескінченна рекурсія",
        "Інакше Python не дозволить присвоєння",
        "Різниці немає, це справа смаку"
      ],
      "answer": 1,
      "explain": "`energy` — це property, тож будь-яке `self.energy = ...` запускає setter. Справжнє значення має жити під *іншим* ім'ям — зазвичай з підкресленням."
    },
    {
      "type": "heading",
      "text": "Об'єкти — це посилання"
    },
    {
      "type": "text",
      "md": "Змінна не містить об'єкт — вона **вказує** на нього (пам'ятаєш розділ про змінні?). З об'єктами класів так само: `backup = mark` не створює другий костюм, а дає ще одне ім'я тому самому. Змінив через одне ім'я — видно через інше.\n\nДля порівняння «це той самий об'єкт?» — `is`. А от `==` для твоїх класів за замовчуванням теж порівнює *ідентичність*, поки ти не навчиш клас порівнювати вміст (метод `__eq__` — у наступному розділі). Щоб отримати незалежну копію — модуль `copy`."
    },
    {
      "type": "code",
      "code": "import copy\n\n\nclass Suit:\n    def __init__(self, name, parts):\n        self.name = name\n        self.parts = parts\n\n\nmark = Suit(\"Mark V\", [\"шолом\", \"рукавиці\"])\nalias = mark                        # те саме посилання\nalias.name = \"Mark V (валіза)\"\nprint(mark.name)\nprint(alias is mark)\n\ntwin = Suit(\"Mark V (валіза)\", [\"шолом\", \"рукавиці\"])\nprint(twin == mark)                 # за замовчуванням == — це is\n\nshallow = copy.copy(mark)           # новий об'єкт, але parts — спільний\ndeep = copy.deepcopy(mark)          # повна незалежна копія\nmark.parts.append(\"реактор\")\nprint(shallow.parts)\nprint(deep.parts)",
      "title": "references.py",
      "output": "Mark V (валіза)\nTrue\nFalse\n['шолом', 'рукавиці', 'реактор']\n['шолом', 'рукавиці']"
    },
    {
      "type": "text",
      "md": "Корисні вбудовані функції для роботи з об'єктами — «діагностичний сканер» JARVIS:\n\n- `isinstance(obj, Cls)` — чи є об'єкт екземпляром класу (враховує наслідування);\n- `type(obj)` — точний клас об'єкта;\n- `vars(obj)` / `obj.__dict__` — словник атрибутів екземпляра;\n- `hasattr`, `getattr`, `setattr`, `delattr` — робота з атрибутами за **іменем-рядком** (зручно, коли ім'я відоме лише під час виконання);\n- `dir(obj)` — усі доступні імена, включно з методами."
    },
    {
      "type": "code",
      "code": "class Suit:\n    def __init__(self, name):\n        self.name = name\n        self.energy = 100\n\n\nmark = Suit(\"Mark LXXXV\")\nsettings = {\"color\": \"нано-червоний\", \"energy\": 95, \"ai\": \"FRIDAY\"}\n\nfor key, value in settings.items():      # налаштовуємо за іменами-рядками\n    setattr(mark, key, value)\n\nprint(vars(mark))\nprint(getattr(mark, \"ai\"))\nprint(getattr(mark, \"shield\", \"немає\"))  # значення за замовчуванням\nprint(hasattr(mark, \"fly\"))\nprint([n for n in dir(mark) if not n.startswith(\"_\")])",
      "title": "introspection.py",
      "output": "{'name': 'Mark LXXXV', 'energy': 95, 'color': 'нано-червоний', 'ai': 'FRIDAY'}\nFRIDAY\nнемає\nFalse\n['ai', 'color', 'energy', 'name']"
    },
    {
      "type": "joke",
      "md": "Хтось: «Можна мені копію костюма?». Я: `copy.copy(mark)`. Через тиждень: «Чому ви обоє полагодили *один* реактор?» — «Бо копія поверхнева, друже». 🧲",
      "hero": "Тоні Старк / Залізна Людина"
    },
    {
      "type": "heading",
      "text": "Міні-проєкт: бортовий комп'ютер костюма"
    },
    {
      "type": "text",
      "md": "Зберемо все разом: атрибут класу, `__init__`, методи, що змінюють стан і викликають одне одного, захищений атрибут, `@property` з валідацією та обчислюваний атрибут. Саме так виглядає «справжній» маленький клас у продакшн-коді."
    },
    {
      "type": "code",
      "code": "class Suit:\n    maker = \"Stark Industries\"\n    _serial = 0                                   # внутрішній лічильник класу\n\n    def __init__(self, model, max_energy=100):\n        Suit._serial += 1\n        self.serial = f\"SI-{Suit._serial:03}\"\n        self.model = model\n        self.max_energy = max_energy\n        self.energy = max_energy                  # через setter\n        self.log = []                             # свій список у кожного\n\n    @property\n    def energy(self):\n        return self._energy\n\n    @energy.setter\n    def energy(self, value):\n        self._energy = max(0, min(value, self.max_energy))   # «притискаємо» у межі\n\n    @property\n    def ready(self):\n        return self.energy >= 20\n\n    def _spend(self, cost, action):\n        if self.energy < cost:\n            self.log.append(f\"✖ {action}: мало енергії\")\n            return False\n        self.energy -= cost\n        self.log.append(f\"✔ {action} (-{cost})\")\n        return True\n\n    def fly(self, km):\n        return self._spend(km * 2, f\"політ {km} км\")\n\n    def fire(self):\n        return self._spend(25, \"репульсор\")\n\n    def report(self):\n        print(f\"[{self.serial}] {self.maker} {self.model}: {self.energy}% | готовий: {self.ready}\")\n        for entry in self.log:\n            print(\"   \", entry)\n\n\nmk = Suit(\"Mark XLVI\", max_energy=120)\nmk.fly(20)\nmk.fire()\nmk.fire()\nmk.fire()\nmk.fire()                                         # на 4-й енергії вже бракує\nmk.energy += 500                                  # setter «притисне» до максимуму\nmk.report()\n\nSuit(\"Mark XLVII\").report()",
      "title": "suit_computer.py",
      "output": "[SI-001] Stark Industries Mark XLVI: 120% | готовий: True\n    ✔ політ 20 км (-40)\n    ✔ репульсор (-25)\n    ✔ репульсор (-25)\n    ✔ репульсор (-25)\n    ✖ репульсор: мало енергії\n[SI-002] Stark Industries Mark XLVII: 100% | готовий: True"
    },
    {
      "type": "tip",
      "md": "Для швидкого налагодження кинь в об'єкт `print(vars(obj))` — побачиш увесь його стан одним словником. А у `breakpoint()`-сесії чи в Jupyter команда `obj.__dict__` рятує від десятка окремих `print`.",
      "title": "vars() — рентген об'єкта"
    },
    {
      "type": "tip",
      "md": "Якщо клас — це лише «мішок даних» з `__init__`, що копіює аргументи в `self`, подивись на `@dataclass` із модуля `dataclasses` (наступний розділ). Він згенерує `__init__`, красивий `repr` і порівняння за тебе — мінус десяток рядків шаблонного коду.",
      "title": "Бачиш шаблонний __init__? Спробуй dataclass"
    },
    {
      "type": "quiz",
      "question": "Скільки об'єктів `Suit` існує після `a = Suit(\"X\"); b = a; c = Suit(\"X\")`?",
      "options": [
        "1",
        "2",
        "3",
        "0 — поки не викликано методи"
      ],
      "answer": 1,
      "explain": "`Suit(...)` викликали двічі — отже два об'єкти. `b = a` лише додає друге ім'я першому об'єкту."
    },
    {
      "type": "viz",
      "id": "encapsulation-vault",
      "title": "Сейф JARVIS: public, _protected і __private",
      "caption": "Обирай, **звідки** звертаєшся до атрибута — з методу класу, ззовні або з класу-спадкоємця — і який атрибут читаєш. Сейф покаже, що реально відбувається: `__code` перетворюється на `_Suit__code`, а `_firmware` відкритий, але з табличкою «не чіпай»."
    },
    {
      "type": "heading",
      "text": "Шпаргалка"
    },
    {
      "type": "table",
      "head": [
        "Що",
        "Синтаксис",
        "Навіщо"
      ],
      "rows": [
        [
          "Оголосити клас",
          "`class Suit:`",
          "Креслення для об'єктів, ім'я в `CamelCase`"
        ],
        [
          "Створити об'єкт",
          "`mark = Suit(\"Mark I\")`",
          "Виклик класу → `__new__` + `__init__`"
        ],
        [
          "Ініціалізатор",
          "`def __init__(self, name):`",
          "Заповнює атрибути нового об'єкта, повертає `None`"
        ],
        [
          "Атрибут екземпляра",
          "`self.name = name`",
          "Свій у кожного об'єкта, живе в `obj.__dict__`"
        ],
        [
          "Атрибут класу",
          "`maker = \"Stark\"` у тілі класу",
          "Спільний для всіх; константи, лічильники"
        ],
        [
          "Метод",
          "`def fire(self, cost):`",
          "`mark.fire(5)` = `Suit.fire(mark, 5)`"
        ],
        [
          "Внутрішнє",
          "`self._firmware`",
          "Домовленість «не чіпай ззовні»"
        ],
        [
          "Name mangling",
          "`self.__code`",
          "Стає `_Suit__code`; захист від конфліктів імен"
        ],
        [
          "Властивість",
          "`@property` + `@x.setter`",
          "Атрибут із логікою: валідація, обчислення"
        ],
        [
          "Перевірка типу",
          "`isinstance(obj, Suit)`",
          "Чи є об'єкт екземпляром класу"
        ],
        [
          "Атрибут за іменем",
          "`getattr(obj, \"x\", default)`",
          "Динамічний доступ, `setattr`/`hasattr`/`delattr`"
        ],
        [
          "Рентген",
          "`vars(obj)`",
          "Усі атрибути екземпляра словником"
        ]
      ]
    },
    {
      "type": "joke",
      "md": "Кажуть, у мене серце з заліза. Неправда: у мене `class Heart` з `@property`, яка не дозволяє встановити `love < 3000`. 🧡"
    }
  ]
};

export default section;
