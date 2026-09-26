import type { Section } from "../types";

const section: Section = {
  "slug": "loops",
  "title": "Цикли",
  "short": "for, while, range, break",
  "icon": "🔁",
  "group": "Основи",
  "summary": "for та while, range, break/continue/else у циклах, enumerate і zip, вкладені цикли, нескінченні цикли та як їх уникати.",
  "hero": {
    "name": "Субару Нацукі",
    "universe": "Re:Zero",
    "emoji": "⏳",
    "quote": "Повернення через смерть — це просто while True з break у кінці.",
    "why": "Субару знову і знову переживає ті самі події, доки не знайде вихід — живий цикл з умовою виходу."
  },
  "theme": {
    "accent": "#9b5cff",
    "accent2": "#3dd6d0",
    "glow": "#7c3aed"
  },
  "minutes": 14,
  "order": 6,
  "blocks": [
    // ───────────────────────── 1. навіщо ─────────────────────────
    { type: "heading", text: "Навіщо цикли: повторення без копіпасту" },
    {
      type: "text",
      md: "Уяви, що треба привітати 1000 користувачів. Написати `print` тисячу разів? Субару теж міг би проживати кожен день вручну... але в нього є **Повернення через смерть** — механізм, що повторює один і той самий відрізок часу, доки не буде виконано умову виходу.\n\nУ програмуванні це називається **цикл**. У Python їх два:\n\n- `for` — «для кожного елемента з колекції зроби...». Кількість повторів відома наперед.\n- `while` — «поки умова істинна, повторюй...». Кількість повторів заздалегідь невідома.\n\nОдин прохід тіла циклу називається **ітерацією**.",
    },
    {
      type: "compare",
      title: "Копіпаст проти циклу",
      bad: {
        label: "Повторюємо вручну",
        code: `print("Спроба 1: Субару прокидається у крамниці")
print("Спроба 2: Субару прокидається у крамниці")
print("Спроба 3: Субару прокидається у крамниці")
print("Спроба 4: Субару прокидається у крамниці")`,
      },
      good: {
        label: "Цикл робить це за нас",
        code: `for attempt in range(1, 5):
    print(f"Спроба {attempt}: Субару прокидається у крамниці")`,
      },
      note: "Треба 400 спроб замість 4? У циклі міняєш одне число. Це і є принцип **DRY** — Don't Repeat Yourself.",
    },

    // ───────────────────────── 2. for ─────────────────────────
    { type: "heading", text: "for: пройти по будь-чому" },
    {
      type: "text",
      md: "`for` у Python — це не «лічильник від 0 до N», як у C чи Java. Це **перебір елементів** будь-якого *ітерованого* об'єкта: списку, рядка, кортежу, словника, множини, файлу, `range`...\n\nНа кожній ітерації змінна циклу отримує наступний елемент, і виконується тіло з відступом. Коли елементи закінчились — цикл завершується сам.",
    },
    {
      type: "code",
      title: "for_list.py",
      code: `heroes = ["Субару", "Емілія", "Рем", "Беатріс"]
total = 0

for name in heroes:
    total += len(name)
    print(name, total)

print("Всього літер:", total)`,
      output: "Субару 6\nЕмілія 12\nРем 15\nБеатріс 22\nВсього літер: 22",
      highlight: [4],
    },
    {
      type: "flow",
      title: "Що насправді робить for",
      nodes: [
        { id: "s", kind: "start", label: "Старт", col: 0, row: 0 },
        { id: "init", kind: "process", label: "total = 0", col: 0, row: 1 },
        { id: "it", kind: "process", label: "it = iter(heroes)", col: 0, row: 2 },
        { id: "dec", kind: "decision", label: "next(it) дав\nелемент?", col: 0, row: 3 },
        { id: "take", kind: "process", label: "name = елемент", col: 0, row: 4 },
        { id: "body", kind: "process", label: "total += len(name)", col: 0, row: 5 },
        { id: "out", kind: "io", label: "print(name, total)", col: 0, row: 6 },
        { id: "fin", kind: "io", label: "print(\"Всього літер:\",\ntotal)", col: 1, row: 7 },
        { id: "e", kind: "end", label: "Кінець", col: 1, row: 8 },
      ],
      edges: [
        { from: "s", to: "init" },
        { from: "init", to: "it" },
        { from: "it", to: "dec" },
        { from: "dec", to: "take", label: "так" },
        { from: "dec", to: "fin", label: "StopIteration", side: "right" },
        { from: "take", to: "body" },
        { from: "body", to: "out" },
        { from: "out", to: "dec", side: "left" },
        { from: "fin", to: "e" },
      ],
      scenarios: [
        {
          name: "heroes — 4 імені",
          steps: [
            { node: "s" },
            { node: "init", note: "`total = 0`" },
            { node: "it", note: "`for` просить у списку ітератор — «вказівник» перед першим елементом" },
            { node: "dec", note: "`next(it)` → `\"Субару\"` (елемент [0])" },
            { node: "take", note: "`name = \"Субару\"`" },
            { node: "body", note: "`len(\"Субару\")` = 6 → `total = 6`" },
            { node: "out", note: "вивід: `Субару 6` — і назад до заголовка циклу" },
            { node: "dec", note: "`next(it)` → `\"Емілія\"` (елемент [1])" },
            { node: "take", note: "`name = \"Емілія\"`" },
            { node: "body", note: "`len(\"Емілія\")` = 6 → `total = 12`" },
            { node: "out", note: "вивід: `Емілія 12` — і назад до заголовка циклу" },
            { node: "dec", note: "`next(it)` → `\"Рем\"` (елемент [2])" },
            { node: "take", note: "`name = \"Рем\"`" },
            { node: "body", note: "`len(\"Рем\")` = 3 → `total = 15`" },
            { node: "out", note: "вивід: `Рем 15` — і назад до заголовка циклу" },
            { node: "dec", note: "`next(it)` → `\"Беатріс\"` (елемент [3])" },
            { node: "take", note: "`name = \"Беатріс\"`" },
            { node: "body", note: "`len(\"Беатріс\")` = 7 → `total = 22`" },
            { node: "out", note: "вивід: `Беатріс 22` — і назад до заголовка циклу" },
            { node: "dec", note: "`next(it)` кидає `StopIteration` — елементів більше немає, `for` тихо виходить" },
            { node: "fin", note: "вивід: `Всього літер: 22`" },
            { node: "e" },
          ],
        },
        {
          name: "heroes = []",
          steps: [
            { node: "s" },
            { node: "init", note: "`total = 0`" },
            { node: "it", note: "`heroes = []` — ітератор по порожньому списку" },
            { node: "dec", note: "перший же `next(it)` → `StopIteration`: тіло не виконається жодного разу" },
            { node: "fin", note: "вивід: `Всього літер: 0`" },
            { node: "e" },
          ],
        },
      ],
      caption: "Під капотом `for` викликає `iter()` один раз і `next()` на кожному колі. Коли `next()` кидає `StopIteration`, цикл перехоплює його сам — тому ти ніколи не бачиш цієї помилки.",
    },
    {
      type: "viz",
      id: "for-stepper",
      title: "Покрокове виконання for",
      caption: "Тисни «Крок» і стеж, як **вказівник** рухається списком, змінна `name` отримує черговий елемент, а `total` накопичує суму. Коли елементи закінчуються — цикл виходить сам.",
    },
    {
      type: "code",
      title: "for_anything.py",
      code: `# рядок — це послідовність символів
for ch in "Rem":
    print(ch, end="-")
print("!")

# словник перебирається по ключах
stats = {"сила": 3, "удача": 1, "розум": 7}
for key in stats:
    print(key, end=" | ")
print("кінець")

# а .items() дає пари (ключ, значення)
for key, value in stats.items():
    print(f"{key}={value}", end="; ")
print("✓")`,
      output: "R-e-m-!\nсила | удача | розум | кінець\nсила=3; удача=1; розум=7; ✓",
    },
    {
      type: "tip",
      title: "розпаковка прямо в заголовку",
      md: "Якщо елементи — пари чи кортежі, розпаковуй одразу: `for name, age in people:` замість `for p in people: name = p[0]...`. Працює з будь-якою вкладеністю: `for i, (x, y) in enumerate(points):`.",
    },
    {
      type: "joke",
      md: "Мене вже вбили сорок разів, але я не здаюсь — я ж не `for`, у якого закінчуються елементи. Я — `while not happy_ending:`!",
    },

    // ───────────────────────── 3. range ─────────────────────────
    { type: "heading", text: "range(): фабрика чисел" },
    {
      type: "text",
      md: "Коли треба просто повторити щось N разів або пройти числами, використовуй `range`. Він має три форми:\n\n- `range(stop)` — від 0 до `stop - 1`\n- `range(start, stop)` — від `start` до `stop - 1`\n- `range(start, stop, step)` — з кроком `step` (може бути від'ємним)\n\nКлючове правило: **`stop` ніколи не входить** у результат. Як і в зрізах, інтервал напіввідкритий: `[start, stop)`.\n\n`range` не створює список у пам'яті — він генерує числа «на льоту», тому `range(10**12)` займає кілька десятків байтів.",
    },
    {
      type: "code",
      title: "range.py",
      code: `print(list(range(5)))
print(list(range(2, 8)))
print(list(range(0, 20, 5)))
print(list(range(10, 0, -3)))
print(list(range(5, 2)))      # порожньо: йти вгору від 5 до 2 не вийде

r = range(0, 100, 7)
print(len(r), r[3], 49 in r)`,
      output: "[0, 1, 2, 3, 4]\n[2, 3, 4, 5, 6, 7]\n[0, 5, 10, 15]\n[10, 7, 4, 1]\n[]\n15 21 True",
    },
    {
      type: "viz",
      id: "range-ruler",
      title: "Лінійка range(start, stop, step)",
      caption: "Рухай повзунки. Кружечок на `stop` — **порожній**: це межа, якої `range` не досягає. Спробуй від'ємний крок або `step = 0`.",
    },
    {
      type: "warning",
      title: "помилка на одиницю",
      md: "Найчастіший баг з `range` — off-by-one. Хочеш числа від 1 до 10 включно? Це `range(1, 11)`, а не `range(1, 10)`. Пам'ятай: `len(range(a, b)) == b - a`.",
    },
    {
      type: "quiz",
      question: "Скільки разів виконається тіло `for i in range(3, 15, 4):`?",
      options: ["3", "4", "12", "5"],
      answer: 0,
      explain: "Значення: 3, 7, 11. Наступне було б 15 — але `stop` не входить. Отже три ітерації.",
    },
    {
      type: "tip",
      title: "змінна _",
      md: "Коли номер ітерації не потрібен, назви змінну `_`: `for _ in range(3): print(\"Ще раз!\")`. Це конвенція, яка каже читачу: «значення навмисно ігнорується».",
    },

    // ───────────────────────── 4. while ─────────────────────────
    { type: "heading", text: "while: поки умова істинна" },
    {
      type: "text",
      md: "`while` перевіряє умову **перед кожною ітерацією**. Якщо `True` — виконує тіло і повертається до перевірки. Якщо `False` — виходить. Якщо умова хибна з самого початку, тіло не виконається жодного разу.\n\nГоловне правило `while`: щось у тілі **має змінювати** стан, від якого залежить умова. Інакше цикл ніколи не закінчиться.",
    },
    {
      type: "code",
      title: "while_countdown.py",
      code: `mana = 10

while mana > 0:
    print(f"Шамак! мана = {mana}")
    mana -= 4          # змінюємо стан — наближаємось до виходу

print(f"Мана скінчилась ({mana}). Субару непритомніє.")`,
      output: "Шамак! мана = 10\nШамак! мана = 6\nШамак! мана = 2\nМана скінчилась (-2). Субару непритомніє.",
      highlight: [5],
    },
    {
      type: "flow",
      title: "while: перевірка перед кожним колом",
      nodes: [
        { id: "s", kind: "start", label: "Старт", col: 0, row: 0 },
        { id: "init", kind: "process", label: "mana = 10  # або 0", col: 0, row: 1 },
        { id: "cond", kind: "decision", label: "mana > 0 ?", col: 0, row: 2 },
        { id: "out", kind: "io", label: "print(f\"Шамак!\nмана = {mana}\")", col: 0, row: 3 },
        { id: "dec", kind: "process", label: "mana -= 4", col: 0, row: 4 },
        { id: "fin", kind: "io", label: "print(f\"Мана\nскінчилась ({mana})\")", col: 1, row: 5 },
        { id: "e", kind: "end", label: "Кінець", col: 1, row: 6 },
      ],
      edges: [
        { from: "s", to: "init" },
        { from: "init", to: "cond" },
        { from: "cond", to: "out", label: "True" },
        { from: "cond", to: "fin", label: "False", side: "right" },
        { from: "out", to: "dec" },
        { from: "dec", to: "cond", side: "left" },
        { from: "fin", to: "e" },
      ],
      scenarios: [
        {
          name: "mana = 10",
          steps: [
            { node: "s" },
            { node: "init", note: "`mana = 10`" },
            { node: "cond", note: "`10 > 0` → **True**" },
            { node: "out", note: "вивід: `Шамак! мана = 10`" },
            { node: "dec", note: "`mana = 6` — стан змінився, повертаємось до умови" },
            { node: "cond", note: "`6 > 0` → **True**" },
            { node: "out", note: "вивід: `Шамак! мана = 6`" },
            { node: "dec", note: "`mana = 2` — стан змінився, повертаємось до умови" },
            { node: "cond", note: "`2 > 0` → **True**" },
            { node: "out", note: "вивід: `Шамак! мана = 2`" },
            { node: "dec", note: "`mana = -2` — стан змінився, повертаємось до умови" },
            { node: "cond", note: "`-2 > 0` → **False** — вихід з циклу" },
            { node: "fin", note: "вивід: `Мана скінчилась (-2). Субару непритомніє.`" },
            { node: "e" },
          ],
        },
        {
          name: "mana = 0",
          steps: [
            { node: "s" },
            { node: "init", note: "`mana = 0`" },
            { node: "cond", note: "`0 > 0` → **False** одразу — тіло не виконається жодного разу" },
            { node: "fin", note: "вивід: `Мана скінчилась (0). Субару непритомніє.`" },
            { node: "e" },
          ],
        },
      ],
      caption: "Стрілка вгору — це повернення до **умови**, а не до початку програми. Рядок `mana -= 4` — єдине, що наближає умову до `False`: прибери його, і петля стане нескінченною.",
    },
    {
      type: "code",
      title: "while_unknown.py",
      code: `# скільки разів треба подвоїти, щоб перевищити 1000?
value = 1
steps = 0
while value <= 1000:
    value *= 2
    steps += 1

print(steps, value)`,
      output: "10 1024",
    },
    {
      type: "viz",
      id: "return-by-death",
      title: "Повернення через смерть (3D)",
      caption: "Кожен виток спіралі — одна ітерація `while`. Червоні кільця — перевірка умови, яка ще `True`: «смерть» і повернення на початок. На останньому витку спрацьовує `break` — і куля вилітає назовні. Вимкни `break`, щоб побачити нескінченний цикл.",
    },
    {
      type: "warning",
      title: "нескінченний цикл",
      md: "Забув `mana -= 4` — і `while mana > 0:` крутиться вічно, програма «зависає». Зупинити її в терміналі можна **Ctrl+C** (`KeyboardInterrupt`). Перед запуском `while` завжди запитуй себе: *що саме в тілі наближає умову до `False`?*",
    },
    {
      type: "code",
      title: "while_true.py",
      code: `# while True + break: коли умову виходу зручніше перевірити всередині
while True:
    command = input("Дія (fight / run / quit): ").strip()
    if command == "quit":
        print("Збереження... Повернення через смерть вимкнено.")
        break
    if command not in ("fight", "run"):
        print("Не зрозумів, спробуй ще")
        continue
    print(f"Субару обирає: {command}")`,
      runnable: false,
    },
    {
      type: "flow",
      title: "while True: continue проти break",
      nodes: [
        { id: "s", kind: "start", label: "Старт", col: 0, row: 0 },
        { id: "inp", kind: "io", label: "command = input(...)", col: 0, row: 1 },
        { id: "q", kind: "decision", label: "command == \"quit\"?", col: 0, row: 2 },
        { id: "sv", kind: "io", label: "print(\"Збереження...\")", col: 1, row: 2 },
        { id: "brk", kind: "process", label: "break", col: 2, row: 2 },
        { id: "e", kind: "end", label: "Кінець", col: 2, row: 3 },
        { id: "bad", kind: "decision", label: "command not in\n(\"fight\", \"run\")?", col: 0, row: 3 },
        { id: "msg", kind: "io", label: "print(\"Не зрозумів,\nспробуй ще\")", col: 1, row: 3 },
        { id: "cont", kind: "process", label: "continue", col: 1, row: 4 },
        { id: "act", kind: "io", label: "print(f\"Субару\nобирає: {command}\")", col: 0, row: 4 },
      ],
      edges: [
        { from: "s", to: "inp" },
        { from: "inp", to: "q" },
        { from: "q", to: "sv", label: "True" },
        { from: "sv", to: "brk" },
        { from: "brk", to: "e" },
        { from: "q", to: "bad", label: "False" },
        { from: "bad", to: "msg", label: "True" },
        { from: "msg", to: "cont" },
        { from: "cont", to: "inp", side: "right" },
        { from: "bad", to: "act", label: "False" },
        { from: "act", to: "inp", side: "left" },
      ],
      scenarios: [
        {
          name: "fight → dance → quit",
          steps: [
            { node: "s" },
            { node: "inp", note: "ввели `fight`" },
            { node: "q", note: "`\"fight\" == \"quit\"` → False" },
            { node: "bad", note: "`\"fight\"` є в кортежі → False" },
            { node: "act", note: "вивід: `Субару обирає: fight` — нове коло" },
            { node: "inp", note: "ввели `dance`" },
            { node: "q", note: "False" },
            { node: "bad", note: "`\"dance\"` немає серед `(\"fight\", \"run\")` → **True**" },
            { node: "msg", note: "вивід: `Не зрозумів, спробуй ще`" },
            { node: "cont", note: "`continue` — решта тіла пропускається, одразу нове коло" },
            { node: "inp", note: "ввели `quit`" },
            { node: "q", note: "`\"quit\" == \"quit\"` → **True**" },
            { node: "sv", note: "вивід: `Збереження... Повернення через смерть вимкнено.`" },
            { node: "brk", note: "`break` — негайний вихід з `while True`" },
            { node: "e" },
          ],
        },
      ],
      caption: "Обидві стрілки вгору ведуть до `input()`: і звичайний кінець тіла, і `continue`. Різниця в тому, що `continue` **пропускає** рядки під собою. А з `while True` вийти можна лише через `break` (або `return` / виняток).",
    },
    {
      type: "tip",
      title: "запобіжник від вічності",
      md: "Для циклів, що чекають на зовнішню подію (мережа, пошук розв'язку), додавай ліміт: `for attempt in range(MAX_TRIES):` замість `while True:`. Цикл гарантовано закінчиться, а `for ... else` скаже, що ліміт вичерпано.",
    },

    // ───────────────────────── 5. break / continue / else ─────────────────────────
    { type: "heading", text: "break, continue та else у циклах" },
    {
      type: "text",
      md: "Три інструменти керування потоком усередині циклу:\n\n- `break` — **негайно вийти** з циклу, пропустивши все, що лишилось.\n- `continue` — **пропустити решту тіла** поточної ітерації й перейти до наступної.\n- `else` після циклу — виконується, **якщо цикл завершився природно**, тобто без `break`.\n\nОстаннє — унікальна фішка Python, яка збиває з пантелику новачків. Читай `else` циклу як *«якщо не було break»*.",
    },
    {
      type: "code",
      title: "break_continue.py",
      code: `for day in range(1, 8):
    if day == 3:
        print(f"День {day}: пропускаю (continue)")
        continue
    if day == 5:
        print(f"День {day}: вихід знайдено! (break)")
        break
    print(f"День {day}: звичайний день")`,
      output: "День 1: звичайний день\nДень 2: звичайний день\nДень 3: пропускаю (continue)\nДень 4: звичайний день\nДень 5: вихід знайдено! (break)",
    },
    {
      type: "viz",
      id: "break-continue",
      title: "Лабораторія break / continue / else",
      caption: "Обери інструкцію і значення `n`, на якому вона спрацює. Зверни увагу на блок `else`: він виконується лише тоді, коли цикл дійшов до кінця **без** `break`.",
    },
    {
      type: "code",
      title: "for_else.py",
      code: `def find_weakness(enemies, target):
    for enemy in enemies:
        if enemy == target:
            print(f"{target}: знайдено!")
            break
    else:
        print(f"{target}: не знайдено ні в кого")

witches = ["Сатела", "Ехідна", "Мінерва"]
find_weakness(witches, "Ехідна")
find_weakness(witches, "Беатріс")`,
      output: "Ехідна: знайдено!\nБеатріс: не знайдено ні в кого",
      highlight: [6],
    },
    {
      type: "flow",
      title: "for … else: пошук з break",
      nodes: [
        { id: "s", kind: "start", label: "find_weakness(...)", col: 0, row: 0 },
        { id: "loop", kind: "decision", label: "є ще enemy\nу enemies?", col: 0, row: 1 },
        { id: "cmp", kind: "decision", label: "enemy == target ?", col: 0, row: 2 },
        { id: "found", kind: "io", label: "print(f\"{target}:\nзнайдено!\")", col: 0, row: 3 },
        { id: "brk", kind: "process", label: "break", col: 0, row: 4 },
        { id: "els", kind: "io", label: "else:\nprint(f\"{target}: не\nзнайдено ні в кого\")", col: 1, row: 3 },
        { id: "e", kind: "end", label: "Кінець", col: 1, row: 5 },
      ],
      edges: [
        { from: "s", to: "loop" },
        { from: "loop", to: "cmp", label: "так" },
        { from: "loop", to: "els", label: "ні", side: "right" },
        { from: "cmp", to: "found", label: "True" },
        { from: "cmp", to: "loop", label: "False", side: "left" },
        { from: "found", to: "brk" },
        { from: "brk", to: "e" },
        { from: "els", to: "e" },
      ],
      scenarios: [
        {
          name: "target = \"Ехідна\"",
          steps: [
            { node: "s", note: "`target = \"Ехідна\"`" },
            { node: "loop", note: "`enemy = \"Сатела\"`" },
            { node: "cmp", note: "`\"Сатела\" == \"Ехідна\"` → False" },
            { node: "loop", note: "`enemy = \"Ехідна\"`" },
            { node: "cmp", note: "→ **True**" },
            { node: "found", note: "вивід: `Ехідна: знайдено!`" },
            { node: "brk", note: "`break` — «Мінерву» не перевіряємо, а блок `else` **пропускається**" },
            { node: "e" },
          ],
        },
        {
          name: "target = \"Беатріс\"",
          steps: [
            { node: "s", note: "`target = \"Беатріс\"`" },
            { node: "loop", note: "`enemy = \"Сатела\"`" },
            { node: "cmp", note: "False" },
            { node: "loop", note: "`enemy = \"Ехідна\"`" },
            { node: "cmp", note: "False" },
            { node: "loop", note: "`enemy = \"Мінерва\"`" },
            { node: "cmp", note: "False" },
            { node: "loop", note: "відьми закінчились — цикл завершився **без break**" },
            { node: "els", note: "спрацьовує `else`: `Беатріс: не знайдено ні в кого`" },
            { node: "e" },
          ],
        },
      ],
      caption: "`else` циклу стоїть на стрілці «елементи закінчились». `break` веде в обхід нього — тому `else` читається як *«якщо не знайшли»*.",
    },
    {
      type: "quiz",
      question: "Коли виконується блок `else` після циклу `for`?",
      options: [
        "Коли тіло циклу не виконалось жодного разу",
        "Коли цикл завершився без `break`",
        "Коли в циклі сталася помилка",
        "Завжди після циклу",
      ],
      answer: 1,
      explain: "`else` спрацьовує, якщо цикл дійшов до кінця сам — навіть якщо ітерацій було нуль. `break` «перестрибує» через `else`.",
    },
    {
      type: "joke",
      md: "Субару-куне, `else` після циклу — як я: завжди поруч, доки ти не зробиш `break`. Тоді мене пропускають... Але я не ображаюсь!",
      hero: "Рем",
    },

    // ───────────────────────── 6. enumerate / zip ─────────────────────────
    { type: "heading", text: "enumerate і zip: номери та пари" },
    {
      type: "text",
      md: "Два вбудованих помічники, без яких не обходиться жоден pythonic-цикл:\n\n- `enumerate(iterable, start=0)` — видає пари `(номер, елемент)`. Більше ніяких `range(len(...))`.\n- `zip(a, b, ...)` — «застібає» кілька колекцій і видає кортежі з елементів на однакових позиціях. Зупиняється на **найкоротшій**.",
    },
    {
      type: "code",
      title: "enumerate.py",
      code: `party = ["Субару", "Емілія", "Рем"]

for i, name in enumerate(party):
    print(i, name)

for place, name in enumerate(party, start=1):
    print(f"#{place}: {name}")`,
      output: "0 Субару\n1 Емілія\n2 Рем\n#1: Субару\n#2: Емілія\n#3: Рем",
    },
    {
      type: "code",
      title: "zip.py",
      code: `names = ["Емілія", "Рем", "Рам", "Беатріс"]
roles = ["маг", "мечник", "мечник"]

for name, role in zip(names, roles):
    print(f"{name} — {role}")

# dict із двох списків — однією строкою
ages = dict(zip(["Субару", "Рем"], [17, 17]))
print(ages)`,
      output: "Емілія — маг\nРем — мечник\nРам — мечник\n{'Субару': 17, 'Рем': 17}",
    },
    {
      type: "viz",
      id: "zip-enumerate",
      title: "Застібка zip та лічильник enumerate",
      caption: "Перемикай режими і тисни «Грати». `zip` видає пари, доки є елементи в **обох** списках — зайвий «Беатріс» лишається без пари. З `strict=True` така різниця довжин стає помилкою.",
    },
    {
      type: "compare",
      title: "Індекси по-старому і по-пайтонівськи",
      bad: {
        label: "range(len()) — стиль C",
        code: `for i in range(len(names)):
    print(i, names[i], roles[i])`,
      },
      good: {
        label: "enumerate + zip",
        code: `for i, (name, role) in enumerate(zip(names, roles)):
    print(i, name, role)`,
      },
      note: "Менше індексів — менше `IndexError`. Якщо ловиш себе на `names[i]` у циклі — майже завжди є кращий спосіб.",
    },
    {
      type: "tip",
      title: "zip(strict=True)",
      md: "З Python 3.10 `zip(a, b, strict=True)` кидає `ValueError`, якщо довжини різні. Використовуй, коли дані **мусять** збігатися — тиха втрата останніх елементів буває дуже підступним багом.",
    },

    // ───────────────────────── 7. вкладені ─────────────────────────
    { type: "heading", text: "Вкладені цикли" },
    {
      type: "text",
      md: "Цикл усередині циклу: на **кожну** ітерацію зовнішнього внутрішній проходить **повністю**. Тож загальна кількість ітерацій — добуток: 3 × 4 = 12.\n\nТипові задачі: таблиці, сітки, пари «кожен з кожним», двовимірні списки.",
    },
    {
      type: "code",
      title: "nested.py",
      code: `for row in range(1, 4):
    line = ""
    for col in range(1, 5):
        line += f"{row * col:4}"
    print(line)`,
      output: "   1   2   3   4\n   2   4   6   8\n   3   6   9  12",
    },
    {
      type: "viz",
      id: "nested-grid",
      title: "Вкладені цикли як 3D-сітка",
      caption: "Кожен кубик — одна ітерація внутрішнього циклу. Дивись порядок: зовнішній `row` змінюється повільно, внутрішній `col` — швидко. У режимі `break` видно, що він перериває **лише внутрішній** цикл.",
    },
    {
      type: "code",
      title: "nested_break.py",
      code: `grid = [
    [1, 4, 7],
    [2, 9, 3],
    [8, 5, 6],
]

target = 9
found = None
for r, row in enumerate(grid):
    for c, value in enumerate(row):
        if value == target:
            found = (r, c)
            break          # виходить лише з внутрішнього циклу!
    if found:
        break              # тому потрібен другий break

print("Знайдено на позиції", found)`,
      output: "Знайдено на позиції (1, 1)",
    },
    {
      type: "tip",
      title: "вихід з кількох циклів одразу",
      md: "`break` рве лише найближчий цикл. Щоб вийти з усіх, винеси вкладені цикли у **функцію** і зроби `return` — це чистіше за прапорці. Або використай `itertools.product(rows, cols)`, щоб перетворити два цикли на один.",
    },
    {
      type: "code",
      title: "product.py",
      code: `from itertools import product

def find(grid, target):
    for r, c in product(range(len(grid)), range(len(grid[0]))):
        if grid[r][c] == target:
            return r, c     # return виходить з усього одразу
    return None

print(find([[1, 4], [2, 9]], 9))
print(find([[1, 4], [2, 9]], 5))`,
      output: "(1, 1)\nNone",
    },

    // ───────────────────────── 8. пастки ─────────────────────────
    { type: "heading", text: "Пастки циклів і як їх уникати" },
    {
      type: "warning",
      title: "не змінюй список, по якому ідеш",
      md: "Видалення елементів зі списку під час `for` по ньому зсуває індекси — цикл «перестрибує» елементи. Ітеруй по **копії** (`for x in items[:]:`) або, ще краще, будуй новий список.",
    },
    {
      type: "code",
      title: "mutate_bug.py",
      code: `deaths = [1, 2, 2, 3, 2, 4]
for d in deaths:
    if d == 2:
        deaths.remove(d)
print("Баг:  ", deaths)

deaths = [1, 2, 2, 3, 2, 4]
deaths = [d for d in deaths if d != 2]
print("Вірно:", deaths)`,
      output: "Баг:   [1, 3, 2, 4]\nВірно: [1, 3, 4]",
    },
    {
      type: "compare",
      title: "Накопичення результату",
      bad: {
        label: "Ручний лічильник і індекси",
        code: `total = 0
i = 0
while i < len(scores):
    total = total + scores[i]
    i = i + 1`,
      },
      good: {
        label: "Вбудовані функції",
        code: `total = sum(scores)
best = max(scores)
passed = sum(1 for s in scores if s >= 60)`,
      },
      note: "Багато циклів у Python вже написані за тебе: `sum`, `min`, `max`, `any`, `all`, `sorted`, `reversed`. Вони швидші (працюють на C) і зрозуміліші.",
    },
    {
      type: "code",
      title: "helpers.py",
      code: `timeline = ["крамниця", "особняк", "село", "замок"]

for place in reversed(timeline):
    print(place, end=" ← ")
print("старт")

print(sorted(timeline, key=len))

print(sum(len(p) for p in timeline))`,
      output: "замок ← село ← особняк ← крамниця ← старт\n['село', 'замок', 'особняк', 'крамниця']\n24",
    },
    {
      type: "tip",
      title: "while з лічильником — майже завжди for",
      md: "Бачиш `i = 0` → `while i < n:` → `i += 1`? Це `for i in range(n):` у маскуванні. `while` лишай для випадків, коли кількість ітерацій **справді** невідома заздалегідь.",
    },
    {
      type: "quiz",
      question: "Що надрукує `for i in range(3): pass` а потім `print(i)`?",
      options: ["`3`", "`2`", "`NameError`", "`0`"],
      answer: 1,
      explain: "Змінна циклу **не зникає** після циклу і зберігає останнє значення — `2`. (Якби range був порожнім, `i` взагалі не було б створено, і тоді був би `NameError`.)",
    },
    {
      type: "joke",
      md: "Я, у свою чергу, бачила стільки нескінченних циклів у бібліотеці, що завжди ношу з собою `Ctrl+C`, я певна.",
      hero: "Беатріс",
    },

    // ───────────────────────── 9. шпаргалка ─────────────────────────
    { type: "heading", text: "Шпаргалка" },
    {
      type: "table",
      head: ["Що треба", "Як написати", "Нотатка"],
      rows: [
        ["Повторити N разів", "`for _ in range(n):`", "`_` — значення не потрібне"],
        ["Пройти по колекції", "`for x in items:`", "Працює з будь-яким iterable"],
        ["Номер + елемент", "`for i, x in enumerate(items, 1):`", "`start` — з якого числа"],
        ["Кілька колекцій разом", "`for a, b in zip(xs, ys):`", "Зупиняється на найкоротшій"],
        ["Ключі й значення словника", "`for k, v in d.items():`", "Порядок вставки зберігається"],
        ["Поки умова", "`while cond:`", "Умова має колись стати `False`"],
        ["Вийти раніше", "`break`", "Лише з найближчого циклу"],
        ["Пропустити ітерацію", "`continue`", "Одразу до наступного елемента"],
        ["Якщо не було break", "`for ...: ... else: ...`", "Ідеально для пошуку"],
        ["У зворотному порядку", "`for x in reversed(items):`", "Або `range(n - 1, -1, -1)`"],
      ],
    },
  ],
};

export default section;
