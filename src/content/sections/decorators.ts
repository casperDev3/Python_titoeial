import type { Section } from "../types";

const section: Section = {
  "slug": "decorators",
  "title": "Декоратори",
  "short": "@wraps, замикання",
  "icon": "🦇",
  "group": "Просунуто",
  "summary": "Функції як об'єкти першого класу, замикання, декоратори з аргументами і без, functools.wraps, кешування lru_cache.",
  "hero": {
    "name": "Бетмен",
    "universe": "DC",
    "emoji": "🦇",
    "quote": "Я не маю суперсил. Я маю пояс, що обгортає будь-яку функцію.",
    "why": "Бетмен підсилює себе гаджетами, не змінюючи себе — як декоратор обгортає функцію, не змінюючи її коду."
  },
  "theme": {
    "accent": "#b88700",
    "accent2": "#64748b",
    "glow": "#eab308"
  },
  "minutes": 15,
  "order": 17,
  "blocks": [
    {
      "type": "text",
      "md": "У Брюса Вейна немає суперсили. Він не літає, не стріляє лазерами з очей і не піднімає вантажівок. Але в нього є **пояс з гаджетами**: гак-кішка, батаранги, димові шашки. Брюс лишається Брюсом — просто *обгорнутим* у спорядження, яке додає можливостей.\n\n**Декоратор** у Python — рівно така ідея. Це функція, що бере іншу функцію, *обгортає* її додатковою поведінкою (логування, заміри часу, перевірка прав, кеш, повторні спроби) і повертає посилену версію — **не змінюючи ані рядка** в коді оригіналу.\n\nЩоб по-справжньому зрозуміти декоратори, пройдемо шлях по сходинках:\n\n- функції — це **об'єкти**, які можна передавати і повертати;\n- вкладені функції і **замикання**;\n- перший декоратор вручну, а потім із синтаксисом `@`;\n- `*args, **kwargs` і `functools.wraps`;\n- декоратори **з аргументами** і стек із кількох декораторів;\n- практичні рецепти і кешування `lru_cache`."
    },
    {
      "type": "heading",
      "text": "Функції — об'єкти першого класу"
    },
    {
      "type": "text",
      "md": "У Python функція — такий самий об'єкт, як число чи рядок. Її можна:\n\n- присвоїти іншій змінній (без дужок!);\n- передати як аргумент в іншу функцію;\n- повернути з функції;\n- покласти у список чи словник.\n\nІм'я функції — просто **ярлик**, приклеєний до об'єкта-функції. Дужки `()` означають «виклич», а без дужок ти маєш сам об'єкт — як гаджет у руці, а не кинутий батаранг."
    },
    {
      "type": "code",
      "code": "def shout(text):\n    return text.upper() + \"!\"\n\ndef whisper(text):\n    return text.lower() + \"...\"\n\nyell = shout                          # без дужок: ще один ярлик\nprint(yell(\"я бетмен\"))\nprint(yell is shout, yell.__name__)\n\ndef speak(style, text):               # функція як аргумент\n    return style(text)\n\nprint(speak(whisper, \"ГОТЕМ СПИТЬ\"))\n\nbelt = {\"крик\": shout, \"шепіт\": whisper}   # функції у словнику\nprint(belt[\"шепіт\"](\"Тихіше, Робіне\"))",
      "title": "first_class.py",
      "output": "Я БЕТМЕН!\nTrue shout\nготем спить...\nтихіше, робіне..."
    },
    {
      "type": "tip",
      "title": "Словник функцій замість ланцюжка if/elif",
      "md": "`actions = {\"add\": add, \"sub\": sub}` і далі `actions[cmd](a, b)` — це і коротше, і швидше, ніж десять `elif cmd == ...`. Такий прийом називається **dispatch table**, і саме на ньому тримаються реєстри команд, плагінів і обробників подій."
    },
    {
      "type": "heading",
      "text": "Вкладені функції і замикання"
    },
    {
      "type": "text",
      "md": "Функцію можна оголосити **всередині** іншої функції і повернути її назовні. Найцікавіше: внутрішня функція **пам'ятає** змінні зовнішньої, навіть коли зовнішня вже завершилась. Це і є **замикання** (*closure*).\n\nPython зберігає такі змінні в спеціальних «комірках» (*cells*), до яких прив'язана внутрішня функція через `__closure__`. Звичайний фрейм зовнішньої функції зникає, але комірки живуть, поки на них є посилання — як Бет-печера, що існує, поки Брюс про неї пам'ятає."
    },
    {
      "type": "code",
      "code": "def make_signal(color):\n    def signal(message):\n        return f\"[{color}] {message}\"   # color — із зовнішньої функції\n    return signal\n\nyellow = make_signal(\"жовтий\")\nred = make_signal(\"червоний\")\n\nprint(yellow(\"Готем кличе\"))\nprint(red(\"Тривога!\"))\nprint(yellow.__code__.co_freevars)\nprint(yellow.__closure__[0].cell_contents)",
      "title": "closure.py",
      "output": "[жовтий] Готем кличе\n[червоний] Тривога!\n('color',)\nжовтий"
    },
    {
      "type": "text",
      "md": "Прочитати змінну з замикання можна вільно. А щоб її **змінити**, потрібно ключове слово `nonlocal` — інакше Python вирішить, що ти створюєш нову локальну змінну."
    },
    {
      "type": "code",
      "code": "def make_counter():\n    count = 0\n    def hit():\n        nonlocal count      # змінюємо змінну із замикання\n        count += 1\n        return count\n    return hit\n\npunch = make_counter()\npunch()\npunch()\nprint(\"удари:\", punch())\n\nkick = make_counter()       # новий виклик — нова комірка\nprint(\"удари ногою:\", kick())",
      "title": "nonlocal_counter.py",
      "highlight": [
        4
      ],
      "output": "удари: 3\nудари ногою: 1"
    },
    {
      "type": "viz",
      "id": "closure-cells",
      "title": "Замикання під мікроскопом",
      "caption": "Покроково: виклик `make_counter()` створює фрейм, а змінна `count` потрапляє в **комірку** (cell). Після `return hit` фрейм зникає, але комірка лишається жити — на неї тримає посилання `hit.__closure__`. Кожен виклик `punch()` змінює те саме значення."
    },
    {
      "type": "warning",
      "title": "UnboundLocalError без nonlocal",
      "md": "Якщо у внутрішній функції написати `count += 1` без `nonlocal count`, отримаєш `UnboundLocalError: cannot access local variable 'count'`. Присвоєння робить `count` **локальною** для внутрішньої функції, а читати її до присвоєння не можна."
    },
    {
      "type": "heading",
      "text": "Перший декоратор: обгортаємо вручну"
    },
    {
      "type": "text",
      "md": "Тепер склеїмо все разом. Декоратор — це функція, яка:\n\n- приймає функцію `func`;\n- створює всередині нову функцію `wrapper`, що робить щось **до** і **після** виклику `func`;\n- повертає `wrapper`.\n\nА потім ми **переприсвоюємо** старе ім'я новій, обгорнутій версії."
    },
    {
      "type": "code",
      "code": "def with_belt(func):\n    def wrapper():\n        print(\"🦇 надягаю пояс\")\n        func()                     # виклик оригіналу із замикання\n        print(\"🦇 знімаю пояс\")\n    return wrapper\n\ndef patrol():\n    print(\"патрулюю Готем\")\n\npatrol = with_belt(patrol)         # ім'я тепер веде на wrapper\npatrol()",
      "title": "manual_decorator.py",
      "highlight": [
        11
      ],
      "output": "🦇 надягаю пояс\nпатрулюю Готем\n🦇 знімаю пояс"
    },
    {
      "type": "text",
      "md": "Рядок `patrol = with_belt(patrol)` такий поширений, що для нього є **синтаксичний цукор** — символ `@` над функцією. Дві версії нижче абсолютно еквівалентні."
    },
    {
      "type": "code",
      "code": "def with_belt(func):\n    def wrapper():\n        print(\"🦇 надягаю пояс\")\n        func()\n        print(\"🦇 знімаю пояс\")\n    return wrapper\n\n@with_belt                         # те саме, що patrol = with_belt(patrol)\ndef patrol():\n    print(\"патрулюю Готем\")\n\npatrol()\nprint(patrol.__name__)             # хм, а де patrol?..",
      "title": "at_syntax.py",
      "highlight": [
        8
      ],
      "output": "🦇 надягаю пояс\nпатрулюю Готем\n🦇 знімаю пояс\nwrapper"
    },
    {
      type: "flow",
      title: "@with_belt: оголошення і виклик",
      nodes: [
        { id: "s", kind: "start", label: "Python читає def", col: 0, row: 0 },
        { id: "def", kind: "process", label: "створити функцію\npatrol", col: 0, row: 1 },
        { id: "dec", kind: "call", label: "with_belt(patrol)", col: 0, row: 2 },
        { id: "bind", kind: "process", label: "patrol = wrapper", col: 0, row: 3 },
        { id: "call", kind: "call", label: "patrol()", col: 0, row: 4 },
        { id: "before", kind: "io", label: "print(\"надягаю\")", col: 0, row: 5 },
        { id: "orig", kind: "call", label: "func()", col: 0, row: 6 },
        { id: "after", kind: "io", label: "print(\"знімаю\")", col: 0, row: 7 },
        { id: "e", kind: "end", label: "Кінець", col: 0, row: 8 },
      ],
      edges: [
        { from: "s", to: "def" },
        { from: "def", to: "dec" },
        { from: "dec", to: "bind", label: "return wrapper" },
        { from: "bind", to: "call" },
        { from: "call", to: "before", label: "у wrapper" },
        { from: "before", to: "orig" },
        { from: "orig", to: "after" },
        { from: "after", to: "e" },
      ],
      scenarios: [
        {
          name: "@with_belt + patrol()",
          steps: [
            { node: "s", note: "бачимо `@with_belt` над `def patrol()`" },
            { node: "def", note: "звичайна функція-об'єкт `patrol` створена" },
            { node: "dec", note: "**час оголошення**: декоратор викликається один раз; всередині народжується `wrapper`, що пам'ятає `func = patrol`" },
            { node: "bind", note: "ім'я `patrol` тепер веде на `wrapper`; `patrol.__name__ == \"wrapper\"`" },
            { node: "call", note: "**час виклику**: насправді викликаємо `wrapper()`" },
            { node: "before", note: "вивід: `🦇 надягаю пояс`" },
            { node: "orig", note: "оригінал із замикання — вивід: `патрулюю Готем`" },
            { node: "after", note: "вивід: `🦇 знімаю пояс`" },
            { node: "e", note: "`wrapper` нічого не повертає → `None`" },
          ],
        },
      ],
      caption: "Верхня половина схеми відбувається **один раз**, коли Python читає `def`. Нижня — **при кожному** виклику `patrol()`.",
    },
    {
      "type": "joke",
      "md": "Альфред: «Сер, ви знову загорнули функцію `patrol` у три шари обгорток». — Я: «Альфреде, це не обгортки. Це **спорядження**».",
      "hero": "Бетмен"
    },
    {
      "type": "quiz",
      "question": "Коли саме виконується тіло декоратора `with_belt` (не `wrapper`)?",
      "options": [
        "При кожному виклику `patrol()`",
        "Один раз — у момент оголошення функції з `@with_belt`",
        "Ніколи",
        "Лише при першому виклику `patrol()`"
      ],
      "answer": 1,
      "explain": "`@with_belt` — це `patrol = with_belt(patrol)`, і воно виконується **одразу**, коли Python читає `def`. Щоразу при виклику працює вже `wrapper`."
    },
    {
      "type": "heading",
      "text": "Універсальний wrapper: *args, **kwargs і return"
    },
    {
      "type": "text",
      "md": "У попереднього декоратора дві вади: `wrapper()` не приймає аргументів і нічого не повертає. Справжній декоратор має бути **прозорим**: пропускати будь-які аргументи через `*args, **kwargs` і повертати результат оригіналу."
    },
    {
      "type": "code",
      "code": "def log_call(func):\n    def wrapper(*args, **kwargs):\n        print(f\"→ {func.__name__}{args} {kwargs}\")\n        result = func(*args, **kwargs)     # пробрасуємо все як є\n        print(f\"← {result!r}\")\n        return result                      # не губимо результат!\n    return wrapper\n\n@log_call\ndef damage(base, multiplier=2):\n    return base * multiplier\n\ntotal = damage(10, multiplier=3)\nprint(\"total =\", total)",
      "title": "log_call.py",
      "highlight": [
        2,
        4,
        6
      ],
      "output": "→ damage(10,) {'multiplier': 3}\n← 30\ntotal = 30"
    },
    {
      "type": "viz",
      "id": "wrapper-flow",
      "title": "Як декоратор підміняє функцію",
      "caption": "Спершу — **час оголошення**: Python створює оригінальну `add`, передає її в `log`, і ім'я `add` перечіпляється на `wrapper`. Потім — **час виклику**: сигнал заходить у `wrapper`, звідти в оригінал і повертається назад. Перемкни `@wraps` і подивись, що стає з `add.__name__`."
    },
    {
      "type": "warning",
      "title": "Забутий return у wrapper",
      "md": "Найчастіша помилка: `wrapper` викликає `func(*args, **kwargs)`, але **не повертає** результат. Декорована функція раптом починає повертати `None`, а ти годину шукаєш баг у зовсім іншому місці. Завжди: `result = func(...)` → `return result`."
    },
    {
      "type": "heading",
      "text": "functools.wraps: не губимо ім'я і документацію"
    },
    {
      "type": "text",
      "md": "Після декорування ім'я функції веде на `wrapper` — і разом з тим зникають її `__name__`, `__doc__`, анотації. Страждають налагодження, логи, документація, тестові фреймворки.\n\nРішення — декоратор `@functools.wraps(func)` на самому `wrapper`: він копіює метадані оригіналу і ще й зберігає посилання на нього в `__wrapped__`."
    },
    {
      "type": "compare",
      "title": "Обгортка без wraps і з wraps",
      "bad": {
        "label": "Бетмен без маски — усі бачать Брюса-wrapper",
        "code": "def plain(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@plain\ndef alfred():\n    \"\"\"Дворецький і найкращий друг.\"\"\"\n\nprint(alfred.__name__)   # wrapper\nprint(alfred.__doc__)    # None"
      },
      "good": {
        "label": "Метадані оригіналу на місці",
        "code": "from functools import wraps\n\ndef polite(func):\n    @wraps(func)                     # копіює __name__, __doc__, ...\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@polite\ndef alfred():\n    \"\"\"Дворецький і найкращий друг.\"\"\"\n\nprint(alfred.__name__)   # alfred\nprint(alfred.__doc__)    # Дворецький і найкращий друг."
      },
      "note": "Правило просте: **кожен** `wrapper` отримує `@wraps(func)`. Це один рядок, який рятує від дивних імен у трейсбеках і логах."
    },
    {
      "type": "code",
      "code": "from functools import wraps\n\ndef polite(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@polite\ndef lucius(gadget):\n    \"\"\"Інженер Wayne Enterprises.\"\"\"\n    return f\"новий {gadget}\"\n\nprint(lucius.__name__, \"|\", lucius.__doc__)\nprint(lucius.__wrapped__(\"бетмобіль\"))     # доступ до оригіналу в обхід обгортки",
      "title": "wraps.py",
      "output": "lucius | Інженер Wayne Enterprises.\nновий бетмобіль"
    },
    {
      "type": "tip",
      "title": "__wrapped__ — чорний хід для тестів",
      "md": "Завдяки `@wraps` у кожної обгорнутої функції є `func.__wrapped__` — оригінал без декоратора. У тестах так можна перевірити чисту логіку без кешу, ретраїв чи перевірки прав. А `inspect.signature(func)` покаже справжню сигнатуру, а не `(*args, **kwargs)`."
    },
    {
      "type": "heading",
      "text": "Декоратори з аргументами"
    },
    {
      "type": "text",
      "md": "Іноді декоратор треба налаштувати: `@repeat(3)`, `@retry(times=5)`, `@require(\"admin\")`. Тут з'являється ще один рівень вкладеності:\n\n- `repeat(3)` — **фабрика**: приймає налаштування і повертає справжній декоратор;\n- `decorator(func)` — приймає функцію і повертає обгортку;\n- `wrapper(*args, **kwargs)` — те, що виконується при виклику.\n\nТобто `@repeat(3)` — це `batarang = repeat(3)(batarang)`. Спочатку виклик з аргументами, потім — застосування."
    },
    {
      "type": "code",
      "code": "from functools import wraps\n\ndef repeat(times):                     # 1. фабрика\n    def decorator(func):               # 2. декоратор\n        @wraps(func)\n        def wrapper(*args, **kwargs):  # 3. обгортка\n            result = None\n            for _ in range(times):\n                result = func(*args, **kwargs)\n            return result\n        return wrapper\n    return decorator\n\n@repeat(3)\ndef batarang(target):\n    print(f\"батаранг → {target}\")\n\nbatarang(\"Джокер\")",
      "title": "repeat.py",
      "highlight": [
        3,
        4,
        6,
        14
      ],
      "output": "батаранг → Джокер\nбатаранг → Джокер\nбатаранг → Джокер"
    },
    {
      "type": "code",
      "code": "from functools import wraps\n\ndef retry(times):\n    def decorator(func):\n        @wraps(func)\n        def wrapper(*args, **kwargs):\n            for attempt in range(1, times + 1):\n                try:\n                    return func(*args, **kwargs)\n                except ConnectionError as e:\n                    print(f\"спроба {attempt}: {e}\")\n            raise RuntimeError(\"Бет-сигнал так і не пройшов\")\n        return wrapper\n    return decorator\n\ncalls = 0\n\n@retry(times=3)\ndef send_signal():\n    global calls\n    calls += 1\n    if calls < 3:\n        raise ConnectionError(\"хмари заважають\")\n    return \"сигнал у небі! 🦇\"\n\nprint(send_signal())",
      "title": "retry.py",
      "output": "спроба 1: хмари заважають\nспроба 2: хмари заважають\nсигнал у небі! 🦇"
    },
    {
      type: "flow",
      title: "Як працює wrapper у @retry",
      nodes: [
        { id: "s", kind: "start", label: "send_signal()", col: 0, row: 0 },
        { id: "init", kind: "process", label: "attempt = 1", col: 0, row: 1 },
        { id: "cond", kind: "decision", label: "attempt <= times ?", col: 0, row: 2 },
        { id: "call", kind: "call", label: "func(*args, **kwargs)", col: 0, row: 3 },
        { id: "err", kind: "decision", label: "ConnectionError?", col: 0, row: 4 },
        { id: "ret", kind: "end", label: "return результат", col: 0, row: 5 },
        { id: "fail", kind: "end", label: "raise RuntimeError", col: 1, row: 3 },
        { id: "log", kind: "io", label: "print(f\"спроба ...\")", col: 1, row: 5 },
        { id: "inc", kind: "process", label: "attempt += 1", col: 1, row: 6 },
      ],
      edges: [
        { from: "s", to: "init" },
        { from: "init", to: "cond" },
        { from: "cond", to: "call", label: "True" },
        { from: "cond", to: "fail", label: "False", side: "right" },
        { from: "call", to: "err" },
        { from: "err", to: "ret", label: "Ні" },
        { from: "err", to: "log", label: "Так", side: "right" },
        { from: "log", to: "inc" },
        { from: "inc", to: "cond", side: "left" },
      ],
      scenarios: [
        {
          name: "@retry(times=3)",
          steps: [
            { node: "s", note: "насправді викликається `wrapper()`; `calls = 0`" },
            { node: "init", note: "`attempt = 1`" },
            { node: "cond", note: "`1 <= 3` → True" },
            { node: "call", note: "`calls = 1` → `raise ConnectionError`" },
            { node: "err", note: "так — `except` ловить" },
            { node: "log", note: "вивід: `спроба 1: хмари заважають`" },
            { node: "inc", note: "`attempt = 2`" },
            { node: "cond", note: "`2 <= 3` → True" },
            { node: "call", note: "`calls = 2` → знову `ConnectionError`" },
            { node: "err", note: "так" },
            { node: "log", note: "вивід: `спроба 2: хмари заважають`" },
            { node: "inc", note: "`attempt = 3`" },
            { node: "cond", note: "`3 <= 3` → True" },
            { node: "call", note: "`calls = 3` → повертає `\"сигнал у небі! 🦇\"`" },
            { node: "err", note: "винятку немає" },
            { node: "ret", note: "`return` одразу виходить і з циклу, і з `wrapper`" },
          ],
        },
        {
          name: "@retry(times=2)",
          steps: [
            { node: "s", note: "`calls = 0`, але спроб лише 2" },
            { node: "init", note: "`attempt = 1`" },
            { node: "cond", note: "`1 <= 2` → True" },
            { node: "call", note: "`calls = 1` → `ConnectionError`" },
            { node: "err", note: "так" },
            { node: "log", note: "вивід: `спроба 1: хмари заважають`" },
            { node: "inc", note: "`attempt = 2`" },
            { node: "cond", note: "`2 <= 2` → True" },
            { node: "call", note: "`calls = 2` → `ConnectionError`" },
            { node: "err", note: "так" },
            { node: "log", note: "вивід: `спроба 2: хмари заважають`" },
            { node: "inc", note: "`attempt = 3`" },
            { node: "cond", note: "`3 <= 2` → False — спроби скінчились" },
            { node: "fail", note: "`RuntimeError: Бет-сигнал так і не пройшов`" },
          ],
        },
      ],
      caption: "Цикл `for attempt in range(1, times + 1)` тут розгорнуто в лічильник. `return` усередині `try` завершує `wrapper` при першому успіху.",
    },
    {
      "type": "warning",
      "title": "@repeat без дужок",
      "md": "Якщо декоратор чекає аргументи, а ти напишеш `@repeat` замість `@repeat(3)`, то сама функція потрапить у параметр `times`, а ім'я `batarang` почне вказувати на `decorator`. Виклик `batarang(\"Джокер\")` **нічого не надрукує** — він мовчки поверне ще одну функцію `wrapper`. А якщо викликати і її — отримаєш загадкове `TypeError: 'function' object cannot be interpreted as an integer`. Пам'ятай: з аргументами — **завжди з дужками**."
    },
    {
      "type": "heading",
      "text": "Стек декораторів: порядок має значення"
    },
    {
      "type": "text",
      "md": "На одну функцію можна начепити кілька декораторів. Вони **застосовуються знизу вгору** (найближчий до `def` — першим), а при виклику сигнал проходить **зверху вниз** — як крізь шари бронекостюма: зовнішній шар зустрічає удар першим.\n\nЗапис `@bold` над `@italic` над `def motto()` — це те саме, що `motto = bold(italic(motto))`."
    },
    {
      "type": "code",
      "code": "def bold(func):\n    def wrapper():\n        return \"<b>\" + func() + \"</b>\"\n    return wrapper\n\ndef italic(func):\n    def wrapper():\n        return \"<i>\" + func() + \"</i>\"\n    return wrapper\n\n@bold\n@italic\ndef motto():\n    return \"Я — ніч\"\n\nprint(motto())               # bold(italic(motto))",
      "title": "stack_order.py",
      "output": "<b><i>Я — ніч</i></b>"
    },
    {
      "type": "code",
      "code": "def layer(name):\n    def decorator(func):\n        print(f\"застосовую @{name}\")          # час оголошення\n        def wrapper():\n            print(f\"вхід у {name}\")            # час виклику\n            result = func()\n            print(f\"вихід з {name}\")\n            return result\n        return wrapper\n    return decorator\n\n@layer(\"броня\")\n@layer(\"пояс\")\ndef core():\n    print(\"  ⚡ Брюс діє\")\n\nprint(\"--- виклик ---\")\ncore()",
      "title": "stack_trace.py",
      "output": "застосовую @пояс\nзастосовую @броня\n--- виклик ---\nвхід у броня\nвхід у пояс\n  ⚡ Брюс діє\nвихід з пояс\nвихід з броня"
    },
    {
      "type": "viz",
      "id": "belt-layers-3d",
      "title": "Пояс Бетмена: шари декораторів у 3D",
      "caption": "Кожна скляна оболонка — окремий декоратор, у центрі — оригінальна функція. Вмикай і вимикай шари, тисни **Виклик** і стеж за імпульсом: він проходить оболонки ззовні всередину, а результат повертається назад. Увімкни `@cache` і виклич двічі — вдруге імпульс розвернеться на шарі кешу, так і не дійшовши до ядра."
    },
    {
      "type": "quiz",
      "question": "Що виведе `print(motto())`, якщо над `motto` стоять `@italic`, а під ним `@bold`?",
      "options": [
        "`<b><i>Я — ніч</i></b>`",
        "`<i><b>Я — ніч</b></i>`",
        "`<i>Я — ніч</i>`",
        "Помилку"
      ],
      "answer": 1,
      "explain": "Нижній декоратор застосовується першим: `motto = italic(bold(motto))`. Зовнішній шар — `italic`, тож він обгортає результат `bold`."
    },
    {
      "type": "heading",
      "text": "Практичні рецепти"
    },
    {
      "type": "text",
      "md": "Декоратори — ідеальне місце для **наскрізної** логіки, яка не стосується суті функції: заміри часу, логування, реєстрація, валідація, контроль доступу. Сама функція лишається чистою, а гаджети можна додавати й знімати одним рядком."
    },
    {
      "type": "code",
      "code": "import time\nfrom functools import wraps\n\ndef timer(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        elapsed = time.perf_counter() - start\n        speed = \"блискавично\" if elapsed < 1 else \"повільно\"\n        print(f\"⏱ {func.__name__}: {speed}\")\n        return result\n    return wrapper\n\n@timer\ndef scan_city(blocks):\n    return sum(i * i for i in range(blocks))\n\nprint(scan_city(10_000))",
      "title": "timer.py",
      "output": "⏱ scan_city: блискавично\n333283335000"
    },
    {
      "type": "code",
      "code": "GADGETS = {}\n\ndef gadget(func):\n    \"\"\"Реєструє функцію і повертає її БЕЗ обгортки.\"\"\"\n    GADGETS[func.__name__] = func\n    return func\n\n@gadget\ndef grapple():\n    return \"гак-кішка\"\n\n@gadget\ndef smoke():\n    return \"димова шашка\"\n\nprint(list(GADGETS))\nprint(GADGETS[\"smoke\"]())",
      "title": "registry.py",
      "output": "['grapple', 'smoke']\nдимова шашка"
    },
    {
      "type": "tip",
      "title": "Декоратор не зобов'язаний обгортати",
      "md": "Декоратор може просто **зареєструвати** функцію і повернути її ж — саме так працюють `@app.route(\"/\")` у Flask, `@pytest.fixture`, `@atexit.register`. Жодного `wrapper`, жодних накладних витрат при виклику."
    },
    {
      "type": "code",
      "code": "from functools import wraps\n\ndef require(role):\n    def decorator(func):\n        @wraps(func)\n        def wrapper(user, *args, **kwargs):\n            if role not in user[\"roles\"]:\n                return f\"⛔ {user['name']}: доступ до {func.__name__} заборонено\"\n            return func(user, *args, **kwargs)\n        return wrapper\n    return decorator\n\n@require(\"batcave\")\ndef open_batcave(user):\n    return f\"🦇 {user['name']} входить у Бет-печеру\"\n\nbruce = {\"name\": \"Брюс\", \"roles\": {\"batcave\", \"wayne\"}}\njoker = {\"name\": \"Джокер\", \"roles\": {\"chaos\"}}\nprint(open_batcave(bruce))\nprint(open_batcave(joker))",
      "title": "require_role.py",
      "output": "🦇 Брюс входить у Бет-печеру\n⛔ Джокер: доступ до open_batcave заборонено"
    },
    {
      "type": "text",
      "md": "Декоратором може бути будь-що **викликане** — навіть клас з методом `__call__`. Це зручно, коли обгортці потрібен стан, до якого хочеться мати доступ ззовні."
    },
    {
      "type": "code",
      "code": "class CountCalls:\n    def __init__(self, func):\n        self.func = func\n        self.calls = 0\n\n    def __call__(self, *args, **kwargs):\n        self.calls += 1\n        return self.func(*args, **kwargs)\n\n@CountCalls\ndef punch():\n    return \"БАМ!\"\n\npunch()\npunch()\nprint(punch(), \"— ударів:\", punch.calls)",
      "title": "class_decorator.py",
      "output": "БАМ! — ударів: 3"
    },
    {
      "type": "tip",
      "title": "Ти вже користуєшся декораторами",
      "md": "`@property`, `@staticmethod`, `@classmethod`, `@dataclass`, `@functools.cache`, `@contextlib.contextmanager` — усе це декоратори зі стандартної бібліотеки. Тепер ти знаєш, що під кожним `@` — звичайний виклик функції (чи класу) з твоєю функцією в аргументі."
    },
    {
      "type": "heading",
      "text": "lru_cache: пам'ять Альфреда"
    },
    {
      "type": "text",
      "md": "`functools.lru_cache` — вбудований декоратор, який **запам'ятовує** результати викликів: для тих самих аргументів функція вдруге не рахується, відповідь береться з кешу. *LRU* (*Least Recently Used*) означає: коли кеш заповнений, викидається те, що використовували найдавніше.\n\nКласичний приклад — рекурсивні числа Фібоначчі: без кешу `fib(n)` рахує ті самі значення тисячі разів, з кешем — кожне рівно один раз."
    },
    {
      "type": "code",
      "code": "from functools import lru_cache\n\ncalls = 0\n\ndef fib_slow(n):\n    global calls\n    calls += 1\n    return n if n < 2 else fib_slow(n - 1) + fib_slow(n - 2)\n\nprint(fib_slow(20), \"| викликів без кешу:\", calls)\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n\nprint(fib(20), \"|\", fib.cache_info())\nprint(fib(100))                  # миттєво",
      "title": "lru_fib.py",
      "highlight": [
        12
      ],
      "output": "6765 | викликів без кешу: 21891\n6765 | CacheInfo(hits=18, misses=21, maxsize=None, currsize=21)\n354224848179261915075"
    },
    {
      "type": "viz",
      "id": "fib-cache-tree",
      "title": "Дерево викликів fib(n): без кешу і з кешем",
      "caption": "Кожен вузол — виклик функції. Без кешу дерево вибухає експоненційно: `fib(2)` рахується знову і знову. Увімкни `@lru_cache` — і повтори перетворюються на миттєві **влучання в кеш** (жовті листки), а дерево стискається до «гілки». Покрути `n` і порівняй лічильники."
    },
    {
      "type": "code",
      "code": "from functools import lru_cache\n\n@lru_cache(maxsize=2)           # пам'ятає лише 2 останні досьє\ndef dossier(name):\n    print(f\"  🔍 шукаю досьє: {name}\")\n    return name.upper()\n\nfor villain in [\"Джокер\", \"Бейн\", \"Джокер\", \"Пінгвін\", \"Бейн\"]:\n    dossier(villain)\n\nprint(dossier.cache_info())\ndossier.cache_clear()           # очистити кеш повністю",
      "title": "lru_maxsize.py",
      "output": "  🔍 шукаю досьє: Джокер\n  🔍 шукаю досьє: Бейн\n  🔍 шукаю досьє: Пінгвін\n  🔍 шукаю досьє: Бейн\nCacheInfo(hits=1, misses=4, maxsize=2, currsize=2)"
    },
    {
      type: "flow",
      title: "Що робить lru_cache при виклику",
      nodes: [
        { id: "s", kind: "start", label: "dossier(name)", col: 0, row: 0 },
        { id: "q", kind: "decision", label: "name у кеші?", col: 0, row: 1 },
        { id: "call", kind: "call", label: "func(name)", col: 0, row: 2 },
        { id: "full", kind: "decision", label: "len == maxsize ?", col: 0, row: 3 },
        { id: "store", kind: "process", label: "cache[name] = result", col: 0, row: 4 },
        { id: "ret", kind: "end", label: "return result", col: 0, row: 5 },
        { id: "evict", kind: "process", label: "викинути\nнайдавніший", col: 1, row: 4 },
        { id: "hit", kind: "process", label: "hits += 1\nпозначити свіжим", col: 2, row: 2 },
        { id: "rhit", kind: "end", label: "return cache[name]", col: 2, row: 3 },
      ],
      edges: [
        { from: "s", to: "q" },
        { from: "q", to: "call", label: "Ні" },
        { from: "q", to: "hit", label: "Так", side: "right" },
        { from: "hit", to: "rhit" },
        { from: "call", to: "full", label: "misses += 1" },
        { from: "full", to: "store", label: "Ні" },
        { from: "full", to: "evict", label: "Так", side: "right" },
        { from: "evict", to: "store" },
        { from: "store", to: "ret" },
      ],
      scenarios: [
        {
          name: "Бейн (1-й раз)",
          steps: [
            { node: "s", note: "кеш: `[Джокер]`, `maxsize=2`" },
            { node: "q", note: "`Бейн` у кеші? Ні" },
            { node: "call", note: "вивід: `🔍 шукаю досьє: Бейн`" },
            { node: "full", note: "`1 == 2` → ні, місце є" },
            { node: "store", note: "кеш: `[Джокер, Бейн]`" },
            { node: "ret", note: "повертає `\"БЕЙН\"`" },
          ],
        },
        {
          name: "Джокер (2-й раз)",
          steps: [
            { node: "s", note: "кеш: `[Джокер, Бейн]`" },
            { node: "q", note: "`Джокер` у кеші? Так!" },
            { node: "hit", note: "`hits = 1`; Джокер стає найсвіжішим: `[Бейн, Джокер]`" },
            { node: "rhit", note: "повертає `\"ДЖОКЕР\"` — функція **не** викликалась, нічого не надруковано" },
          ],
        },
        {
          name: "Пінгвін",
          steps: [
            { node: "s", note: "кеш: `[Бейн, Джокер]`" },
            { node: "q", note: "`Пінгвін` у кеші? Ні" },
            { node: "call", note: "вивід: `🔍 шукаю досьє: Пінгвін`" },
            { node: "full", note: "`2 == 2` → так, кеш повний" },
            { node: "evict", note: "викидаємо найдавніше використаного — `Бейн`" },
            { node: "store", note: "кеш: `[Джокер, Пінгвін]` — тому наступний `Бейн` знову промах" },
            { node: "ret", note: "повертає `\"ПІНГВІН\"`" },
          ],
        },
      ],
      caption: "Сценарії йдуть у порядку з `lru_maxsize.py`. *LRU* означає: при переповненні вилітає той, до кого найдовше не зверталися.",
    },
    {
      "type": "warning",
      "title": "Кешувати можна лише хешовані аргументи",
      "md": "`lru_cache` використовує аргументи як ключі словника, тому вони мають бути **хешованими**: числа, рядки, кортежі. Виклик зі списком чи словником дасть `TypeError: unhashable type: 'list'`. Передавай `tuple(items)` замість `items`. І не кешуй функції з побічними ефектами (друк, запис у БД) чи залежністю від часу — вони виконаються лише раз."
    },
    {
      "type": "tip",
      "title": "@cache — коротше для безмежного кешу",
      "md": "З Python 3.9 є `@functools.cache` — те саме, що `@lru_cache(maxsize=None)`, але коротше і трохи швидше. А для властивостей класу, що обчислюються раз, — `@functools.cached_property`."
    },
    {
      "type": "warning",
      "title": "Пастка пізнього зв'язування в замиканнях",
      "md": "`funcs = [lambda: i for i in range(3)]` → `[f() for f in funcs]` дає `[2, 2, 2]`, а не `[0, 1, 2]`: замикання пам'ятає **змінну**, а не її значення на момент створення. Лікується аргументом за замовчуванням: `lambda i=i: i`."
    },
    {
      "type": "code",
      "code": "funcs = [lambda: i for i in range(3)]\nprint([f() for f in funcs])        # усі бачать останнє i\n\nfuncs = [lambda i=i: i for i in range(3)]\nprint([f() for f in funcs])        # значення «заморожене» в момент створення",
      "title": "late_binding.py",
      "output": "[2, 2, 2]\n[0, 1, 2]"
    },
    {
      "type": "joke",
      "md": "Супермен питає, як я перемагаю без суперсил. Просто: `@lru_cache`. Я пам'ятаю кожну його слабкість — і вдруге нічого не обчислюю."
    },
    {
      "type": "quiz",
      "question": "Скільки разів надрукується «шукаю досьє» для викликів `Джокер, Бейн, Джокер, Пінгвін, Бейн` з `maxsize=2`?",
      "options": [
        "2",
        "3",
        "4",
        "5"
      ],
      "answer": 2,
      "explain": "Джокер (промах), Бейн (промах), Джокер (**влучання**, стає «свіжим»), Пінгвін (промах, витісняє найдавнішого — Бейна), Бейн (знову промах). Разом 4 промахи: `hits=1, misses=4`."
    },
    {
      "type": "heading",
      "text": "Шпаргалка"
    },
    {
      "type": "table",
      "head": [
        "Що",
        "Як виглядає",
        "Навіщо"
      ],
      "rows": [
        [
          "Функція як об'єкт",
          "`f = shout` (без дужок)",
          "Передати, повернути, покласти в словник"
        ],
        [
          "Замикання",
          "внутрішня функція + `__closure__`",
          "Пам'ятати стан без класів і глобальних змінних"
        ],
        [
          "`nonlocal x`",
          "у вкладеній функції",
          "Змінити змінну із замикання"
        ],
        [
          "Декоратор",
          "`def deco(func): ... return wrapper`",
          "Додати поведінку, не чіпаючи код"
        ],
        [
          "`@deco`",
          "над `def`",
          "Цукор для `f = deco(f)`"
        ],
        [
          "`*args, **kwargs`",
          "у `wrapper`",
          "Пропускати будь-які аргументи"
        ],
        [
          "`@wraps(func)`",
          "над `wrapper`",
          "Зберегти `__name__`, `__doc__`, `__wrapped__`"
        ],
        [
          "З аргументами",
          "`@repeat(3)` → 3 рівні функцій",
          "Налаштовувати поведінку"
        ],
        [
          "Стек",
          "`@a @b def f` = `a(b(f))`",
          "Застосування знизу вгору, виклик згори"
        ],
        [
          "`@lru_cache(maxsize=N)`",
          "`functools`",
          "Кешувати результати чистих функцій"
        ],
        [
          "`@cache`",
          "`functools`, 3.9+",
          "Безмежний кеш коротким записом"
        ]
      ]
    },
    {
      "type": "joke",
      "md": "Кажуть, у мене сім шарів декораторів. Неправда. Їх вісім. Восьмий — `@wraps`, тому ніхто не знає, що під маскою — `wrapper`."
    },
    {
      "type": "tip",
      "title": "Декоратор — шаблон «з трьох рядків»",
      "md": "Запам'ятай скелет і пиши декоратори на автоматі:\n\n- `def deco(func):` → `@wraps(func)` → `def wrapper(*args, **kwargs):`\n- всередині: *до* → `result = func(*args, **kwargs)` → *після* → `return result`\n- наприкінці: `return wrapper`\n\nПотрібні аргументи — загорни це все ще в одну функцію-фабрику."
    }
  ]
};

export default section;
