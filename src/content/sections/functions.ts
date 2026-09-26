import type { Section } from "../types";

const section: Section = {
  "slug": "functions",
  "title": "Функції",
  "short": "def, аргументи, return, scope",
  "icon": "🧩",
  "group": "Функції",
  "summary": "def і return, позиційні та іменовані аргументи, значення за замовчуванням, *args/**kwargs, області видимості LEGB, рекурсія, docstrings.",
  "hero": {
    "name": "Ізуку Мідорія (Деку)",
    "universe": "My Hero Academia",
    "emoji": "💥",
    "quote": "One For All — це функція, яку передають далі, разом з аргументами!",
    "why": "Причуда One For All передається від героя до героя — як аргументи передаються у функцію."
  },
  "theme": {
    "accent": "#22c55e",
    "accent2": "#0ea5a4",
    "glow": "#16a34a"
  },
  "minutes": 18,
  "order": 9,
  "blocks": [
    {
      "type": "text",
      "md": "Уяви, що кожного разу, коли Деку хоче вдарити *Detroit Smash*, йому треба заново пояснювати собі, як працює One For All: скільки відсотків сили, як не зламати руку, куди ставити ногу. Жах. Натомість він просто **викликає** відпрацьований прийом.\n\n**Функція** — це саме такий прийом: іменований шматок коду, який ти пишеш один раз, а викликаєш скільки завгодно, щоразу передаючи нові «вхідні дані» (аргументи). Функції роблять код коротшим, зрозумілішим і таким, що легко тестується.\n\nУ цьому розділі пройдемо весь шлях: `def` і `return`, позиційні та іменовані аргументи, значення за замовчуванням, `*args` і `**kwargs`, області видимості LEGB, рекурсію та документацію."
    },
    {
      "type": "heading",
      "text": "def: оголошуємо свій прийом"
    },
    {
      "type": "text",
      "md": "Функцію створюють ключовим словом `def`, далі — ім'я, дужки з **параметрами** і двокрапка. Тіло функції — це блок з відступом. Поки функцію не **викликали** (ім'я + дужки), її код не виконується — Python лише запам'ятовує рецепт.\n\n- **параметр** — ім'я-змінна в оголошенні: `def smash(power)`\n- **аргумент** — конкретне значення під час виклику: `smash(100)`"
    },
    {
      "type": "code",
      "code": "def greet():\n    print(\"Я тут, бо я — Деку!\")\n\ngreet()          # виклик — дужки обов'язкові\ngreet()          # можна викликати скільки завгодно\n\ndef smash(power):\n    print(f\"DETROIT SMASH на {power}%!\")\n\nsmash(5)\nsmash(100)",
      "title": "def_basics.py",
      "output": "Я тут, бо я — Деку!\nЯ тут, бо я — Деку!\nDETROIT SMASH на 5%!\nDETROIT SMASH на 100%!"
    },
    {
      "type": "tip",
      "title": "Назва = що робить",
      "md": "Ім'я функції — це **дієслово** у `snake_case`: `calculate_total`, `send_email`, `load_hero`. Якщо важко придумати ім'я — функція, мабуть, робить забагато різних речей. Розбий її на кілька."
    },
    {
      "type": "warning",
      "title": "Забув дужки — нічого не сталося",
      "md": "`greet` без дужок — це **сам об'єкт функції**, а не виклик. Рядок `greet` нічого не надрукує, а `print(greet)` виведе щось на кшталт `<function greet at 0x...>`. Хочеш запустити — став дужки: `greet()`."
    },
    {
      "type": "heading",
      "text": "return: повертаємо результат"
    },
    {
      "type": "text",
      "md": "`print` лише **показує** значення на екрані, а `return` **віддає** його назад у місце виклику — щоб результат можна було зберегти в змінну, передати далі чи порахувати з ним щось ще.\n\n`return` одразу **завершує** функцію: рядки після нього не виконуються. Якщо функція дійшла до кінця без `return` (або з порожнім `return`), вона повертає `None`."
    },
    {
      "type": "code",
      "code": "def power_level(base, percent):\n    return base * percent // 100\n\ndeku = power_level(1000, 20)\nprint(deku)\nprint(power_level(1000, 100) - deku)\n\ndef say_hi():\n    print(\"Привіт!\")\n\nresult = say_hi()      # друкує, але нічого не повертає\nprint(result)",
      "title": "return_vs_print.py",
      "output": "200\n800\nПривіт!\nNone"
    },
    {
      "type": "viz",
      "id": "call-stepper",
      "title": "Покрокове виконання виклику",
      "caption": "Тисни **Крок** і дивись, як Python стрибає у функцію, створює для неї окремий **фрейм** з локальними змінними, а `return` відносить значення назад і фрейм зникає. Зверни увагу: `result` існує лише всередині виклику."
    },
    {
      "type": "code",
      "code": "def check_quirk(name):\n    if not name:\n        return \"Без причуди\"   # ранній вихід\n    if name == \"One For All\":\n        return \"Легендарна причуда!\"\n    return f\"Причуда: {name}\"\n\nprint(check_quirk(\"\"))\nprint(check_quirk(\"One For All\"))\nprint(check_quirk(\"Explosion\"))",
      "title": "early_return.py",
      "output": "Без причуди\nЛегендарна причуда!\nПричуда: Explosion"
    },
    {
      "type": "tip",
      "title": "Guard clauses",
      "md": "**Ранній `return` (guard clause)** замість глибоких `if/else`: спочатку відсікай «погані» випадки і виходь, а основну логіку пиши без зайвих відступів. Код читається згори вниз, як сценарій бою."
    },
    {
      "type": "code",
      "code": "def min_max(numbers):\n    return min(numbers), max(numbers)   # насправді це один кортеж\n\nlow, high = min_max([7, 2, 9, 4])\nprint(low, high)\nprint(min_max([3, 1]))",
      "title": "multiple_return.py",
      "output": "2 9\n(1, 3)"
    },
    {
      "type": "joke",
      "md": "All Might повертає не лише усмішку, а й кортеж `(надія, сила, \"I AM HERE!\")`. А ти досі повертаєш `None`, бо забув написати `return`? 😅"
    },
    {
      "type": "quiz",
      "question": "Що виведе `print(f())`, якщо `def f(): x = 5`?",
      "options": [
        "`5`",
        "`None`",
        "`x`",
        "Помилку `NameError`"
      ],
      "answer": 1,
      "explain": "Функція без `return` завжди повертає `None`. Змінна `x` була створена всередині і зникла разом із фреймом."
    },
    {
      "type": "heading",
      "text": "Позиційні та іменовані аргументи"
    },
    {
      "type": "text",
      "md": "Аргументи можна передавати двома способами:\n\n- **позиційно** — за порядком: перше значення потрапляє в перший параметр, друге — у другий;\n- **за іменем** (keyword) — `name=значення`: порядок уже неважливий, а код читається як речення.\n\nМожна змішувати, але спершу — всі позиційні, потім — іменовані."
    },
    {
      "type": "code",
      "code": "def train(hero, hours, place):\n    print(f\"{hero} тренується {hours} год. у {place}\")\n\ntrain(\"Деку\", 3, \"пляж Дагоба\")                     # позиційно\ntrain(place=\"U.A.\", hero=\"Бакуго\", hours=5)         # за іменами\ntrain(\"Тодорокі\", place=\"спортзал\", hours=2)        # змішано",
      "title": "positional_keyword.py",
      "output": "Деку тренується 3 год. у пляж Дагоба\nБакуго тренується 5 год. у U.A.\nТодорокі тренується 2 год. у спортзал"
    },
    {
      "type": "warning",
      "title": "Порядок має значення",
      "md": "Позиційний аргумент **після** іменованого — синтаксична помилка: `train(hero=\"Деку\", 3, \"U.A.\")` → `SyntaxError: positional argument follows keyword argument`. А передати той самий параметр двічі (`train(\"Деку\", hero=\"Бакуго\", ...)`) — `TypeError: got multiple values for argument 'hero'`."
    },
    {
      "type": "tip",
      "title": "Іменуй незрозумілі аргументи",
      "md": "Якщо у виклику є «магічні» `True`, `False`, `None` чи числа — передавай їх **за іменем**. `resize(img, 800, 600, True)` — загадка, а `resize(img, width=800, height=600, keep_ratio=True)` — документація прямо у виклику."
    },
    {
      "type": "heading",
      "text": "Значення за замовчуванням"
    },
    {
      "type": "text",
      "md": "Параметру можна дати **значення за замовчуванням** — тоді аргумент стає необов'язковим. Параметри з дефолтами йдуть **після** обов'язкових."
    },
    {
      "type": "code",
      "code": "def smash(target, percent=5, move=\"Detroit\"):\n    return f\"{move} Smash по {target} на {percent}%\"\n\nprint(smash(\"роботу\"))\nprint(smash(\"Ному\", 100))\nprint(smash(\"Оверхолу\", move=\"Delaware\"))",
      "title": "defaults.py",
      "output": "Detroit Smash по роботу на 5%\nDetroit Smash по Ному на 100%\nDelaware Smash по Оверхолу на 5%"
    },
    {
      "type": "text",
      "md": "А тепер найвідоміша пастка Python. Значення за замовчуванням обчислюється **один раз** — у момент виконання `def`, а не при кожному виклику. Якщо це змінюваний об'єкт (список, словник), усі виклики ділитимуть **один і той самий** об'єкт."
    },
    {
      "type": "code",
      "code": "def add_member(name, team=[]):     # ⚠️ пастка!\n    team.append(name)\n    return team\n\nprint(add_member(\"Деку\"))\nprint(add_member(\"Урарака\"))       # очікували ['Урарака']...\nprint(add_member(\"Іїда\"))",
      "title": "mutable_default_bug.py",
      "output": "['Деку']\n['Деку', 'Урарака']\n['Деку', 'Урарака', 'Іїда']"
    },
    {
      "type": "viz",
      "id": "mutable-default",
      "title": "Пастка змінюваного дефолту",
      "caption": "Перемикай **`team=[]`** та **`team=None`** і роби кілька викликів. У першому режимі всі виклики тягнуться стрілками до **одного** списку, який створився разом із `def`. У другому — кожен виклик отримує свіжий список."
    },
    {
      "type": "compare",
      "title": "Змінюваний дефолт",
      "bad": {
        "code": "def add_member(name, team=[]):\n    team.append(name)\n    return team",
        "label": "Один список на всіх"
      },
      "good": {
        "code": "def add_member(name, team=None):\n    if team is None:\n        team = []          # новий список на кожен виклик\n    team.append(name)\n    return team",
        "label": "None як сигнал"
      },
      "note": "Правило: дефолтом роби лише **незмінні** значення (`None`, числа, рядки, кортежі). Для списків і словників — `None` і створення всередині."
    },
    {
      "type": "code",
      "code": "def add_member(name, team=None):\n    if team is None:\n        team = []\n    team.append(name)\n    return team\n\nprint(add_member(\"Деку\"))\nprint(add_member(\"Урарака\"))\nclass_1a = [\"Бакуго\"]\nprint(add_member(\"Кірішіма\", class_1a))",
      "title": "mutable_default_fix.py",
      "output": "['Деку']\n['Урарака']\n['Бакуго', 'Кірішіма']"
    },
    {
      "type": "heading",
      "text": "*args і **kwargs: скільки завгодно аргументів"
    },
    {
      "type": "text",
      "md": "Іноді невідомо заздалегідь, скільки аргументів прийде. Для цього є «зірочки»:\n\n- `*args` збирає всі **зайві позиційні** аргументи в **кортеж**;\n- `**kwargs` збирає всі **зайві іменовані** аргументи в **словник**.\n\nІмена `args` і `kwargs` — лише домовленість, магія саме у `*` та `**`."
    },
    {
      "type": "code",
      "code": "def team_attack(leader, *members, **moves):\n    print(\"Лідер:\", leader)\n    print(\"Команда:\", members)\n    print(\"Прийоми:\", moves)\n\nteam_attack(\"Деку\", \"Бакуго\", \"Тодорокі\", deku=\"Smash\", bakugo=\"Howitzer\")",
      "title": "args_kwargs.py",
      "output": "Лідер: Деку\nКоманда: ('Бакуго', 'Тодорокі')\nПрийоми: {'deku': 'Smash', 'bakugo': 'Howitzer'}"
    },
    {
      "type": "viz",
      "id": "args-binder",
      "title": "Як Python розкладає аргументи по параметрах",
      "caption": "Обери виклик і тисни **Далі** — кожен аргумент «летить» у свій слот: спершу позиційні, потім зайві позиційні падають у кортеж `*args`, іменовані знаходять параметр за ім'ям, а решта йде у словник `**kwargs`."
    },
    {
      "type": "code",
      "code": "def total_power(*powers):\n    return sum(powers)\n\nprint(total_power(10, 20, 30))\nprint(total_power())\n\nsquad = [45, 55, 100]\nprint(total_power(*squad))          # * при виклику — розпакувати список\n\nstats = {\"hero\": \"Урарака\", \"hours\": 4, \"place\": \"U.A.\"}\n\ndef train(hero, hours, place):\n    return f\"{hero}: {hours} год. у {place}\"\n\nprint(train(**stats))               # ** при виклику — розпакувати словник",
      "title": "unpacking_call.py",
      "output": "60\n0\n200\nУрарака: 4 год. у U.A."
    },
    {
      "type": "tip",
      "title": "Зірочки навпаки",
      "md": "`*` і `**` працюють в обидва боки: в **оголошенні** вони **збирають** аргументи, а у **виклику** — **розпаковують** колекцію. `print(*[1, 2, 3], sep=\" → \")` виведе `1 → 2 → 3`."
    },
    {
      "type": "code",
      "code": "# усе, що після * — лише за іменем (keyword-only)\ndef launch(target, *, power, safe=True):\n    return f\"{target}: {power}% (safe={safe})\"\n\nprint(launch(\"Ному\", power=45))\n\ntry:\n    launch(\"Ному\", 45)\nexcept TypeError as e:\n    print(\"TypeError:\", e)\n\n# усе, що перед / — лише позиційно (positional-only)\ndef distance(x, y, /):\n    return (x ** 2 + y ** 2) ** 0.5\n\nprint(distance(3, 4))",
      "title": "keyword_only.py",
      "output": "Ному: 45% (safe=True)\nTypeError: launch() takes 1 positional argument but 2 were given\n5.0"
    },
    {
      "type": "table",
      "head": [
        "Синтаксис у def",
        "Що означає",
        "Приклад виклику"
      ],
      "rows": [
        [
          "`def f(a, b)`",
          "звичайні параметри: позиційно або за іменем",
          "`f(1, 2)`, `f(b=2, a=1)`"
        ],
        [
          "`def f(a, b=10)`",
          "`b` необов'язковий",
          "`f(1)`, `f(1, 5)`"
        ],
        [
          "`def f(*args)`",
          "зайві позиційні → кортеж",
          "`f(1, 2, 3)` → `args == (1, 2, 3)`"
        ],
        [
          "`def f(**kwargs)`",
          "зайві іменовані → словник",
          "`f(x=1)` → `kwargs == {'x': 1}`"
        ],
        [
          "`def f(a, *, b)`",
          "`b` — лише за іменем",
          "`f(1, b=2)`"
        ],
        [
          "`def f(a, /, b)`",
          "`a` — лише позиційно",
          "`f(1, 2)`, `f(1, b=2)`"
        ],
        [
          "`f(*lst)` / `f(**d)`",
          "розпакування при виклику",
          "`f(*[1, 2])` ≡ `f(1, 2)`"
        ]
      ]
    },
    {
      "type": "quiz",
      "question": "Що буде в `kwargs` після виклику `f(1, 2, mode=\"max\")`, якщо `def f(a, *args, **kwargs)`?",
      "options": [
        "`{}`",
        "`{'mode': 'max'}`",
        "`(2,)`",
        "`{'a': 1, 'mode': 'max'}`"
      ],
      "answer": 1,
      "explain": "`1` потрапляє в `a`, `2` — у кортеж `args == (2,)`, а іменований `mode` не має свого параметра, тому йде в `kwargs`."
    },
    {
      "type": "heading",
      "text": "Області видимості: правило LEGB"
    },
    {
      "type": "text",
      "md": "Коли Python бачить ім'я змінної, він шукає його в чотирьох «кільцях» — від найближчого до найдальшого, і зупиняється на першому знайденому:\n\n- **L — Local**: всередині поточної функції;\n- **E — Enclosing**: у зовнішній функції (якщо функція вкладена);\n- **G — Global**: на рівні модуля (файлу);\n- **B — Built-in**: вбудовані імена Python — `print`, `len`, `max`...\n\nЯк у Деку: спершу він шукає силу в собі, потім — у спадку попередніх носіїв One For All, потім — у всьому геройському товаристві."
    },
    {
      "type": "code",
      "code": "power = \"global: 5%\"              # G\n\ndef outer():\n    power = \"enclosing: 20%\"      # E\n    def inner():\n        power = \"local: 100%\"     # L\n        print(power)\n    inner()\n    print(power)\n\nouter()\nprint(power)\nprint(len(\"One For All\"))         # B — len вбудована",
      "title": "legb.py",
      "output": "local: 100%\nenclosing: 20%\nglobal: 5%\n11"
    },
    {
      "type": "viz",
      "id": "legb-3d",
      "title": "LEGB у 3D: де Python шукає ім'я",
      "caption": "Обери ім'я — «зонд» стартує з **Local** у центрі і рухається назовні кільце за кільцем, доки не знайде визначення. Обертай сцену і клацай кільця, щоб побачити, які імена живуть на кожному рівні."
    },
    {
      "type": "code",
      "code": "counter = 0\n\ndef bad_increment():\n    try:\n        counter += 1          # Python вважає counter ЛОКАЛЬНОЮ\n    except UnboundLocalError as e:\n        print(\"Помилка:\", type(e).__name__)\n\ndef good_increment():\n    global counter            # явно: працюємо з глобальною\n    counter += 1\n\nbad_increment()\ngood_increment()\ngood_increment()\nprint(counter)",
      "title": "global_keyword.py",
      "output": "Помилка: UnboundLocalError\n2"
    },
    {
      "type": "code",
      "code": "def make_counter():\n    count = 0\n    def click():\n        nonlocal count        # змінна з Enclosing-рівня\n        count += 1\n        return count\n    return click\n\ntap = make_counter()\nprint(tap(), tap(), tap())\n\nother = make_counter()        # новий, незалежний лічильник\nprint(other())",
      "title": "nonlocal_closure.py",
      "output": "1 2 3\n1"
    },
    {
      "type": "warning",
      "title": "UnboundLocalError",
      "md": "Якщо всередині функції є **присвоєння** імені (`x = ...`, `x += 1`), Python вважає `x` **локальною на всю функцію** — навіть у рядках *до* присвоєння. Звідси `UnboundLocalError`. Читати глобальну змінну можна без `global`, змінювати — ні."
    },
    {
      "type": "tip",
      "title": "Уникай global",
      "md": "`global` — це майже завжди запах коду. Краще **передай значення аргументом і поверни результат**: `score = add_points(score, 10)`. Такі функції легко тестувати, і вони не мають прихованих побічних ефектів."
    },
    {
      "type": "quiz",
      "question": "На рівні модуля `x = 1`, а функція — `def f(): print(x)`. Що надрукує `f()`?",
      "options": [
        "`1`",
        "`None`",
        "`UnboundLocalError`",
        "`NameError`"
      ],
      "answer": 0,
      "explain": "Всередині `f` немає присвоєння `x`, тому Python не знаходить його в Local і шукає далі — у Global, де `x = 1`. Читати глобальні змінні можна."
    },
    {
      "type": "heading",
      "text": "Функції — теж об'єкти"
    },
    {
      "type": "text",
      "md": "У Python функція — такий самий об'єкт, як число чи список. Її можна покласти у змінну, у словник, передати аргументом в іншу функцію або повернути з функції. Це називається *first-class functions*, і на цьому тримаються `sorted(key=...)`, `map`, декоратори та замикання."
    },
    {
      "type": "code",
      "code": "def detroit(target):\n    return f\"Detroit Smash → {target}\"\n\ndef delaware(target):\n    return f\"Delaware Smash → {target}\"\n\nmoves = {\"кулак\": detroit, \"клацання\": delaware}\n\ndef use_move(move, target):       # приймає функцію як аргумент\n    return move(target)\n\nprint(use_move(moves[\"кулак\"], \"Ному\"))\nprint(use_move(moves[\"клацання\"], \"Мускула\"))\nprint(detroit.__name__)",
      "title": "first_class.py",
      "output": "Detroit Smash → Ному\nDelaware Smash → Мускула\ndetroit"
    },
    {
      "type": "joke",
      "md": "Бакуго: «Мені не потрібні твої функції, Деку!» — і одразу передає `explode` як аргумент у `sorted(key=...)`. Цундере-програмування.",
      "hero": "Кацукі Бакуго"
    },
    {
      "type": "heading",
      "text": "Рекурсія: функція викликає себе"
    },
    {
      "type": "text",
      "md": "**Рекурсія** — коли функція викликає саму себе, щоразу з «меншою» задачею. Кожна рекурсивна функція має дві частини:\n\n- **базовий випадок** — коли зупинитись (без нього — нескінченність);\n- **рекурсивний крок** — виклик себе з простішими даними.\n\nКожен виклик кладе новий **фрейм** на **стек викликів**. Коли базовий випадок повертає значення, фрейми знімаються один за одним у зворотному порядку — як передача One For All від останнього носія назад до першого."
    },
    {
      "type": "code",
      "code": "def factorial(n):\n    if n <= 1:                # базовий випадок\n        return 1\n    return n * factorial(n - 1)   # рекурсивний крок\n\nprint(factorial(5))\nprint(factorial(10))",
      "title": "factorial.py",
      "output": "120\n3628800"
    },
    {
      "type": "viz",
      "id": "call-stack-3d",
      "title": "Стек викликів factorial у 3D",
      "caption": "Кожна скляна плита — окремий фрейм зі своїм `n`. **Крок** кладе новий фрейм на вершину, а після базового випадку фрейми знімаються і передають результат вниз. Постав `n` слайдером і клацни будь-яку плиту, щоб побачити її локальні змінні."
    },
    {
      "type": "code",
      "code": "def countdown(n, depth=0):\n    print(\"  \" * depth + f\"countdown({n})\")\n    if n == 0:\n        print(\"  \" * depth + \"🚀 Старт!\")\n        return\n    countdown(n - 1, depth + 1)\n    print(\"  \" * depth + f\"повернулися в countdown({n})\")\n\ncountdown(3)",
      "title": "recursion_trace.py",
      "output": "countdown(3)\n  countdown(2)\n    countdown(1)\n      countdown(0)\n      🚀 Старт!\n    повернулися в countdown(1)\n  повернулися в countdown(2)\nповернулися в countdown(3)"
    },
    {
      "type": "code",
      "code": "def fib(n, memo={}):          # тут спільний dict — навмисно, як кеш\n    if n < 2:\n        return n\n    if n not in memo:\n        memo[n] = fib(n - 1) + fib(n - 2)\n    return memo[n]\n\nprint(fib(10))\nprint(fib(80))\n\nfrom functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib2(n):\n    return n if n < 2 else fib2(n - 1) + fib2(n - 2)\n\nprint(fib2(80))",
      "title": "fib_memo.py",
      "output": "55\n23416728348467685\n23416728348467685"
    },
    {
      "type": "tip",
      "title": "lru_cache — безкоштовне прискорення",
      "md": "Наївний `fib(n)` без кешу робить **експоненційну** кількість викликів: `fib(35)` — майже 30 мільйонів. Декоратор `@functools.lru_cache` (або `@functools.cache`) запам'ятовує результати і робить з цього лінійний час одним рядком."
    },
    {
      "type": "warning",
      "title": "RecursionError",
      "md": "У Python глибина рекурсії обмежена (зазвичай ~1000 фреймів). Забутий базовий випадок чи дуже глибока рекурсія → `RecursionError: maximum recursion depth exceeded`. Для простих повторень (сума списку, лічильник) цикл у Python і швидший, і безпечніший."
    },
    {
      "type": "quiz",
      "question": "Що станеться, якщо з `factorial` прибрати рядки `if n <= 1: return 1`?",
      "options": [
        "Поверне 0",
        "Поверне `None`",
        "Буде `RecursionError`",
        "Python сам зупиниться на 1"
      ],
      "answer": 2,
      "explain": "Без базового випадку функція викликає себе нескінченно (`n` йде в мінус), стек переповнюється, і Python кидає `RecursionError`."
    },
    {
      "type": "heading",
      "text": "Docstrings і анотації типів"
    },
    {
      "type": "text",
      "md": "**Docstring** — рядок у потрійних лапках одразу під `def`. Його показує `help(f)`, IDE під час наведення та генератори документації. Коротко: що робить функція, що приймає, що повертає.\n\n**Анотації типів** (`name: str`, `-> int`) Python під час виконання не перевіряє — це підказки для людей, IDE та інструментів на кшталт `mypy`. Але вони роблять код самодокументованим."
    },
    {
      "type": "code",
      "code": "def power_up(base: int, percent: float = 5.0) -> float:\n    \"\"\"Повертає силу удару з урахуванням відсотка One For All.\n\n    base    — базова сила героя\n    percent — скільки відсотків причуди використати\n    \"\"\"\n    return base * percent / 100\n\nprint(power_up(1000, 20))\nprint(power_up.__doc__.splitlines()[0])\nprint(power_up.__annotations__)",
      "title": "docstring_types.py",
      "output": "200.0\nПовертає силу удару з урахуванням відсотка One For All.\n{'base': <class 'int'>, 'percent': <class 'float'>, 'return': <class 'float'>}"
    },
    {
      "type": "tip",
      "title": "help() — твій довідник",
      "md": "У консолі чи Jupyter напиши `help(len)` або `len?` — і отримаєш docstring будь-якої функції, навіть вбудованої. А в IDE просто наведи курсор. Добрий docstring = менше питань від колег (і від тебе через пів року)."
    },
    {
      "type": "joke",
      "md": "Деку веде зошит «Аналіз героїв для майбутнього» на 13 томів. Ти ж можеш написати хоча б один docstring на три рядки? 📓"
    },
    {
      "type": "heading",
      "text": "Шпаргалка героя"
    },
    {
      "type": "table",
      "head": [
        "Що",
        "Як",
        "Нотатка"
      ],
      "rows": [
        [
          "Оголосити",
          "`def name(params):`",
          "тіло — з відступом"
        ],
        [
          "Повернути",
          "`return value`",
          "без `return` → `None`"
        ],
        [
          "Кілька значень",
          "`return a, b`",
          "це кортеж, розпаковуй `x, y = f()`"
        ],
        [
          "Дефолт",
          "`def f(x, n=1)`",
          "лише незмінні! для списку — `None`"
        ],
        [
          "Будь-скільки позиційних",
          "`def f(*args)`",
          "`args` — кортеж"
        ],
        [
          "Будь-скільки іменованих",
          "`def f(**kwargs)`",
          "`kwargs` — словник"
        ],
        [
          "Лише за іменем",
          "`def f(a, *, b)`",
          "захист від плутанини"
        ],
        [
          "Змінити глобальну",
          "`global x`",
          "краще повертай значення"
        ],
        [
          "Змінити зовнішню",
          "`nonlocal x`",
          "у вкладеній функції"
        ],
        [
          "Документація",
          "`\"\"\"docstring\"\"\"`",
          "`help(f)`, `f.__doc__`"
        ]
      ]
    },
    {
      "type": "tip",
      "title": "Правило одного прийому",
      "md": "Хороша функція — як добрий прийом героя: **одна задача, зрозуміла назва, передбачуваний результат**. Якщо функція довша за екран — час виносити частини в окремі функції."
    },
    {
      "type": "joke",
      "md": "Plus Ultra! Тепер ти вмієш передавати силу далі — як One For All, тільки через аргументи. Наступна зупинка — comprehensions, де Леві вже точить мечі. 🗡️"
    }
  ]
};

export default section;
