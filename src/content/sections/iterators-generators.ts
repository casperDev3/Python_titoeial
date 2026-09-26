import type { Section } from "../types";

const section: Section = {
  "slug": "iterators-generators",
  "title": "Ітератори та генератори",
  "short": "iter, next, yield",
  "icon": "🌀",
  "group": "Просунуто",
  "summary": "Протокол ітерації, iter() та next(), yield і генератори, ліниві обчислення, генераторні вирази, itertools.",
  "hero": {
    "name": "Доктор Стрендж",
    "universe": "Marvel",
    "emoji": "🌀",
    "quote": "Я бачив 14 000 605 варіантів. Генератор видає їх по одному — yield.",
    "why": "Стрендж переглядає майбутнє по одному варіанту — як генератор ліниво видає значення лише на запит."
  },
  "theme": {
    "accent": "#16a34a",
    "accent2": "#f97316",
    "glow": "#15803d"
  },
  "minutes": 14,
  "order": 16,
  "blocks": [
    {
      "type": "text",
      "md": "Коли Доктор Стрендж підняв Око Агамотто і зазирнув у майбутнє, він не отримав усі **14 000 605** варіантів одним гігантським списком — голова б луснула. Він переглядав їх **по одному**: подивився, зробив висновок, попросив наступний.\n\nСаме так у Python працюють **ітератори** та **генератори**. Замість того щоб будувати в пам'яті мільйон елементів наперед, вони видають значення **на запит** — одне за одним. Це і є *ліниві обчислення*.\n\nУ цьому розділі розберемо:\n\n- що таке **ітерабельний об'єкт** і **ітератор**, і чим вони відрізняються;\n- протокол ітерації: `iter()`, `next()` і `StopIteration`;\n- як насправді працює цикл `for`;\n- власні ітератори-класи і **генератори** з `yield`;\n- ліниві обчислення, нескінченні послідовності і **генераторні вирази**;\n- `yield from`, конвеєри з генераторів і модуль **itertools**."
    },
    {
      "type": "heading",
      "text": "Ітерабельне і ітератор: книга та закладка"
    },
    {
      "type": "text",
      "md": "Два слова, які постійно плутають:\n\n- **Ітерабельний об'єкт** (*iterable*) — те, по чому *можна* пройтись циклом: `list`, `tuple`, `str`, `dict`, `set`, `range`, файл. Має метод `__iter__`.\n- **Ітератор** (*iterator*) — «закладка», що пам'ятає, де ти зупинився, і вміє видати **наступний** елемент. Має `__next__` (і `__iter__`, що повертає сам себе).\n\nУяви книгу заклинань у бібліотеці Камар-Таджа. Книга — ітерабельна: її можна читати. А закладка Вонга — ітератор: вона знає поточну сторінку. З однієї книги можна зробити скільки завгодно закладок, і кожна рухатиметься незалежно."
    },
    {
      "type": "code",
      "code": "spells = [\"Щит Серафима\", \"Дзеркальний вимір\", \"Петля часу\"]\n\nbookmark = iter(spells)          # книга → закладка\nprint(type(spells).__name__, \"→\", type(bookmark).__name__)\n\n# у книги немає __next__, у закладки — є\nprint(hasattr(spells, \"__next__\"), hasattr(bookmark, \"__next__\"))\n\n# ітератор повертає САМ СЕБЕ на iter()\nprint(iter(bookmark) is bookmark)\nprint(iter(spells) is spells)",
      "title": "iterable_vs_iterator.py",
      "output": "list → list_iterator\nFalse True\nTrue\nFalse"
    },
    {
      "type": "tip",
      "title": "Як швидко перевірити, чи це ітератор",
      "md": "Порівняй `iter(x) is x`. Для ітератора (генератор, `map`, `zip`, файл) — `True`: він сам собі закладка. Для колекції (`list`, `dict`, `str`) — `False`: вона щоразу створює **нову** закладку. Це пояснює, чому по списку можна пройтись двічі, а по генератору — ні."
    },
    {
      "type": "heading",
      "text": "iter() і next(): протокол вручну"
    },
    {
      "type": "text",
      "md": "Весь механізм тримається на двох функціях:\n\n- `iter(obj)` — отримати ітератор (викликає `obj.__iter__()`);\n- `next(it)` — отримати наступний елемент (викликає `it.__next__()`).\n\nКоли елементи закінчились, ітератор кидає виняток **`StopIteration`** — це сигнал «варіантів більше немає». Другий аргумент `next(it, default)` дозволяє замість винятку отримати значення за замовчуванням."
    },
    {
      "type": "code",
      "code": "stones = [\"Час\", \"Простір\", \"Розум\"]\nit = iter(stones)\n\nprint(next(it))\nprint(next(it))\nprint(next(it))\nprint(next(it, \"Каменів більше немає\"))   # default замість винятку\n\ntry:\n    next(it)\nexcept StopIteration:\n    print(\"StopIteration: ітератор вичерпано\")",
      "title": "next_manual.py",
      "highlight": [
        7
      ],
      "output": "Час\nПростір\nРозум\nКаменів більше немає\nStopIteration: ітератор вичерпано"
    },
    {
      "type": "viz",
      "id": "iter-protocol",
      "title": "Протокол ітерації крок за кроком",
      "caption": "Створи ітератор кнопкою `iter()` і тисни `next()`. Стрілка-закладка рухається по списку, пройдені елементи тьмяніють. Коли елементів більше немає — летить `StopIteration`, і цикл `for` зупиняється. Праворуч — як виглядає `for` «під капотом»."
    },
    {
      "type": "heading",
      "text": "Як насправді працює for"
    },
    {
      "type": "text",
      "md": "Цикл `for` — це просто зручна обгортка над протоколом. Коли ти пишеш `for v in visions:`, Python робить рівно таке:\n\n- викликає `iter(visions)` і отримує ітератор;\n- у нескінченному циклі викликає `next()`;\n- ловить `StopIteration` і тихо виходить.\n\nТому `for` працює з **будь-чим**, що підтримує протокол: списками, рядками, словниками, файлами, `range`, генераторами і твоїми власними класами."
    },
    {
      "type": "code",
      "code": "visions = [\"перемога\", \"поразка\", \"нічия\"]\n\n# Так пише людина:\nfor v in visions:\n    print(\"бачу:\", v)\n\nprint(\"---\")\n\n# Так це бачить Python:\nit = iter(visions)\nwhile True:\n    try:\n        v = next(it)\n    except StopIteration:\n        break\n    print(\"бачу:\", v)",
      "title": "for_under_the_hood.py",
      "highlight": [
        10,
        11,
        12,
        13,
        14,
        15
      ],
      "output": "бачу: перемога\nбачу: поразка\nбачу: нічия\n---\nбачу: перемога\nбачу: поразка\nбачу: нічия"
    },
    {
      type: "flow",
      title: "Цикл for під капотом",
      nodes: [
        { id: "s", kind: "start", label: "for v in visions:", col: 0, row: 0 },
        { id: "it", kind: "call", label: "it = iter(visions)", col: 0, row: 1 },
        { id: "nx", kind: "call", label: "v = next(it)", col: 0, row: 2 },
        { id: "stop", kind: "decision", label: "StopIteration?", col: 0, row: 3 },
        { id: "body", kind: "io", label: "print(\"бачу:\", v)", col: 0, row: 4 },
        { id: "e", kind: "end", label: "Вихід з циклу", col: 1, row: 5 },
      ],
      edges: [
        { from: "s", to: "it" },
        { from: "it", to: "nx" },
        { from: "nx", to: "stop" },
        { from: "stop", to: "body", label: "Ні" },
        { from: "stop", to: "e", label: "Так", side: "right" },
        { from: "body", to: "nx", side: "left" },
      ],
      scenarios: [
        {
          name: "3 бачення",
          steps: [
            { node: "s", note: "`visions = [\"перемога\", \"поразка\", \"нічия\"]`" },
            { node: "it", note: "`iter()` повертає ітератор-«закладку» на початку списку" },
            { node: "nx", note: "`v = \"перемога\"`" },
            { node: "stop", note: "значення є — винятку немає" },
            { node: "body", note: "вивід: `бачу: перемога`" },
            { node: "nx", note: "`v = \"поразка\"`" },
            { node: "stop", note: "винятку немає" },
            { node: "body", note: "вивід: `бачу: поразка`" },
            { node: "nx", note: "`v = \"нічия\"`" },
            { node: "stop", note: "винятку немає" },
            { node: "body", note: "вивід: `бачу: нічия`" },
            { node: "nx", note: "елементи скінчились — `next()` кидає `StopIteration`" },
            { node: "stop", note: "так, `StopIteration`" },
            { node: "e", note: "`for` тихо ловить виняток і завершується; `v` лишається `\"нічия\"`" },
          ],
        },
        {
          name: "порожній список",
          steps: [
            { node: "s", note: "`visions = []`" },
            { node: "it", note: "ітератор порожнього списку" },
            { node: "nx", note: "першого ж разу — `StopIteration`" },
            { node: "stop", note: "так" },
            { node: "e", note: "тіло не виконалось жодного разу, нічого не виведено" },
          ],
        },
      ],
      caption: "`for` — це `iter()` один раз і `next()` у циклі, доки не прилетить `StopIteration`. Ніякої магії з індексами.",
    },
    {
      "type": "joke",
      "md": "Вонг: «Ти знову взяв книгу без дозволу?» — Я: «Ні, я просто викликав `iter()` на бібліотеці». — Вонг: «А повертати хто буде?» — Я: «`StopIteration` сам усе закриє».",
      "hero": "Доктор Стрендж"
    },
    {
      "type": "warning",
      "title": "Ітератор — одноразовий",
      "md": "Пройдений ітератор **не перемотується**. Другий `for` по тому самому генератору чи `map` не виведе нічого — і жодної помилки! Навіть оператор `in` «з'їдає» елементи, поки шукає. Потрібно пройтись кілька разів — збережи дані у `list` або створи новий ітератор."
    },
    {
      "type": "code",
      "code": "it = iter([10, 20, 30, 40])\nprint(20 in it)        # шукає... і з'їдає 10 та 20\nprint(list(it))        # лишилось тільки те, що після\n\ngen = (x * 2 for x in range(3))\nprint(list(gen))\nprint(list(gen))       # вдруге — порожньо!",
      "title": "exhausted.py",
      "output": "True\n[30, 40]\n[0, 2, 4]\n[]"
    },
    {
      type: "flow",
      title: "Як in шукає в ітераторі (і з'їдає його)",
      nodes: [
        { id: "s", kind: "start", label: "20 in it", col: 0, row: 0 },
        { id: "nx", kind: "call", label: "x = next(it)", col: 0, row: 1 },
        { id: "stop", kind: "decision", label: "StopIteration?", col: 0, row: 2 },
        { id: "eq", kind: "decision", label: "x == 20 ?", col: 0, row: 3 },
        { id: "yes", kind: "end", label: "True", col: 0, row: 4 },
        { id: "no", kind: "end", label: "False", col: 1, row: 3 },
      ],
      edges: [
        { from: "s", to: "nx" },
        { from: "nx", to: "stop" },
        { from: "stop", to: "eq", label: "Ні" },
        { from: "stop", to: "no", label: "Так", side: "right" },
        { from: "eq", to: "yes", label: "Так" },
        { from: "eq", to: "nx", label: "Ні", side: "left" },
      ],
      scenarios: [
        {
          name: "20 in iter([10, 20, 30, 40])",
          steps: [
            { node: "s", note: "`it = iter([10, 20, 30, 40])`" },
            { node: "nx", note: "`x = 10` — елемент спожито" },
            { node: "stop", note: "ні" },
            { node: "eq", note: "`10 == 20` → False" },
            { node: "nx", note: "`x = 20` — теж спожито" },
            { node: "stop", note: "ні" },
            { node: "eq", note: "`20 == 20` → True" },
            { node: "yes", note: "результат `True`; у `it` лишились тільки `[30, 40]`" },
          ],
        },
        {
          name: "50 in iter([10, 20])",
          steps: [
            { node: "s", note: "`it = iter([10, 20])`" },
            { node: "nx", note: "`x = 10`" },
            { node: "stop", note: "ні" },
            { node: "eq", note: "`10 == 50` → False" },
            { node: "nx", note: "`x = 20`" },
            { node: "stop", note: "ні" },
            { node: "eq", note: "`20 == 50` → False" },
            { node: "nx", note: "елементів немає — `StopIteration`" },
            { node: "stop", note: "так" },
            { node: "no", note: "результат `False`; `list(it)` тепер `[]` — ітератор вичерпано" },
          ],
        },
      ],
      caption: "Пошук у списку можна повторювати скільки завгодно, а в ітераторі кожна перевірка `next()` безповоротно зсуває закладку.",
    },
    {
      "type": "heading",
      "text": "Власний ітератор: клас з __iter__ і __next__"
    },
    {
      "type": "text",
      "md": "Щоб зробити свій ітератор, достатньо реалізувати два методи:\n\n- `__iter__(self)` — повертає `self`;\n- `__next__(self)` — повертає наступне значення або кидає `StopIteration`.\n\nЗробимо відлік до відкриття порталу."
    },
    {
      "type": "code",
      "code": "class Countdown:\n    \"\"\"Ітератор: відлік до відкриття порталу.\"\"\"\n\n    def __init__(self, start):\n        self.current = start\n\n    def __iter__(self):\n        return self\n\n    def __next__(self):\n        if self.current <= 0:\n            raise StopIteration\n        value = self.current\n        self.current -= 1\n        return value\n\n\nfor n in Countdown(3):\n    print(n, end=\" \")\nprint(\"🌀 портал відкрито!\")",
      "title": "countdown_class.py",
      "output": "3 2 1 🌀 портал відкрито!"
    },
    {
      "type": "text",
      "md": "Але в такого класу та сама проблема одноразовості. Якщо хочеш об'єкт, по якому можна ходити **багато разів**, розділи ролі: *контейнер* у `__iter__` щоразу повертає **новий** ітератор."
    },
    {
      "type": "code",
      "code": "class Multiverse:\n    \"\"\"Ітерабельний контейнер: кожен for отримує нову закладку.\"\"\"\n\n    def __init__(self, *worlds):\n        self.worlds = worlds\n\n    def __iter__(self):\n        return iter(self.worlds)     # новий ітератор щоразу\n\n\nm = Multiverse(\"Земля-616\", \"Земля-838\", \"Земля-199999\")\nprint(list(m))\nprint(len([w for w in m]))           # і ще раз — працює",
      "title": "reusable_iterable.py",
      "output": "['Земля-616', 'Земля-838', 'Земля-199999']\n3"
    },
    {
      "type": "heading",
      "text": "Генератори: yield замість класу"
    },
    {
      "type": "text",
      "md": "Писати клас з `__next__` щоразу — нудно. **Генератор** — це функція, у якій є `yield`. Вона автоматично стає фабрикою ітераторів:\n\n- виклик генераторної функції **не виконує жодного рядка** — лише створює об'єкт-генератор;\n- кожен `next()` запускає код до найближчого `yield`, віддає значення і **заморожує** функцію разом з усіма локальними змінними;\n- наступний `next()` розморожує її рівно з того місця;\n- коли функція доходить до кінця — автоматично летить `StopIteration`.\n\n`return` віддає результат *один раз* і завершує функцію. `yield` віддає значення і **ставить на паузу**. Це як Стрендж, що застиг у Петлі часу: між «кадрами» він пам'ятає все."
    },
    {
      "type": "code",
      "code": "def countdown(n):\n    print(\"Старт відліку\")\n    while n > 0:\n        yield n\n        n -= 1\n    print(\"Кінець\")\n\n\ngen = countdown(3)            # тіло ще НЕ виконується\nprint(type(gen).__name__)\nprint(next(gen))              # тепер друкується «Старт відліку»\nprint(next(gen))\nprint(list(gen))              # добирає решту і доходить до кінця",
      "title": "first_generator.py",
      "highlight": [
        4
      ],
      "output": "generator\nСтарт відліку\n3\n2\nКінець\n[1]"
    },
    {
      type: "flow",
      title: "next() і yield: генератор на паузі",
      nodes: [
        { id: "s", kind: "start", label: "Старт", col: 0, row: 0 },
        { id: "mk", kind: "call", label: "gen = countdown(n)", col: 0, row: 1 },
        { id: "nx", kind: "call", label: "next(gen)", col: 0, row: 2 },
        { id: "run", kind: "process", label: "виконати тіло з\nмісця паузи", col: 0, row: 3 },
        { id: "cond", kind: "decision", label: "while n > 0 ?", col: 0, row: 4 },
        { id: "y", kind: "io", label: "yield n", col: 0, row: 5 },
        { id: "fin", kind: "io", label: "print(\"Кінець\")", col: 1, row: 5 },
        { id: "stop", kind: "end", label: "StopIteration", col: 1, row: 6 },
      ],
      edges: [
        { from: "s", to: "mk" },
        { from: "mk", to: "nx" },
        { from: "nx", to: "run" },
        { from: "run", to: "cond" },
        { from: "cond", to: "y", label: "True" },
        { from: "cond", to: "fin", label: "False", side: "right" },
        { from: "y", to: "nx", label: "пауза", side: "left" },
        { from: "fin", to: "stop" },
      ],
      scenarios: [
        {
          name: "countdown(2)",
          steps: [
            { node: "s" },
            { node: "mk", note: "тіло ще **не** виконується; стан `GEN_CREATED`" },
            { node: "nx", note: "перший `next()` — запускаємо з першого рядка" },
            { node: "run", note: "вивід: `Старт відліку`; `n = 2`" },
            { node: "cond", note: "`2 > 0` → True" },
            { node: "y", note: "`next()` повертає `2`; функція заморожена (`GEN_SUSPENDED`), `n = 2` збережено" },
            { node: "nx", note: "другий `next()` — розморожуємо після `yield`" },
            { node: "run", note: "`n -= 1` → `n = 1`" },
            { node: "cond", note: "`1 > 0` → True" },
            { node: "y", note: "`next()` повертає `1`; знову пауза" },
            { node: "nx", note: "третій `next()`" },
            { node: "run", note: "`n -= 1` → `n = 0`" },
            { node: "cond", note: "`0 > 0` → False — вихід з while" },
            { node: "fin", note: "вивід: `Кінець`" },
            { node: "stop", note: "функція дійшла до кінця → `StopIteration`, стан `GEN_CLOSED`" },
          ],
        },
        {
          name: "countdown(0)",
          steps: [
            { node: "s" },
            { node: "mk", note: "`GEN_CREATED`, нічого не надруковано" },
            { node: "nx", note: "перший `next()`" },
            { node: "run", note: "вивід: `Старт відліку`; `n = 0`" },
            { node: "cond", note: "`0 > 0` → False" },
            { node: "fin", note: "вивід: `Кінець`" },
            { node: "stop", note: "жодного `yield` — перший же `next()` кидає `StopIteration`" },
          ],
        },
      ],
      caption: "Кожен `next()` проганяє тіло лише до найближчого `yield`. Між викликами генератор «спить» разом з усіма локальними змінними.",
    },
    {
      "type": "viz",
      "id": "generator-stepper",
      "title": "Життя генератора: пауза на кожному yield",
      "caption": "Тисни **Крок** і стеж за двома «фреймами»: код, що викликає `next()`, і сам генератор. Зверни увагу на стан `GEN_SUSPENDED`: між викликами функція *заморожена*, а локальна змінна `n` зберігає значення. Після останнього `yield` генератор доходить до кінця — і летить `StopIteration`."
    },
    {
      "type": "compare",
      "title": "Функція, що будує список, проти генератора",
      "bad": {
        "label": "Збирає все в пам'ять, а потім віддає",
        "code": "def read_visions(count):\n    result = []\n    for i in range(count):\n        result.append(f\"варіант {i}\")\n    return result          # 14 000 605 рядків у пам'яті одразу\n\nfor v in read_visions(14_000_605):\n    if \"поразка\" in v:\n        break"
      },
      "good": {
        "label": "Віддає по одному, коли просять",
        "code": "def read_visions(count):\n    for i in range(count):\n        yield f\"варіант {i}\"   # один рядок за раз\n\nfor v in read_visions(14_000_605):\n    if \"поразка\" in v:\n        break                  # решту навіть не буде обчислено"
      },
      "note": "Патерн «створи порожній список → `append` у циклі → `return`» майже завжди можна замінити на `yield`. Код стає коротшим, а пам'ять — вільною. Якщо все ж потрібен список — просто `list(read_visions(10))`."
    },
    {
      "type": "quiz",
      "question": "Що надрукує `g = countdown(3)` для функції з `print(\"Старт відліку\")` на першому рядку?",
      "options": [
        "«Старт відліку»",
        "Нічого",
        "3",
        "Помилку TypeError"
      ],
      "answer": 1,
      "explain": "Виклик генераторної функції лише **створює** генератор. Жоден рядок тіла не виконується, доки не прийде перший `next()`."
    },
    {
      "type": "heading",
      "text": "Ліниві обчислення і нескінченні послідовності"
    },
    {
      "type": "text",
      "md": "Раз генератор обчислює значення лише на запит, він може бути **нескінченним** — ніхто ж не просить усе одразу. Цикл `while True` у звичайній функції повісив би програму, а в генераторі — це нормальна справа: зупиняє той, хто *споживає* значення."
    },
    {
      "type": "code",
      "code": "def fibonacci():\n    a, b = 0, 1\n    while True:              # нескінченно — і це ок\n        yield a\n        a, b = b, a + b\n\n\nfor i, f in enumerate(fibonacci()):\n    if i == 10:\n        break\n    print(f, end=\" \")",
      "title": "infinite_fib.py",
      "output": "0 1 1 2 3 5 8 13 21 34 "
    },
    {
      "type": "text",
      "md": "А тепер — магія економії пам'яті. Список з мільйона квадратів займає мегабайти, а генератор тих самих квадратів — кількасот байтів, бо зберігає лише *рецепт* і поточний стан."
    },
    {
      "type": "code",
      "code": "import sys\n\nsquares_list = [x * x for x in range(1_000_000)]\nsquares_gen = (x * x for x in range(1_000_000))\n\nprint(\"список > 8 МБ:\", sys.getsizeof(squares_list) > 8_000_000)\nprint(\"генератор < 300 Б:\", sys.getsizeof(squares_gen) < 300)\nprint(sum(squares_gen))      # результат той самий",
      "title": "memory.py",
      "output": "список > 8 МБ: True\nгенератор < 300 Б: True\n333332833333500000"
    },
    {
      "type": "viz",
      "id": "lazy-pipeline",
      "title": "Жадібно vs ліниво: конвеєр range → x² → парні → перші 3",
      "caption": "Порівняй два режими. **Список** спершу обчислює *усі* квадрати, потім фільтрує *усе*, і тільки потім бере три. **Генератор** проганяє елементи по одному крізь увесь конвеєр і зупиняється, щойно знайдено три результати — решта навіть не торкається процесора. Покрути слайдер `N` і порівняй лічильник операцій."
    },
    {
      "type": "viz",
      "id": "time-stone-3d",
      "title": "Око Агамотто: майбутнє на запит",
      "caption": "Спіраль довкола Каменя Часу — це варіанти майбутнього. У режимі **генератора** вони примарні, поки ти не викличеш `next()`: лише тоді варіант «матеріалізується». Спробуй клацнути по далекому варіанту — генератор не вміє стрибати вперед. У режимі **списку** все обчислюється одразу — і шкала пам'яті заповнюється повністю."
    },
    {
      "type": "joke",
      "md": "14 000 605 варіантів майбутнього. Якби я зберігав їх у `list`, мені довелося б боротися не з Таносом, а з `MemoryError`."
    },
    {
      "type": "tip",
      "title": "Не заглядай наперед — бери зріз",
      "md": "Генератор не підтримує `gen[5:10]` (він не знає свою довжину!). Для «зрізу» ітератора є `itertools.islice(gen, 5, 10)` — він так само лінивий і працює навіть з нескінченними генераторами."
    },
    {
      "type": "heading",
      "text": "Генераторні вирази"
    },
    {
      "type": "text",
      "md": "Генераторний вираз — це списковий включник (list comprehension), але в **круглих** дужках: `(x * 2 for x in data)`. Він не будує список, а повертає генератор.\n\nІдеальне місце для нього — аргумент функцій-«споживачів»: `sum`, `min`, `max`, `any`, `all`, `\"\".join`, `sorted`, `set`, `dict`. Якщо генератор — єдиний аргумент, другі дужки можна не писати."
    },
    {
      "type": "code",
      "code": "artifacts = [\"плащ\", \"амулет\", \"кільце\", \"книга\", \"портал\"]\n\nprint(sum(len(a) for a in artifacts))                 # без зайвого списку\nprint(any(a.startswith(\"к\") for a in artifacts))      # зупиниться на першому True\nprint(\", \".join(a.upper() for a in artifacts if len(a) > 5))\nprint(max((len(a), a) for a in artifacts))\n\nlazy = (a[::-1] for a in artifacts)\nprint(next(lazy), next(lazy))",
      "title": "genexp.py",
      "output": "27\nTrue\nАМУЛЕТ, КІЛЬЦЕ, ПОРТАЛ\n(6, 'портал')\nщалп телума"
    },
    {
      "type": "tip",
      "title": "any() і all() + генератор = коротке замикання",
      "md": "`any(check(x) for x in huge_data)` зупиняється на **першому** `True`, а `all(...)` — на першому `False`. Зі списком `any([check(x) for x in huge_data])` ти спочатку перевіриш **усі** елементи, а вже потім `any` подивиться на результат. Прибери квадратні дужки — і отримаєш прискорення безкоштовно."
    },
    {
      "type": "warning",
      "title": "len() і індекси генератору недоступні",
      "md": "`len(gen)` → `TypeError: object of type 'generator' has no len()`, `gen[0]` → `TypeError: 'generator' object is not subscriptable`. Генератор не знає, скільки в ньому елементів, поки не пройде їх усі. Потрібна довжина чи доступ за індексом — зроби `list(gen)` (якщо дані поміщаються в пам'ять)."
    },
    {
      "type": "quiz",
      "question": "Чим `(x * x for x in range(10))` відрізняється від `[x * x for x in range(10)]`?",
      "options": [
        "Нічим, це синоніми",
        "Перше — кортеж, друге — список",
        "Перше — лінивий генератор, друге — готовий список у пам'яті",
        "Перше працює швидше завжди"
      ],
      "answer": 2,
      "explain": "Круглі дужки створюють **генератор** — значення обчислюються по одному при ітерації. Кортежу через включник не буває: для нього пишуть `tuple(x * x for x in range(10))`."
    },
    {
      "type": "heading",
      "text": "yield from і конвеєри генераторів"
    },
    {
      "type": "text",
      "md": "Генератори чудово **з'єднуються в ланцюжок**: вихід одного — вхід іншого. Кожна ланка робить одну маленьку справу, а дані течуть по конвеєру по одному елементу — як сигнал крізь ланцюжок порталів.\n\n`yield from iterable` — скорочення для `for x in iterable: yield x`. Він передає всі значення вкладеного ітератора назовні."
    },
    {
      "type": "code",
      "code": "def read_log():\n    yield from [\n        \"INFO   чай у Вонга\",\n        \"ERROR  Дормамму прибув\",\n        \"INFO   медитація\",\n        \"ERROR  петля часу зациклилась\",\n    ]\n\n\ndef only_errors(lines):\n    for line in lines:\n        if line.startswith(\"ERROR\"):\n            yield line\n\n\ndef strip_level(lines):\n    for line in lines:\n        yield line.split(maxsplit=1)[1]\n\n\npipeline = strip_level(only_errors(read_log()))   # ще нічого не прочитано\nfor message in pipeline:\n    print(\"⚠️\", message)",
      "title": "pipeline.py",
      "output": "⚠️ Дормамму прибув\n⚠️ петля часу зациклилась"
    },
    {
      "type": "code",
      "code": "def flatten(items):\n    \"\"\"Розплющує вкладені списки будь-якої глибини.\"\"\"\n    for x in items:\n        if isinstance(x, list):\n            yield from flatten(x)    # рекурсивно віддаємо все з підсписку\n        else:\n            yield x\n\n\nprint(list(flatten([1, [2, [3, [4]]], 5])))",
      "title": "yield_from.py",
      "highlight": [
        5
      ],
      "output": "[1, 2, 3, 4, 5]"
    },
    {
      "type": "tip",
      "title": "Файли вже є лінивими ітераторами",
      "md": "`for line in open(\"huge.log\"):` читає файл **рядок за рядком**, а не весь одразу. Комбінуй це з генераторами-фільтрами — і обробиш лог на 10 ГБ, маючи в пам'яті один рядок. А от `f.readlines()` завантажить усе — уникай його для великих файлів."
    },
    {
      "type": "heading",
      "text": "Генератор зсередини: return, send і стани"
    },
    {
      "type": "text",
      "md": "Кілька речей, які варто знати, щоб генератори не дивували:\n\n- `return value` у генераторі завершує його; значення потрапляє в `StopIteration.value` (і його повертає `yield from`);\n- `gen.send(x)` відновлює генератор і робить `x` результатом виразу `yield` — так генератор може **отримувати** дані;\n- `gen.close()` зупиняє генератор достроково;\n- `inspect.getgeneratorstate(gen)` показує стан: `GEN_CREATED`, `GEN_RUNNING`, `GEN_SUSPENDED`, `GEN_CLOSED`."
    },
    {
      "type": "code",
      "code": "from inspect import getgeneratorstate\n\n\ndef ritual():\n    yield \"крок 1: руки\"\n    yield \"крок 2: мандала\"\n    return \"ритуал завершено\"\n\n\ngen = ritual()\nprint(getgeneratorstate(gen))\nprint(next(gen))\nprint(getgeneratorstate(gen))\nprint(next(gen))\ntry:\n    next(gen)\nexcept StopIteration as e:\n    print(\"return →\", e.value)\nprint(getgeneratorstate(gen))",
      "title": "gen_states.py",
      "output": "GEN_CREATED\nкрок 1: руки\nGEN_SUSPENDED\nкрок 2: мандала\nreturn → ритуал завершено\nGEN_CLOSED"
    },
    {
      "type": "code",
      "code": "def running_average():\n    total = count = 0\n    average = None\n    while True:\n        x = yield average       # віддаємо середнє, отримуємо нове число\n        total += x\n        count += 1\n        average = total / count\n\n\navg = running_average()\nnext(avg)                       # «розігрів»: доходимо до першого yield\nprint(avg.send(10))\nprint(avg.send(20))\nprint(avg.send(60))",
      "title": "send.py",
      "highlight": [
        5
      ],
      "output": "10.0\n15.0\n30.0"
    },
    {
      "type": "tip",
      "title": "iter() з «вартовим»",
      "md": "Мало хто знає другу форму: `iter(func, sentinel)` — викликає `func()` знову і знову, поки та не поверне `sentinel`. Класика: `for chunk in iter(lambda: f.read(4096), b\"\"):` — читання файлу блоками без жодного `while True`."
    },
    {
      "type": "code",
      "code": "answers = iter([\"так\", \"ні\", \"можливо\", \"стоп\", \"ще щось\"])\nask = lambda: next(answers)\n\nfor a in iter(ask, \"стоп\"):     # викликає ask(), поки не отримає \"стоп\"\n    print(a)",
      "title": "iter_sentinel.py",
      "output": "так\nні\nможливо"
    },
    {
      "type": "heading",
      "text": "itertools: пояс артефактів"
    },
    {
      "type": "text",
      "md": "Модуль `itertools` — це набір лінивих «цеглинок» для роботи з ітераторами. Усі функції повертають ітератори, тож поєднуються між собою без втрат пам'яті. Найкорисніші:\n\n- **нескінченні**: `count`, `cycle`, `repeat`;\n- **обрізка і фільтри**: `islice`, `takewhile`, `dropwhile`, `filterfalse`, `compress`;\n- **склеювання і групування**: `chain`, `zip_longest`, `groupby`, `pairwise`, `batched`;\n- **накопичення**: `accumulate`;\n- **комбінаторика**: `product`, `permutations`, `combinations`.\n\nНе забувай і про вбудовані ліниві інструменти: `range`, `enumerate`, `zip`, `map`, `filter`, `reversed` — усі вони теж ітератори (крім `range`, що є лінивою послідовністю)."
    },
    {
      "type": "code",
      "code": "from itertools import accumulate, chain, count, cycle, islice, takewhile\n\nprint(list(islice(count(10, 5), 4)))            # 10, 15, 20, 25 ...\nprint(list(islice(cycle(\"AB\"), 5)))             # A B A B A ...\nprint(list(chain([1, 2], (3, 4), \"56\")))        # склеїти будь-що\nprint(list(accumulate([1, 2, 3, 4])))           # біжуча сума\nprint(list(takewhile(lambda x: x < 4, [1, 3, 5, 2])))",
      "title": "itertools_basics.py",
      "output": "[10, 15, 20, 25]\n['A', 'B', 'A', 'B', 'A']\n[1, 2, 3, 4, '5', '6']\n[1, 3, 6, 10]\n[1, 3]"
    },
    {
      "type": "code",
      "code": "from itertools import batched, combinations, groupby, pairwise, permutations, product\n\nprint(list(product(\"AB\", [1, 2])))\nprint(len(list(permutations(\"ABC\"))))\nprint(list(combinations(\"ABCD\", 2)))\nprint(list(pairwise([1, 4, 9, 16])))\nprint(list(batched(range(7), 3)))              # Python 3.12+\n\nheroes = sorted([\"Стрендж\", \"Вонг\", \"Старк\", \"Ванда\", \"Тор\"], key=lambda s: s[0])\nfor letter, group in groupby(heroes, key=lambda s: s[0]):\n    print(letter, list(group))",
      "title": "itertools_more.py",
      "output": "[('A', 1), ('A', 2), ('B', 1), ('B', 2)]\n6\n[('A', 'B'), ('A', 'C'), ('A', 'D'), ('B', 'C'), ('B', 'D'), ('C', 'D')]\n[(1, 4), (4, 9), (9, 16)]\n[(0, 1, 2), (3, 4, 5), (6,)]\nВ ['Вонг', 'Ванда']\nС ['Стрендж', 'Старк']\nТ ['Тор']"
    },
    {
      "type": "warning",
      "title": "groupby групує лише сусідів",
      "md": "`groupby` об'єднує **поспіль розташовані** однакові ключі. Якщо дані не відсортовані, `groupby(\"abab\")` дасть чотири групи замість двох. Спочатку `sorted(data, key=...)` з **тим самим** ключем — потім `groupby`."
    },
    {
      "type": "viz",
      "id": "itertools-lab",
      "title": "Лабораторія itertools",
      "caption": "Обери інструмент і витягуй значення по одному кнопкою `next()` — рівно так, як це робить `for`. Для нескінченних `count` і `cycle` кнопка «Усе» чесно попередить, що кінця не буде."
    },
    {
      "type": "code",
      "code": "heroes = [\"Стрендж\", \"Вонг\", \"Ванда\"]\npowers = [\"час\", \"бойові мистецтва\", \"хаос\"]\n\npairs = zip(heroes, powers)\nprint(iter(pairs) is pairs)          # zip — теж ітератор\n\nfor i, (hero, power) in enumerate(pairs, start=1):\n    print(f\"{i}. {hero} — {power}\")\n\nprint(dict(zip(heroes, powers)))     # новий zip — повні дані",
      "title": "builtin_iterators.py",
      "output": "True\n1. Стрендж — час\n2. Вонг — бойові мистецтва\n3. Ванда — хаос\n{'Стрендж': 'час', 'Вонг': 'бойові мистецтва', 'Ванда': 'хаос'}"
    },
    {
      "type": "tip",
      "title": "Нескінченний генератор + islice = ідеальний «лічильник ID»",
      "md": "`ids = count(1)` і далі `next(ids)` усюди, де потрібен новий унікальний номер. Жодних глобальних змінних з `+= 1`. А `dict.fromkeys`, `sorted`, `set`, `max` приймають будь-який ітератор — тож збирати дані в проміжні списки взагалі рідко треба."
    },
    {
      "type": "joke",
      "md": "Дормамму, я прийшов домовитися. `while True: yield \"домовитися\"`. Твій хід — викликай `next()`. Скільки завгодно разів."
    },
    {
      "type": "quiz",
      "question": "Що виведе `list(islice(cycle(\"XY\"), 3))`?",
      "options": [
        "`['X', 'Y']`",
        "`['X', 'Y', 'X']`",
        "Програма зависне",
        "`['XY', 'XY', 'XY']`"
      ],
      "answer": 1,
      "explain": "`cycle` нескінченно повторює `X, Y, X, Y…`, а `islice(..., 3)` лінива і забирає лише перші три елементи. Зависання не буде, бо зайвого ніхто не обчислює."
    },
    {
      "type": "quiz",
      "question": "Скільки разів виконається `print` у `g = (print(x) for x in range(5)); next(g); next(g)`?",
      "options": [
        "0",
        "2",
        "5",
        "7"
      ],
      "answer": 1,
      "explain": "Генераторний вираз лінивий: `print(x)` виконується лише тоді, коли просять наступний елемент. Два `next()` — два виклики."
    },
    {
      "type": "heading",
      "text": "Шпаргалка"
    },
    {
      "type": "table",
      "head": [
        "Інструмент",
        "Що робить",
        "Приклад"
      ],
      "rows": [
        [
          "`iter(x)`",
          "Отримати ітератор з ітерабельного",
          "`it = iter([1, 2])`"
        ],
        [
          "`next(it, default)`",
          "Наступний елемент або `default`",
          "`next(it, None)`"
        ],
        [
          "`StopIteration`",
          "Сигнал «елементів більше немає»",
          "ловить `for` автоматично"
        ],
        [
          "`__iter__` / `__next__`",
          "Протокол для власних класів",
          "`def __next__(self): ...`"
        ],
        [
          "`yield`",
          "Віддати значення і стати на паузу",
          "`yield n`"
        ],
        [
          "`yield from it`",
          "Віддати всі значення іншого ітератора",
          "`yield from flatten(x)`"
        ],
        [
          "`(… for … in …)`",
          "Генераторний вираз",
          "`sum(x*x for x in data)`"
        ],
        [
          "`gen.send(v)`",
          "Передати значення в генератор",
          "`avg.send(10)`"
        ],
        [
          "`islice(it, a, b)`",
          "«Зріз» будь-якого ітератора",
          "`islice(count(), 5)`"
        ],
        [
          "`chain`, `zip`, `enumerate`",
          "Склеїти / поєднати / пронумерувати",
          "`chain(a, b)`"
        ],
        [
          "`groupby`, `batched`, `pairwise`",
          "Групи, пачки, сусідні пари",
          "`batched(data, 100)`"
        ]
      ]
    },
    {
      "type": "tip",
      "title": "Коли генератор, а коли список",
      "md": "Генератор — коли даних багато або нескінченно, коли проходиш **один раз**, коли будуєш конвеєр обробки. Список — коли потрібні `len()`, індекси, повторні проходи чи сортування на місці. Сумнів? Почни з генератора — перетворити на список можна в один рядок."
    },
    {
      "type": "joke",
      "md": "Ти питаєш, чи виграємо ми? Я переглянув лише перший варіант — `next(future)`. Решту обчислимо, коли знадобиться. Лінь? Ні. **Оптимізація.**"
    }
  ]
};

export default section;
