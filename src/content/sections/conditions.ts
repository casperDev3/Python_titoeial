import type { Section } from "../types";

const section: Section = {
  "slug": "conditions",
  "title": "Умови та розгалуження",
  "short": "if / elif / else / match",
  "icon": "🔀",
  "group": "Основи",
  "summary": "if/elif/else, truthy та falsy значення, тернарний вираз, вкладені умови, структурне зіставлення match/case.",
  "hero": {
    "name": "L та Лайт Ягамі",
    "universe": "Death Note",
    "emoji": "📓",
    "quote": "Якщо ім'я записане — то... elif ні — то нічого не станеться.",
    "why": "Death Note — це чиста логіка умов: кожне правило зошита — окрема гілка if."
  },
  "theme": {
    "accent": "#e5484d",
    "accent2": "#6e56cf",
    "glow": "#b4232a"
  },
  "minutes": 12,
  "order": 5,
  "blocks": [
    // ───────────────────────── 1. if ─────────────────────────
    { type: "heading", text: "Перший if: зошит відкрито" },
    {
      type: "text",
      md: "До цього моменту твої програми виконувалися рядок за рядком, як дисциплінований студент. Але справжня програма має **приймати рішення**: пустити користувача чи ні, показати знижку чи ні, записати ім'я в зошит чи... ну, ти зрозумів.\n\nДля цього є інструкція `if`. Вона перевіряє **умову** — вираз, що дає `True` або `False`. Якщо `True`, виконується вкладений блок коду. Якщо `False` — Python просто перестрибує через нього.\n\nСинтаксис строгий, як правила зошита смерті:\n\n- після умови — обов'язкова **двокрапка** `:`\n- тіло умови — з **відступом** (стандарт — 4 пробіли)\n- тіло закінчується там, де закінчується відступ",
    },
    {
      type: "code",
      title: "if.py",
      code: `power = 97  # відсоток упевненості L

if power > 90:
    print("Я майже впевнений, що ти Кіра.")
    print("Але потрібні докази.")

print("Розслідування триває.")  # виконається завжди`,
      output: "Я майже впевнений, що ти Кіра.\nАле потрібні докази.\nРозслідування триває.",
      highlight: [3],
    },
    {
      type: "text",
      md: "Зверни увагу: останній `print` стоїть **без відступу**, тож він не належить до `if` і виконується за будь-якої умови. У Python відступ — це не прикраса, а частина синтаксису. Саме він показує, де починається і де закінчується блок.",
    },
    {
      type: "warning",
      title: "двокрапка і відступи",
      md: "Забута `:` дає `SyntaxError: expected ':'`, а змішування табів і пробілів — `TabError` або `IndentationError`. Налаштуй редактор вставляти 4 пробіли на Tab — і забудь про цю проблему назавжди.",
    },
    {
      type: "joke",
      md: "Я на 97% впевнений, що ти забув двокрапку після `if`. Решта 3% — що ти поставив там крапку з комою, бо прийшов із JavaScript.",
      hero: "L",
    },

    // ───────────────────────── 2. else / elif ─────────────────────────
    { type: "heading", text: "else та elif: кожне правило — окрема гілка" },
    {
      type: "text",
      md: "`else` — це «інакше»: блок, що виконується, коли умова `if` хибна. А якщо варіантів більше двох, на допомогу приходить `elif` (скорочення від *else if*).\n\nГоловне правило ланцюжка `if / elif / else`: Python перевіряє умови **згори вниз** і виконує **лише першу** гілку, умова якої істинна. Щойно знайшов — решту навіть не читає. `else` спрацьовує, тільки якщо жодна умова не підійшла.",
    },
    {
      type: "code",
      title: "grade.py",
      code: `score = 78

if score >= 90:
    grade = "A"
elif score >= 75:
    grade = "B"
elif score >= 60:
    grade = "C"
else:
    grade = "F"

print(f"Бали: {score} → оцінка {grade}")`,
      output: "Бали: 78 → оцінка B",
      highlight: [5, 6],
    },
    {
      type: "viz",
      id: "branch-flow",
      title: "Як Python обирає гілку",
      caption: "Рухай повзунок балів і тисни «Крок»: умови перевіряються згори вниз, і щойно одна дає `True` — решта **пропускаються**. Навіть якщо вони теж були б істинними.",
    },
    {
      type: "warning",
      title: "порядок elif має значення",
      md: "Якщо поставити ширшу умову першою (`score >= 60` перед `score >= 90`), то відмінник отримає «C»: перша ж істинна гілка перехоплює виконання. Завжди йди від **найвужчої** умови до найширшої.",
    },
    {
      type: "compare",
      title: "Окремі if проти ланцюжка elif",
      bad: {
        label: "Три незалежні if — перевіряються всі",
        code: `temp = 35

if temp > 30:
    print("Спекотно")
if temp > 20:
    print("Тепло")      # теж надрукується!
if temp > 10:
    print("Прохолодно") # і це теж!`,
      },
      good: {
        label: "Один ланцюжок — спрацює одна гілка",
        code: `temp = 35

if temp > 30:
    print("Спекотно")
elif temp > 20:
    print("Тепло")
elif temp > 10:
    print("Прохолодно")`,
      },
      note: "Окремі `if` — це окремі питання, кожне перевіряється. `elif` — це варіанти **однієї** відповіді: взаємовиключні гілки.",
    },
    {
      type: "quiz",
      question: "`x = 15`. Що надрукує ланцюжок `if x > 5: print(\"A\")` → `elif x > 10: print(\"B\")` → `else: print(\"C\")`?",
      options: ["A", "B", "A і B", "C"],
      answer: 0,
      explain: "`x > 5` вже істинне, тож спрацьовує перша гілка, а `elif x > 10` навіть не перевіряється — хоча вона теж була б `True`.",
    },

    // ───────────────────────── 3. логіка ─────────────────────────
    { type: "heading", text: "Порівняння і логіка в умовах" },
    {
      type: "text",
      md: "Умова — це будь-який вираз. Найчастіше це порівняння (`==`, `!=`, `<`, `>`, `<=`, `>=`), перевірка належності (`in`, `not in`) і їх комбінації через `and`, `or`, `not`.\n\nPython вміє те, чого не вміє більшість мов, — **ланцюжки порівнянь**: `0 < x < 10` читається рівно так, як у математиці, і означає `0 < x and x < 10`.",
    },
    {
      type: "code",
      title: "logic.py",
      code: `age = 17
has_ticket = True
name = "Light"

if 13 <= age < 18:
    print("Підліток")

if has_ticket and age >= 16:
    print("Можна на сеанс")

if name in ("L", "Light", "Near"):
    print("Геній у кадрі")

if not (age > 60 or name == "Ryuk"):
    print("Ні пенсіонер, ні шинігамі")`,
      output: "Підліток\nМожна на сеанс\nГеній у кадрі\nНі пенсіонер, ні шинігамі",
    },
    {
      type: "text",
      md: "`and` та `or` у Python — **ліниві** (short-circuit). `and` зупиняється на першому хибному значенні, `or` — на першому істинному. І вони повертають не обов'язково `True`/`False`, а **саме те значення**, на якому зупинились. Подивись, як це працює:",
    },
    {
      type: "viz",
      id: "short-circuit",
      title: "Ліниве обчислення and / or",
      caption: "Обери оператор і значення операндів. Сірі операнди Python **навіть не обчислює** — а результатом стає останнє обчислене значення, а не обов'язково `True`/`False`.",
    },
    {
      type: "code",
      title: "short_circuit.py",
      code: `def check(label, value):
    print(f"  перевіряю {label}")
    return value

print("and:")
result = check("A", 0) and check("B", 5)
print("  результат:", result)

print("or:")
result = check("A", "") or check("B", "Кіра") or check("C", 42)
print("  результат:", result)`,
      output: "and:\n  перевіряю A\n  результат: 0\nor:\n  перевіряю A\n  перевіряю B\n  результат: Кіра",
    },
    {
      type: "tip",
      title: "безпечна перевірка через and",
      md: "Лінивість `and` — це захист: `if user and user.is_admin:` ніколи не впаде з `AttributeError`, бо якщо `user` — це `None`, друга частина не обчислюється. Так само `if items and items[0] == \"x\":` не дасть `IndexError` на порожньому списку.",
    },
    {
      type: "warning",
      title: "if x == 1 or 2",
      md: "Класична пастка: `if color == \"red\" or \"blue\":` — **завжди** `True`! Python читає це як `(color == \"red\") or \"blue\"`, а непорожній рядок `\"blue\"` — істинний. Правильно: `if color in (\"red\", \"blue\"):`.",
    },
    {
      type: "compare",
      title: "Багато варіантів одного значення",
      bad: {
        label: "Довго і легко помилитися",
        code: `if day == "sat" or day == "sun" or day == "holiday":
    rest()`,
      },
      good: {
        label: "Коротко і читабельно",
        code: `if day in {"sat", "sun", "holiday"}:
    rest()`,
      },
      note: "Для перевірки належності множина `{...}` ще й шукає за O(1), хоча на трьох елементах різниці не відчуєш — головне тут читабельність.",
    },

    // ───────────────────────── 4. truthy / falsy ─────────────────────────
    { type: "heading", text: "Truthy і falsy: що Python вважає правдою" },
    {
      type: "text",
      md: "В `if` можна підставити **будь-яке** значення, не лише `True`/`False`. Python сам викличе `bool()` і вирішить. Правило просте: *порожнє і нульове — хибне, все інше — істинне*.\n\nФальшивих значень (falsy) небагато, їх варто знати напам'ять:",
    },
    {
      type: "table",
      head: ["Тип", "Falsy (хибне)", "Приклад truthy"],
      rows: [
        ["`NoneType`", "`None`", "—"],
        ["`bool`", "`False`", "`True`"],
        ["числа", "`0`, `0.0`, `0j`", "`-1`, `0.001`"],
        ["рядок", "`\"\"`", "`\" \"`, `\"0\"`, `\"False\"`"],
        ["колекції", "`[]`, `()`, `{}`, `set()`, `range(0)`", "`[0]`, `[[]]`, `{\"a\": 0}`"],
      ],
    },
    {
      type: "viz",
      id: "truthy-sorter",
      title: "Сортувальник правди",
      caption: "Вгадай, куди потрапить значення: у **truthy** чи **falsy**. Підступні `\"0\"`, `\" \"` і `[0]` — справжні тести на уважність, як допити L.",
    },
    {
      type: "code",
      title: "truthy.py",
      code: `values = [0, 42, "", "0", " ", [], [0], None, {}, 0.0]

for v in values:
    print(f"{v!r:>6} → {bool(v)}")`,
      output: "     0 → False\n    42 → True\n    '' → False\n   '0' → True\n   ' ' → True\n    [] → False\n   [0] → True\n  None → False\n    {} → False\n   0.0 → False",
    },
    {
      type: "compare",
      title: "Перевірка на порожнечу",
      bad: {
        label: "Зайва робота",
        code: `if len(suspects) > 0:
    investigate(suspects)

if name != "":
    greet(name)

if is_kira == True:
    arrest()`,
      },
      good: {
        label: "Pythonic",
        code: `if suspects:
    investigate(suspects)

if name:
    greet(name)

if is_kira:
    arrest()`,
      },
      note: "PEP 8 прямо рекомендує покладатися на truthiness колекцій і ніколи не порівнювати з `True` через `==`.",
    },
    {
      type: "warning",
      title: "0 — теж falsy",
      md: "`if not count:` спрацює і коли `count is None` (даних нема), і коли `count == 0` (даних рівно нуль). Якщо тобі важлива різниця — перевіряй явно: `if count is None:`. Для `None` завжди використовуй `is`, а не `==`.",
    },
    {
      type: "code",
      title: "none_vs_zero.py",
      code: `def report(kills):
    if kills is None:
        return "дані засекречені"
    if not kills:
        return "чистий, як сніг"
    return f"підозрілих смертей: {kills}"

print(report(None))
print(report(0))
print(report(12))`,
      output: "дані засекречені\nчистий, як сніг\nпідозрілих смертей: 12",
    },
    {
      type: "quiz",
      question: "Яке з цих значень **truthy**?",
      options: ["`0.0`", "`\"\"`", "`[None]`", "`set()`"],
      answer: 2,
      explain: "`[None]` — це список з одним елементом. Не важливо, що всередині `None`: непорожня колекція завжди істинна.",
    },
    {
      type: "joke",
      md: "Шинігамі не можуть їсти яблука в людському світі без Лайта. Тож для мене `if apples:` — найважливіша умова у всесвіті. Порожній кошик — `False`, а це вже трагедія.",
      hero: "Рюк",
    },

    // ───────────────────────── 5. тернарний ─────────────────────────
    { type: "heading", text: "Тернарний вираз: if в один рядок" },
    {
      type: "text",
      md: "Коли треба просто **обрати одне з двох значень**, чотири рядки `if/else` — забагато. Для цього є умовний (тернарний) вираз:\n\n`значення_якщо_так if умова else значення_якщо_ні`\n\nПорядок незвичний: спершу «що хочемо», потім умова. Читай як англійське речення: *«take this **if** condition, **else** that»*.",
    },
    {
      type: "code",
      title: "ternary.py",
      code: `hp = 30

status = "живий" if hp > 0 else "переможений"
print(status)

label = "критично" if hp < 50 else "норм"
print(f"HP {hp}: {label}")

# працює всередині будь-якого виразу
print(f"У тебе {hp} {'очко' if hp == 1 else 'очок'} здоров'я")`,
      output: "живий\nHP 30: критично\nУ тебе 30 очок здоров'я",
    },
    {
      type: "viz",
      id: "ternary-rails",
      title: "Тернарна стрілка (3D)",
      caption: "Перемикай умову — стрілка переводить колію, і куля-значення котиться до `a` або до `b`. Обчислюється лише **одна** з гілок, друга навіть не чіпається.",
    },
    {
      type: "tip",
      title: "мін/макс без if",
      md: "Замість `x if x > y else y` пиши `max(x, y)`. А щоб «затиснути» число в межах: `hp = max(0, min(hp, 100))` — ніяких `if` і гарантовано `0 ≤ hp ≤ 100`.",
    },
    {
      type: "warning",
      title: "вкладені тернарні вирази",
      md: "`a if x else b if y else c` технічно працює, але читати це — як розшифровувати послання Кіри. Якщо варіантів більше двох — повертайся до звичайного `if/elif/else` або словника.",
    },

    // ───────────────────────── 6. вкладені ─────────────────────────
    { type: "heading", text: "Вкладені умови та guard clauses" },
    {
      type: "text",
      md: "`if` можна класти всередину іншого `if` — тоді внутрішня перевірка відбувається, лише коли зовнішня пройшла. Виходить **дерево рішень**: кожен вузол — питання, кожне ребро — відповідь.\n\nАле обережно: три-чотири рівні вкладеності — і код перетворюється на «стрілу», яка тікає за правий край екрана.",
    },
    {
      type: "code",
      title: "nested.py",
      code: `def can_write(has_notebook, knows_face, knows_name):
    if has_notebook:
        if knows_face:
            if knows_name:
                return "✍️  ім'я записано"
            else:
                return "потрібне ім'я"
        else:
            return "потрібне обличчя"
    else:
        return "немає зошита"

print(can_write(True, True, True))
print(can_write(True, True, False))
print(can_write(False, True, True))`,
      output: "✍️  ім'я записано\nпотрібне ім'я\nнемає зошита",
    },
    {
      type: "viz",
      id: "decision-tree",
      title: "Дерево рішень зошита (3D)",
      caption: "Перемикай умови — світна куля спускається деревом по гілках `True` / `False`. Натисни на вузол, щоб побачити його умову. Кожен рівень глибини — ще один відступ у коді.",
    },
    {
      type: "compare",
      title: "Стріла вкладеності проти раннього виходу",
      bad: {
        label: "Піраміда відступів",
        code: `def can_write(has_notebook, knows_face, knows_name):
    if has_notebook:
        if knows_face:
            if knows_name:
                return "записано"
            else:
                return "потрібне ім'я"
        else:
            return "потрібне обличчя"
    else:
        return "немає зошита"`,
      },
      good: {
        label: "Guard clauses — ранній return",
        code: `def can_write(has_notebook, knows_face, knows_name):
    if not has_notebook:
        return "немає зошита"
    if not knows_face:
        return "потрібне обличчя"
    if not knows_name:
        return "потрібне ім'я"
    return "записано"`,
      },
      note: "Спершу відсікаємо всі «погані» випадки і виходимо. Основна логіка лишається в кінці — без жодного зайвого відступу.",
    },
    {
      type: "tip",
      title: "зливай умови через and",
      md: "Два вкладені `if` без `else` — це один `if` з `and`: замість `if a:` → `if b:` пиши `if a and b:`. Мінус рівень вкладеності, плюс читабельність.",
    },

    // ───────────────────────── 7. match ─────────────────────────
    { type: "heading", text: "match / case: структурне зіставлення" },
    {
      type: "text",
      md: "З Python 3.10 є `match` — не просто `switch` з інших мов, а **структурне зіставлення зі зразком** (pattern matching). Воно вміє:\n\n- порівнювати з літералами: `case 404:`\n- об'єднувати варіанти: `case \"y\" | \"yes\":`\n- **розпаковувати** структуру і захоплювати частини в змінні: `case (\"move\", x, y):`\n- перевіряти словники, класи, додаткові умови (`if` guard)\n- ловити все інше: `case _:`\n\nЯк і `elif`, кейси перевіряються згори вниз, і виконується **перший** збіг.",
    },
    {
      type: "code",
      title: "match_basic.py",
      code: `def http_status(code):
    match code:
        case 200:
            return "OK"
        case 301 | 302:
            return "Редирект"
        case 404:
            return "Не знайдено"
        case _:
            return "Щось інше"

for c in (200, 302, 404, 500):
    print(c, http_status(c))`,
      output: "200 OK\n302 Редирект\n404 Не знайдено\n500 Щось інше",
    },
    {
      type: "code",
      title: "match_structure.py",
      code: `def run(command):
    match command.split():
        case ["quit"]:
            return "вихід"
        case ["go", direction]:
            return f"іду на {direction}"
        case ["write", name, *rest]:
            return f"записую {name}, деталі: {rest}"
        case []:
            return "порожня команда"
        case _:
            return "невідома команда"

print(run("quit"))
print(run("go north"))
print(run("write Lind heart attack"))
print(run(""))
print(run("dance now please"))`,
      output: "вихід\nіду на north\nзаписую Lind, деталі: ['heart', 'attack']\nпорожня команда\nневідома команда",
      highlight: [5, 7],
    },
    {
      type: "viz",
      id: "match-machine",
      title: "Машина зіставлення",
      caption: "Обери значення-суб'єкт і дивись, як Python прикладає його до кожного `case` по черзі. Зелений — збіг, і змінні зі зразка **захоплюють** відповідні частини.",
    },
    {
      type: "code",
      title: "match_dict_guard.py",
      code: `def handle(event):
    match event:
        case {"type": "click", "x": x, "y": y} if x < 0 or y < 0:
            return "клік поза екраном"
        case {"type": "click", "x": x, "y": y}:
            return f"клік у ({x}, {y})"
        case {"type": "key", "key": "q" | "Q"}:
            return "вихід"
        case {"type": "key", "key": k}:
            return f"натиснуто {k}"
        case _:
            return "ігнорую"

print(handle({"type": "click", "x": 10, "y": 20}))
print(handle({"type": "click", "x": -5, "y": 3}))
print(handle({"type": "key", "key": "Q"}))
print(handle({"type": "key", "key": "a", "shift": True}))
print(handle({"type": "scroll"}))`,
      output: "клік у (10, 20)\nклік поза екраном\nвихід\nнатиснуто a\nігнорую",
    },
    {
      type: "text",
      md: "Зверни увагу: зразок-словник вимагає лише **наявності** вказаних ключів — зайві ключі (як `\"shift\"`) не заважають. А зразок-список, навпаки, вимагає **точної довжини**, якщо немає `*rest`.",
    },
    {
      type: "warning",
      title: "голе ім'я в case — це захоплення, а не порівняння",
      md: "`case RED:` **не** порівнює з константою `RED` — воно захоплює будь-яке значення у нову змінну `RED` і спрацьовує завжди! Python навіть видасть `SyntaxError: name capture 'RED' makes remaining patterns unreachable`, якщо після нього є інші кейси. Для констант використовуй крапку: `case Color.RED:` або літерали.",
    },
    {
      type: "code",
      title: "match_class.py",
      code: `from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

def where(p):
    match p:
        case Point(x=0, y=0):
            return "центр"
        case Point(x=0, y=y):
            return f"на осі Y, y={y}"
        case Point(x=x, y=0):
            return f"на осі X, x={x}"
        case Point(x=x, y=y) if x == y:
            return f"на діагоналі, {x}"
        case Point():
            return "десь у площині"

for p in [Point(0, 0), Point(0, 7), Point(3, 0), Point(4, 4), Point(1, 9)]:
    print(where(p))`,
      output: "центр\nна осі Y, y=7\nна осі X, x=3\nна діагоналі, 4\nдесь у площині",
    },
    {
      type: "quiz",
      question: "Що поверне `match [1, 2, 3]:` з кейсами `case [x, y]:`, `case [x, *rest]:`, `case _:` (у такому порядку)?",
      options: ["Спрацює `case [x, y]` з x=1, y=2", "Спрацює `case [x, *rest]` з x=1, rest=[2, 3]", "Спрацює `case _`", "SyntaxError"],
      answer: 1,
      explain: "Зразок `[x, y]` вимагає рівно два елементи, а їх три — не збіг. `[x, *rest]` бере перший у `x`, решту — списком у `rest`.",
    },
    {
      type: "joke",
      md: "Я перевіряю кожного підозрюваного по черзі: `case Light():`... збіг. Жаль, що Python не дозволяє `case _:` для «всіх, хто мене бісить».",
      hero: "L",
    },

    // ───────────────────────── 8. лайфхаки ─────────────────────────
    { type: "heading", text: "Професійні трюки: any, all, словники, :=" },
    {
      type: "text",
      md: "Коли умов стає багато, досвідчені пайтоністи замінюють ланцюжки `if` на більш виразні інструменти.",
    },
    {
      type: "code",
      title: "any_all.py",
      code: `names = ["Light", "Misa", "Ryuk"]
notebook = ["Lind", "Raye", "Naomi"]

print(any(n in notebook for n in names))   # хоч один?
print(all(len(n) >= 4 for n in names))    # усі?

scores = [88, 92, 79]
if all(s >= 75 for s in scores):
    print("Стипендія!")`,
      output: "False\nTrue\nСтипендія!",
    },
    {
      type: "tip",
      title: "any/all ліниві",
      md: "`any()` зупиняється на першому `True`, а `all()` — на першому `False`, як і `or`/`and`. З генераторним виразом усередині перевірка мільйонного списку може закінчитися на першому ж елементі.",
    },
    {
      type: "code",
      title: "dispatch.py",
      code: `# замість довгого if/elif — словник
prices = {"apple": 3, "banana": 2, "cherry": 5}

fruit = "banana"
print(prices.get(fruit, "немає в наявності"))
print(prices.get("durian", "немає в наявності"))

# словник функцій — диспетчер команд
actions = {
    "add": lambda a, b: a + b,
    "mul": lambda a, b: a * b,
}
op = "mul"
print(actions[op](6, 7))`,
      output: "2\nнемає в наявності\n42",
    },
    {
      type: "code",
      title: "walrus.py",
      code: `data = {"name": "Light", "rank": "A"}

# := присвоює і одразу повертає значення
if (rank := data.get("rank")) is not None:
    print(f"Ранг знайдено: {rank}")

if (n := len(data)) > 1:
    print(f"У досьє {n} поля")`,
      output: "Ранг знайдено: A\nУ досьє 2 поля",
    },
    {
      type: "tip",
      title: "моржевий оператор :=",
      md: "`:=` (walrus operator, Python 3.8+) рятує від подвійного обчислення: спершу обчислив і зберіг, тут же порівняв. Обов'язково бери в дужки: `(x := f()) > 0`, бо без дужок `x := f() > 0` збереже в `x` результат порівняння.",
    },
    {
      type: "tip",
      title: "умова з input()",
      md: "`input()` завжди повертає **рядок**. `if input() == 5:` ніколи не спрацює — порівнюй з `\"5\"` або перетвори: `int(input())`. А для відповідей «так/ні» нормалізуй регістр: `if answer.strip().lower() in {\"y\", \"yes\", \"так\"}:`.",
    },
    {
      type: "code",
      title: "input_check.py",
      code: `answer = input("Ти Кіра? (так/ні): ")

if answer.strip().lower() in {"так", "т", "yes", "y"}:
    print("Я знав! Руки за голову.")
elif answer.strip().lower() in {"ні", "н", "no", "n"}:
    print("Підозрілість зросла на 5%.")
else:
    print("Ухильна відповідь. Ще підозріліше.")`,
      runnable: false,
    },
    {
      type: "quiz",
      question: "Що буде в `x` після `x = 5 > 3 and \"так\" or \"ні\"`?",
      options: ["`True`", "`\"так\"`", "`\"ні\"`", "`5`"],
      answer: 1,
      explain: "`5 > 3` — `True`, тож `and` повертає правий операнд `\"так\"`. Далі `\"так\" or \"ні\"` зупиняється на truthy `\"так\"`. Це старий трюк до появи тернарного виразу — сьогодні пиши `\"так\" if 5 > 3 else \"ні\"`.",
    },
    {
      type: "joke",
      md: "Мій план ідеальний: `if L.suspects(me): act_normal() else: act_normal()`. Коли обидві гілки однакові — ніхто нічого не доведе.",
      hero: "Лайт Ягамі",
    },

    // ───────────────────────── 9. шпаргалка ─────────────────────────
    { type: "heading", text: "Шпаргалка" },
    {
      type: "table",
      head: ["Конструкція", "Приклад", "Коли використовувати"],
      rows: [
        ["`if / elif / else`", "`if x > 0: ... elif x == 0: ... else: ...`", "Кілька взаємовиключних гілок"],
        ["Ланцюжок порівнянь", "`0 <= x < 10`", "Перевірка діапазону"],
        ["`in` / `not in`", "`if day in {\"sat\", \"sun\"}:`", "Одне з кількох значень"],
        ["Truthiness", "`if items:` / `if not name:`", "Перевірка на порожнечу"],
        ["`is None`", "`if value is None:`", "Відрізнити «немає» від `0` / `\"\"`"],
        ["Тернарний", "`a if cond else b`", "Вибір одного з двох значень"],
        ["Guard clause", "`if not ok: return`", "Позбутися вкладеності"],
        ["`match / case`", "`case [\"go\", d]:`", "Розбір структури даних"],
        ["`any` / `all`", "`all(s > 0 for s in xs)`", "Умова над колекцією"],
        ["`dict.get`", "`prices.get(k, 0)`", "Замість ланцюжка `elif` по ключу"],
      ],
    },
  ],
};

export default section;
