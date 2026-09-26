import type { Section } from "../types";

/** Сирий рядок: зберігає зворотні слеші (\n, \t, \x…) у прикладах коду як є. */
const py = String.raw;

const section: Section = {
  "slug": "strings",
  "title": "Рядки",
  "short": "f-strings, зрізи, методи",
  "icon": "🔤",
  "group": "Основи",
  "summary": "Рядки як незмінні послідовності символів: індекси, зрізи, методи, f-рядки та форматування, Unicode, екранування.",
  "hero": {
    "name": "Сейлор Мун",
    "universe": "Sailor Moon",
    "emoji": "🌙",
    "quote": "Іменем Місяця — я відформатую тебе f-рядком!",
    "why": "Трансформація Сейлор Мун — це .upper(), .title() і f-рядки: той самий текст, нова форма."
  },
  "theme": {
    "accent": "#e0457f",
    "accent2": "#8b7bff",
    "glow": "#ff8cc6"
  },
  "minutes": 15,
  "order": 4,
  "blocks": [
    {
      type: "text",
      md: "Рядок (`str`) — це **впорядкована незмінна послідовність символів Unicode**. Імена, повідомлення, JSON з сервера, HTML-сторінка, вміст файлу — усе це рядки. Тому робота з текстом — один із найважливіших навиків програміста.\n\nСейлор Мун щоразу перевтілюється, але Усагі лишається Усагі. З рядками так само: методи на кшталт `.upper()` чи `.title()` не змінюють оригінал — вони створюють **новий** рядок у новій формі. Лунна призма, дай нам силу! 🌙",
    },

    // ───────────────────────── Створення
    { type: "heading", text: "Як створити рядок: лапки та екранування" },
    {
      type: "text",
      md: "Рядок можна взяти в одинарні `'...'` або подвійні `\"...\"` лапки — різниці немає. Зручно: якщо всередині є апостроф, бери подвійні, і навпаки. Для багаторядкового тексту є потрійні лапки `\"\"\"...\"\"\"`.\n\nСпецсимволи записують через **екранування** зворотним слешем: `\\n` — новий рядок, `\\t` — табуляція, `\\\\` — сам слеш, `\\'` і `\\\"` — лапки. А префікс `r` робить **сирий рядок**, де слеш — просто слеш.",
    },
    {
      type: "code",
      title: "create.py",
      code: py`hero = "Сейлор Мун"
quote = 'Іменем Місяця!'
mixed = "Вона сказала: 'Покараю!'"
also = 'I\'m Sailor Moon'
print(hero, quote)
print(mixed)
print(also)
print(type(hero), len(hero))`,
      output: py`Сейлор Мун Іменем Місяця!
Вона сказала: 'Покараю!'
I'm Sailor Moon
<class 'str'> 10`,
    },
    {
      type: "code",
      title: "escapes.py",
      code: py`poem = """Місячна призма,
дай мені силу!"""
print(poem)
print("Рядок 1\nРядок 2")
print("Шлях: C:\\Users\\usagi")
print(r"Raw: C:\new\table")
print(len("\n"), len(r"\n"))`,
      output: py`Місячна призма,
дай мені силу!
Рядок 1
Рядок 2
Шлях: C:\Users\usagi
Raw: C:\new\table
1 2`,
    },
    {
      type: "tip",
      title: "r-рядки для шляхів і regex",
      md: "Шляхи Windows та регулярні вирази пиши сирими рядками: `r\"C:\\new\\data\"`, `r\"\\d+\\.\\d+\"`. Інакше `\\n` у `C:\\new` тихо стане переведенням рядка, а `\\t` — табуляцією. А ще краще для шляхів — `pathlib.Path`.",
    },
    {
      type: "joke",
      hero: "Такседо Маск",
      md: "Я з'являюся лише в найпотрібніший момент — як `\\n` наприкінці кожного `print()`. Ніхто мене не помічає, але без мене все злиплося б в один рядок.",
    },

    // ───────────────────────── Індекси
    { type: "heading", text: "Індекси: кожен символ має номер" },
    {
      type: "text",
      md: "Рядок — це послідовність, тож до кожного символу можна дістатися за **індексом** у квадратних дужках. Нумерація починається з **нуля**. А від'ємні індекси рахують з кінця: `s[-1]` — останній символ, `s[-2]` — передостанній.\n\nДля рядка довжини `n` правильні індекси: від `0` до `n - 1` і від `-n` до `-1`. Вихід за межі — `IndexError`.",
    },
    {
      type: "viz",
      id: "index-tiara",
      title: "Тіара індексів",
      caption: "Кожна намистина — один символ. Клікни на неї: побачиш додатний і від'ємний індекс, код символу в Unicode (`ord`) та байти UTF-8. Введи власний рядок з емодзі чи кирилицею — `len()` рахує **символи**, а не байти.",
    },
    {
      type: "code",
      title: "indexing.py",
      code: py`word = "MOONPRISM"
print(word[0], word[4], word[-1], word[-2])
print(word[len(word) - 1])   # те саме, що word[-1]
print(len(word))`,
      output: py`M P M S
M
9`,
    },
    {
      type: "warning",
      title: "IndexError",
      md: "`\"moon\"[4]` падає з `IndexError: string index out of range` — останній індекс `3`, бо рахуємо з нуля. Порожній рядок `\"\"` не має взагалі жодного індексу, тож `s[0]` на ньому теж падає. Перевіряй `if s:` перед доступом або використовуй зрізи — вони ніколи не падають.",
    },

    // ───────────────────────── Зрізи
    { type: "heading", text: "Зрізи: s[start:stop:step]" },
    {
      type: "text",
      md: "Зріз вирізає шматок рядка: `s[start:stop:step]`.\n\n- `start` — з якого індексу (включно), за замовчуванням з початку,\n- `stop` — до якого (**не включно**!), за замовчуванням до кінця,\n- `step` — крок; від'ємний крок іде справа наліво.\n\nЗапам'ятай фокус: `s[:k] + s[k:] == s` для будь-якого `k`. А `s[::-1]` — найвідоміший спосіб розвернути рядок.",
    },
    {
      type: "viz",
      id: "slice-lab",
      title: "Лабораторія зрізів",
      caption: "Рухай `start`, `stop`, `step` або вмикай `None` (порожнє місце у зрізі). Підсвічені клітинки — ті, що потраплять у результат, номерки — порядок, у якому Python їх збирає. Спробуй від'ємний крок!",
    },
    {
      type: "code",
      title: "slicing.py",
      code: py`s = "SAILORMOON"
print(s[0:6])     # SAILOR
print(s[6:])      # до кінця
print(s[:3])      # з початку
print(s[-4:])     # останні 4
print(s[::2])     # кожен другий
print(s[::-1])    # розворот!
print(s[1:8:3])
print(repr(s[100:]))  # зріз не падає — порожній рядок
print(repr(s[5:2]))`,
      output: py`SAILOR
MOON
SAI
MOON
SIOMO
NOOMROLIAS
AOO
''
''`,
    },
    {
      type: "flow",
      title: "Як зріз збирає символи (крок > 0)",
      nodes: [
        { id: "s", kind: "start", label: "s[start:stop:step]", col: 0, row: 0 },
        { id: "norm", kind: "process", label: "від'ємні += len(s)\nNone → межі рядка\nобрізати до 0…len(s)", col: 0, row: 1 },
        { id: "init", kind: "process", label: 'i = start\nres = ""', col: 0, row: 2 },
        { id: "d", kind: "decision", label: "i < stop ?", col: 0, row: 3 },
        { id: "add", kind: "process", label: "res += s[i]", col: 0, row: 4 },
        { id: "inc", kind: "process", label: "i += step", col: 0, row: 5 },
        { id: "e", kind: "end", label: "повернути res", col: 1, row: 3 },
      ],
      edges: [
        { from: "s", to: "norm" },
        { from: "norm", to: "init" },
        { from: "init", to: "d" },
        { from: "d", to: "add", label: "True" },
        { from: "d", to: "e", label: "False", side: "right" },
        { from: "add", to: "inc" },
        { from: "inc", to: "d", side: "left" },
      ],
      scenarios: [
        {
          name: 's = "SAILORMOON"; s[1:8:3]',
          steps: [
            { node: "s" },
            { node: "norm", note: "`start = 1`, `stop = 8`, `step = 3` — нормалізувати нічого" },
            { node: "init", note: '`i = 1`, `res = ""`' },
            { node: "d", note: "`1 < 8` → True" },
            { node: "add", note: '`s[1]` = `A` → `res = "A"`' },
            { node: "inc", note: "`i = 4`" },
            { node: "d", note: "`4 < 8` → True" },
            { node: "add", note: '`s[4]` = `O` → `res = "AO"`' },
            { node: "inc", note: "`i = 7`" },
            { node: "d", note: "`7 < 8` → True" },
            { node: "add", note: '`s[7]` = `O` → `res = "AOO"`' },
            { node: "inc", note: "`i = 10`" },
            { node: "d", note: "`10 < 8` → False" },
            { node: "e", note: "результат: `'AOO'`" },
          ],
        },
        {
          name: 's = "SAILORMOON"; s[-4:]',
          steps: [
            { node: "s" },
            { node: "norm", note: "`start = -4 + 10 = 6`, `stop = None` → `10`, `step = 1`" },
            { node: "init", note: '`i = 6`, `res = ""`' },
            { node: "d", note: "`6 < 10` → True" },
            { node: "add", note: '`s[6]` = `M` → `res = "M"`' },
            { node: "inc", note: "`i = 7`" },
            { node: "d", note: "`7 < 10` → True" },
            { node: "add", note: '`res = "MO"`' },
            { node: "inc", note: "`i = 8`" },
            { node: "d", note: "`8 < 10` → True" },
            { node: "add", note: '`res = "MOO"`' },
            { node: "inc", note: "`i = 9`" },
            { node: "d", note: "`9 < 10` → True" },
            { node: "add", note: '`res = "MOON"`' },
            { node: "inc", note: "`i = 10`" },
            { node: "d", note: "`10 < 10` → False" },
            { node: "e", note: "результат: `'MOON'`" },
          ],
        },
      ],
      caption: "Для від'ємного кроку все так само, але умова — `i > stop`, а межі за замовчуванням — з кінця до початку. Через обрізання меж зріз ніколи не кидає `IndexError`.",
    },
    {
      type: "tip",
      title: "Паліндром в один рядок",
      md: "`s == s[::-1]` — перевірка на паліндром. Для фраз спершу нормалізуй: `clean = \"\".join(ch for ch in s.lower() if ch.isalnum())`, а потім `clean == clean[::-1]`. «А роза упала на лапу Азора» — перевір сам!",
    },
    {
      type: "quiz",
      question: "`s = \"SAILORMOON\"`. Що дасть `s[-4:]`?",
      options: ["\"SAIL\"", "\"MOON\"", "\"NOOM\"", "\"ORMOON\""],
      answer: 1,
      explain: "`-4` — четвертий символ з кінця (`M`), а порожній `stop` означає «до кінця». Отже `\"MOON\"`.",
    },

    // ───────────────────────── Незмінність
    { type: "heading", text: "Незмінність: рядок не можна «підправити»" },
    {
      type: "text",
      md: "Рядки **незмінні (immutable)**: після створення жоден символ не можна замінити. `s[0] = \"M\"` — це `TypeError`. Усі «зміни» насправді створюють **новий** об'єкт, а ім'я просто перечіплюється на нього.\n\nЦе не обмеження, а суперсила: рядки можна безпечно передавати куди завгодно (ніхто їх не зіпсує), використовувати як ключі словника, а Python може кешувати й перевикористовувати однакові рядки.",
    },
    {
      type: "viz",
      id: "immutable-memory",
      title: "Імена, об'єкти і перевтілення",
      caption: "Проганяй програму по кроках. Жоден об'єкт-рядок у пам'яті не змінюється — з'являються нові, а стрілки-імена перемикаються. Об'єкт, на який ніхто не вказує, прибере збирач сміття.",
    },
    {
      type: "code",
      title: "immutable.py",
      code: py`name = "usagi"
try:
    name[0] = "U"
except TypeError as e:
    print("Помилка:", e)

new_name = "U" + name[1:]
print(new_name, name)

original = name
name += " tsukino"
print(original, "|", name)
print(original is name)`,
      output: py`Помилка: 'str' object does not support item assignment
Usagi usagi
usagi | usagi tsukino
False`,
    },
    {
      type: "warning",
      title: "Метод не змінює рядок",
      md: "`name.upper()` сам по собі нічого не робить з `name` — він **повертає** новий рядок. Якщо результат не зберегти (`name = name.upper()`), він просто зникне. Класична помилка: викликати `s.strip()` і дивуватися, чому пробіли на місці.",
    },
    {
      type: "joke",
      hero: "Луна",
      md: "Усагі, рядки незмінні. Як і твоя звичка запізнюватися до школи. Різниця лише в тому, що рядок хоча б можна перезаписати новим: `usagi = usagi.replace(\"пізно\", \"вчасно\")`.",
    },

    // ───────────────────────── Операції
    { type: "heading", text: "Операції з рядками: +, *, in, len, порівняння" },
    {
      type: "text",
      md: "`+` склеює рядки (конкатенація), `*` повторює, `in` перевіряє, чи є підрядок, `len()` повертає кількість символів. Рядки порівнюються посимвольно за кодами Unicode — тому всі великі латинські літери «менші» за малі: `\"Z\" < \"a\"`.",
    },
    {
      type: "code",
      title: "operations.py",
      code: py`print("Сейлор" + " " + "Мун")
print("✨" * 5)
print("Мун" in "Сейлор Мун")
print(len("Місяць"))
print("abc" < "abd", "Z" < "a")
print(str(42) + " воїни")`,
      output: py`Сейлор Мун
✨✨✨✨✨
True
6
True True
42 воїни`,
    },
    {
      type: "warning",
      title: "str + int",
      md: "`\"Рівень: \" + 5` падає з `TypeError: can only concatenate str (not \"int\") to str`. Python не вгадує, чого ти хочеш. Або явно перетвори `str(5)`, або — краще — використовуй f-рядок: `f\"Рівень: {level}\"`.",
    },
    {
      type: "compare",
      title: "Збирання рядка в циклі",
      bad: {
        label: "+= у циклі",
        code: py`result = ""
for scout in scouts:
    result += scout + ", "
result = result[:-2]  # відрізаємо зайву кому`,
      },
      good: {
        label: "join",
        code: py`result = ", ".join(scouts)`,
      },
      note: "Кожне `+=` створює новий рядок і копіює все попереднє — на тисячах елементів це повільно (O(n²) у гіршому випадку). `join` рахує довжину заздалегідь і будує рядок за один прохід. Плюс не треба відрізати зайву кому.",
    },

    // ───────────────────────── Методи
    { type: "heading", text: "Методи: трансформації Місячної призми" },
    {
      type: "text",
      md: "У рядків понад 40 методів. Найважливіші групи:\n\n- **Регістр:** `upper`, `lower`, `title`, `capitalize`, `swapcase`, `casefold`.\n- **Очищення:** `strip`, `lstrip`, `rstrip`, `removeprefix`, `removesuffix`.\n- **Пошук:** `find`, `index`, `count`, `startswith`, `endswith`.\n- **Заміна:** `replace`.\n- **Розбиття/склеювання:** `split`, `rsplit`, `splitlines`, `join`.\n- **Перевірки:** `isdigit`, `isalpha`, `isalnum`, `isspace`, `isupper`…\n- **Вирівнювання:** `center`, `ljust`, `rjust`, `zfill`.",
    },
    {
      type: "viz",
      id: "method-prism",
      title: "Місячна призма методів",
      caption: "Введи будь-який текст і обирай метод — літери перевтілюються на очах. Зверни увагу: внизу завжди лишається **оригінал без змін**, бо метод повертає новий рядок.",
    },
    {
      type: "code",
      title: "case_methods.py",
      code: py`s = "sailor MOON power"
print(s.upper())
print(s.lower())
print(s.title())
print(s.capitalize())
print(s.swapcase())
padded = "   ✨ moon ✨   "
print(repr(padded.strip()))
print(repr(padded.lstrip()))
print(repr("--moon--".strip("-")))`,
      output: py`SAILOR MOON POWER
sailor moon power
Sailor Moon Power
Sailor moon power
SAILOR moon POWER
'✨ moon ✨'
'✨ moon ✨   '
'moon'`,
    },
    {
      type: "code",
      title: "search_replace.py",
      code: py`s = "Moon Prism Power, Make Up!"
print(s.find("Power"))
print(s.find("Mars"))    # -1 — не знайдено
print(s.index("Prism"))
print(s.count("o"))
print(s.startswith("Moon"), s.endswith("!"))
print(s.replace("Moon", "Mars"))
print(s.replace("o", "0", 1))   # лише перше входження`,
      output: py`11
-1
5
3
True True
Mars Prism Power, Make Up!
M0on Prism Power, Make Up!`,
    },
    {
      type: "flow",
      title: "Як s.find(sub) шукає підрядок",
      nodes: [
        { id: "s", kind: "start", label: "s.find(sub)", col: 0, row: 0 },
        { id: "init", kind: "process", label: "n = len(s)\nm = len(sub)\ni = 0", col: 0, row: 1 },
        { id: "d1", kind: "decision", label: "i <= n - m ?", col: 0, row: 2 },
        { id: "d2", kind: "decision", label: "s[i:i+m] == sub ?", col: 0, row: 3 },
        { id: "inc", kind: "process", label: "i += 1", col: 0, row: 4 },
        { id: "nf", kind: "end", label: "return -1", col: 1, row: 2 },
        { id: "ok", kind: "end", label: "return i", col: 1, row: 3 },
      ],
      edges: [
        { from: "s", to: "init" },
        { from: "init", to: "d1" },
        { from: "d1", to: "d2", label: "True" },
        { from: "d1", to: "nf", label: "False", side: "right" },
        { from: "d2", to: "ok", label: "True", side: "right" },
        { from: "d2", to: "inc", label: "False" },
        { from: "inc", to: "d1", side: "left" },
      ],
      scenarios: [
        {
          name: '"moon".find("on")',
          steps: [
            { node: "s" },
            { node: "init", note: "`n = 4`, `m = 2`, `i = 0`" },
            { node: "d1", note: "`0 <= 2` → True" },
            { node: "d2", note: '`s[0:2]` = `"mo"` ≠ `"on"`' },
            { node: "inc", note: "`i = 1`" },
            { node: "d1", note: "`1 <= 2` → True" },
            { node: "d2", note: '`s[1:3]` = `"oo"` ≠ `"on"`' },
            { node: "inc", note: "`i = 2`" },
            { node: "d1", note: "`2 <= 2` → True" },
            { node: "d2", note: '`s[2:4]` = `"on"` — збіг!' },
            { node: "ok", note: "повертає `2`" },
          ],
        },
        {
          name: '"moon".find("sun")',
          steps: [
            { node: "s" },
            { node: "init", note: "`n = 4`, `m = 3`, `i = 0`" },
            { node: "d1", note: "`0 <= 1` → True" },
            { node: "d2", note: '`s[0:3]` = `"moo"` ≠ `"sun"`' },
            { node: "inc", note: "`i = 1`" },
            { node: "d1", note: "`1 <= 1` → True" },
            { node: "d2", note: '`s[1:4]` = `"oon"` ≠ `"sun"`' },
            { node: "inc", note: "`i = 2`" },
            { node: "d1", note: "`2 <= 1` → False — далі підрядок уже не влізе" },
            { node: "nf", note: "повертає `-1` (а `index` тут кинув би `ValueError`)" },
          ],
        },
      ],
      caption: "Це спрощена модель: CPython використовує хитріший і швидший алгоритм, але результат той самий. Оператор `in` робить той самий пошук і повертає `True`/`False`.",
    },
    {
      type: "tip",
      title: "find vs index",
      md: "`find` повертає `-1`, якщо не знайшов, а `index` кидає `ValueError`. Але якщо тобі треба лише «чи є?», не використовуй жодного — пиши `if \"Power\" in s:`. Це читабельніше і швидше.",
    },
    {
      type: "code",
      title: "split_join.py",
      code: py`csv = "Мун,Меркурій,Марс,Юпітер,Венера"
scouts = csv.split(",")
print(scouts)
print(len(scouts))
print(" ✦ ".join(scouts))
print("а  б   в".split())          # будь-які пробіли
print("key=value=x".split("=", 1))  # максимум 1 розріз
print("рядок1\nрядок2".splitlines())`,
      output: py`['Мун', 'Меркурій', 'Марс', 'Юпітер', 'Венера']
5
Мун ✦ Меркурій ✦ Марс ✦ Юпітер ✦ Венера
['а', 'б', 'в']
['key', 'value=x']
['рядок1', 'рядок2']`,
    },
    {
      type: "tip",
      title: "split() без аргументів — розумний",
      md: "`\"  а  б   в \".split()` ігнорує пробіли на краях і зливає підряд кілька пробілів, табуляцій і `\\n` в один роздільник. А `split(\" \")` чесно ріже по кожному пробілу й дає порожні рядки: `['', '', 'а', '', 'б', …]`. Для «слів» майже завжди потрібен варіант без аргументів.",
    },
    {
      type: "code",
      title: "checks_align.py",
      code: py`print("2024".isdigit(), "12a".isdigit())
print("Moon".isalpha(), "Moon1".isalnum())
print("   ".isspace(), "MOON".isupper())
print("42".zfill(5), "moon".center(10, "*"))
print("moon".ljust(8, ".") + "|", "moon".rjust(8) + "|")`,
      output: py`True False
True True
True True
00042 ***moon***
moon....|     moon|`,
    },
    {
      type: "code",
      title: "strip_trap.py",
      code: py`print("report.txt".rstrip(".txt"))       # пастка!
print("report.txt".removesuffix(".txt"))  # правильно (Python 3.9+)
print("Sailor Moon".removeprefix("Sailor "))`,
      output: py`repor
report
Moon`,
    },
    {
      type: "warning",
      title: "strip прибирає НАБІР символів",
      md: "`strip(\".txt\")` не видаляє суфікс `.txt` — він видаляє з країв **будь-які** символи з набору `{'.', 't', 'x'}`, доки не натрапить на інший. Тому `\"report.txt\"` перетворюється на `\"repor\"`. Для префіксів і суфіксів є `removeprefix` / `removesuffix`.",
    },
    {
      type: "quiz",
      question: "Що виведе код `s = \"moon\"; s.upper(); print(s)`?",
      options: ["MOON", "moon", "Moon", "None"],
      answer: 1,
      explain: "`upper()` повертає **новий** рядок, а результат ніде не збережено. Сам `s` незмінний, тож лишається `\"moon\"`. Треба `s = s.upper()`.",
    },

    // ───────────────────────── f-рядки
    { type: "heading", text: "f-рядки: форматування іменем Місяця" },
    {
      type: "text",
      md: "**f-рядок** (Python 3.6+) — найзручніший спосіб вставити значення в текст: префікс `f` і вирази у фігурних дужках `{}`. Усередині дужок можна писати будь-який вираз: арифметику, виклики методів, умовні вирази.\n\nПісля двокрапки йде **специфікація формату**: `{value:[заповнювач][вирівнювання][ширина][,][.точність][тип]}`. Наприклад, `{price:>10,.2f}` — праворуч у полі шириною 10, з розділювачами тисяч і двома знаками після коми.",
    },
    {
      type: "code",
      title: "fstrings.py",
      code: py`name = "Усагі"
age = 14
power = 9876.54321
print(f"{name} має {age} років")
print(f"Через рік: {age + 1}")
print(f"{name.upper()!r}")
print(f"Сила: {power:.2f}")
print(f"Сила: {power:,.1f}")
print(f"[{name:<8}] [{name:>8}] [{name:^8}]")
print(f"[{age:*^9}]")
print(f"{age=}, {power=:.0f}")`,
      output: py`Усагі має 14 років
Через рік: 15
'УСАГІ'
Сила: 9876.54
Сила: 9,876.5
[Усагі   ] [   Усагі] [ Усагі  ]
[***14****]
age=14, power=9877`,
    },
    {
      type: "viz",
      id: "format-spec",
      title: "Конструктор специфікації формату",
      caption: "Збирай специфікацію по частинах і дивись, як змінюється результат. Кожна клітинка — один символ; бліді — заповнювач до потрібної ширини. Спробуй тип `d` для дробового числа — Python теж видасть помилку.",
    },
    {
      type: "code",
      title: "number_formats.py",
      code: py`x = 0.8567
n = 1234567
print(f"{x:.1%}")
print(f"{n:_}")
print(f"{n:e}")
print(f"{255:b} {255:o} {255:x} {255:#X}")
print(f"{7:03d}")
print(f"{3.14159:8.3f}|")`,
      output: py`85.7%
1_234_567
1.234567e+06
11111111 377 ff 0XFF
007
   3.142|`,
    },
    {
      type: "tip",
      title: "f\"{x=}\" — дебаг за секунду",
      md: "Знак `=` після виразу друкує і сам вираз, і значення: `f\"{hp=}\"` → `hp=42`, `f\"{len(items)=}\"` → `len(items)=3`. Можна поєднувати з форматом: `f\"{ratio=:.2%}\"`. Ідеально, щоб швидко глянути, що відбувається, без довгих `print(\"hp:\", hp)`.",
    },
    {
      type: "code",
      title: "old_styles.py",
      code: py`hero, lvl = "Мун", 99
print("Герой {} рівня {}".format(hero, lvl))
print("Герой {h} рівня {l:03}".format(h=hero, l=lvl))
print("Герой %s рівня %d" % (hero, lvl))
template = "Привіт, {name}!"
print(template.format(name="Чібіуса"))`,
      output: py`Герой Мун рівня 99
Герой Мун рівня 099
Герой Мун рівня 99
Привіт, Чібіуса!`,
    },
    {
      type: "compare",
      title: "Складання повідомлення",
      bad: {
        label: "Конкатенація і str()",
        code: py`msg = "Герой " + name + " має " + str(age) + " років і " + str(round(power, 2)) + " сили"`,
      },
      good: {
        label: "f-рядок",
        code: py`msg = f"Герой {name} має {age} років і {power:.2f} сили"`,
      },
      note: "f-рядок читається як готовий текст, не потребує `str()` і одразу вміє форматувати числа. `.format()` лишається корисним для шаблонів, які задаються заздалегідь (наприклад, з файлу перекладів).",
    },
    {
      type: "joke",
      md: "Іменем Місяця — я покараю тебе за `\"Рівень: \" + 5`! `TypeError` — це не баг, це моє останнє попередження. Наступного разу — тільки f-рядки.",
    },
    {
      type: "quiz",
      question: "Що виведе `print(f\"{7:03}\")`?",
      options: ["7", "  7", "007", "7.000"],
      answer: 2,
      explain: "`0` перед шириною означає «доповнити нулями», `3` — ширина поля. Отже `007`. Корисно для номерів файлів: `frame_{i:04}.png`.",
    },

    // ───────────────────────── Unicode
    { type: "heading", text: "Unicode, байти та кодування" },
    {
      type: "text",
      md: "Кожен символ має номер у таблиці **Unicode** — **кодову точку**. `ord(\"A\") == 65`, `chr(65) == \"A\"`. Рядок Python зберігає саме символи, тому `len(\"🌙\") == 1`.\n\nАле коли текст іде у файл чи мережу, його треба перетворити на **байти** — це робить `encode()`. Найпоширеніше кодування — **UTF-8**: латиниця займає 1 байт, кирилиця — 2, більшість емодзі — 4. Назад — `bytes.decode()`.",
    },
    {
      type: "viz",
      id: "utf8-towers",
      title: "Вежі UTF-8",
      caption: "Кожна колона — один символ рядка, кожен кубик — один байт у UTF-8. Натисни на колону, щоб побачити байти в hex. Порівняй `len(s)` і `len(s.encode())` для латиниці, кирилиці та емодзі.",
    },
    {
      type: "code",
      title: "unicode.py",
      code: py`for ch in "A", "ї", "🌙":
    print(ch, ord(ch), hex(ord(ch)), ch.encode("utf-8"))
print(chr(9790), chr(0x1F319))
print("\u2764", "\N{CRESCENT MOON}")
word = "Місяць"
data = word.encode("utf-8")
print(len(word), len(data))
print(data.decode("utf-8"))`,
      output: py`A 65 0x41 b'A'
ї 1111 0x457 b'\xd1\x97'
🌙 127769 0x1f319 b'\xf0\x9f\x8c\x99'
☾ 🌙
❤ 🌙
6 12
Місяць`,
    },
    {
      type: "flow",
      title: "Скільки байтів займе символ у UTF-8",
      nodes: [
        { id: "s", kind: "start", label: 'ch.encode("utf-8")', col: 0, row: 0 },
        { id: "cp", kind: "process", label: "cp = ord(ch)", col: 0, row: 1 },
        { id: "d1", kind: "decision", label: "cp < 0x80 ?", col: 0, row: 2 },
        { id: "d2", kind: "decision", label: "cp < 0x800 ?", col: 0, row: 3 },
        { id: "d3", kind: "decision", label: "cp < 0x10000 ?", col: 0, row: 4 },
        { id: "b4", kind: "end", label: "4 байти\n11110xxx + 3×10xxxxxx", col: 0, row: 5 },
        { id: "b1", kind: "end", label: "1 байт\n0xxxxxxx", col: 1, row: 2 },
        { id: "b2", kind: "end", label: "2 байти\n110xxxxx 10xxxxxx", col: 1, row: 3 },
        { id: "b3", kind: "end", label: "3 байти\n1110xxxx + 2×10xxxxxx", col: 1, row: 4 },
      ],
      edges: [
        { from: "s", to: "cp" },
        { from: "cp", to: "d1" },
        { from: "d1", to: "b1", label: "True" },
        { from: "d1", to: "d2", label: "False" },
        { from: "d2", to: "b2", label: "True" },
        { from: "d2", to: "d3", label: "False" },
        { from: "d3", to: "b3", label: "True" },
        { from: "d3", to: "b4", label: "False" },
      ],
      scenarios: [
        {
          name: 'ch = "ї"',
          steps: [
            { node: "s" },
            { node: "cp", note: "`cp = 1111` (`0x457`)" },
            { node: "d1", note: "`0x457 < 0x80` → False" },
            { node: "d2", note: "`0x457 < 0x800` → True" },
            { node: "b2", note: "`b'\\xd1\\x97'` — 2 байти, як уся кирилиця" },
          ],
        },
        {
          name: 'ch = "€"',
          steps: [
            { node: "s" },
            { node: "cp", note: "`cp = 8364` (`0x20ac`)" },
            { node: "d1", note: "`0x20ac < 0x80` → False" },
            { node: "d2", note: "`0x20ac < 0x800` → False" },
            { node: "d3", note: "`0x20ac < 0x10000` → True" },
            { node: "b3", note: "`b'\\xe2\\x82\\xac'` — 3 байти" },
          ],
        },
        {
          name: 'ch = "🌙"',
          steps: [
            { node: "s" },
            { node: "cp", note: "`cp = 127769` (`0x1f319`)" },
            { node: "d1", note: "`0x1f319 < 0x80` → False" },
            { node: "d2", note: "`0x1f319 < 0x800` → False" },
            { node: "d3", note: "`0x1f319 < 0x10000` → False" },
            { node: "b4", note: "`b'\\xf0\\x9f\\x8c\\x99'` — 4 байти" },
          ],
        },
      ],
      caption: "Старші біти першого байта кажуть декодеру, скільки байтів у символі, а кожен байт продовження починається з `10`. Тому ASCII-текст у UTF-8 — це просто ASCII.",
    },
    {
      type: "code",
      title: "casefold.py",
      code: py`print("Straße".lower(), "Straße".casefold())
print("MOON".lower() == "moon")
print("Straße".casefold() == "STRASSE".casefold())`,
      output: py`straße strasse
True
True`,
    },
    {
      type: "tip",
      title: "casefold для порівняння без регістру",
      md: "Для порівняння «без урахування регістру» використовуй `a.casefold() == b.casefold()` — це агресивніша версія `lower()`, яка правильно обробляє німецьке `ß`, грецькі сигми тощо. А відкриваючи файли, завжди явно вказуй кодування: `open(path, encoding=\"utf-8\")`.",
    },
    {
      type: "quiz",
      question: "Скільки виведе `len(\"🌙\".encode(\"utf-8\"))`?",
      options: ["1", "2", "4", "8"],
      answer: 2,
      explain: "Символ один (`len(\"🌙\") == 1`), але його кодова точка `U+1F319` більша за `U+FFFF`, тому в UTF-8 вона займає **4 байти**.",
    },
    {
      type: "warning",
      title: "UnicodeDecodeError",
      md: "Якщо файл збережено в `cp1251`, а ти читаєш його як `utf-8`, отримаєш `UnicodeDecodeError` або «кракозябри». Кодування не вгадується — його треба знати. Для «брудних» даних є `decode(\"utf-8\", errors=\"replace\")`, що підставить `�` замість битих байтів.",
    },

    // ───────────────────────── Шпаргалка
    { type: "heading", text: "Шпаргалка трансформацій" },
    {
      type: "table",
      head: ["Що зробити", "Код", "Результат"],
      rows: [
        ["Довжина", "`len(\"moon\")`", "`4`"],
        ["Перший / останній символ", "`s[0]`, `s[-1]`", "`'m'`, `'n'`"],
        ["Розвернути", "`s[::-1]`", "`'noom'`"],
        ["Великі / малі літери", "`s.upper()`, `s.lower()`", "`'MOON'`, `'moon'`"],
        ["Кожне слово з великої", "`\"sailor moon\".title()`", "`'Sailor Moon'`"],
        ["Прибрати пробіли з країв", "`\"  hi  \".strip()`", "`'hi'`"],
        ["Замінити", "`s.replace(\"o\", \"0\")`", "`'m00n'`"],
        ["Розбити на слова", "`\"a b c\".split()`", "`['a', 'b', 'c']`"],
        ["Склеїти список", "`\"-\".join([\"a\", \"b\"])`", "`'a-b'`"],
        ["Чи є підрядок", "`\"oo\" in s`", "`True`"],
        ["Позиція підрядка", "`s.find(\"on\")`", "`2` або `-1`"],
        ["Два знаки після коми", "`f\"{x:.2f}\"`", "`'3.14'`"],
        ["Нулі попереду", "`f\"{7:03}\"`", "`'007'`"],
        ["Розділювачі тисяч", "`f\"{n:,}\"`", "`'1,234,567'`"],
        ["Відсотки", "`f\"{0.25:.0%}\"`", "`'25%'`"],
        ["Код символу", "`ord(\"A\")`, `chr(65)`", "`65`, `'A'`"],
        ["У байти і назад", "`s.encode()`, `b.decode()`", "`b'moon'` ↔ `'moon'`"],
      ],
    },
    {
      type: "tip",
      title: "Магія translate",
      md: "Для заміни багатьох символів за раз є `str.maketrans` + `translate`: `\"moon\".translate(str.maketrans(\"mo\", \"MO\"))` → `'MOOn'`. А щоб видалити символи — третій аргумент: `str.maketrans(\"\", \"\", \"aeiou\")` прибере всі голосні одним рухом.",
    },
    {
      type: "joke",
      md: "Тепер ти знаєш усі мої перевтілення: `upper()` — бойова форма, `strip()` — зняти зайве, `[::-1]` — повернути час назад, а f-рядок — фінальна атака. Moon Prism Power, `print()`!",
    },
  ],
};

export default section;
