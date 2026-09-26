import type { Section } from "../types";

/** Код Python пишемо через String.raw — бекслеші лишаються як у Python. */
const py = String.raw;

const section: Section = {
  "slug": "pythonic",
  "title": "Pythonic стиль і лайфхаки",
  "short": "PEP 8, типи, трюки",
  "icon": "✨",
  "group": "Просунуто",
  "summary": "PEP 8 і читабельність, анотації типів, f-string трюки, розпакування, collections, pathlib, enumerate/zip, дебаг та найкращі лайфхаки Python.",
  "hero": {
    "name": "Джотаро Куджо",
    "universe": "JoJo's Bizarre Adventure",
    "emoji": "⭐",
    "quote": "Yare yare daze... Твій код не pythonic. Star Platinum: The World!",
    "why": "Стенд Джотаро — точний і елегантний. Pythonic-код такий самий: мінімум рухів, максимум сили."
  },
  "theme": {
    "accent": "#8b5cf6",
    "accent2": "#ec4899",
    "glow": "#7c3aed"
  },
  "minutes": 16,
  "order": 18,
  "blocks": [
    // ───────────────────────────── 1. Що таке pythonic
    { type: "heading", text: "Що означає «pythonic»", id: "what" },
    {
      type: "text",
      md: "Код може *працювати* — і водночас бути незграбним, як удар новачка. А може працювати й **читатися як проза**. Друге в спільноті Python називають **pythonic**: код, що використовує сильні сторони мови замість того, щоб перекладати на Python звички з C чи Java.\n\nStar Platinum б'є не найсильніше, а *найточніше*: жодного зайвого руху. Pythonic-код такий самий:\n\n- **читабельність важливіша за хитромудрість** — код читають у 10 разів частіше, ніж пишуть;\n- **вбудовані інструменти** (`enumerate`, `zip`, `sum`, `any`, `collections`) замість ручних циклів з лічильниками;\n- **явне краще за неявне** — ніякої магії, яку треба розгадувати.\n\nФілософію мови зібрано в «Дзені Python» — 19 афоризмів Тіма Пітерса. Він вбудований прямо в інтерпретатор.",
    },
    {
      type: "code",
      title: "Дзен Python (перші рядки)",
      code: py`import this`,
      output: py`The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
...`,
      runnable: false,
    },
    {
      type: "viz",
      id: "ora-refactor",
      title: "ORA ORA-рефакторинг: від «працює» до «pythonic»",
      caption: "Кожен удар Star Platinum — одне pythonic-перетворення. Проходь покроково й дивись, як 10 рядків у стилі C стискаються до 3 чистих рядків, які роблять **те саме** (вивід праворуч не змінюється).",
    },

    // ───────────────────────────── 2. PEP 8
    { type: "heading", text: "PEP 8: єдиний стиль для всіх Стендів", id: "pep8" },
    {
      type: "text",
      md: "[PEP 8](https://peps.python.org/pep-0008/) — офіційний посібник зі стилю коду Python. Він не робить програму швидшою, але робить **будь-який** Python-код схожим на твій — і навпаки. Головне:\n\n- **Відступ — 4 пробіли**, ніяких табів.\n- **Імена**: `snake_case` для змінних і функцій, `CapWords` для класів, `UPPER_SNAKE_CASE` для констант, `_name` — «внутрішнє, не чіпай».\n- **Пробіли** навколо `=` і операторів (`x = a + b`), після коми, але **не** всередині дужок і не навколо `=` у іменованих аргументах (`f(x, key=1)`).\n- **Довжина рядка** — до 79 (спільнота часто бере 88–100). Довгі вирази переносимо всередині дужок.\n- **Дві порожні лінії** між функціями й класами верхнього рівня, одна — між методами.\n- **Імпорти** — нагорі файлу, по одному модулю на рядок.",
    },
    {
      type: "compare",
      title: "Той самий код — інший рівень",
      bad: {
        label: "Працює, але очі болять",
        code: py`def CalcDmg( Power,Speed ):
  x=Power*2+Speed
  if(x>100): return 'ORA'*3
  else : return 'ora'
StandList=['Star Platinum' ,'The World']`,
      },
      good: {
        label: "PEP 8",
        code: py`def calc_damage(power, speed):
    damage = power * 2 + speed
    if damage > 100:
        return "ORA" * 3
    return "ora"


stand_names = ["Star Platinum", "The World"]`,
      },
      note: "Не форматуй вручну: `ruff format` (або `black`) вирівнює код за пів секунди, а `ruff check` знаходить сотні проблем — від невикористаних імпортів до небезпечних порівнянь. Налаштуй «format on save» у редакторі й забудь про суперечки щодо пробілів.",
    },
    {
      type: "code",
      title: "Імена за PEP 8",
      code: py`MAX_POWER = 9000                    # константа — UPPER_SNAKE_CASE


class StandUser:                    # клас — CapWords
    def __init__(self, name, stand):
        self.name = name            # атрибути — snake_case
        self.stand = stand
        self._secret_move = "ORA"   # _ спереду — внутрішнє

    def summon_stand(self):         # методи — snake_case
        return f"{self.name}: {self.stand}!"


jotaro = StandUser("Jotaro", "Star Platinum")
print(jotaro.summon_stand())
print(MAX_POWER > 8000)`,
      output: py`Jotaro: Star Platinum!
True`,
    },
    {
      type: "warning",
      title: "Не перекривай вбудовані імена",
      md: "`list = [1, 2]`, `sum = 0`, `id = 5`, `str = \"hi\"`, `input = ...` — і вбудована функція зникає до кінця файлу. Потім `list(\"abc\")` падає з `TypeError: 'list' object is not callable`. Бери змістовні імена: `scores`, `total`, `user_id`, `text`. Якщо дуже хочеться — додай підкреслення в кінці: `type_`, `id_`.",
    },
    {
      type: "joke",
      md: "Yare yare daze… Змінна `l` поруч з `1` і `I`? Навіть Star Platinum з його зором не розрізнить. PEP 8 теж забороняє такі імена. ⭐",
    },

    // ───────────────────────────── 3. Типи
    { type: "heading", text: "Анотації типів: підказки для людей і редактора", id: "types" },
    {
      type: "text",
      md: "З Python 3.5 можна підписувати, *що* очікує функція і *що* повертає. Це **анотації типів** (type hints):\n\n- `name: str` — параметр; `-> str` — тип результату;\n- колекції: `list[int]`, `dict[str, float]`, `tuple[int, int]`, `set[str]`;\n- «або»: `int | None` (Python 3.10+), `str | int`;\n- змінні теж можна: `score: int = 0`.\n\n**Важливо:** Python під час виконання анотації **не перевіряє**. Їх читають редактор (автодоповнення, підсвічування помилок) і статичні аналізатори — `mypy`, `pyright`. Це як оцінки Стенда (Power: A, Speed: A) — вони нічого не роблять самі, але одразу кажуть, чого чекати.",
    },
    {
      type: "code",
      title: "Підписуємо функції",
      code: py`def punch(target: str, times: int = 3) -> str:
    return f"{'ORA ' * times}→ {target}"


def find_stand(user: str, registry: dict[str, str]) -> str | None:
    return registry.get(user)       # None, якщо не знайдено


stands: dict[str, str] = {"Jotaro": "Star Platinum", "Dio": "The World"}

print(punch("Dio"))
print(find_stand("Dio", stands))
print(find_stand("Speedwagon", stands))
print(punch.__annotations__)`,
      output: py`ORA ORA ORA → Dio
The World
None
{'target': <class 'str'>, 'times': <class 'int'>, 'return': <class 'str'>}`,
    },
    {
      type: "code",
      title: "Анотації — не охоронці",
      code: py`def double(x: int) -> int:
    return x * 2


print(double(21))
print(double("ORA"))   # Python не заперечує! mypy — заперечить`,
      output: py`42
ORAORA`,
    },
    {
      type: "tip",
      title: "Коли анотації окупаються",
      md: "Підписуй **публічні функції** й усе, що приймає складні структури (`dict[str, list[int]]`). Для локальних змінних анотації зазвичай зайві — тип і так видно. Перевіряй проєкт командою `mypy .` або вбудованим Pylance у VS Code: він підкреслить `double(\"ORA\")` ще до запуску.",
    },

    // ───────────────────────────── 4. f-string
    { type: "heading", text: "f-string: форматування зі швидкістю Star Platinum", id: "fstrings" },
    {
      type: "text",
      md: "`f\"...\"` — найшвидший і найчитабельніший спосіб зібрати рядок. Усередині `{}` — будь-який вираз, а після двокрапки — **специфікація формату** (format spec) — міні-мова для чисел і вирівнювання:\n\n`{значення:[заповнювач][вирівнювання][ширина][,][.точність][тип]}`\n\nЗапам'ятай кілька «прийомів» — і забудеш про `round()` + `str()` + ручні пробіли.",
    },
    {
      type: "code",
      title: "Основні прийоми format spec",
      code: py`name = "Jotaro"
power = 1234567.891
ratio = 0.877

print(f"{name=}")              # дебаг: ім'я і значення
print(f"{power:,.2f}")         # тисячі + 2 знаки
print(f"{power:_.0f}")         # роздільник _
print(f"{ratio:.1%}")          # відсотки
print(f"[{name:>10}]")         # праворуч, ширина 10
print(f"[{name:<10}]")         # ліворуч
print(f"[{name:*^12}]")        # по центру, заповнення *
print(f"{255:b} {255:o} {255:x} {255:#X}")
print(f"{7:03d}")              # нулі попереду
print(f"{power:.3e}")          # експоненційний запис`,
      output: py`name='Jotaro'
1,234,567.89
1_234_568
87.7%
[    Jotaro]
[Jotaro    ]
[***Jotaro***]
11111111 377 ff 0XFF
007
1.235e+06`,
    },
    {
      type: "viz",
      id: "fstring-lab",
      title: "Лабораторія format spec",
      caption: "Збери специфікацію з деталей: вирівнювання, заповнювач, ширина, роздільник, точність і тип. Результат рахується за правилами Python — пробіли підсвічено крапками, а рамка показує ширину поля.",
    },
    {
      type: "code",
      title: "Ще кілька f-string суперсил",
      code: py`from datetime import datetime

stand = "Star Platinum"
width = 17
moment = datetime(1989, 1, 1, 13, 37)
hp = 42

print(f"{stand!r}")                    # repr: з лапками
print(f"|{stand:^{width}}|")           # ширина зі змінної
print(f"{moment:%d.%m.%Y %H:%M}")      # формат дати
print(f"{len(stand) * 2 = }")          # = з виразом і пробілами
print(f"HP: {hp:>4} {'💀' if hp < 50 else '💪'}")`,
      output: py`'Star Platinum'
|  Star Platinum  |
01.01.1989 13:37
len(stand) * 2 = 26
HP:   42 💀`,
    },
    {
      type: "table",
      head: ["Специфікація", "Що робить", "Приклад → результат"],
      rows: [
        ["`:.2f`", "2 знаки після коми", "`f\"{3.14159:.2f}\"` → `3.14`"],
        ["`:,` / `:_`", "Роздільник тисяч", "`f\"{1234567:,}\"` → `1,234,567`"],
        ["`:.0%`", "Відсотки", "`f\"{0.25:.0%}\"` → `25%`"],
        ["`:>8` `:<8` `:^8`", "Вирівнювання в полі ширини 8", "`f\"{'ab':^6}\"` → `  ab  `"],
        ["`:*^9`", "Заповнювач + вирівнювання", "`f\"{'ab':*^6}\"` → `**ab**`"],
        ["`:05d`", "Нулі попереду", "`f\"{42:05d}\"` → `00042`"],
        ["`:b` `:x` `:#x`", "Двійкова, 16-кова, з префіксом", "`f\"{10:#x}\"` → `0xa`"],
        ["`:e`", "Експонента", "`f\"{1500:.1e}\"` → `1.5e+03`"],
        ["`!r`", "`repr()` значення", "`f\"{'hi'!r}\"` → `'hi'`"],
        ["`=`", "Самодокументування", "`f\"{x=}\"` → `x=5`"],
      ],
    },
    {
      type: "tip",
      title: "Підкреслення в числах",
      md: "Пиши великі числа як `1_000_000` замість `1000000` — Python ігнорує `_`, а око миттєво бачить мільйон. А щоб *вивести* так само: `f\"{n:_}\"` або `f\"{n:,}\"`.",
    },

    // ───────────────────────────── 5. Розпакування
    { type: "heading", text: "Розпакування: удар по кількох цілях одразу", id: "unpacking" },
    {
      type: "text",
      md: "Розпакування — це присвоєння «за формою»: зліва стільки імен, скільки елементів праворуч. Воно прибирає індекси `[0]`, `[1]`, `[-1]`, які нічого не кажуть читачу.\n\n- `a, b = b, a` — обмін без тимчасової змінної;\n- `first, *rest = items` — зірочка збирає «все інше» в **список** (навіть порожній);\n- `_` — умовне ім'я для «це мені не потрібно»;\n- `*` і `**` також розпаковують колекції у виклики функцій і літерали.",
    },
    {
      type: "code",
      title: "Розпакування в присвоєнні",
      code: py`a, b = "Jotaro", "Dio"
a, b = b, a                      # обмін
print(a, b)

first, *middle, last = [1, 2, 3, 4, 5]
print(first, middle, last)

*_, final_boss = ["Kakyoin", "Polnareff", "Avdol", "Dio"]
print(final_boss)

(x, y), z = (3, 4), 5            # вкладене
print(x, y, z)

name, _, stand = ("Jotaro", 17, "Star Platinum")
print(name, "→", stand)`,
      output: py`Dio Jotaro
1 [2, 3, 4] 5
Dio
3 4 5
Jotaro → Star Platinum`,
    },
    {
      type: "viz",
      id: "unpack-lab",
      title: "Розпакування наживо",
      caption: "Обери шаблон і змінюй кількість елементів. Дивись, куди «летить» кожне значення, що потрапляє в `*зірочку` і коли Python кидає `ValueError`.",
    },
    {
      type: "code",
      title: "* і ** у викликах та літералах",
      code: py`team = ["Jotaro", "Joseph"]
more = ["Kakyoin", "Polnareff"]

print(*team, sep=" & ")                 # розпакували в аргументи
crusaders = [*team, *more, "Avdol"]     # склеїли списки
print(crusaders)

base = {"power": "A", "speed": "A"}
extra = {"range": "C", "speed": "A+"}
print({**base, **extra})                # злиття: правий перемагає
print(base | extra)                     # те саме, Python 3.9+


def attack(user, stand, move):
    return f"{user} + {stand}: {move}!"


args = ("Jotaro", "Star Platinum")
kwargs = {"move": "ORA ORA"}
print(attack(*args, **kwargs))`,
      output: py`Jotaro & Joseph
['Jotaro', 'Joseph', 'Kakyoin', 'Polnareff', 'Avdol']
{'power': 'A', 'speed': 'A+', 'range': 'C'}
{'power': 'A', 'speed': 'A+', 'range': 'C'}
Jotaro + Star Platinum: ORA ORA!`,
    },

    // ───────────────────────────── 6. enumerate / zip / вбудовані
    { type: "heading", text: "enumerate, zip і вбудовані суперсили", id: "builtins" },
    {
      type: "text",
      md: "Якщо ти пишеш `for i in range(len(items))` — зупинись. Це «акцент» з інших мов. У Python:\n\n- `enumerate(items, start=1)` — дає пари *(номер, елемент)*;\n- `zip(a, b)` — іде по кількох колекціях паралельно, видаючи кортежі;\n- `dict(zip(keys, values))` — словник з двох списків в один рядок;\n- `zip(*matrix)` — транспонування таблиці.\n\nА ще — `sum`, `min`, `max`, `sorted` з параметром `key`, і `any` / `all`, які зупиняються, щойно відповідь відома.",
    },
    {
      type: "code",
      title: "enumerate і zip",
      code: py`crusaders = ["Jotaro", "Kakyoin", "Polnareff"]
stands = ["Star Platinum", "Hierophant Green", "Silver Chariot"]

for i, name in enumerate(crusaders, start=1):
    print(i, name)

for name, stand in zip(crusaders, stands):
    print(f"{name:<10} → {stand}")

roster = dict(zip(crusaders, stands))
print(roster["Kakyoin"])

matrix = [[1, 2, 3], [4, 5, 6]]
print(list(zip(*matrix)))              # транспонування`,
      output: py`1 Jotaro
2 Kakyoin
3 Polnareff
Jotaro     → Star Platinum
Kakyoin    → Hierophant Green
Polnareff  → Silver Chariot
Hierophant Green
[(1, 4), (2, 5), (3, 6)]`,
    },
    {
      type: "viz",
      id: "zip-3d",
      title: "3D: zip, zip_longest і enumerate",
      caption: "Дві доріжки кубиків — два списки. Перемикай режим і змінюй довжини: `zip` з'єднує пари, поки не скінчиться *коротший* список, `zip_longest` доповнює пропуски `fillvalue`, а `enumerate` додає доріжку номерів. Клацни пару, щоб побачити кортеж.",
    },
    {
      type: "code",
      title: "Пастка: zip мовчки обрізає",
      code: py`from itertools import zip_longest

names = ["Jotaro", "Dio", "Joseph"]
ages = [17, 122]

print(list(zip(names, ages)))                   # Joseph зник!
print(list(zip_longest(names, ages, fillvalue="?")))

try:
    list(zip(names, ages, strict=True))         # Python 3.10+
except ValueError as e:
    print("ValueError:", e)`,
      output: py`[('Jotaro', 17), ('Dio', 122)]
[('Jotaro', 17), ('Dio', 122), ('Joseph', '?')]
ValueError: zip() argument 2 is shorter than argument 1`,
    },
    {
      type: "flow",
      title: "Як zip збирає пари",
      nodes: [
        { id: "s", kind: "start", label: "zip(names, ages)", col: 0, row: 0 },
        { id: "a", kind: "decision", label: "a = next(it1)\nвдалося?", col: 0, row: 1 },
        { id: "b", kind: "decision", label: "b = next(it2)\nвдалося?", col: 0, row: 2 },
        { id: "y", kind: "io", label: "видати (a, b)", col: 0, row: 3 },
        { id: "e", kind: "end", label: "StopIteration", col: 1, row: 4 },
      ],
      edges: [
        { from: "s", to: "a" },
        { from: "a", to: "b", label: "Так" },
        { from: "a", to: "e", label: "Ні", side: "right" },
        { from: "b", to: "y", label: "Так" },
        { from: "b", to: "e", label: "Ні", side: "right" },
        { from: "y", to: "a", side: "left" },
      ],
      scenarios: [
        {
          name: "3 імені, 2 віки",
          steps: [
            { node: "s", note: "`names = ['Jotaro', 'Dio', 'Joseph']`, `ages = [17, 122]`" },
            { node: "a", note: "`a = 'Jotaro'`" },
            { node: "b", note: "`b = 17`" },
            { node: "y", note: "пара `('Jotaro', 17)`" },
            { node: "a", note: "`a = 'Dio'`" },
            { node: "b", note: "`b = 122`" },
            { node: "y", note: "пара `('Dio', 122)`" },
            { node: "a", note: "`a = 'Joseph'` — вже *забрано* з першого списку" },
            { node: "b", note: "`ages` вичерпано → **Ні**" },
            { node: "e", note: "кінець: `'Joseph'` мовчки загубився. Результат `[('Jotaro', 17), ('Dio', 122)]`" },
          ],
        },
        {
          name: "1 ім'я, 2 віки",
          steps: [
            { node: "s", note: "`names = ['Jotaro']`, `ages = [17, 122]`" },
            { node: "a", note: "`a = 'Jotaro'`" },
            { node: "b", note: "`b = 17`" },
            { node: "y", note: "пара `('Jotaro', 17)`" },
            { node: "a", note: "`names` вичерпано → **Ні**" },
            { node: "e", note: "`122` навіть не читався. Результат `[('Jotaro', 17)]`" },
          ],
        },
      ],
      caption: "`zip` зупиняється на *першому* вичерпаному ітераторі. Хочеш помилку замість тиші — `strict=True`; хочеш доповнення — `zip_longest`.",
    },
    {
      type: "code",
      title: "key=, sum, any, all",
      code: py`power = {"Star Platinum": 95, "The World": 95, "Hermit Purple": 40, "Magician's Red": 80}

print(max(power, key=power.get))                       # ключ з max значенням
print(sorted(power, key=power.get, reverse=True)[:2])  # топ-2
print(sorted(power.items(), key=lambda kv: (-kv[1], kv[0])))
print(sum(v for v in power.values() if v > 50))
print(any(v > 90 for v in power.values()), all(v > 50 for v in power.values()))`,
      output: py`Star Platinum
['Star Platinum', 'The World']
[('Star Platinum', 95), ('The World', 95), ("Magician's Red", 80), ('Hermit Purple', 40)]
270
True False`,
    },
    {
      type: "compare",
      title: "Цикл з лічильником проти вбудованих",
      bad: {
        label: "Стиль C: range(len(...)) і прапорці",
        code: py`found = False
for i in range(len(stands)):
    if stands[i] == "The World":
        found = True
        break

total = 0
for i in range(len(prices)):
    total = total + prices[i]`,
      },
      good: {
        label: "Pythonic",
        code: py`found = "The World" in stands

total = sum(prices)`,
      },
      note: "Оператор `in` і вбудовані функції написані на C — вони не лише коротші, а й **швидші** за ручні цикли.",
    },
    {
      type: "joke",
      hero: "Джозеф Джостар",
      md: "Твій наступний рядок буде: «Навіщо я писав `for i in range(len(names))`, якщо є `enumerate`?!» 🎩 …Бачиш? Джостари завжди вгадують.",
    },

    // ───────────────────────────── 7. collections
    { type: "heading", text: "collections: спецзагін структур даних", id: "collections" },
    {
      type: "text",
      md: "Модуль `collections` — це Стенди для звичайних колекцій. Кожен має одну суперздібність:\n\n- **`Counter`** — рахує елементи: `Counter(words).most_common(3)`. Відсутній ключ → `0`, а не `KeyError`.\n- **`defaultdict`** — словник, що сам створює значення за замовчуванням: ідеальний для групування.\n- **`namedtuple`** — кортеж з іменованими полями: `point.x` замість `point[0]`.\n- **`deque`** — черга з двома кінцями: `append`/`popleft` за O(1), а `maxlen` робить з неї «останні N подій».",
    },
    {
      type: "code",
      title: "Counter — лічильник ударів",
      code: py`from collections import Counter

battle_cry = "ora ora ora muda muda ora"
hits = Counter(battle_cry.split())

print(hits)
print(hits.most_common(1))
print(hits["muda"], hits["yare"])        # відсутній ключ → 0

hits.update(["muda", "muda", "muda"])
print(hits.most_common())`,
      output: py`Counter({'ora': 4, 'muda': 2})
[('ora', 4)]
2 0
[('muda', 5), ('ora', 4)]`,
    },
    {
      type: "flow",
      title: "Що Counter робить за тебе",
      nodes: [
        { id: "s", kind: "start", label: "Counter(words)", col: 0, row: 0 },
        { id: "init", kind: "process", label: "counts = {}", col: 0, row: 1 },
        { id: "more", kind: "decision", label: "є ще слово w?", col: 0, row: 2 },
        { id: "has", kind: "decision", label: "w in counts?", col: 0, row: 3 },
        { id: "zero", kind: "process", label: "counts[w] = 0", col: 1, row: 4 },
        { id: "inc", kind: "process", label: "counts[w] += 1", col: 0, row: 5 },
        { id: "e", kind: "end", label: "return counts", col: 2, row: 3 },
      ],
      edges: [
        { from: "s", to: "init" },
        { from: "init", to: "more" },
        { from: "more", to: "has", label: "Так" },
        { from: "more", to: "e", label: "Ні", side: "right" },
        { from: "has", to: "inc", label: "Так" },
        { from: "has", to: "zero", label: "Ні", side: "right" },
        { from: "zero", to: "inc" },
        { from: "inc", to: "more", side: "left" },
      ],
      scenarios: [
        {
          name: "\"ora ora muda\"",
          steps: [
            { node: "s", note: "`words = ['ora', 'ora', 'muda']`" },
            { node: "init", note: "`counts = {}`" },
            { node: "more", note: "`w = 'ora'`" },
            { node: "has", note: "`'ora'` ще нема → **Ні**" },
            { node: "zero", note: "`counts = {'ora': 0}`" },
            { node: "inc", note: "`counts = {'ora': 1}`" },
            { node: "more", note: "`w = 'ora'`" },
            { node: "has", note: "вже є → **Так**" },
            { node: "inc", note: "`counts = {'ora': 2}`" },
            { node: "more", note: "`w = 'muda'`" },
            { node: "has", note: "нема → **Ні**" },
            { node: "zero", note: "`counts = {'ora': 2, 'muda': 0}`" },
            { node: "inc", note: "`counts = {'ora': 2, 'muda': 1}`" },
            { node: "more", note: "слова скінчились → **Ні**" },
            { node: "e", note: "`Counter({'ora': 2, 'muda': 1})`" },
          ],
        },
      ],
      caption: "Уся ця розвилка «є ключ чи ні» ховається всередині `Counter`: відсутній ключ дає `0`, тож `hits[w] += 1` працює одразу.",
    },
    {
      type: "viz",
      id: "counter-3d",
      title: "3D-гістограма Counter",
      caption: "Обери бойовий клич і дивись, як `Counter` будує стовпчики. Режим «символи» рахує літери, «слова» — слова. Верхні три стовпці світяться — це `most_common(3)`. Клацни стовпчик, щоб побачити `hits[key]`.",
    },
    {
      type: "code",
      title: "defaultdict — групування без if",
      code: py`from collections import defaultdict

sightings = [
    ("Jotaro", "Star Platinum"),
    ("Dio", "The World"),
    ("Jotaro", "Star Platinum: The World"),
    ("Joseph", "Hermit Purple"),
]

by_user = defaultdict(list)          # нового ключа → порожній список
for user, stand in sightings:
    by_user[user].append(stand)

print(dict(by_user))`,
      output: py`{'Jotaro': ['Star Platinum', 'Star Platinum: The World'], 'Dio': ['The World'], 'Joseph': ['Hermit Purple']}`,
    },
    {
      type: "code",
      title: "namedtuple і deque",
      code: py`from collections import deque, namedtuple

Stand = namedtuple("Stand", ["name", "power", "speed"])
sp = Stand("Star Platinum", "A", "A")
print(sp)
print(sp.name, sp[1])

recent = deque(maxlen=3)             # пам'ятає лише 3 останні
for move in ["ORA", "MUDA", "ORA", "ZA WARUDO", "ORA"]:
    recent.append(move)
print(recent)

recent.appendleft("YARE")            # найстаріший справа випадає
print(list(recent))`,
      output: py`Stand(name='Star Platinum', power='A', speed='A')
Star Platinum A
deque(['ORA', 'ZA WARUDO', 'ORA'], maxlen=3)
['YARE', 'ORA', 'ZA WARUDO']`,
    },
    {
      type: "tip",
      title: "Групування без імпортів",
      md: "Якщо `defaultdict` здається зайвим — звичайний словник має `setdefault`: `groups.setdefault(user, []).append(stand)`. А для підрахунку — `counts[key] = counts.get(key, 0) + 1`. Але для частот `Counter` усе одно найчитабельніший.",
    },

    // ───────────────────────────── 8. pathlib
    { type: "heading", text: "pathlib та ідіоми профі", id: "pathlib-idioms" },
    {
      type: "text",
      md: "Забудь про склеювання шляхів рядками (`\"data\" + \"/\" + name`) — на Windows інший роздільник, і все ламається. `pathlib.Path` — це шлях-об'єкт:\n\n- оператор `/` склеює частини: `Path(\"data\") / \"notes\" / \"day.txt\"`;\n- властивості `.name`, `.stem`, `.suffix`, `.parent`;\n- методи `.exists()`, `.mkdir(parents=True, exist_ok=True)`, `.read_text()`, `.write_text()`, `.glob(\"*.txt\")`;\n- `Path.home()`, `Path.cwd()` — домашня та поточна тека.",
    },
    {
      type: "code",
      title: "Щоденник подорожі до Єгипту",
      code: py`from pathlib import Path

base = Path("egypt_trip")
diary = base / "notes" / "day_50.txt"

print(diary)
print(diary.name, diary.stem, diary.suffix)
print(diary.parent)

diary.parent.mkdir(parents=True, exist_ok=True)
diary.write_text("Yare yare daze.\nDio близько.\n", encoding="utf-8")
(base / "notes" / "day_51.txt").write_text("ORA!", encoding="utf-8")

print(diary.exists())
print(diary.read_text(encoding="utf-8").splitlines())
print(sorted(p.name for p in base.glob("notes/*.txt")))
print(diary.with_suffix(".md").name)`,
      output: py`egypt_trip/notes/day_50.txt
day_50.txt day_50 .txt
egypt_trip/notes
True
['Yare yare daze.', 'Dio близько.']
['day_50.txt', 'day_51.txt']
day_50.md`,
    },

    // ───────────────────────────── 9. Ідіоми
    {
      type: "text",
      md: "Наостанок — ідіоми, за якими профі впізнає профі. Кожна з них економить рядок-два і, що важливіше, робить намір коду очевидним.",
    },
    {
      type: "code",
      title: "Маленькі, але смертоносні прийоми",
      code: py`hp = 75
print(0 < hp <= 100)                 # ланцюжок порівнянь

nickname = ""
print(nickname or "JoJo")            # значення за замовчуванням

team = []
if not team:                         # порожнє → False
    print("Команда порожня")

stats = {"power": "A"}
print(stats.get("range", "?"))       # без KeyError

print(" ".join(["Star", "Platinum"]))  # склеювання рядків

enemies = [3, 8, 1, 9]
if (n := len(enemies)) > 3:          # walrus: присвоїти і перевірити
    print(f"Забагато ворогів: {n}")

value = None
print(value is None)                 # None перевіряємо через is`,
      output: py`True
JoJo
Команда порожня
?
Star Platinum
Забагато ворогів: 4
True`,
    },
    {
      type: "compare",
      title: "EAFP проти LBYL",
      bad: {
        label: "LBYL: «подивись, перш ніж стрибати»",
        code: py`if "Dio" in stands and stands["Dio"] is not None:
    stand = stands["Dio"]
else:
    stand = "unknown"

if os.path.exists(path):
    with open(path) as f:   # файл могли видалити між рядками!
        data = f.read()`,
      },
      good: {
        label: "EAFP: «легше попросити вибачення»",
        code: py`stand = stands.get("Dio") or "unknown"

try:
    data = Path(path).read_text()
except FileNotFoundError:
    data = ""`,
      },
      note: "У Python прийнято *пробувати* й ловити конкретний виняток (EAFP), а не перевіряти десяток умов наперед. Це коротше і без «гонитви»: між перевіркою і дією світ може змінитись.",
    },
    {
      type: "warning",
      title: "== None і == True",
      md: "`None` — єдиний об'єкт, тож перевіряй його **ідентичність**: `if x is None`. А `if flag == True` пиши просто як `if flag`. Порівняння `x == None` може обдурити, якщо клас перевизначив `__eq__`, і `ruff` одразу позначить його як помилку (E711).",
    },
    {
      type: "warning",
      title: "Pythonic ≠ «в один рядок»",
      md: "Список-вираз на три рядки з двома `if`, `lambda` в `lambda` і walrus усередині — це не pythonic, це криптографія. Якщо одним рядком не виходить *читабельно*, напиши звичайний цикл з добрим ім'ям змінної. Readability counts.",
    },
    {
      type: "tip",
      title: "@cache — пам'ять Стенда",
      md: "Функція з дорогими повторними обчисленнями? Один декоратор — і результати запам'ятовуються: `from functools import cache` + `@cache` над функцією. Рекурсивний `fib(100)` стає миттєвим (див. приклад нижче).",
    },
    {
      type: "code",
      title: "functools.cache",
      code: py`from functools import cache


@cache
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)


print(fib(100))
print(fib.cache_info())`,
      output: py`354224848179261915075
CacheInfo(hits=98, misses=101, maxsize=None, currsize=101)`,
    },
    {
      type: "flow",
      title: "Як @cache перехоплює виклик",
      nodes: [
        { id: "s", kind: "start", label: "виклик fib(n)", col: 0, row: 0 },
        { id: "hit", kind: "decision", label: "n є в кеші?", col: 0, row: 1 },
        { id: "calc", kind: "call", label: "r = тіло fib(n)", col: 0, row: 2 },
        { id: "store", kind: "process", label: "кеш[n] = r", col: 0, row: 3 },
        { id: "get", kind: "process", label: "r = кеш[n]", col: 1, row: 4 },
        { id: "e", kind: "end", label: "return r", col: 0, row: 5 },
      ],
      edges: [
        { from: "s", to: "hit" },
        { from: "hit", to: "calc", label: "Ні" },
        { from: "hit", to: "get", label: "Так", side: "right" },
        { from: "calc", to: "store" },
        { from: "store", to: "e" },
        { from: "get", to: "e" },
      ],
      scenarios: [
        {
          name: "fib(10) вперше",
          steps: [
            { node: "s", note: "свіжий кеш: `hits=0, misses=0`" },
            { node: "hit", note: "`10` у кеші нема → **Ні** (`misses += 1`)" },
            { node: "calc", note: "тіло рахує `fib(9) + fib(8)` — і ці виклики теж ідуть через кеш" },
            { node: "store", note: "`кеш[10] = 55`; після всього `CacheInfo(hits=8, misses=11, …)`" },
            { node: "e", note: "повертає `55`" },
          ],
        },
        {
          name: "fib(10) вдруге",
          steps: [
            { node: "s", note: "кеш уже містить `0…10`" },
            { node: "hit", note: "`10` є → **Так**" },
            { node: "get", note: "`r = 55` — тіло функції **не** виконується (`hits=9`)" },
            { node: "e", note: "повертає `55` миттєво" },
          ],
        },
      ],
      caption: "`@cache` — це обгортка: вона дивиться в словник *до* виклику твоєї функції і кладе результат туди *після*. Працює лише для функцій з хешованими аргументами і без побічних ефектів.",
    },

    // ───────────────────────────── 10. Дебаг
    { type: "heading", text: "Дебаг: Star Platinum: The World!", id: "debug" },
    {
      type: "text",
      md: "Коли щось іде не так, у тебе є кілька рівнів сили:\n\n- **`print(f\"{x=}\")`** — швидкий погляд: ім'я і значення за один удар.\n- **`pprint`** — гарно друкує великі вкладені словники й списки.\n- **`breakpoint()`** — **зупиняє час**. Програма завмирає на цьому рядку, і ти в інтерактивному дебагері `pdb` можеш роздивитись будь-яку змінну, крокувати далі й навіть змінювати значення. Точнісінько як The World Джотаро.\n- **`logging`** — «дорослий» print: рівні важливості, час, вимикається однією конфігурацією.\n- **`assert`** — «цього ніколи не має статися»: падає одразу, якщо умова хибна.",
    },
    {
      type: "code",
      title: "Швидкий огляд змінних",
      code: py`from pprint import pprint

enemy = "Dio"
hp = 666
print(f"{enemy=}, {hp=}")
print(f"{hp * 2 = }")

party = {
    "Jotaro": {"stand": "Star Platinum", "stats": {"power": "A", "speed": "A"}},
    "Kakyoin": {"stand": "Hierophant Green", "stats": {"power": "C", "speed": "B"}},
}
pprint(party, width=60)`,
      output: py`enemy='Dio', hp=666
hp * 2 = 1332
{'Jotaro': {'stand': 'Star Platinum',
            'stats': {'power': 'A', 'speed': 'A'}},
 'Kakyoin': {'stand': 'Hierophant Green',
             'stats': {'power': 'C', 'speed': 'B'}}}`,
    },
    {
      type: "code",
      title: "breakpoint() — зупинка часу",
      code: py`def fight(hp: int, damage: int) -> int:
    breakpoint()          # ⏸ час зупинено: відкриється (Pdb)
    return hp - damage

fight(100, 30)

# У консолі pdb:
#   p hp, damage   → надрукувати значення
#   n              → наступний рядок
#   s              → зайти всередину виклику
#   c              → продовжити виконання
#   q              → вийти`,
      runnable: false,
    },
    {
      type: "code",
      title: "logging замість print",
      code: py`import logging
import sys

logging.basicConfig(
    level=logging.DEBUG,
    format="%(levelname)-8s %(message)s",
    stream=sys.stdout,
    force=True,
)
log = logging.getLogger("stand")

log.debug("Stand активовано")
log.info("Star Platinum готовий")
log.warning("Dio поруч!")
log.error("Час зупинено 😱")`,
      output: py`DEBUG    Stand активовано
INFO     Star Platinum готовий
WARNING  Dio поруч!
ERROR    Час зупинено 😱`,
    },
    {
      type: "tip",
      title: "Замір швидкості за 5 секунд",
      md: "Не гадай, що швидше, — міряй: `python3 -m timeit \"sum(range(1000))\"` у терміналі або `%timeit` у Jupyter. У коді — `time.perf_counter()` до й після блоку. А `python3 -X importtime main.py` покаже, які імпорти гальмують старт.",
    },
    {
      type: "joke",
      md: "Star Platinum: The World! ⏸ …Час зупинено. У мене є 5 секунд, щоб надрукувати `locals()`, знайти баг і повернутися. Yare yare daze. Це і є `breakpoint()`.",
    },

    // ───────────────────────────── 11. Перевір себе
    { type: "heading", text: "Перевір себе", id: "quiz" },
    {
      type: "quiz",
      question: "Що буде в `middle` після `first, *middle, last = [\"ORA\", \"MUDA\"]`?",
      options: ["None", "[]", "ValueError", "\"\""],
      answer: 1,
      explain: "Зірочка збирає «все, що лишилось», і завжди робить це у **список** — навіть порожній. `first = \"ORA\"`, `last = \"MUDA\"`, `middle = []`. `ValueError` був би, якби елементів було менше за обов'язкові імена (наприклад, один).",
    },
    {
      type: "quiz",
      question: "Що надрукує `print(f\"{0.5:.0%}|{42:>5}|\")`?",
      options: ["0.5%|42   |", "50%|   42|", "50%|42   |", "0%|   42|"],
      answer: 1,
      explain: "`%` множить на 100 і додає знак відсотка → `50%`. `>5` вирівнює по правому краю в полі ширини 5 → три пробіли і `42`.",
    },
    {
      type: "quiz",
      question: "Що поверне `list(zip([1, 2, 3], \"ab\"))`?",
      options: ["[(1, 'a'), (2, 'b'), (3, None)]", "[(1, 'a'), (2, 'b')]", "ValueError", "[(1, 2, 3), ('a', 'b')]"],
      answer: 1,
      explain: "`zip` зупиняється на найкоротшій колекції й **мовчки** відкидає решту. Хочеш доповнити — `itertools.zip_longest`; хочеш помилку — `zip(..., strict=True)`.",
    },
    {
      type: "quiz",
      question: "Функція оголошена як `def heal(hp: int) -> int`. Що станеться при виклику `heal(\"сто\")`?",
      options: [
        "TypeError ще до виконання тіла",
        "Python автоматично перетворить \"сто\" на число",
        "Тіло виконається як звичайно — анотації не перевіряються в рантаймі",
        "SyntaxError",
      ],
      answer: 2,
      explain: "Анотації — лише метадані для людей, редакторів і `mypy`. Інтерпретатор їх не застосовує. Помилка (якщо буде) виникне лише тоді, коли тіло спробує зробити з рядком щось неможливе.",
    },
    {
      type: "table",
      head: ["Замість…", "Пиши pythonic"],
      rows: [
        ["`for i in range(len(xs)): xs[i]`", "`for x in xs:` / `for i, x in enumerate(xs):`"],
        ["`tmp = a; a = b; b = tmp`", "`a, b = b, a`"],
        ["`if len(xs) == 0:`", "`if not xs:`"],
        ["`if x == None:`", "`if x is None:`"],
        ["`s = s + word` у циклі", "`\" \".join(words)`"],
        ["`d[k] if k in d else 0`", "`d.get(k, 0)`"],
        ["Ручний лічильник у словнику", "`Counter(items)`"],
        ["`\"dir\" + \"/\" + name`", "`Path(\"dir\") / name`"],
        ["`\"Hi \" + name + \"!\"`", "`f\"Hi {name}!\"`"],
        ["`print(\"x =\", x)`", "`print(f\"{x=}\")`"],
        ["`if 0 < x and x < 10:`", "`if 0 < x < 10:`"],
      ],
    },
    {
      type: "tip",
      title: "Фінальний прийом: ruff на все",
      md: "Встанови [ruff](https://docs.astral.sh/ruff/) (`python -m pip install ruff`) і запускай `ruff check --fix .` + `ruff format .`. Він сам виправить більшість не-pythonic конструкцій з цієї сторінки: невикористані імпорти, `== None`, зайві `else` після `return`, сортування імпортів. Твій власний Стенд-рецензент.",
    },
  ],
};

export default section;
