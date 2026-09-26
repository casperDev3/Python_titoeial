import type { Section } from "../types";

/** Код Python пишемо через String.raw — бекслеші лишаються як у Python. */
const py = String.raw;

const section: Section = {
  "slug": "modules",
  "title": "Модулі, пакети та pip",
  "short": "import, venv, stdlib",
  "icon": "📦",
  "group": "Надійність",
  "summary": "import і from, як Python шукає модулі, __name__ == '__main__', пакети, стандартна бібліотека, pip та віртуальні середовища.",
  "hero": {
    "name": "Сенку Ішіґамі",
    "universe": "Dr. Stone",
    "emoji": "🧪",
    "quote": "Десять мільярдів відсотків — цей модуль вже є в стандартній бібліотеці!",
    "why": "Сенку відбудовує цивілізацію з окремих відкриттів — як програма збирається з модулів і пакетів."
  },
  "theme": {
    "accent": "#84cc16",
    "accent2": "#06b6d4",
    "glow": "#65a30d"
  },
  "minutes": 12,
  "order": 13,
  "blocks": [
    // ───────────────────────────── 1. Навіщо модулі
    { type: "heading", text: "Королівство Науки будується з відкриттів", id: "why" },
    {
      type: "text",
      md: "Сенку не винаходить цивілізацію одним махом. Спочатку — вапно, потім мило, скло, залізо, електрика, радіо. Кожне відкриття — окремий, перевірений «блок», на який спираються наступні.\n\nУ Python такі блоки називаються **модулями**. Модуль — це просто файл `.py` з функціями, класами й змінними. Замість того щоб пхати все в один файл на 5000 рядків, ми:\n\n- **ділимо** програму на логічні частини (`physics.py`, `chemistry.py`, `radio.py`);\n- **перевикористовуємо** код — одну функцію пишемо один раз, а імпортуємо звідусіль;\n- **беремо готове** — Python має величезну *стандартну бібліотеку* («батарейки в комплекті»), а ще понад пів мільйона пакетів на PyPI.\n\nКоманда `import` — це твій спосіб сказати: «Мені потрібне відкриття X. Принесіть його сюди».",
    },
    {
      type: "code",
      title: "Перший імпорт",
      code: py`import math

print(math.sqrt(16))     # квадратний корінь
print(math.pi)           # константа π
print(math.floor(3.99))  # округлення вниз
print(math.factorial(5)) # 5! = 120`,
      output: py`4.0
3.141592653589793
3
120`,
    },
    {
      type: "joke",
      md: "Людство витратило два мільйони років, щоб дійти до числа π. А тобі достатньо написати `import math`. Це збуджує! Sosoru ze kore wa! 🧪",
    },

    // ───────────────────────────── 2. import / from / as
    { type: "heading", text: "Три заклинання: import, from і as", id: "import-forms" },
    {
      type: "text",
      md: "Є кілька форм імпорту, і вони по-різному впливають на твій **простір імен** (namespace) — «таблицю» імен, які видно у файлі:\n\n- `import math` — у просторі імен з'являється **одне** ім'я `math`. Усе всередині — через крапку: `math.sqrt`. Одразу видно, звідки функція.\n- `from math import sqrt, pi` — у простір імен потрапляють **саме** `sqrt` і `pi`. Пишеш коротко, але втрачаєш підказку «звідки це».\n- `import statistics as st` — те саме, що `import`, але під **псевдонімом**. Класика: `import numpy as np`, `import pandas as pd`.\n- `from math import *` — висипає **усі** публічні імена модуля у твій файл. Майже завжди погана ідея (див. нижче).",
    },
    {
      type: "code",
      title: "Усі форми імпорту",
      code: py`from math import sqrt, pi
import statistics as st
from datetime import date as Date

print(sqrt(81), round(pi, 2))
print(st.mean([7, 8, 10]))          # середнє
print(st.median([3, 1, 4, 1, 5]))   # медіана
print(Date(2026, 9, 26).isoformat())`,
      output: py`9.0 3.14
8.333333333333334
3
2026-09-26`,
    },
    {
      type: "viz",
      id: "import-namespace",
      title: "Що потрапляє у твій namespace",
      caption: "Перемикай форму імпорту й дивись, які імена з'являються у файлі `main.py`. Кнопка «Імпортувати ще раз» показує **кеш модулів**: код модуля виконується лише один раз, а далі Python віддає готовий об'єкт з `sys.modules`.",
    },
    {
      type: "compare",
      title: "Зірочка — ворог науки",
      bad: {
        label: "import * — звідки взялася pow?",
        code: py`from math import *
from os import *

# Хто така pow? math.pow? вбудована pow?
# А ще os перезаписав open()... 😵
print(pow(2, 10))`,
      },
      good: {
        label: "Явні імена — чиста лабораторія",
        code: py`import math
from os import path

print(math.pow(2, 10))   # одразу ясно: з math
print(path.join("lab", "cola.txt"))`,
      },
      note: "`import *` робить код нечитабельним і створює тихі конфлікти імен: пізніший імпорт мовчки перезаписує попередній. PEP 8 прямо радить його уникати.",
    },
    {
      type: "code",
      title: "Модуль — теж об'єкт",
      code: py`import math

print(type(math))
print(math.__name__)
# dir() показує все, що лежить у модулі
print([name for name in dir(math) if name.startswith("is")])`,
      output: py`<class 'module'>
math
['isclose', 'isfinite', 'isinf', 'isnan', 'isqrt']`,
    },
    {
      type: "tip",
      title: "Досліджуй модулі прямо в REPL",
      md: "Не знаєш, що вміє модуль? Відкрий `python3` і спитай: `dir(math)` — список імен, `help(math.isqrt)` — документація функції, `math.__file__` — де лежить файл. Це швидше за гуглення і завжди відповідає *твоїй* версії Python.",
    },

    // ───────────────────────────── 3. Свій модуль
    { type: "heading", text: "Твій власний модуль за 30 секунд", id: "own-module" },
    {
      type: "text",
      md: "Будь-який файл `.py` — вже модуль. Створи поруч із `main.py` файл `senku_tools.py`, напиши в ньому функцію — і `import senku_tools` спрацює. Ім'я модуля = ім'я файлу **без** `.py`, тому називай файли як змінні: `snake_case`, без дефісів і пробілів (`my-tools.py` імпортувати не вийде).\n\nУ браузері в нас немає окремих файлів, тож у прикладі нижче ми *створюємо* модуль кодом через `pathlib`, додаємо його теку в `sys.path` (про це — трохи згодом) і імпортуємо. На твоєму комп'ютері достатньо просто покласти файл поруч.",
    },
    {
      type: "code",
      title: "Створюємо і імпортуємо senku_tools.py",
      code: py`import importlib, sys
from pathlib import Path

lab = Path("lab")
lab.mkdir(exist_ok=True)
(lab / "senku_tools.py").write_text('''
BILLION = 10_000_000_000

def percent(p):
    return f"{p:,}%".replace(",", " ")

def make_cola(sugar, water):
    return f"🥤 кола з {sugar} г цукру і {water} мл води"
''')

if str(lab) not in sys.path:
    sys.path.insert(0, str(lab))
importlib.invalidate_caches()        # нові файли — оновити кеш шукача
sys.modules.pop("senku_tools", None) # щоб повторний запуск взяв свіжу версію

import senku_tools

print(senku_tools.percent(senku_tools.BILLION))
print(senku_tools.make_cola(40, 330))`,
      output: py`10 000 000 000%
🥤 кола з 40 г цукру і 330 мл води`,
    },

    // ───────────────────────────── 4. __name__
    { type: "heading", text: "Магія if __name__ == \"__main__\"", id: "name-main" },
    {
      type: "text",
      md: "Коли Python **імпортує** модуль, він виконує *увесь* його код зверху донизу — кожен `print`, кожен виклик. Якщо в `tools.py` внизу стоїть тестовий `print(\"Перевірка!\")`, він вистрілить у кожного, хто імпортує `tools`. Незручно.\n\nРішення — спеціальна змінна `__name__`, яку Python створює в кожному модулі:\n\n- файл запустили **напряму** (`python3 tools.py`) → `__name__ == \"__main__\"`;\n- файл **імпортували** (`import tools`) → `__name__ == \"tools\"`.\n\nТож блок `if __name__ == \"__main__\":` — це «запускай тільки якщо я головний». Ідеальне місце для демо, тестів і точки входу `main()`.",
    },
    {
      type: "viz",
      id: "name-main",
      title: "Хто головний: запуск чи імпорт",
      caption: "Обери, як саме запускається код, і проходь покроково. Зверни увагу, які рядки `tools.py` виконуються, а які пропускаються, і яке значення має `__name__` у кожному файлі.",
    },
    {
      type: "code",
      title: "__name__ зсередини і ззовні",
      code: py`import importlib, sys
from pathlib import Path

lab = Path("lab")
lab.mkdir(exist_ok=True)
(lab / "stone_world.py").write_text('''
print(f"[stone_world] __name__ = {__name__!r}")

def revive(name):
    return f"{name} повернувся з кам'яного сну!"

if __name__ == "__main__":
    print("Демо: " + revive("Тайджу"))   # при імпорті НЕ виконається
''')

if str(lab) not in sys.path:
    sys.path.insert(0, str(lab))
importlib.invalidate_caches()
sys.modules.pop("stone_world", None)

import stone_world                      # виконує весь файл один раз

print(f"[main] __name__ = {__name__!r}")
print(stone_world.revive("Юдзуріха"))`,
      output: py`[stone_world] __name__ = 'stone_world'
[main] __name__ = '__main__'
Юдзуріха повернувся з кам'яного сну!`,
      highlight: [8, 9, 19],
    },
    {
      type: "compare",
      title: "Точка входу у скрипті",
      bad: {
        label: "Код на верхньому рівні",
        code: py`# radio.py
def broadcast(msg):
    return f"📻 {msg}"

# виконається навіть при import radio!
print(broadcast("Тут Королівство Науки"))
data = input("Повідомлення: ")`,
      },
      good: {
        label: "Функція main() + guard",
        code: py`# radio.py
def broadcast(msg):
    return f"📻 {msg}"

def main():
    print(broadcast("Тут Королівство Науки"))
    data = input("Повідомлення: ")

if __name__ == "__main__":
    main()`,
      },
      note: "Правильний варіант можна безпечно імпортувати (`from radio import broadcast`) і водночас запускати як програму. Так пишуть практично всі професійні скрипти.",
    },
    {
      type: "joke",
      md: "Коли Хром питає, навіщо `if __name__ == \"__main__\"`: «Це як мій лабораторний журнал. Якщо *я* його відкрив — проводимо експеримент. Якщо його позичив Ґен — він просто читає формули, а не підпалює лабораторію». 📓",
    },

    // ───────────────────────────── 5. Як Python шукає
    { type: "heading", text: "Як Python шукає модулі: sys.modules і sys.path", id: "search" },
    {
      type: "text",
      md: "Коли ти пишеш `import cola`, Python діє як методичний науковець:\n\n- **Кеш `sys.modules`.** Спершу дивиться, чи модуль уже завантажено. Якщо так — віддає готовий об'єкт *без повторного виконання* коду. Тому `print` у модулі спрацьовує лише при першому імпорті.\n- **Список `sys.path`.** Якщо в кеші нема — перебирає теки зі списку `sys.path` **по порядку**: спочатку тека запущеного скрипта, потім `PYTHONPATH`, потім стандартна бібліотека, потім `site-packages` (сюди ставить пакети `pip`).\n- **Перший збіг перемагає.** Знайшов `cola.py` (або теку-пакет `cola/`) — виконує, кладе в `sys.modules`, прив'язує ім'я.\n- **Нічого не знайшов** — `ModuleNotFoundError: No module named 'cola'`.\n\nЗвідси головна пастка новачків: файл `random.py` у твоїй теці стоїть у `sys.path` *раніше* за стандартну бібліотеку і **перекриває** справжній `random`.",
    },
    {
      type: "viz",
      id: "import-search",
      title: "Пошук модуля крок за кроком",
      caption: "Обери, що імпортуємо, і запусти пошук. Увімкни «Мій random.py у теці проєкту», щоб побачити, як власний файл перекриває стандартну бібліотеку — і чому потім `random.randint` раптом «не існує».",
    },
    {
      type: "code",
      title: "Кеш: код модуля виконується один раз",
      code: py`import importlib, sys
from pathlib import Path

lab = Path("lab")
lab.mkdir(exist_ok=True)
(lab / "nital.py").write_text('print("🧪 Варю розчин для відновлення...")\n')
if str(lab) not in sys.path:
    sys.path.insert(0, str(lab))
importlib.invalidate_caches()
sys.modules.pop("nital", None)

import nital           # перший раз — код виконується
import nital           # другий — береться з кешу, тиша
print("nital" in sys.modules)

importlib.reload(nital)  # примусово виконати ще раз`,
      output: py`🧪 Варю розчин для відновлення...
True
🧪 Варю розчин для відновлення...`,
    },
    {
      type: "code",
      title: "sys.path — звичайний список",
      code: py`import sys

print(type(sys.path).__name__)
print(len(sys.path) > 0)

sys.path.append("/home/senku/inventions")  # можна змінювати в рантаймі
print(sys.path[-1])`,
      output: py`list
True
/home/senku/inventions`,
    },
    {
      type: "warning",
      title: "Не називай файли як модулі стандартної бібліотеки",
      md: "Файли `random.py`, `math.py`, `json.py`, `email.py`, `test.py`, `turtle.py` у теці проєкту перекривають справжні модулі. Симптом: `AttributeError: module 'random' has no attribute 'randint'` або дивний circular import. Лікування — перейменуй файл (`my_random.py`) **і видали** папку `__pycache__` поруч.",
    },
    {
      type: "code",
      title: "Модуля немає? Обробляємо акуратно",
      code: py`try:
    import dragon_radar          # такого пакета не існує
except ModuleNotFoundError as err:
    print("Не знайдено:", err.name)
    print(err)

# Класичний патерн «швидка бібліотека, або запасний варіант»
try:
    import ujson as json         # стороння, швидша
except ImportError:
    import json                  # стандартна, є завжди
print(json.dumps({"hero": "Senku", "iq": 10**10}))`,
      output: py`Не знайдено: dragon_radar
No module named 'dragon_radar'
{"hero": "Senku", "iq": 10000000000}`,
    },
    {
      type: "tip",
      title: "python -m — запуск модуля як програми",
      md: "Прапорець `-m` шукає модуль у `sys.path` і запускає його як `__main__`. Купа корисних утиліт уже є в стандартній бібліотеці:\n\n- `python3 -m http.server 8000` — миттєвий вебсервер для поточної теки;\n- `python3 -m json.tool data.json` — гарно відформатувати JSON;\n- `python3 -m timeit \"sum(range(1000))\"` — заміряти швидкість;\n- `python3 -m venv .venv` і `python3 -m pip install …` — про них нижче.",
    },

    // ───────────────────────────── 6. Пакети
    { type: "heading", text: "Пакети: теки з модулями", id: "packages" },
    {
      type: "text",
      md: "Коли модулів стає багато, їх групують у **пакет** — теку, у якій лежать модулі і (зазвичай) файл `__init__.py`. Пакети можна вкладати: `kingdom/science/chemistry.py` імпортується як `kingdom.science.chemistry`.\n\n- `__init__.py` виконується при першому імпорті пакета. Тут можна «підняти» найважливіші імена нагору, щоб писати `from kingdom import make_soap` замість довгого шляху. Може бути й порожнім.\n- **Абсолютний імпорт** — повний шлях від кореня: `from kingdom.chemistry import make_soap`. Рекомендований за замовчуванням.\n- **Відносний імпорт** — від поточного пакета, з крапками: `from .chemistry import make_soap` (та сама тека), `from ..tools import x` (тека вище). Працює *тільки всередині пакетів*.\n- `__all__ = [...]` у модулі визначає, що саме віддає `from module import *`.",
    },
    {
      type: "code",
      title: "Пакет kingdom: відносні й абсолютні імпорти",
      code: py`import importlib, sys
from pathlib import Path

pkg = Path("lab/kingdom")
pkg.mkdir(parents=True, exist_ok=True)
(pkg / "chemistry.py").write_text('''
def make_soap():
    return "🧼 мило (жир + зола)"
''')
(pkg / "physics.py").write_text('''
from .chemistry import make_soap     # відносний: сусідній модуль

def make_lab():
    return f"лабораторія, де вже є {make_soap()}"
''')
(pkg / "__init__.py").write_text('''
from .physics import make_lab         # «піднімаємо» ім'я нагору
__all__ = ["make_lab"]
''')

if "lab" not in sys.path:
    sys.path.insert(0, "lab")
importlib.invalidate_caches()
for name in [m for m in sys.modules if m.startswith("kingdom")]:
    del sys.modules[name]

from kingdom.chemistry import make_soap   # абсолютний шлях
from kingdom import make_lab              # завдяки __init__.py

print(make_soap())
print(make_lab())`,
      output: py`🧼 мило (жир + зола)
лабораторія, де вже є 🧼 мило (жир + зола)`,
    },
    {
      type: "viz",
      id: "package-tree-3d",
      title: "3D-мапа пакета «Королівство Науки»",
      caption: "Покрути пакет і клацни будь-який модуль: побачиш його абсолютний імпорт і відносний імпорт з модуля `kingdom/radio/receiver.py`. Скляні платформи — теки-пакети, кристали — модулі `.py`.",
    },
    {
      type: "table",
      head: ["Звідки імпортуємо", "Абсолютно", "Відносно (з kingdom/radio/receiver.py)"],
      rows: [
        ["Сусідній модуль тієї ж теки", "`from kingdom.radio import antenna`", "`from . import antenna`"],
        ["Функція з сусіднього модуля", "`from kingdom.radio.antenna import tune`", "`from .antenna import tune`"],
        ["Модуль з батьківського пакета", "`from kingdom import config`", "`from .. import config`"],
        ["Модуль із сусіднього підпакета", "`from kingdom.chemistry.soap import make`", "`from ..chemistry.soap import make`"],
      ],
    },
    {
      type: "warning",
      title: "Відносний імпорт у скрипті, запущеному напряму",
      md: "`python3 kingdom/radio/receiver.py` з рядком `from .antenna import tune` впаде з `ImportError: attempted relative import with no known parent package`. Коли файл запущено напряму, він `__main__` і не знає свого пакета. Запускай як модуль від кореня проєкту: `python3 -m kingdom.radio.receiver`.",
    },
    {
      type: "warning",
      title: "Циклічний імпорт",
      md: "Якщо `a.py` імпортує `b`, а `b.py` одразу імпортує `a`, один із них отримає *напівзавантажений* модуль — і ти побачиш `ImportError: cannot import name ... (most likely due to a circular import)`. Лікування: винеси спільне в третій модуль, або імпортуй усередині функції, де воно справді потрібне.",
    },

    // ───────────────────────────── 7. Стандартна бібліотека
    { type: "heading", text: "Стандартна бібліотека: батарейки в комплекті", id: "stdlib" },
    {
      type: "text",
      md: "Сенку мріяв би про таке: сотні модулів, які встановлюються разом із Python. Жодного `pip install` — просто `import`. Перш ніж писати свій велосипед або ставити пакет, перевір, чи немає цього вже в stdlib. На десять мільярдів відсотків — часто є!",
    },
    {
      type: "code",
      title: "Швидкий тур по stdlib",
      code: py`import json, random, string
from datetime import date, timedelta
from collections import Counter

# datetime — дати й інтервали
petrified = date(2019, 4, 1)
print(petrified + timedelta(days=3700 * 365))  # ≈ 3700 років у камені

# random — з seed результат відтворюваний
random.seed(42)
print(random.randint(1, 100), random.choice(["Сенку", "Хром", "Ґен"]))

# json — словник ↔ текст
raw = json.dumps({"invention": "радіо", "year": 5741}, ensure_ascii=False)
print(raw, json.loads(raw)["year"])

# string + Counter — швидкий аналіз
print(string.ascii_uppercase[:5])
print(Counter("sosoru ze").most_common(2))`,
      output: py`5716-10-16
82 Сенку
{"invention": "радіо", "year": 5741} 5741
ABCDE
[('s', 2), ('o', 2)]`,
    },
    {
      type: "table",
      head: ["Модуль", "Для чого", "Приклад"],
      rows: [
        ["`math`, `statistics`", "Математика, середнє, медіана", "`math.isqrt(99)`, `statistics.mean(xs)`"],
        ["`random`", "Випадкові числа і вибір", "`random.choice(heroes)`, `random.shuffle(deck)`"],
        ["`datetime`, `time`", "Дати, час, інтервали, паузи", "`date.today()`, `time.perf_counter()`"],
        ["`pathlib`, `os`, `shutil`", "Файли, теки, шляхи", "`Path(\"lab\") / \"data.txt\"`"],
        ["`json`, `csv`", "Обмін даними", "`json.load(f)`, `csv.DictReader(f)`"],
        ["`collections`", "Counter, defaultdict, deque", "`Counter(words).most_common(3)`"],
        ["`itertools`, `functools`", "Ітератори, кеш, часткові функції", "`itertools.pairwise(xs)`, `@cache`"],
        ["`re`", "Регулярні вирази", "`re.findall(r\"\\d+\", text)`"],
        ["`sys`", "Інтерпретатор: path, argv, exit", "`sys.argv[1:]`, `sys.exit(1)`"],
        ["`argparse`, `logging`", "CLI-аргументи, журнали", "`logging.info(\"старт\")`"],
        ["`importlib`", "Динамічні імпорти, reload", "`importlib.import_module(name)`"],
      ],
    },
    {
      type: "code",
      title: "Імпорт за ім'ям у рядку",
      code: py`import importlib

for name in ["math", "json", "cola_formula"]:
    try:
        mod = importlib.import_module(name)
        print(f"✅ {name}: {mod.__name__}")
    except ModuleNotFoundError:
        print(f"❌ {name}: ще не винайшли")`,
      output: py`✅ math: math
✅ json: json
❌ cola_formula: ще не винайшли`,
    },
    {
      type: "tip",
      title: "Порядок імпортів за PEP 8",
      md: "Імпорти — на самому верху файлу, групами через порожній рядок: **1)** стандартна бібліотека, **2)** сторонні пакети (`requests`, `numpy`), **3)** твої модулі. Усередині групи — за алфавітом. Інструменти `ruff` (правило `I`) або `isort` сортують їх автоматично.",
    },

    // ───────────────────────────── 8. pip
    { type: "heading", text: "pip і PyPI: склад чужих винаходів", id: "pip" },
    {
      type: "text",
      md: "Коли stdlib не вистачає, йдемо на [PyPI](https://pypi.org) — Python Package Index, де лежать сотні тисяч пакетів: `requests` для HTTP, `numpy` для обчислень, `pandas` для таблиць, `rich` для красивого терміналу. Встановлює їх утиліта **pip**.\n\nПакет потрапляє в теку `site-packages` того Python, яким ти запустив pip. Тому **золоте правило**: запускай pip через потрібний інтерпретатор — `python3 -m pip`, а не просто `pip`. Так ти точно знаєш, куди ставиться пакет.",
    },
    {
      type: "code",
      title: "Основні команди pip (термінал)",
      code: py`python3 -m pip install requests          # встановити останню версію
python3 -m pip install "requests==2.32.3" # конкретну версію
python3 -m pip install -U requests        # оновити
python3 -m pip show requests              # версія, залежності, шлях
python3 -m pip list                       # що встановлено
python3 -m pip uninstall requests         # видалити

python3 -m pip freeze > requirements.txt  # зафіксувати версії
python3 -m pip install -r requirements.txt  # відтворити на іншому ПК`,
      runnable: false,
    },
    {
      type: "code",
      title: "requirements.txt — рецепт середовища",
      code: py`# requirements.txt
requests==2.32.3
rich>=13.0,<14
python-dotenv~=1.0   # сумісні 1.x`,
      runnable: false,
    },
    {
      type: "tip",
      title: "Ім'я пакета ≠ ім'я модуля",
      md: "Встановлюєш одне, імпортуєш інше: `pip install pillow` → `import PIL`, `pip install beautifulsoup4` → `import bs4`, `pip install scikit-learn` → `import sklearn`, `pip install python-dotenv` → `import dotenv`. Якщо `import` не працює одразу після встановлення — перевір ім'я на сторінці пакета на PyPI.",
    },

    // ───────────────────────────── 9. venv
    { type: "heading", text: "Віртуальні середовища: окрема лабораторія на кожен проєкт", id: "venv" },
    {
      type: "text",
      md: "Уяви: проєкту «Радіо» потрібен `requests 2.31`, а проєкту «Смартфон» — `requests 2.32`. Якщо ставити все в один глобальний Python, проєкти почнуть ламати один одного. А ще можна випадково зламати системний Python macOS чи Linux.\n\n**Віртуальне середовище** (`venv`) — ізольована копія інтерпретатора зі *своєю* текою `site-packages`. Кожен проєкт — своя лабораторія зі своїми реактивами:\n\n- `python3 -m venv .venv` — створити (тека `.venv` у корені проєкту);\n- **активувати** — після цього `python` і `pip` у терміналі вказують на середовище;\n- ставити пакети — вони потрапляють лише в `.venv`;\n- `deactivate` — вийти.\n\nТеку `.venv` **не комітять** у git (додай у `.gitignore`), а комітять `requirements.txt`, з якого будь-хто відтворить середовище.",
    },
    {
      type: "code",
      title: "Життєвий цикл venv (термінал)",
      code: py`# 1. створити
python3 -m venv .venv

# 2. активувати
source .venv/bin/activate        # macOS / Linux
.venv\Scripts\activate           # Windows (PowerShell / cmd)

# 3. працювати — (.venv) у промпті означає, що ти всередині
(.venv) $ python -m pip install requests rich
(.venv) $ python -m pip freeze > requirements.txt

# 4. вийти
(.venv) $ deactivate`,
      runnable: false,
    },
    {
      type: "viz",
      id: "venv-islands-3d",
      title: "3D: острови віртуальних середовищ",
      caption: "Клацни острів, щоб **активувати** його середовище, і встанови пакет — він з'явиться лише на активному острові. Глобальний Python у центрі лишається чистим. Так кожен проєкт має власні версії бібліотек.",
    },
    {
      type: "code",
      title: "Я всередині venv?",
      code: py`import sys

in_venv = sys.prefix != sys.base_prefix
print("Інтерпретатор:", sys.executable)
print("У віртуальному середовищі:", in_venv)`,
    },
    {
      type: "warning",
      title: "«Я ж встановив пакет, а import не працює!»",
      md: "У 90% випадків pip поставив пакет в *інший* Python: забув активувати `.venv`, або редактор (VS Code, PyCharm) використовує інший інтерпретатор. Перевір `python3 -c \"import sys; print(sys.executable)\"` і вибери правильний інтерпретатор у редакторі. Ставити пакети завжди через `python -m pip`.",
    },
    {
      type: "tip",
      title: "uv — швидкий сучасний менеджер",
      md: "[uv](https://docs.astral.sh/uv/) робить те саме, що `venv` + `pip`, але в 10–100 разів швидше: `uv venv`, `uv pip install requests`, а для проєктів — `uv init` і `uv add requests` (версії фіксуються в `uv.lock`). Базу (`venv` і `pip`) все одно варто розуміти — uv працює на тих самих ідеях.",
    },
    {
      type: "joke",
      md: "Ставити всі пакети в глобальний Python — це як змішати всі реактиви Королівства Науки в одному казані. Вибухне на десять мільярдів відсотків. Кожному проєкту — окрема колба `.venv`! ⚗️",
    },

    // ───────────────────────────── 10. Перевір себе
    { type: "heading", text: "Перевір себе", id: "quiz" },
    {
      type: "quiz",
      question: "У модулі `cola.py` на верхньому рівні стоїть `print(\"Шипить!\")`. Скільки разів він надрукує, якщо в `main.py` тричі написати `import cola`?",
      options: ["0 разів", "1 раз", "3 рази", "Буде помилка"],
      answer: 1,
      explain: "Перший `import` виконує модуль і кладе його в `sys.modules`. Наступні імпорти беруть готовий об'єкт з кешу без повторного виконання коду. Змусити перевиконати можна через `importlib.reload(cola)`.",
    },
    {
      type: "quiz",
      question: "Файл `tools.py` імпортовано з `main.py`. Яке значення має `__name__` *всередині* `tools.py`?",
      options: ["\"__main__\"", "\"tools\"", "\"tools.py\"", "\"main\""],
      answer: 1,
      explain: "При імпорті `__name__` дорівнює імені модуля — `\"tools\"`. Значення `\"__main__\"` отримує лише файл, який запустили напряму. Тому блок `if __name__ == \"__main__\":` при імпорті пропускається.",
    },
    {
      type: "quiz",
      question: "У теці проєкту лежить твій файл `random.py`. Що станеться з `import random` у `main.py` поруч?",
      options: [
        "Python імпортує стандартний random, бо він «важливіший»",
        "Імпортується твій random.py, бо тека скрипта стоїть у sys.path першою",
        "Буде SyntaxError",
        "Python об'єднає обидва модулі",
      ],
      answer: 1,
      explain: "`sys.path` перебирається по порядку, і тека запущеного скрипта — на першому місці. Твій файл перекриває стандартний модуль, і `random.randint` раптом «зникає». Не називай файли як модулі stdlib.",
    },
    {
      type: "quiz",
      question: "Чому краще писати `python3 -m pip install rich`, ніж просто `pip install rich`?",
      options: [
        "Так пакет встановлюється швидше",
        "Так гарантовано ставиш пакет саме для цього інтерпретатора python3",
        "Звичайний pip не вміє ставити пакети",
        "Так пакет потрапляє в стандартну бібліотеку",
      ],
      answer: 1,
      explain: "Команда `pip` у PATH може належати зовсім іншому Python (системному, старому, іншому venv). `python3 -m pip` запускає pip *саме того* інтерпретатора, яким ти потім запускатимеш код.",
    },
    {
      type: "tip",
      title: "Шпаргалка на одну колбу",
      md: "- `import x` — чисто і явно; `from x import y` — коротко; `as` — для довгих імен.\n- Код модуля виконується **один раз**, далі — кеш `sys.modules`.\n- Пошук: `sys.modules` → `sys.path` по порядку → `ModuleNotFoundError`.\n- `if __name__ == \"__main__\": main()` — у кожному скрипті.\n- Новий проєкт → `python3 -m venv .venv` → активувати → `python -m pip install …` → `pip freeze > requirements.txt`.",
    },
  ],
};

export default section;
