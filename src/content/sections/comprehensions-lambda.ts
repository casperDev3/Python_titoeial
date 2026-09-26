import type { Section } from "../types";

const section: Section = {
  "slug": "comprehensions-lambda",
  "title": "Comprehensions та lambda",
  "short": "генератори списків, map, filter",
  "icon": "⚡",
  "group": "Функції",
  "summary": "List/dict/set comprehensions, умови всередині, lambda-функції, map/filter/sorted з key, any/all, функціональний стиль.",
  "hero": {
    "name": "Леві Аккерман",
    "universe": "Attack on Titan",
    "emoji": "🗡️",
    "quote": "Один рядок. Жодного зайвого руху.",
    "why": "Леві робить за секунду те, на що іншим треба хвилина — як comprehension замість циклу на 5 рядків."
  },
  "theme": {
    "accent": "#14b8a6",
    "accent2": "#94a3b8",
    "glow": "#0d9488"
  },
  "minutes": 12,
  "order": 10,
  "blocks": [
    {
      "type": "text",
      "md": "Капітан Леві не робить зайвих рухів. Там, де новобранець розмахує мечами пів хвилини, Леві — один точний оберт, і титан уже лежить.\n\nУ Python є свій «стиль Леві»: **comprehensions** та **lambda**. Цикл на п'ять рядків перетворюється на один виразний рядок, а маленька функція пишеться прямо там, де потрібна. Але, як і в розвідкорпусі, швидкість без дисципліни — шлях до біди: розберемо і силу, і межі цих інструментів."
    },
    {
      "type": "heading",
      "text": "List comprehension: цикл в один рядок"
    },
    {
      "type": "text",
      "md": "Класичний патерн «створи порожній список → пройдись циклом → додай результат» зустрічається постійно. **List comprehension** робить те саме одним виразом:\n\n`[вираз for елемент in ітерований_об'єкт]`\n\nЧитай його як речення: «*вираз* для кожного *елемента* в *колекції*». Результат — новий список, оригінал не змінюється."
    },
    {
      "type": "compare",
      "title": "Той самий результат",
      "bad": {
        "code": "squares = []\nfor n in range(1, 6):\n    squares.append(n ** 2)",
        "label": "4 рядки і append"
      },
      "good": {
        "code": "squares = [n ** 2 for n in range(1, 6)]",
        "label": "Один рух"
      },
      "note": "Comprehension не лише коротший — він ще й трохи швидший, бо не викликає `.append` на кожній ітерації, і одразу видно намір: «будуємо новий список»."
    },
    {
      "type": "code",
      "code": "squares = [n ** 2 for n in range(1, 6)]\nprint(squares)\n\nnames = [\"levi\", \"mikasa\", \"eren\", \"armin\"]\nprint([name.title() for name in names])\nprint([len(name) for name in names])\nprint([c for c in \"ТИТАН\"])",
      "title": "list_comp.py",
      "output": "[1, 4, 9, 16, 25]\n['Levi', 'Mikasa', 'Eren', 'Armin']\n[4, 6, 4, 5]\n['Т', 'И', 'Т', 'А', 'Н']"
    },
    {
      "type": "viz",
      "id": "comprehension-pipeline",
      "title": "Конвеєр comprehension",
      "caption": "Обери вираз і фільтр, а потім тисни **Запуск** або **Крок**. Кожен елемент проходить через ворота `if` (якщо є), потім через «клинок» виразу — і лише тоді падає в новий список. Саме в такому порядку Python виконує comprehension."
    },
    {
      "type": "heading",
      "text": "Фільтр: if у кінці"
    },
    {
      "type": "text",
      "md": "Додай `if` **в кінець**, щоб пропустити лише потрібні елементи:\n\n`[вираз for x in колекція if умова]`\n\nУмова перевіряється **до** виразу: якщо вона `False`, елемент просто не потрапляє в результат."
    },
    {
      "type": "code",
      "code": "heights = [3, 15, 7, 60, 4, 13]\nbig_titans = [h for h in heights if h >= 10]\nprint(big_titans)\n\nwords = [\"dedicate\", \"your\", \"heart\", \"to\", \"the\", \"cause\"]\nprint([w.upper() for w in words if len(w) > 3])\nprint([n for n in range(20) if n % 3 == 0 and n % 2 == 0])",
      "title": "filter_comp.py",
      "output": "[15, 60, 13]\n['DEDICATE', 'YOUR', 'HEART', 'CAUSE']\n[0, 6, 12, 18]"
    },
    {
      "type": "heading",
      "text": "if-else у виразі: трансформація, а не фільтр"
    },
    {
      "type": "text",
      "md": "Хочеш не викинути елемент, а **замінити** його? Тоді потрібен тернарний вираз `a if умова else b` — і він стоїть **на початку**, на місці виразу:\n\n- `[x for x in data if x > 0]` — **фільтр**: довжина результату може зменшитися;\n- `[x if x > 0 else 0 for x in data]` — **перетворення**: довжина та сама."
    },
    {
      "type": "code",
      "code": "hp = [120, -5, 80, 0, -30]\n\nalive = [h for h in hp if h > 0]                 # фільтр\nclamped = [h if h > 0 else 0 for h in hp]         # трансформація\nstatus = [\"💀\" if h <= 0 else \"⚔️\" for h in hp]\n\nprint(alive)\nprint(clamped)\nprint(status)",
      "title": "ternary_comp.py",
      "output": "[120, 80]\n[120, 0, 80, 0, 0]\n['⚔️', '💀', '⚔️', '💀', '💀']"
    },
    {
      "type": "warning",
      "title": "else в кінці",
      "md": "`[x for x in data if x > 0 else 0]` — це `SyntaxError`. `else` у кінці не буває: у фільтра `else` немає за визначенням. Якщо потрібен `else` — переносиш умову **вперед**: `[x if x > 0 else 0 for x in data]`."
    },
    {
      "type": "quiz",
      "question": "Скільки елементів у `[x if x % 2 else -x for x in range(6)]`?",
      "options": [
        "3",
        "6",
        "0",
        "Це помилка синтаксису"
      ],
      "answer": 1,
      "explain": "`if-else` на початку — це **трансформація**, а не фільтр: кожен з 6 елементів `range(6)` потрапляє в результат (парні стають від'ємними). Результат: `[0, 1, -2, 3, -4, 5]`."
    },
    {
      "type": "joke",
      "md": "Леві бачить `for`-цикл на шість рядків, який просто підносить числа до квадрата: «Це огидно. Прибери. Один рядок»."
    },
    {
      "type": "heading",
      "text": "Вкладені comprehensions"
    },
    {
      "type": "text",
      "md": "В одному comprehension може бути кілька `for`. Порядок — **такий самий, як у вкладених циклах**: перший `for` — зовнішній, наступний — внутрішній.\n\nА comprehension всередині comprehension будує **вкладені списки**, наприклад матрицю."
    },
    {
      "type": "code",
      "code": "# кілька for — як вкладені цикли\npairs = [(squad, n) for squad in \"AB\" for n in range(1, 4)]\nprint(pairs)\n\n# матриця 3×3: comprehension у comprehension\ngrid = [[r * 3 + c for c in range(3)] for r in range(3)]\nprint(grid)\n\n# «розплющити» матрицю в один список\nflat = [x for row in grid for x in row]\nprint(flat)\n\n# транспонування\nprint([[row[i] for row in grid] for i in range(3)])",
      "title": "nested_comp.py",
      "output": "[('A', 1), ('A', 2), ('A', 3), ('B', 1), ('B', 2), ('B', 3)]\n[[0, 1, 2], [3, 4, 5], [6, 7, 8]]\n[0, 1, 2, 3, 4, 5, 6, 7, 8]\n[[0, 3, 6], [1, 4, 7], [2, 5, 8]]"
    },
    {
      "type": "viz",
      "id": "nested-grid-3d",
      "title": "Вкладений comprehension у 3D",
      "caption": "Кожен кубик — один елемент `[[f(i, j) for j in range(n)] for i in range(n)]`. Запусти заповнення і стеж: зовнішній `for i` проходить рядки, внутрішній `for j` біжить по кубиках. Режим **flat** показує, як `[x for row in grid for x in row]` витягує все в одну лінію."
    },
    {
      "type": "tip",
      "title": "Як читати два for",
      "md": "Щоб правильно прочитати `[x for row in grid for x in row]`, перепиши його подумки як цикли **в тому ж порядку**: `for row in grid:` → `for x in row:` → `x`. Порядок `for` у comprehension завжди збігається з порядком вкладених циклів."
    },
    {
      "type": "warning",
      "title": "Не переборщи",
      "md": "Три рівні вкладеності в одному рядку — це вже не «стиль Леві», а головоломка. Якщо comprehension не вміщається в один-два рядки або має більше двох `for`, пиши звичайний цикл: читабельність важливіша за кількість рядків."
    },
    {
      "type": "heading",
      "text": "Dict, set і генераторні вирази"
    },
    {
      "type": "text",
      "md": "Той самий синтаксис працює й для інших колекцій — змінюються лише дужки:\n\n- `{k: v for ...}` — **dict comprehension**;\n- `{x for ...}` — **set comprehension** (унікальні значення);\n- `(x for ...)` — **генераторний вираз**: не створює колекцію, а видає елементи по одному, на вимогу. Ідеально для `sum`, `max`, `any` на великих даних."
    },
    {
      "type": "code",
      "code": "soldiers = [\"Levi\", \"Mikasa\", \"Hange\", \"Erwin\"]\n\nname_len = {name: len(name) for name in soldiers}\nprint(name_len)\n\nkills = {\"Levi\": 58, \"Mikasa\": 20, \"Hange\": 3}\nelite = {name: k for name, k in kills.items() if k >= 10}\nprint(elite)\n\nswapped = {v: k for k, v in kills.items()}\nprint(swapped[58])\n\nletters = {name[0] for name in [\"Levi\", \"Liza\", \"Mikasa\", \"Moblit\"]}\nprint(sorted(letters))\n\ntotal = sum(k for k in kills.values())    # без зайвих дужок і списку\nprint(total)",
      "title": "dict_set_gen.py",
      "output": "{'Levi': 4, 'Mikasa': 6, 'Hange': 5, 'Erwin': 5}\n{'Levi': 58, 'Mikasa': 20}\nLevi\n['L', 'M']\n81"
    },
    {
      "type": "tip",
      "title": "sum(... for ...) без квадратних дужок",
      "md": "Коли генераторний вираз — **єдиний** аргумент функції, додаткові дужки не потрібні: `sum(x * x for x in data)`, `max(len(w) for w in words)`. А ще він не створює проміжний список у пам'яті — на мільйоні елементів це помітна економія."
    },
    {
      "type": "code",
      "code": "import sys\n\nas_list = [n * 2 for n in range(100_000)]\nas_gen = (n * 2 for n in range(100_000))\n\nprint(type(as_gen).__name__)\nprint(sys.getsizeof(as_list) > 100_000)   # список займає сотні КБ\nprint(sys.getsizeof(as_gen) < 1_000)      # генератор — крихітний\nprint(next(as_gen), next(as_gen), next(as_gen))",
      "title": "generator_memory.py",
      "output": "generator\nTrue\nTrue\n0 2 4"
    },
    {
      "type": "heading",
      "text": "lambda: функція в один рядок"
    },
    {
      "type": "text",
      "md": "`lambda` створює **анонімну функцію** прямо у виразі:\n\n`lambda параметри: вираз`\n\nРезультат виразу повертається автоматично (без `return`). Усередині — лише **один вираз**: жодних циклів, присвоєнь чи кількох рядків. Lambda створена для коротких «одноразових» функцій, які передаються в інші функції."
    },
    {
      "type": "code",
      "code": "double = lambda x: x * 2          # те саме, що def double(x): return x * 2\nprint(double(21))\n\nadd = lambda a, b=10: a + b\nprint(add(5), add(5, 1))\n\nprint((lambda name: f\"Salute, {name}!\")(\"Erwin\"))\n\nrank = lambda k: \"еліта\" if k >= 50 else \"солдат\"\nprint(rank(58), rank(3))",
      "title": "lambda_basics.py",
      "output": "42\n15 6\nSalute, Erwin!\nеліта солдат"
    },
    {
      "type": "compare",
      "title": "Lambda у змінній",
      "bad": {
        "code": "square = lambda x: x ** 2",
        "label": "Lambda з ім'ям"
      },
      "good": {
        "code": "def square(x):\n    return x ** 2",
        "label": "Звичайний def"
      },
      "note": "PEP 8 не радить присвоювати lambda змінній: у `def` є нормальне ім'я в трейсбеку, docstring і місце для анотацій. Lambda сяє там, де функцію **передають аргументом** і вона більше ніде не потрібна."
    },
    {
      "type": "heading",
      "text": "map, filter, sorted з key"
    },
    {
      "type": "text",
      "md": "Функції вищого порядку приймають **іншу функцію** як аргумент:\n\n- `map(f, data)` — застосовує `f` до кожного елемента;\n- `filter(f, data)` — лишає елементи, для яких `f` повертає істину;\n- `sorted(data, key=f)` — сортує за значенням `f(елемент)`, а не за самим елементом. Так само працюють `min`, `max` і `list.sort`.\n\n`map` і `filter` повертають **ліниві ітератори** — щоб побачити результат, обгорни в `list()`."
    },
    {
      "type": "code",
      "code": "nums = [1, 2, 3, 4, 5, 6]\n\nprint(list(map(lambda n: n * 10, nums)))\nprint(list(filter(lambda n: n % 2 == 0, nums)))\nprint(list(map(str.upper, [\"levi\", \"hange\"])))   # можна передати готову функцію\nprint(list(map(int, \"2045\")))\n\nlazy = map(lambda n: n * 10, nums)\nprint(type(lazy).__name__)                          # map — ще нічого не пораховано\nprint(next(lazy), next(lazy))                       # рахує лише на вимогу",
      "title": "map_filter.py",
      "output": "[10, 20, 30, 40, 50, 60]\n[2, 4, 6]\n['LEVI', 'HANGE']\n[2, 0, 4, 5]\nmap\n10 20"
    },
    {
      "type": "viz",
      "id": "map-filter-lab",
      "title": "Лабораторія map / filter / sorted",
      "caption": "Обери операцію і lambda — і подивись, як функція застосовується до **кожного** елемента: для `map` значення перетворюються, для `filter` відсіюються ті, де lambda дала `False`, а для `sorted` поруч з елементом з'являється його **ключ**, за яким і відбувається сортування."
    },
    {
      "type": "code",
      "code": "squad = [(\"Levi\", 160, 58), (\"Mikasa\", 170, 20), (\"Hange\", 170, 3), (\"Erwin\", 188, 10)]\n\nprint(sorted(squad, key=lambda s: s[2], reverse=True)[0][0])   # найбільше вбивств\nprint([s[0] for s in sorted(squad, key=lambda s: s[1])])        # за зростом\nprint([s[0] for s in sorted(squad, key=lambda s: (-s[1], s[0]))])  # зріст ↓, ім'я ↑\nprint(min(squad, key=lambda s: s[1])[0])\nprint(max([\"eren\", \"armin\", \"sasha\"], key=len))",
      "title": "sorted_key.py",
      "output": "Levi\n['Levi', 'Mikasa', 'Hange', 'Erwin']\n['Erwin', 'Hange', 'Mikasa', 'Levi']\nLevi\narmin"
    },
    {
      "type": "viz",
      "id": "sorted-key-3d",
      "title": "sorted(key=...) у 3D",
      "caption": "Колони — солдати розвідкорпусу, їхня висота — це зріст. Перемикай **key** — і колони перешиковуються: Python рахує ключ для кожного елемента **один раз**, а потім сортує за ключами. Спробуй `reverse` і складений ключ-кортеж."
    },
    {
      "type": "tip",
      "title": "itemgetter і attrgetter",
      "md": "Замість `lambda s: s[1]` можна взяти `operator.itemgetter(1)`, а замість `lambda h: h.name` — `operator.attrgetter(\"name\")`. Вони швидші і чудово читаються: `sorted(squad, key=itemgetter(2, 0))` — сортування за кількома полями."
    },
    {
      "type": "tip",
      "title": "Складний ключ одним кортежем",
      "md": "Сортування за кількома критеріями з різним напрямком — поверни з `key` **кортеж** і зроби числове поле від'ємним: `key=lambda s: (-s.score, s.name)` — очки за спаданням, а при рівності — ім'я за алфавітом."
    },
    {
      "type": "quiz",
      "question": "Що поверне `sorted([\"bb\", \"a\", \"ccc\"], key=len, reverse=True)`?",
      "options": [
        "`['a', 'bb', 'ccc']`",
        "`['ccc', 'bb', 'a']`",
        "`[3, 2, 1]`",
        "`['bb', 'a', 'ccc']`"
      ],
      "answer": 1,
      "explain": "`key=len` рахує довжину кожного рядка (2, 1, 3) і сортує **елементи** за цими ключами, а `reverse=True` — від найбільшого. Повертаються самі рядки, не ключі."
    },
    {
      "type": "joke",
      "md": "Ханджі: «Я відсортувала титанів за `key=lambda t: t.cuteness`!» Леві: «Ключ — `t.threat`, окуляриста. І `reverse=True`».",
      "hero": "Ханджі Зое"
    },
    {
      "type": "heading",
      "text": "any і all: перевірка всієї колекції"
    },
    {
      "type": "text",
      "md": "- `any(iterable)` — `True`, якщо **хоч один** елемент істинний;\n- `all(iterable)` — `True`, якщо **всі** елементи істинні.\n\nРазом з генераторним виразом це найкоротший спосіб запитати «чи є хоч один...?» та «чи всі...?». До того ж вони **ліниві**: `any` зупиняється на першому `True`, `all` — на першому `False`."
    },
    {
      "type": "code",
      "code": "hp = [100, 45, 0, 80]\n\nprint(any(h == 0 for h in hp))       # чи є загиблі?\nprint(all(h > 0 for h in hp))        # чи всі живі?\nprint(all(h <= 100 for h in hp))\n\nprint(any([]), all([]))              # порожня колекція: any → False, all → True\n\ndef check(h):\n    print(f\"  перевіряю {h}\")\n    return h == 0\n\nprint(any(check(h) for h in hp))     # зупиниться на 0 — 80 вже не перевірить",
      "title": "any_all.py",
      "output": "True\nFalse\nTrue\nFalse True\n  перевіряю 100\n  перевіряю 45\n  перевіряю 0\nTrue"
    },
    {
      "type": "viz",
      "id": "any-all-shortcircuit",
      "title": "Коротке замикання any / all",
      "caption": "Обери функцію та умову і тисни **Крок**. Бачиш, як `any` кидає перевірку, щойно знайде перше `True`, а `all` — перше `False`? Решта елементів навіть не перевіряються."
    },
    {
      "type": "warning",
      "title": "all() на порожньому — True",
      "md": "`all([])` повертає `True` («всі нуль елементів задовольняють умову» — так звана *vacuous truth*). Якщо порожній список для тебе означає «ні», перевір його окремо: `bool(items) and all(...)`."
    },
    {
      "type": "heading",
      "text": "Функціональний стиль: коли так, а коли ні"
    },
    {
      "type": "text",
      "md": "Comprehensions, `map`, `filter`, `lambda`, `any/all`, `sorted(key=...)`, `functools.reduce` — усе це частинки **функціонального стилю**: замість покрокових інструкцій «зроби те, потім те» ти описуєш **перетворення даних**. Функції без побічних ефектів легше тестувати і комбінувати.\n\nАле в Python панує принцип «читабельність важлива». Кілька практичних правил:\n\n- comprehension зазвичай читається краще, ніж `map` + `lambda`: `[x * 2 for x in data]` проти `list(map(lambda x: x * 2, data))`;\n- `map(str, data)` з готовою функцією — чудово, lambda там не потрібна;\n- якщо логіка має кілька кроків, винятки чи `print` — пиши звичайний цикл або `def`;\n- comprehension — для **створення** колекції. Не використовуй його заради побічних ефектів (`[print(x) for x in data]` — антипатерн)."
    },
    {
      "type": "code",
      "code": "from functools import reduce\n\nscores = [58, 20, 3, 10]\n\n# reduce згортає колекцію в одне значення\nprint(reduce(lambda acc, x: acc + x, scores))\nprint(reduce(lambda a, b: a if a > b else b, scores))\n\n# але для типових випадків є готові функції — вони зрозуміліші\nprint(sum(scores), max(scores))\n\n# конвеєр: відфільтрувати → перетворити → відсортувати → взяти топ-2\nsquad = {\"Levi\": 58, \"Mikasa\": 20, \"Hange\": 3, \"Erwin\": 10, \"Jean\": 7}\nranked = sorted(squad.items(), key=lambda pair: pair[1], reverse=True)\ntop = [name.upper() for name, k in ranked if k >= 10][:2]\nprint(top)",
      "title": "functional_style.py",
      "output": "91\n58\n91 58\n['LEVI', 'MIKASA']"
    },
    {
      "type": "code",
      "code": "# Walrus := всередині comprehension — рахуємо один раз, використовуємо двічі\ndata = [\"  levi \", \"\", \" mikasa\", \"   \"]\nclean = [s for raw in data if (s := raw.strip())]\nprint(clean)\n\n# enumerate і zip у comprehension\nnames = [\"Levi\", \"Mikasa\", \"Eren\"]\nranks = [\"капітан\", \"солдат\", \"солдат\"]\nprint([f\"{i}. {n} — {r}\" for i, (n, r) in enumerate(zip(names, ranks), start=1)])",
      "title": "walrus_zip.py",
      "output": "['levi', 'mikasa']\n['1. Levi — капітан', '2. Mikasa — солдат', '3. Eren — солдат']"
    },
    {
      "type": "tip",
      "title": "Walrus у comprehension",
      "md": "`:=` (моржовий оператор) у comprehension дозволяє **обчислити значення один раз** і одразу і відфільтрувати, і використати його: `[y for x in data if (y := expensive(x)) > 0]`. Без нього `expensive` викликався б двічі."
    },
    {
      "type": "quiz",
      "question": "Який варіант найкраще передає намір «множини унікальних довжин слів»?",
      "options": [
        "`list(set(map(lambda w: len(w), words)))`",
        "`{len(w) for w in words}`",
        "`[len(w) for w in words if w not in words]`",
        "`set([len(w)] for w in words)`"
      ],
      "answer": 1,
      "explain": "Set comprehension `{len(w) for w in words}` одразу будує множину — коротко і прозоро. Варіант з `map` + `lambda` працює, але зайво складний, а останні два — помилкові."
    },
    {
      "type": "joke",
      "md": "Ервін: «Віддайте свої серця!» Леві: «Віддайте свої цикли. Мені вистачить одного comprehension».",
      "hero": "Ервін Смит"
    },
    {
      "type": "heading",
      "text": "Шпаргалка Леві"
    },
    {
      "type": "table",
      "head": [
        "Задача",
        "Код",
        "Результат"
      ],
      "rows": [
        [
          "Перетворити кожен",
          "`[x * 2 for x in xs]`",
          "список тієї ж довжини"
        ],
        [
          "Відфільтрувати",
          "`[x for x in xs if x > 0]`",
          "тільки підходящі"
        ],
        [
          "Замінити за умовою",
          "`[x if x > 0 else 0 for x in xs]`",
          "та сама довжина"
        ],
        [
          "Розплющити",
          "`[x for row in m for x in row]`",
          "один плаский список"
        ],
        [
          "Словник",
          "`{k: v for k, v in pairs}`",
          "`dict`"
        ],
        [
          "Множина",
          "`{x % 3 for x in xs}`",
          "`set`, унікальні"
        ],
        [
          "Лінива сума",
          "`sum(x * x for x in xs)`",
          "без проміжного списку"
        ],
        [
          "Lambda",
          "`lambda a, b: a + b`",
          "анонімна функція"
        ],
        [
          "Сортування за ключем",
          "`sorted(xs, key=len, reverse=True)`",
          "новий список"
        ],
        [
          "Хоч один / всі",
          "`any(...)` / `all(...)`",
          "`bool`, з коротким замиканням"
        ]
      ]
    },
    {
      "type": "tip",
      "title": "Тест «прочитай вголос»",
      "md": "Коли не впевнений, чи comprehension не заскладний, — прочитай його вголос українською. Якщо речення «квадрат кожного числа з даних, якщо воно парне» звучить природно — усе гаразд. Якщо виходить абзац — розгорни в цикл."
    }
  ]
};

export default section;
