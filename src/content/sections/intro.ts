import type { Section } from "../types";

const ZEN = `The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than *right* now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!`;

const section: Section = {
  "slug": "intro",
  "title": "Перші кроки з Python",
  "short": "print, REPL, Zen",
  "icon": "🚀",
  "group": "Старт",
  "summary": "Що таке Python, як працює інтерпретатор, перша програма, print() та input(), коментарі і Дзен Python.",
  "hero": {
    "name": "Наруто Узумакі",
    "universe": "Naruto",
    "emoji": "🍥",
    "quote": "Я ніколи не здаюся — і мій перший print теж не здасться!",
    "why": "Наруто починав з нуля і став Хокаге — ідеальний провідник для першого кроку в програмуванні."
  },
  "theme": {
    "accent": "#e56b00",
    "accent2": "#ffd23f",
    "glow": "#ff6b00"
  },
  "minutes": 10,
  "order": 1,
  "blocks": [
    // ─────────────────────────── 1. Що таке Python
    { type: "heading", text: "Що таке Python і чому саме він", id: "what-is-python" },
    {
      type: "text",
      md: "**Python** — це мова програмування, яку в 1991 році випустив нідерландець Ґвідо ван Россум. Назва — не на честь змії, а на честь британського комедійного шоу *Monty Python's Flying Circus*. Тож гумор тут у ДНК мови — і в нашому курсі теж.\n\nЧому з Python починають найчастіше:\n\n- **Читається майже як англійська.** Код `if age >= 18: print(\"Можна\")` зрозумілий навіть без підготовки.\n- **Мало «церемоній».** Щоб вивести текст, достатньо одного рядка — без класів, `main()` і крапок з комою.\n- **Величезна екосистема.** Веб (Django, FastAPI), дані й ШІ (NumPy, pandas, PyTorch), автоматизація, ігри, наука.\n- **Інтерпретована мова.** Пишеш — одразу запускаєш, без окремого кроку компіляції в `.exe`.\n\nНаруто вступав до Академії ніндзя, ледве тримаючи куна́й. Ти вступаєш до Академії Python — і твоя перша техніка буде простішою за *Клонування тіні*.",
    },
    {
      type: "code",
      title: "hello.py",
      code: `print("Привіт, світе!")
print("Мене звати Наруто, і я стану Хокаге!")`,
      output: `Привіт, світе!
Мене звати Наруто, і я стану Хокаге!`,
    },
    {
      type: "text",
      md: "Це вже повноцінна програма. Два рядки — дві команди, і Python виконує їх **згори донизу, по черзі**. Натисни «Запустити» — код виконається прямо в браузері (через Pyodide — справжній CPython, скомпільований у WebAssembly).",
    },
    {
      type: "joke",
      md: "Мій перший `print` вивів «Привіт, світе!». Ірука-сенсей сказав, що це найкращий Rasengan, який він бачив у першокласника. Ну… він сказав «нормально». Але я чув «найкращий», даттебайо!",
    },

    // ─────────────────────────── 2. Інтерпретатор
    { type: "heading", text: "Як Python виконує твій код", id: "interpreter" },
    {
      type: "text",
      md: "Коли ти запускаєш `python3 hello.py`, відбувається три кроки:\n\n- **Компіляція в байткод.** Інтерпретатор (найпоширеніший — **CPython**, написаний на C) читає весь файл, перевіряє синтаксис і перетворює текст на *байткод* — компактні інструкції на кшталт `LOAD_NAME`, `CALL`.\n- **Виконання у віртуальній машині.** Python Virtual Machine (PVM) бере інструкції одну за одною і виконує їх, працюючи зі стеком значень.\n- **Результат.** Текст у консолі, файл на диску, відповідь сервера — що завгодно.\n\nВажливий висновок: якщо у файлі **синтаксична помилка**, не виконається *жоден* рядок — бо компіляція зупиняється ще до старту. А от помилка на кшталт «такої змінної немає» трапляється вже *під час виконання* — і все, що було вище, встигне відпрацювати.",
    },
    {
      type: "viz",
      id: "interpreter-3d",
      title: "Шлях коду: від .py до виводу",
      caption: "Обертай сцену і натискай на станції. Кнопка **Запустити** пускає «чакру» конвеєром: вихідний код → компілятор → байткод → PVM → вивід.",
    },
    {
      type: "flow",
      title: "Як CPython запускає скрипт",
      nodes: [
        { id: "s", kind: "start", label: "python3 hello.py", col: 0, row: 0 },
        { id: "read", kind: "process", label: "прочитати весь\nфайл .py", col: 0, row: 1 },
        { id: "syn", kind: "decision", label: "синтаксис OK?", col: 0, row: 2 },
        { id: "se", kind: "end", label: "SyntaxError —\nнічого не виконано", col: 1, row: 3 },
        { id: "comp", kind: "process", label: "компіляція\nу байткод", col: 0, row: 3 },
        { id: "more", kind: "decision", label: "є ще\nінструкції?", col: 0, row: 4 },
        { id: "done", kind: "end", label: "програма\nзавершилась", col: 1, row: 5 },
        { id: "exec", kind: "process", label: "PVM виконує\nінструкцію", col: 0, row: 5 },
        { id: "err", kind: "decision", label: "помилка?", col: 0, row: 6 },
        { id: "tb", kind: "end", label: "Traceback: вище\nвсе вже виконано", col: 1, row: 7 },
      ],
      edges: [
        { from: "s", to: "read" },
        { from: "read", to: "syn" },
        { from: "syn", to: "comp", label: "Так" },
        { from: "syn", to: "se", label: "Ні", side: "right" },
        { from: "comp", to: "more" },
        { from: "more", to: "exec", label: "Так" },
        { from: "more", to: "done", label: "Ні", side: "right" },
        { from: "exec", to: "err" },
        { from: "err", to: "more", label: "Ні", side: "left" },
        { from: "err", to: "tb", label: "Так", side: "right" },
      ],
      scenarios: [
        {
          name: "Все гаразд",
          steps: [
            { node: "s", note: "Запускаємо файл із двох рядків: `name = \"Наруто\"` і `print(\"Привіт,\", name)`" },
            { node: "read", note: "Python читає **увесь** файл як текст — ще нічого не виконано" },
            { node: "syn", note: "Дужки й лапки на місці — синтаксис коректний" },
            { node: "comp", note: "Текст → байткод: `LOAD_CONST`, `STORE_NAME`, `CALL`…" },
            { node: "more", note: "Так — інструкції рядка 1" },
            { node: "exec", note: "`name = \"Наруто\"` — змінну створено" },
            { node: "err", note: "Помилок немає" },
            { node: "more", note: "Так — інструкції рядка 2" },
            { node: "exec", note: "`print(\"Привіт,\", name)` → вивід: `Привіт, Наруто`" },
            { node: "err", note: "Помилок немає" },
            { node: "more", note: "Інструкцій більше немає" },
            { node: "done", note: "Програма завершилась успішно (код виходу 0)" },
          ],
        },
        {
          name: "NameError",
          steps: [
            { node: "s", note: "Файл: `print(\"Старт\")` і `print(nam)` — одруківка в імені" },
            { node: "read", note: "Читаємо весь файл" },
            { node: "syn", note: "Синтаксично все правильно — `nam` виглядає як звичайне ім'я" },
            { node: "comp", note: "Компіляція проходить успішно" },
            { node: "more", note: "Так — рядок 1" },
            { node: "exec", note: "`print(\"Старт\")` → вивід: `Старт`" },
            { node: "err", note: "Помилок немає" },
            { node: "more", note: "Так — рядок 2" },
            { node: "exec", note: "Шукаємо ім'я `nam`… його не існує" },
            { node: "err", note: "Так — помилка **під час виконання**" },
            { node: "tb", note: "`NameError: name 'nam' is not defined`. Але `Старт` уже надруковано!" },
          ],
        },
        {
          name: "SyntaxError",
          steps: [
            { node: "s", note: "Файл: `print(\"Старт\")` і `print(\"Кінець\"` — забули дужку" },
            { node: "read", note: "Читаємо весь файл" },
            { node: "syn", note: "Дужку `(` так і не закрито — синтаксис зламаний" },
            { node: "se", note: "`SyntaxError: '(' was never closed`. Навіть `Старт` не надруковано — до виконання не дійшло" },
          ],
        },
      ],
      caption: "Синтаксис перевіряється для **всього** файлу до старту, а помилки виконання трапляються лише тоді, коли PVM дійде до проблемного рядка.",
    },
    {
      type: "code",
      title: "peek_bytecode.py",
      code: `import dis

# Подивимося, на що Python перетворює один рядок коду
dis.dis('print("Hi")')`,
    },
    {
      type: "tip",
      title: "Зазирни під капот",
      md: "Модуль `dis` показує байткод будь-якого рядка чи функції. Точний список інструкцій залежить від версії Python (3.12, 3.13 і 3.14 трохи відрізняються), тому вивід у тебе може не збігатися з сусідським — і це нормально. Кешований байткод Python зберігає в теках `__pycache__` у файлах `.pyc`, щоб наступний `import` був швидшим.",
    },
    {
      type: "code",
      title: "version.py",
      code: `import sys

print(sys.version_info.major)  # головна версія мови
print(sys.version_info >= (3, 10))`,
      output: `3
True`,
    },

    // ─────────────────────────── 3. print()
    { type: "heading", text: "print() на повну потужність", id: "print" },
    {
      type: "text",
      md: "`print()` — твоя перша техніка і найкращий друг для налагодження. Вона приймає **будь-яку кількість аргументів** через кому, перетворює кожен на текст і виводить, розділяючи пробілами. Числа, рядки, результати обчислень — усе підходить.",
    },
    {
      type: "code",
      title: "print_args.py",
      code: `print("Наруто", "Узумакі")
print("Ранг:", "генін", "| Рівень:", 12)
print("2 + 3 =", 2 + 3)
print()  # порожній рядок
print("Кінець місії")`,
      output: `Наруто Узумакі
Ранг: генін | Рівень: 12
2 + 3 = 5

Кінець місії`,
    },
    {
      type: "text",
      md: "У `print()` є два іменовані параметри, які змінюють усе:\n\n- `sep` — що ставити **між** аргументами (за замовчуванням пробіл `\" \"`).\n- `end` — що дописати **в кінці** (за замовчуванням перенесення рядка `\"\\n\"`).",
    },
    {
      type: "code",
      title: "sep_end.py",
      code: `print("2026", "09", "26", sep="-")
print("Rasengan", end="... ")
print("БУМ!")
print("ра", "мен", sep="")
print("Наруто", "Саске", "Сакура", sep=" | ")`,
      output: `2026-09-26
Rasengan... БУМ!
рамен
Наруто | Саске | Сакура`,
      highlight: [1, 2],
    },
    {
      type: "viz",
      id: "print-playground",
      title: "Лабораторія print()",
      caption: "Вмикай аргументи, міняй `sep` і `end` — і дивись, як змінюється вивід. Підсвічені символи — це саме те, що вставив `sep`, а `⏎` — перенесення рядка з `end`.",
    },
    {
      type: "text",
      md: "Спецсимволи всередині рядків починаються зі зворотної скісної риски — це *escape-послідовності*: `\\n` — новий рядок, `\\t` — табуляція, `\\\\` — сама риска, `\\\"` — лапки всередині рядка в лапках.",
    },
    {
      type: "code",
      title: "escapes.py",
      code: `print("Рядок 1\\nРядок 2")
print("Ім'я:\\tНаруто")
print("Шлях: C:\\\\ninja\\\\scrolls")
print("Він сказав: \\"Даттебайо!\\"")
print('Одинарні лапки дозволяють "звичайні" всередині')`,
      output: `Рядок 1
Рядок 2
Ім'я:	Наруто
Шлях: C:\\ninja\\scrolls
Він сказав: "Даттебайо!"
Одинарні лапки дозволяють "звичайні" всередині`,
    },
    {
      type: "text",
      md: "Щоб вставити значення прямо в текст, використовуй **f-рядки** — постав `f` перед лапками і пиши вирази у фігурних дужках. Докладно про них — у розділі про рядки, а поки що це найзручніший спосіб зібрати фразу.",
    },
    {
      type: "code",
      title: "fstrings.py",
      code: `name = "Наруто"
clones = 1000

print(f"{name} створює {clones} клонів!")
print(f"А це вдвічі більше: {clones * 2}")`,
      output: `Наруто створює 1000 клонів!
А це вдвічі більше: 2000`,
    },
    {
      type: "tip",
      title: "Налагодження одним символом",
      md: "Додай `=` у кінці виразу в f-рядку — і Python виведе і вираз, і значення: `print(f\"{clones=}\")` дасть `clones=1000`. Працює навіть з виразами: `f\"{clones * 2 = }\"` → `clones * 2 = 2000`. Ідеально, коли треба швидко глянути, що лежить у змінних.",
    },
    {
      type: "code",
      title: "debug_fstring.py",
      code: `clones = 1000
chakra = 97.5

print(f"{clones=}")
print(f"{clones * 2 = }")
print(f"{chakra=}, {clones=}")`,
      output: `clones=1000
clones * 2 = 2000
chakra=97.5, clones=1000`,
    },
    {
      type: "compare",
      title: "Склеювання тексту з числами",
      bad: {
        label: "Плюси, str() і ручні пробіли",
        code: `level = 12
print("Наруто має рівень " + str(level) + " і " + str(3) + " техніки")`,
      },
      good: {
        label: "f-рядок: читається з першого погляду",
        code: `level = 12
print(f"Наруто має рівень {level} і 3 техніки")`,
      },
      note: "Склеювання через `+` працює лише між рядками: `\"рівень \" + 12` впаде з `TypeError`. f-рядок сам перетворює значення на текст і не губить пробіли.",
    },
    {
      type: "tip",
      title: "Розпакування у print",
      md: "Зірочка розкладає колекцію на окремі аргументи: `team = [\"Наруто\", \"Саске\", \"Сакура\"]`, а потім `print(*team, sep=\", \")` → `Наруто, Саске, Сакура`. Без циклів і `join` — корисно для швидкого виводу списків.",
    },

    // ─────────────────────────── 4. input()
    { type: "heading", text: "input(): розмова з користувачем", id: "input" },
    {
      type: "text",
      md: "`input()` зупиняє програму, показує підказку і чекає, доки користувач щось введе й натисне Enter. Те, що ввели, повертається як **рядок** — і його зазвичай зберігають у змінну.",
    },
    {
      type: "code",
      title: "greet.py",
      code: `name = input("Як тебе звати, ніндзя? ")
village = input("З якого ти селища? ")
print(f"Вітаю, {name} із селища {village}!")`,
      output: `Як тебе звати, ніндзя? Наруто
З якого ти селища? Листя
Вітаю, Наруто із селища Листя!`,
      runnable: false,
    },
    {
      type: "warning",
      title: "input() завжди повертає str",
      md: "Навіть якщо користувач ввів `12`, ти отримаєш рядок `\"12\"`. Тоді `\"12\" + 1` дасть `TypeError`, а `\"12\" * 2` — `\"1212\"`. Щоб рахувати, перетвори явно: `age = int(input(\"Вік: \"))`.",
    },
    {
      type: "code",
      title: "input_is_str.py",
      code: `age = "12"  # саме це поверне input(), якщо ввести 12

print(age * 2)        # повторення рядка!
print(int(age) * 2)   # а тепер справжня математика
print(type(age))`,
      output: `1212
24
<class 'str'>`,
      highlight: [3, 4],
    },
    {
      type: "flow",
      title: "input() + int(): шлях введення",
      nodes: [
        { id: "s", kind: "start", label: "Старт", col: 0, row: 0 },
        { id: "in", kind: "io", label: "text = input(\"Вік: \")", col: 0, row: 1 },
        { id: "str", kind: "process", label: "text — завжди str", col: 0, row: 2 },
        { id: "ok", kind: "decision", label: "int(text)\nвдалося?", col: 0, row: 3 },
        { id: "ve", kind: "end", label: "ValueError", col: 1, row: 4 },
        { id: "age", kind: "process", label: "age = int(text)", col: 0, row: 4 },
        { id: "out", kind: "io", label: "print(age * 2)", col: 0, row: 5 },
        { id: "e", kind: "end", label: "Кінець", col: 0, row: 6 },
      ],
      edges: [
        { from: "s", to: "in" },
        { from: "in", to: "str" },
        { from: "str", to: "ok" },
        { from: "ok", to: "age", label: "Так" },
        { from: "ok", to: "ve", label: "Ні", side: "right" },
        { from: "age", to: "out" },
        { from: "out", to: "e" },
      ],
      scenarios: [
        {
          name: "ввели 12",
          steps: [
            { node: "s" },
            { node: "in", note: "Підказка `Вік: `, користувач вводить `12` і тисне Enter" },
            { node: "str", note: "`text = '12'` — рядок, не число!" },
            { node: "ok", note: "`int('12')` → `12`" },
            { node: "age", note: "`age = 12` (тепер `int`)" },
            { node: "out", note: "вивід: `24` (а `text * 2` дало б `1212`)" },
            { node: "e" },
          ],
        },
        {
          name: "ввели \" 7 \"",
          steps: [
            { node: "s" },
            { node: "in", note: "Користувач випадково ввів пробіли: ` 7 `" },
            { node: "str", note: "`text = ' 7 '`" },
            { node: "ok", note: "`int(' 7 ')` → `7` — пробіли по краях `int()` пробачає" },
            { node: "age", note: "`age = 7`" },
            { node: "out", note: "вивід: `14`" },
            { node: "e" },
          ],
        },
        {
          name: "ввели 12.5",
          steps: [
            { node: "s" },
            { node: "in", note: "Користувач вводить `12.5`" },
            { node: "str", note: "`text = '12.5'`" },
            { node: "ok", note: "У рядку крапка — для `int()` це не ціле число" },
            { node: "ve", note: "`ValueError: invalid literal for int() with base 10: '12.5'`" },
          ],
        },
      ],
      caption: "`input()` **завжди** повертає рядок. Перетворення — окремий крок, і саме на ньому програма може впасти.",
    },
    {
      type: "joke",
      md: "Я попросив у користувача кількість мисок рамену, він ввів `3`, а програма замовила «333». Какаші-сенсей сказав: «Наруто, це рядок. `int()` — твій друг». Тепер я завжди перевіряю тип. А рамен… рамен не пропав.",
    },

    // ─────────────────────────── 5. Коментарі
    { type: "heading", text: "Коментарі та docstring", id: "comments" },
    {
      type: "text",
      md: "Коментар починається з `#` і триває до кінця рядка — Python його повністю ігнорує. Коментарі пишуть для людей: навіщо тут цей код, чому саме так, що ще треба зробити.\n\nРядок у потрійних лапках `\"\"\"...\"\"\"` на початку файлу чи функції — це **docstring**, вбудована документація. На відміну від коментаря, вона доступна з коду через `__doc__` і `help()`.",
    },
    {
      type: "code",
      title: "comments.py",
      code: `"""Модуль тренування: рахуємо клонів.

Docstring на початку файлу — документація модуля.
"""

# Скільки клонів створює одна техніка
CLONES_PER_JUTSU = 4

jutsu_count = 3  # Наруто сьогодні в ударі
total = CLONES_PER_JUTSU * jutsu_count

# print("це рядок вимкнено — він не виконається")
print("Клонів:", total)
print(__doc__.splitlines()[0])`,
      output: `Клонів: 12
Модуль тренування: рахуємо клонів.`,
    },
    {
      type: "tip",
      title: "Коментуй «чому», а не «що»",
      md: "Коментар `x = x + 1  # додаємо 1` нічого не додає. А `retries += 1  # сервер іноді відповідає з 2-ї спроби` — рятує колегу через пів року. У більшості редакторів `Ctrl+/` (або `⌘+/` на Mac) коментує/розкоментовує виділені рядки — зручно, щоб тимчасово вимкнути шматок коду.",
    },

    // ─────────────────────────── 6. Синтаксис
    { type: "heading", text: "Синтаксис: відступи, регістр і порядок", id: "syntax" },
    {
      type: "text",
      md: "Кілька правил, які Python перевіряє суворіше за Какаші на іспиті дзвіночків:\n\n- **Відступи — це частина синтаксису.** Блоки коду (тіло `if`, циклу, функції) виділяються відступом, а не фігурними дужками. Стандарт — **4 пробіли**.\n- **Регістр має значення.** `print` і `Print` — різні імена; `Print` не існує.\n- **Один рядок — одна інструкція.** Крапка з комою в кінці не потрібна.\n- **Виконання — згори донизу.** Не можна використати змінну до того, як її створено.",
    },
    {
      type: "code",
      title: "indent.py",
      code: `chakra = 80

if chakra > 50:
    print("Досить чакри для Rasengan!")
    print("Атакуємо!")
print("Ця інструкція поза if — виконується завжди")`,
      output: `Досить чакри для Rasengan!
Атакуємо!
Ця інструкція поза if — виконується завжди`,
      highlight: [4, 5],
    },
    {
      type: "compare",
      title: "Відступи",
      bad: {
        label: "IndentationError: unexpected indent",
        code: `print("Старт")
    print("Зайвий відступ")  # Python не розуміє, до чого він`,
      },
      good: {
        label: "Відступ лише всередині блоку",
        code: `print("Старт")
if True:
    print("Відступ тут доречний")`,
      },
      note: "Ніколи не змішуй табуляції та пробіли в одному файлі. Налаштуй редактор, щоб клавіша Tab вставляла 4 пробіли — у VS Code і PyCharm це стоїть за замовчуванням для `.py`.",
    },
    {
      type: "viz",
      id: "step-runner",
      title: "Інтерпретатор крок за кроком",
      caption: "Перемикай програми і тисни **Крок**. Порівняй: з `NameError` перші рядки встигають виконатися, а з `SyntaxError` не виконується нічого — Python спершу компілює весь файл.",
    },
    {
      type: "warning",
      title: "Помилки — не вирок, а підказка",
      md: "Традиційний *traceback* читай **знизу вгору**: останній рядок каже тип помилки та причину (`NameError: name 'nam' is not defined. Did you mean: 'name'?`), а трохи вище — номер рядка, де вона сталася. Сучасний Python навіть підказує правильне ім'я. Не лякайся червоного тексту: це Python намагається допомогти.",
    },
    {
      type: "code",
      title: "case_sensitive.py",
      code: `Hero = "Наруто"
hero = "Саске"

print(Hero)
print(hero)
# Print("x")  →  NameError: name 'Print' is not defined`,
      output: `Наруто
Саске`,
    },
    {
      type: "joke",
      hero: "Саске Учіха",
      md: "Відступ — рівно 4 пробіли. Не 3. Не 2. Не таб. Досконалість — шлях клану Учіха. …Наруто, чому в тебе в одному файлі 3, 5 і таб одночасно?!",
    },
    {
      type: "warning",
      title: "Не називай файли як модулі",
      md: "Файл `random.py`, `string.py` чи `turtle.py` у твоїй теці «перекриє» однойменний стандартний модуль, і `import random` раптом імпортує твій же файл. Результат — загадкові помилки на кшталт `AttributeError: module 'random' has no attribute 'randint'`. Називай файли унікально: `my_random_game.py`.",
    },

    // ─────────────────────────── 7. REPL
    { type: "heading", text: "REPL — інтерактивна консоль", id: "repl" },
    {
      type: "text",
      md: "Запусти в терміналі просто `python3` (без імені файлу) — і побачиш запрошення `>>>`. Це **REPL**: *Read → Eval → Print → Loop*. Python читає вираз, обчислює, одразу друкує результат і чекає наступного. Ідеально для експериментів: перевірити, як працює функція, порахувати щось, згадати синтаксис.\n\nУ REPL не потрібен `print` — значення виразу показується автоматично. Вийти: `exit()` або `Ctrl+D` (на Windows `Ctrl+Z`, потім Enter).",
    },
    {
      type: "code",
      title: "REPL-сесія",
      code: `>>> 2 ** 10
1024
>>> "Наруто" * 2
'НарутоНаруто'
>>> _ + "!"          # _ — результат попереднього виразу
'НарутоНаруто!'
>>> len("Хокаге")
6`,
      runnable: false,
    },
    {
      type: "flow",
      title: "Цикл REPL: Read → Eval → Print → Loop",
      nodes: [
        { id: "s", kind: "start", label: "python3", col: 0, row: 0 },
        { id: "prompt", kind: "io", label: "показати >>>", col: 0, row: 1 },
        { id: "read", kind: "io", label: "Read: прочитати\nрядок", col: 0, row: 2 },
        { id: "exit", kind: "decision", label: "exit()?", col: 0, row: 3 },
        { id: "bye", kind: "end", label: "вихід з REPL", col: 1, row: 4 },
        { id: "eval", kind: "process", label: "Eval: обчислити", col: 0, row: 4 },
        { id: "none", kind: "decision", label: "результат\nis None?", col: 0, row: 5 },
        { id: "print", kind: "io", label: "Print: вивести\nrepr(результату)", col: 0, row: 6 },
      ],
      edges: [
        { from: "s", to: "prompt" },
        { from: "prompt", to: "read" },
        { from: "read", to: "exit" },
        { from: "exit", to: "eval", label: "Ні" },
        { from: "exit", to: "bye", label: "Так", side: "right" },
        { from: "eval", to: "none" },
        { from: "none", to: "print", label: "Ні" },
        { from: "none", to: "prompt", label: "Так", side: "right" },
        { from: "print", to: "prompt", side: "left" },
      ],
      scenarios: [
        {
          name: "Коротка сесія",
          steps: [
            { node: "s", note: "Запускаємо `python3` без імені файлу" },
            { node: "prompt", note: "Запрошення `>>>` — REPL чекає" },
            { node: "read", note: "Ввели `2 ** 10`" },
            { node: "exit", note: "Це не вихід" },
            { node: "eval", note: "`2 ** 10` → `1024`" },
            { node: "none", note: "Результат — число, не `None`" },
            { node: "print", note: "вивід: `1024`, а `_` тепер дорівнює `1024`" },
            { node: "prompt", note: "Loop — знову `>>>`" },
            { node: "read", note: "Ввели `print(\"Hi\")`" },
            { node: "exit", note: "Це не вихід" },
            { node: "eval", note: "`print` сам друкує `Hi` і повертає `None`" },
            { node: "none", note: "Так — `None` REPL не показує (тому не буде зайвого `None`)" },
            { node: "prompt", note: "Знову `>>>`" },
            { node: "read", note: "Ввели `exit()`" },
            { node: "exit", note: "Так — завершуємо сесію" },
            { node: "bye", note: "Повертаємось у звичайний термінал" },
          ],
        },
      ],
      caption: "REPL — це нескінченний цикл «прочитав → обчислив → показав». Значення `None` він мовчки пропускає.",
    },
    {
      type: "text",
      md: "Кілька вбудованих «сенсорів» для розвідки — вони знадобляться в кожному розділі курсу:\n\n- `type(x)` — який тип у значення.\n- `len(x)` — довжина рядка чи колекції.\n- `help(x)` — документація.\n- `dir(x)` — список усіх атрибутів і методів.",
    },
    {
      type: "code",
      title: "sensors.py",
      code: `print(type(42))
print(type("42"))
print(len("Хокаге"))
print(2 ** 100)
print(7 / 2, 7 // 2)`,
      output: `<class 'int'>
<class 'str'>
6
1267650600228229401496703205376
3.5 3`,
    },
    {
      type: "code",
      title: "help.py",
      code: `# Документація прямо в консолі
help(print)

# Які методи є у рядка? (показуємо перші 5 «звичайних»)
methods = [m for m in dir("") if not m.startswith("_")]
print(methods[:5])`,
    },
    {
      type: "tip",
      title: "Суперсили консолі",
      md: "- `python3 -i script.py` — запустить файл, а потім залишить тебе в REPL з усіма його змінними. Найкращий спосіб «покопатися» в результатах.\n- `python3 -c \"print(2**64)\"` — виконати один рядок без файлу.\n- У Python 3.13+ новий REPL має кольори, багаторядкове редагування і команди `help`, `exit` без дужок.\n- `python3 -m this`, `python3 -m http.server` — модулі теж можна запускати як програми.",
    },

    // ─────────────────────────── 8. Дзен
    { type: "heading", text: "Дзен Python", id: "zen" },
    {
      type: "text",
      md: "У Python є власний «кодекс ніндзя» — 19 афоризмів Тіма Пітерса про те, яким має бути хороший код. Він захований прямо в мові як великодня пасхалка: просто виконай `import this`.",
    },
    {
      type: "code",
      title: "zen.py",
      code: `import this`,
      output: ZEN,
    },
    {
      type: "viz",
      id: "zen-3d",
      title: "Сувій Дзену в 3D",
      caption: "Кільце з 19 скляних сувоїв. Обертай, натискай на будь-який — побачиш афоризм і його переклад. Кнопки внизу гортають по черзі.",
    },
    {
      type: "text",
      md: "Найважливіші правила для новачка:\n\n- **Readability counts** — код читають набагато частіше, ніж пишуть. Давай змінним осмислені імена.\n- **Explicit is better than implicit** — краще написати трохи більше, але зрозуміло.\n- **Errors should never pass silently** — не ховай помилки, розбирайся з ними.\n- **Simple is better than complex** — найпростіше рішення, що працює, зазвичай найкраще.",
    },
    {
      type: "joke",
      md: "«Now is better than never» — це ж буквально мій шлях ніндзя! А от «Although never is often better than *right* now» я поки що не зрозумів. Мабуть, це про те, чому Шікамару досі не дописав свій код.",
    },
    {
      type: "tip",
      title: "PEP 8 — стиль ніндзя",
      md: "Офіційний гайд зі стилю коду — [PEP 8](https://peps.python.org/pep-0008/): 4 пробіли, `snake_case` для змінних, пробіли навколо `=`, рядки до ~79–99 символів. Не завчай — постав форматер **Ruff** або **Black** у редактор, і він вирівнює код при збереженні.",
    },

    // ─────────────────────────── 9. Підсумок
    { type: "heading", text: "Шпаргалка і перевірка", id: "cheatsheet" },
    {
      type: "table",
      head: ["Що", "Приклад", "Результат / навіщо"],
      rows: [
        ["Вивести текст", "`print(\"Hi\")`", "`Hi`"],
        ["Кілька значень", "`print(\"a\", 1, True)`", "`a 1 True` — через пробіл"],
        ["Свій розділювач", "`print(1, 2, sep=\"-\")`", "`1-2`"],
        ["Без переносу", "`print(\"a\", end=\"\")`", "наступний `print` продовжить рядок"],
        ["Ввести дані", "`x = input(\"? \")`", "завжди `str`"],
        ["Рядок → число", "`int(\"12\")`, `float(\"2.5\")`", "`12`, `2.5`"],
        ["Вставити значення", "`f\"{name}!\"`", "f-рядок"],
        ["Налагодження", "`f\"{x=}\"`", "`x=42`"],
        ["Коментар", "`# текст`", "ігнорується Python"],
        ["Новий рядок / таб", "`\\n`, `\\t`", "escape-послідовності"],
        ["Тип значення", "`type(x)`", "`<class 'int'>`"],
        ["Довідка", "`help(x)`, `dir(x)`", "документація і методи"],
        ["Дзен", "`import this`", "19 правил хорошого коду"],
      ],
    },
    {
      type: "quiz",
      question: "Що виведе `print(\"A\", \"B\", sep=\"-\", end=\"!\")`?",
      options: ["A B!", "A-B!", "A-B-!", "A-B\\n!"],
      answer: 1,
      explain: "`sep` стоїть лише **між** аргументами (`A-B`), а `end` дописується один раз у самому кінці замість переносу рядка — виходить `A-B!`.",
    },
    {
      type: "quiz",
      question: "Користувач ввів `7` у `x = input()`. Що поверне `x * 3`?",
      options: ["21", "\"777\"", "TypeError", "7.0"],
      answer: 1,
      explain: "`input()` завжди повертає рядок, тому `x` — це `\"7\"`, а рядок, помножений на число, повторюється: `\"777\"`. Для математики потрібно `int(x) * 3`.",
    },
    {
      type: "quiz",
      question: "У файлі 5 рядків. У 4-му рядку — `print(nam)` (змінної `nam` немає). Що встигне виконатися?",
      options: [
        "Нічого — Python перевіряє весь файл заздалегідь",
        "Рядки 1–3, потім NameError",
        "Усі 5 рядків, а помилка — лише попередження",
        "Лише рядок 4",
      ],
      answer: 1,
      explain: "`NameError` виникає **під час виконання**: рядки 1–3 уже відпрацювали. А от `SyntaxError` (наприклад, забута кома) ламає компіляцію — і тоді не виконується жоден рядок.",
    },
    {
      type: "quiz",
      question: "Який рядок Python **повністю проігнорує**?",
      options: ["`print(\"# не коментар\")`", "`# print(\"привіт\")`", "`\"\"\"docstring\"\"\"`", "`Print(\"привіт\")`"],
      answer: 1,
      explain: "Усе після `#` (поза рядком) — коментар. У першому варіанті `#` всередині лапок — це просто символ тексту. Docstring — це справжній рядок, який зберігається в `__doc__`. А `Print` з великої літери дасть `NameError`.",
    },
    {
      type: "joke",
      md: "Ти пройшов перший розділ! Тепер ти офіційно генін Python. Далі — змінні і типи, там тебе чекає Гоку зі своїм «over 9000». Не відставай — я ніколи не беру свої слова назад!",
    },
  ],
};

export default section;
