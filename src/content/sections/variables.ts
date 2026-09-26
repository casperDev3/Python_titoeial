import type { Section } from "../types";

const section: Section = {
  "slug": "variables",
  "title": "Змінні та типи даних",
  "short": "int, float, str, bool, None",
  "icon": "📦",
  "group": "Основи",
  "summary": "Змінні як імена-ярлики на об'єкти, динамічна типізація, int/float/str/bool/None, приведення типів, id() і mutable vs immutable.",
  "hero": {
    "name": "Сон Гоку",
    "universe": "Dragon Ball",
    "emoji": "🐉",
    "quote": "Мій рівень сили — це int, і він більше 9000!",
    "why": "Гоку постійно трансформується — як значення змінюють тип при приведенні."
  },
  "theme": {
    "accent": "#ff6a00",
    "accent2": "#2f7bff",
    "glow": "#ff9d3a"
  },
  "minutes": 14,
  "order": 2,
  "blocks": [
    // ─────────────────────────── 1. Ярлики
    { type: "heading", text: "Змінна — це ярлик, а не коробка", id: "names" },
    {
      type: "text",
      md: "У багатьох підручниках кажуть «змінна — це коробка, в яку кладуть значення». Для Python це **неправда**, і саме через цю пастку новачки плутаються з копіюванням списків.\n\nУ Python усе — **об'єкти**, що живуть у пам'яті: число `9000`, рядок `\"Goku\"`, список, функція. А змінна — це лише **ім'я, ярлик**, який прикріплено до об'єкта. Оператор `=` не копіює значення, а каже: «віднині ім'я `power` вказує ось на цей об'єкт».\n\nУяви скаутер Веджити: він не *містить* Гоку, а лише *наведений* на нього. Наведи другий скаутер — і обидва покажуть того самого воїна.",
    },
    {
      type: "code",
      title: "first_vars.py",
      code: `power = 9001
name = "Goku"
is_saiyan = True

print(name, "має силу", power)
print("Сайян?", is_saiyan)

power = power + 1000   # ярлик переклеєно на новий об'єкт
print("Після тренування:", power)`,
      output: `Goku має силу 9001
Сайян? True
Після тренування: 10001`,
    },
    {
      type: "viz",
      id: "name-tags",
      title: "Імена → об'єкти: покрокова пам'ять",
      caption: "Тисни **Крок** і стеж за стрілками. `goku = power` не копіює число — обидва імені вказують на **той самий** об'єкт. Об'єкт, на який не лишилось жодного імені (лічильник посилань 0), Python прибирає з пам'яті.",
    },
    {
      type: "joke",
      md: "Веджита питає: «Якщо я напишу `vegeta = goku`, я стану таким самим сильним?» Ні, принце. Ти просто станеш ще одним ярликом на Гоку. Технічно — найбільший фанат.",
      hero: "Сон Гоку",
    },

    // ─────────────────────────── 2. Іменування
    { type: "heading", text: "Як називати змінні", id: "naming" },
    {
      type: "text",
      md: "Правила, які перевіряє сам Python:\n\n- Ім'я складається з літер, цифр і `_`, але **не починається з цифри**: `level2` — можна, `2level` — ні.\n- **Регістр важливий**: `power`, `Power` і `POWER` — три різні змінні.\n- Не можна брати **ключові слова**: `class`, `if`, `for`, `None`, `True`, `import`…\n\nА це — угоди спільноти (PEP 8), які варто виконувати:\n\n- `snake_case` для змінних і функцій: `max_power_level`.\n- `UPPER_CASE` для констант: `MAX_POWER = 9000`. Python не заборонить їх змінити — це «чесне слово» програміста.\n- `PascalCase` лише для класів: `SuperSaiyan`.\n- Одна `_` — змінна, значення якої нам не потрібне: `for _ in range(3)`.",
    },
    {
      type: "code",
      title: "naming.py",
      code: `import keyword

max_power_level = 9000      # snake_case ✓
MAX_POWER = 9000            # «константа» ✓
power2 = 42                 # цифра не на початку ✓
_hidden_form = "Ultra Instinct"

print(keyword.iskeyword("class"))
print(keyword.iskeyword("goku"))
print("Power" == "power")`,
      output: `True
False
False`,
    },
    {
      type: "warning",
      title: "Не перекривай вбудовані імена",
      md: "`list`, `str`, `input`, `sum`, `max`, `id`, `type` — це імена вбудованих функцій, а не ключові слова, тому Python дозволить `str = \"Goku\"`. Але після цього `str(42)` впаде з `TypeError: 'str' object is not callable`, бо ярлик `str` тепер наклеєно на рядок. Обирай `name`, `text`, `items`, `total`.",
    },
    {
      type: "tip",
      title: "Імена як документація",
      md: "`d = 7` — незрозуміло. `days_until_tournament = 7` — зрозуміло всім. Хороше ім'я економить коментар. А для булевих змінних використовуй префікси `is_`, `has_`, `can_`: `is_saiyan`, `has_tail`, `can_fly` — тоді `if can_fly:` читається як речення.",
    },

    // ─────────────────────────── 3. Динамічна типізація
    { type: "heading", text: "Динамічна типізація і type()", id: "dynamic" },
    {
      type: "text",
      md: "У Python тип має **об'єкт**, а не ім'я. Тому одна й та сама змінна може спочатку вказувати на число, а потім — на рядок. Це і є **динамічна типізація**. Водночас Python **строго типізований**: він не буде мовчки склеювати рядок із числом, як JavaScript.\n\nДізнатися тип можна через `type()`, а перевірити — через `isinstance()`.",
    },
    {
      type: "code",
      title: "types.py",
      code: `print(type(42))
print(type(3.14))
print(type("Kamehameha"))
print(type(True))
print(type(None))

power = 9000
print(type(power).__name__)
power = "over 9000!"      # те саме ім'я — інший тип
print(type(power).__name__)`,
      output: `<class 'int'>
<class 'float'>
<class 'str'>
<class 'bool'>
<class 'NoneType'>
int
str`,
    },
    {
      type: "code",
      title: "isinstance.py",
      code: `ki = 3.5

print(isinstance(ki, float))
print(isinstance(ki, (int, float)))   # «це число?»
print(isinstance(True, int))          # bool — підвид int!`,
      output: `True
True
True`,
    },
    {
      type: "tip",
      title: "isinstance замість type() ==",
      md: "Перевірка `type(x) == int` не пропускає підкласи, а `isinstance(x, int)` — пропускає і приймає кортеж типів: `isinstance(x, (int, float))`. Для «чи це число» це саме те, що треба. А ще анотації типів `power: int = 9000` Python **не перевіряє** під час виконання — їх читають редактор і `mypy`, щоб ловити помилки заздалегідь.",
    },
    {
      type: "code",
      title: "annotations.py",
      code: `power: int = 9000
name: str = "Goku"

power = "жарт"   # Python не заперечує — анотації лише підказки
print(power, type(power).__name__)`,
      output: `жарт str`,
    },

    // ─────────────────────────── 4. Числа
    { type: "heading", text: "Числа: int і float", id: "numbers" },
    {
      type: "text",
      md: "**`int`** — цілі числа **довільної довжини**. Жодного переповнення, як у C чи Java: `2 ** 1000` — будь ласка. Для читабельності великі числа можна розбивати підкресленням: `1_000_000`. Також є записи в інших системах числення: `0b1010` (двійкова), `0o17` (вісімкова), `0xff` (шістнадцяткова).\n\n**`float`** — дробові числа з плаваючою крапкою (стандарт IEEE 754, 64 біти). Вони швидкі, але **наближені**: не кожен десятковий дріб можна точно записати у двійковій системі.",
    },
    {
      type: "code",
      title: "ints.py",
      code: `print(2 ** 100)
print(1_000_000 + 1)
print(0b1010, 0o17, 0xff)
print(bin(10), hex(255))
print(int("ff", 16), int("1010", 2))
print(7 / 2, type(7 / 2).__name__)   # / завжди дає float
print(10 / 5)`,
      output: `1267650600228229401496703205376
1000001
10 15 255
0b1010 0xff
255 10
3.5 float
2.0`,
    },
    {
      type: "code",
      title: "floats.py",
      code: `import math

print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))
print(1e3, 2.5e-3)          # експоненційний запис
print(round(2.675, 2))      # не 2.68! 2.675 у пам'яті трохи менше
print(float("inf") > 10 ** 100)`,
      output: `0.30000000000000004
False
True
1000.0 0.0025
2.67
True`,
      highlight: [3, 4, 5],
    },
    {
      type: "warning",
      title: "Не порівнюй float через ==",
      md: "`0.1 + 0.2 == 0.3` — це `False`, і це не баг Python, а властивість двійкових дробів у будь-якій мові. Порівнюй з допуском через `math.isclose(a, b)`. А для грошей використовуй `decimal.Decimal(\"0.10\")` або рахуй у копійках цілими числами.",
    },
    {
      type: "joke",
      md: "Скаутер показав `0.30000000000000004` замість `0.3`. Веджита розтрощив уже третій. Бульма зітхнула й підключила `math.isclose` — тепер скаутери живуть довше.",
    },

    // ─────────────────────────── 5. str, bool, None
    { type: "heading", text: "Рядки, bool, None і truthiness", id: "str-bool-none" },
    {
      type: "text",
      md: "**`str`** — текст у лапках: одинарних `'...'`, подвійних `\"...\"` чи потрійних для багаторядкового тексту. Рядки докладно розберемо в окремому розділі; зараз важливо, що вони **незмінні**.\n\n**`bool`** — лише два значення: `True` і `False` (з великої літери!). Цікавий факт: `bool` — це підклас `int`, тож `True == 1`, а `False == 0`.\n\n**`None`** — спеціальний об'єкт «нічого», єдиний у своєму роді (*синглтон*). Його повертають функції, які нічого не повертають явно, ним позначають «значення ще немає».",
    },
    {
      type: "code",
      title: "bool_none.py",
      code: `print(True + True + True)      # bool — це int
print(True == 1, False == 0)

dragon_balls = 7
print(dragon_balls == 7)       # порівняння повертає bool

wish = None                    # бажання ще не загадали
print(wish is None)

result = print("Ka-me-ha-me-ha!")
print(result)                  # print нічого не повертає`,
      output: `3
True True
True
True
Ka-me-ha-me-ha!
None`,
    },
    {
      type: "compare",
      title: "Перевірка на None",
      bad: {
        label: "== None або просто if not",
        code: `wish = 0
if wish == None:      # працює, але не за PEP 8
    print("Нема бажання")
if not wish:          # спрацює і для 0, "" та []!
    print("Нема бажання?")`,
      },
      good: {
        label: "is None — точно і швидко",
        code: `wish = 0
if wish is None:
    print("Нема бажання")
else:
    print("Бажання:", wish)`,
      },
      note: "`None` існує в одному екземплярі, тому `is` перевіряє саме його. А `if not wish` сплутає `None` з `0`, порожнім рядком чи списком — а це різні ситуації.",
    },

    // ─────────────────────────── 6. Truthiness
    {
      type: "text",
      md: "**Truthy і falsy.** У `if` та `while` можна підставити **будь-яке** значення — Python сам перетворить його на `bool`. Правило просте: **falsy** (хибні) — це «нулі» і «порожнечі»:\n\n- `False`, `None`\n- нулі: `0`, `0.0`\n- порожні колекції: `\"\"`, `[]`, `()`, `{}`, `set()`\n\nУсе інше — **truthy**. Навіть рядок `\"False\"`, рядок `\"0\"` і рядок з одного пробілу.",
    },
    {
      type: "code",
      title: "truthy.py",
      code: `print(bool(0), bool(0.0), bool(""), bool([]), bool(None))
print(bool(42), bool(-1), bool("0"), bool(" "), bool("False"))

senzu_beans = []
if senzu_beans:
    print("Є боби!")
else:
    print("Бобів немає, тримайся, Гоку")`,
      output: `False False False False False
True True True True True
Бобів немає, тримайся, Гоку`,
    },
    {
      type: "viz",
      id: "truthy-sorter",
      title: "Сортувальник Truthy / Falsy",
      caption: "Обери значення і вгадай, куди його відправить `bool()`. Правильні відповіді набирають «рівень сили».",
    },

    // ─────────────────────────── 7. Приведення типів
    { type: "heading", text: "Приведення типів: трансформації", id: "casting" },
    {
      type: "text",
      md: "Як Гоку переходить у Супер Сайяна, так значення можна **перетворити** на інший тип функціями `int()`, `float()`, `str()`, `bool()`. Важливо: вони не змінюють старий об'єкт, а **створюють новий**.\n\n- `int(3.99)` **відкидає** дробову частину (до нуля), а не округлює: `3`, а `int(-3.99)` → `-3`.\n- `int(\"42\")` читає рядок, але `int(\"3.14\")` — помилка: спершу `float()`, потім `int()`.\n- `round()` округлює «до парного» (банківське округлення): `round(2.5)` → `2`.",
    },
    {
      type: "code",
      title: "casting.py",
      code: `print(int("9001") + 1)
print(float("3.5") * 2)
print(str(42) + "!")
print(int(3.99), int(-3.99))
print(round(3.7), round(2.5), round(3.5))
print(int(float("3.14")))
print(int("  42  "))          # пробіли по краях — не проблема`,
      output: `9002
7.0
42!
3 -3
4 2 4
3
42`,
    },
    {
      type: "viz",
      id: "transform-3d",
      title: "Камера трансформацій типів",
      caption: "Обери значення й функцію-трансформацію. Кожен тип має свою форму: `int` — куб, `float` — сфера, `str` — тор, `bool` — октаедр, `None` — порожнє кільце. Невдала трансформація закінчується помилкою — як і в Python.",
    },
    {
      type: "code",
      title: "cast_errors.py",
      code: `try:
    int("3.14")
except ValueError as e:
    print("ValueError:", e)

try:
    int("over 9000")
except ValueError as e:
    print("ValueError:", e)

try:
    print("Сила: " + 9000)
except TypeError as e:
    print("TypeError:", e)`,
      output: `ValueError: invalid literal for int() with base 10: '3.14'
ValueError: invalid literal for int() with base 10: 'over 9000'
TypeError: can only concatenate str (not "int") to str`,
    },
    {
      type: "tip",
      title: "Перевір, перш ніж перетворювати",
      md: "`\"9001\".isdigit()` → `True`, а `\"-5\".isdigit()` → `False` (мінус — не цифра). Тому для чисел від користувача надійніше писати `try: n = int(text)` / `except ValueError:` — про це детально в розділі про помилки. А `bool(\"False\")` — це `True`, бо рядок непорожній! Щоб розпізнати «так/ні», порівнюй текст: `text.lower() in (\"yes\", \"так\", \"1\")`.",
    },

    // ─────────────────────────── 8. id і is
    { type: "heading", text: "id(), is та ==", id: "identity" },
    {
      type: "text",
      md: "Кожен об'єкт має **ідентичність** — унікальний номер, поки він живий. Його повертає `id()` (у CPython це адреса в пам'яті).\n\n- `a == b` — **рівність значень**: «чи однакові вони?»\n- `a is b` — **ідентичність**: «чи це *той самий* об'єкт?», тобто `id(a) == id(b)`.\n\nДва близнюки-фьюжн можуть бути однаковими на вигляд (`==`), але це дві різні людини (`is not`).",
    },
    {
      type: "code",
      title: "identity.py",
      code: `team_a = ["Goku", "Vegeta"]
team_b = team_a                 # другий ярлик на той самий список
team_c = ["Goku", "Vegeta"]     # новий список з тим самим вмістом

print(team_a == team_c)   # однаковий вміст
print(team_a is team_c)   # але різні об'єкти
print(team_a is team_b)   # а тут — один і той самий
print(id(team_a) == id(team_b))`,
      output: `True
False
True
True`,
    },
    {
      type: "warning",
      title: "is — не для чисел і рядків",
      md: "`x is 1000` іноді дає `True`, іноді `False`: CPython кешує малі числа (від −5 до 256) і деякі рядки, але це деталь реалізації, а не правило мови. Python 3.8+ навіть видає `SyntaxWarning: \"is\" with 'int' literal`. Використовуй `is` лише з `None`, `True`/`False` і коли справді перевіряєш «той самий об'єкт».",
    },

    // ─────────────────────────── 9. Mutable vs immutable
    { type: "heading", text: "Mutable vs immutable", id: "mutability" },
    {
      type: "text",
      md: "Найважливіша ідея розділу. Об'єкти бувають:\n\n- **Незмінні (immutable)**: `int`, `float`, `bool`, `str`, `tuple`, `None`, `frozenset`. Змінити їх *неможливо* — будь-яка «зміна» створює **новий** об'єкт, і ярлик переклеюється.\n- **Змінні (mutable)**: `list`, `dict`, `set` і більшість власних класів. Їх можна змінювати **на місці** — і всі ярлики, що на них вказують, побачать зміну.\n\nАналогія: незмінний об'єкт — це Гоку в базовій формі на фото. Хочеш Супер Сайяна — роби нове фото. Змінний — це сам Гоку: він тренується, і всі, хто на нього дивиться, бачать нові м'язи.",
    },
    {
      type: "viz",
      id: "mutable-lab",
      title: "Лабораторія: += на різних типах",
      caption: "Обери тип і натисни `a += …`. Для незмінних типів з'являється **новий** об'єкт і ярлик `a` переїжджає, а `b` лишається на старому. Для списку об'єкт росте **на місці** — і `b` теж бачить зміну.",
    },
    {
      type: "code",
      title: "mutable_alias.py",
      code: `team = ["Goku"]
squad = team            # не копія! той самий список
squad.append("Vegeta")
print(team)             # зміна видна через обидва імені

power = 9000
level = power
level += 1              # int незмінний → новий об'єкт
print(power, level)`,
      output: `['Goku', 'Vegeta']
9000 9001`,
      highlight: [3, 4],
    },
    {
      type: "code",
      title: "plus_equals.py",
      code: `t = (1, 2)
t_alias = t
t += (3,)               # tuple: новий об'єкт
print(t, t_alias, t is t_alias)

l = [1, 2]
l_alias = l
l += [3]                # list: зміна на місці
print(l, l_alias, l is l_alias)`,
      output: `(1, 2, 3) (1, 2) False
[1, 2, 3] [1, 2, 3] True`,
    },
    {
      type: "code",
      title: "copy.py",
      code: `team = ["Goku", "Vegeta"]

clone1 = team.copy()    # поверхнева копія
clone2 = list(team)     # те саме
clone3 = team[:]        # і так теж

clone1.append("Gohan")
print(team)
print(clone1)
print(clone1 is team)`,
      output: `['Goku', 'Vegeta']
['Goku', 'Vegeta', 'Gohan']
False`,
    },
    {
      type: "compare",
      title: "Кілька порожніх списків одним рядком",
      bad: {
        label: "Один список на три імені",
        code: `goku_moves = vegeta_moves = gohan_moves = []
goku_moves.append("Kamehameha")
print(vegeta_moves)   # ['Kamehameha'] — сюрприз!`,
      },
      good: {
        label: "Кожному — свій список",
        code: `goku_moves, vegeta_moves, gohan_moves = [], [], []
goku_moves.append("Kamehameha")
print(vegeta_moves)   # []`,
      },
      note: "`a = b = c = 0` безпечно, бо `int` незмінний. А з `[]` чи `{}` усі імена вказують на **один** об'єкт. Для вкладених структур (список списків) звичайна копія теж поверхнева — використовуй `copy.deepcopy()`.",
    },
    {
      type: "viz",
      id: "memory-3d",
      title: "3D-пам'ять: посилання і збирач сміття",
      caption: "Сфери — об'єкти в пам'яті, скляні таблички — імена. Проходь кроки й дивись, як змінюється лічильник посилань. Натисни на сферу, щоб побачити її `type`, `id` і скільки ярликів на неї вказує. Щойно лічильник падає до 0 — об'єкт зникає.",
    },
    {
      type: "tip",
      title: "del видаляє ярлик, а не об'єкт",
      md: "`del power` відклеює ім'я `power`. Сам об'єкт знищиться лише тоді, коли на нього не залишиться жодного посилання — цим займається **підрахунок посилань** CPython плюс **збирач сміття** `gc` для циклічних посилань. Подивитись лічильник можна через `sys.getrefcount(obj)` (він покаже на 1 більше — сам виклик теж тримає посилання).",
    },
    {
      type: "joke",
      hero: "Крилін",
      md: "Мене вбивали стільки разів, що я вже зрозумів: я — об'єкт з лічильником посилань 0. Добре, що Драконячі кулі працюють як `undo` для збирача сміття.",
    },

    // ─────────────────────────── 10. Присвоєння-комбо
    { type: "heading", text: "Комбо-присвоєння", id: "assignment" },
    {
      type: "text",
      md: "Кілька технік, які роблять код коротшим і виразнішим:\n\n- **Множинне присвоєння**: `x, y = 1, 2` — праворуч створюється кортеж, який *розпаковується* по іменах.\n- **Обмін без тимчасової змінної**: `a, b = b, a`.\n- **Розширене розпакування**: `first, *rest = ...` — зірочка забирає «все інше» у список.\n- **Складене присвоєння**: `+=`, `-=`, `*=`, `//=`… — `x += 1` те саме, що `x = x + 1` (для незмінних типів).\n- **Моржовий оператор** `:=` (Python 3.8+) присвоює прямо всередині виразу.",
    },
    {
      type: "code",
      title: "unpacking.py",
      code: `x, y = 10, 20
x, y = y, x                     # обмін місцями
print(x, y)

name, power, form = "Goku", 9001, "SSJ"
print(f"{name}: {power} ({form})")

leader, *others = ["Goku", "Vegeta", "Gohan", "Piccolo"]
print(leader)
print(others)

ki = 100
ki *= 3
ki -= 50
print(ki)`,
      output: `20 10
Goku: 9001 (SSJ)
Goku
['Vegeta', 'Gohan', 'Piccolo']
250`,
    },
    {
      type: "code",
      title: "walrus.py",
      code: `scouter = "power level 9001"

if (n := len(scouter)) > 10:
    print(f"Довге повідомлення: {n} символів")`,
      output: `Довге повідомлення: 16 символів`,
    },
    {
      type: "tip",
      title: "Підкреслення для непотрібного",
      md: "Коли при розпакуванні частина значень не потрібна, бери `_`: `name, _, form = (\"Goku\", 9001, \"SSJ\")`. Колеги одразу зрозуміють, що це значення навмисно ігнорується. А `_, *middle, _ = data` вийме «середину» без першого й останнього елементів.",
    },
    {
      type: "joke",
      md: "`goku, vegeta = vegeta, goku` — і ось ми помінялися тілами без жодного Капітана Гінью. Python робить фьюжн і обмін швидше, ніж танець Фьюжн-Ха!",
    },

    // ─────────────────────────── 11. Шпаргалка
    { type: "heading", text: "Шпаргалка і перевірка", id: "cheatsheet" },
    {
      type: "table",
      head: ["Тип", "Приклад", "Змінний?", "Falsy-значення", "Перетворення"],
      rows: [
        ["`int`", "`42`, `-7`, `1_000`, `0xff`", "ні", "`0`", "`int(\"42\")`, `int(3.9)` → `3`"],
        ["`float`", "`3.14`, `1e3`, `float(\"inf\")`", "ні", "`0.0`", "`float(\"2.5\")`"],
        ["`str`", "`\"Goku\"`, `'SSJ'`", "ні", "`\"\"`", "`str(42)` → `\"42\"`"],
        ["`bool`", "`True`, `False`", "ні", "`False`", "`bool(x)` — за правилом truthy"],
        ["`NoneType`", "`None`", "ні", "`None`", "— (перевіряй `is None`)"],
        ["`tuple`", "`(1, 2)`, `(1,)`", "ні", "`()`", "`tuple([1, 2])`"],
        ["`list`", "`[1, 2]`", "**так**", "`[]`", "`list(\"abc\")`"],
        ["`dict`", "`{\"hp\": 100}`", "**так**", "`{}`", "`dict(hp=100)`"],
        ["`set`", "`{1, 2}`", "**так**", "`set()`", "`set([1, 1, 2])`"],
      ],
    },
    {
      type: "quiz",
      question: "Що виведе код?\n`a = [1]` → `b = a` → `b.append(2)` → `print(a)`",
      options: ["[1]", "[1, 2]", "[2]", "NameError"],
      answer: 1,
      explain: "`b = a` не копіює список — обидва імені вказують на **один** об'єкт. `append` змінює його на місці, тому `a` теж бачить `[1, 2]`.",
    },
    {
      type: "quiz",
      question: "Чому дорівнює `bool(\"False\")`?",
      options: ["False", "True", "None", "TypeError"],
      answer: 1,
      explain: "Будь-який **непорожній** рядок — truthy, незалежно від тексту всередині. Falsy лише порожній рядок `\"\"`.",
    },
    {
      type: "quiz",
      question: "Що поверне `int(-2.7)`?",
      options: ["-3", "-2", "-2.7", "ValueError"],
      answer: 1,
      explain: "`int()` відкидає дробову частину в бік нуля (truncation), а не округлює вниз. Тому `-2.7` → `-2`. Округлення вниз дає `math.floor(-2.7)` → `-3`.",
    },
    {
      type: "quiz",
      question: "Який тип має результат `10 / 5`?",
      options: ["int", "float", "str", "залежить від значень"],
      answer: 1,
      explain: "Оператор `/` **завжди** повертає `float`: `10 / 5` → `2.0`. Цілочисельне ділення — `//`: `10 // 5` → `2`.",
    },
    {
      type: "quiz",
      question: "`s = \"Goku\"`, `t = s`, `s += \"!\"`. Що в `t`?",
      options: ["\"Goku!\"", "\"Goku\"", "None", "помилка: рядки незмінні"],
      answer: 1,
      explain: "Рядок незмінний, тому `s += \"!\"` створює **новий** об'єкт `\"Goku!\"` і переклеює на нього ярлик `s`. Ярлик `t` лишається на старому `\"Goku\"`. Помилки немає — змінюється не рядок, а те, куди вказує ім'я.",
    },
  ],
};

export default section;
