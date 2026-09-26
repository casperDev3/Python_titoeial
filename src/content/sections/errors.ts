import type { Section } from "../types";

/** Код Python пишемо через String.raw — бекслеші (\n) лишаються як у Python. */
const py = String.raw;

const section: Section = {
  "slug": "errors",
  "title": "Винятки та помилки",
  "short": "try / except / raise",
  "icon": "🛡️",
  "group": "Надійність",
  "summary": "Типи помилок, traceback, try/except/else/finally, raise, власні винятки, EAFP проти LBYL, assert.",
  "hero": {
    "name": "Танджіро Камадо",
    "universe": "Demon Slayer",
    "emoji": "🔥",
    "quote": "Дихання Води, Перша Форма: except ValueError!",
    "why": "Танджіро має окрему форму дихання на кожну загрозу — як окремий except на кожен тип помилки."
  },
  "theme": {
    "accent": "#10b981",
    "accent2": "#ef4444",
    "glow": "#059669"
  },
  "minutes": 14,
  "order": 11,
  "blocks": [
    // ───────────────────────────── 1. Що таке помилка
    { type: "heading", text: "Помилки — це демони, яких можна перемогти", id: "what" },
    {
      type: "text",
      md: "Кожна програма рано чи пізно зустріне демона: користувач введе «сорок два» замість `42`, файл зникне, мережа впаде, а в словнику не буде потрібного ключа. У Python такі ситуації називаються **винятками** (exceptions).\n\nВажливо розрізняти два види проблем:\n\n- **Синтаксична помилка** (`SyntaxError`, `IndentationError`) — код навіть не запуститься. Python читає файл цілком *до* виконання і відмовляється стартувати, якщо граматика зламана.\n- **Виняток під час виконання** — код граматично правильний, але на якомусь рядку трапилось щось неможливе. Виконання зупиняється саме *на цьому рядку*, а все, що вище, вже встигло відпрацювати.\n\nХороша новина: винятки — це не кінець світу, а *об'єкти*, які можна зловити, роздивитись і обробити. Саме цього ми й навчимось.",
    },
    {
      type: "code",
      title: "Виняток зупиняє програму на місці",
      code: py`print("Початок місії")
x = int("42")
print("x =", x)
y = int("сорок два")  # 💥 тут демон
print("Цього рядка ми не побачимо")`,
      output: py`Початок місії
x = 42
Traceback (most recent call last):
  File "main.py", line 4, in <module>
    y = int("сорок два")  # 💥 тут демон
        ~~~^^^^^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'сорок два'`,
      highlight: [4],
    },
    {
      type: "joke",
      md: "Я відчуваю запах… `ValueError`! Він пахне рядком, який прикидається числом. 👃🔥",
    },

    // ───────────────────────────── 2. Traceback
    { type: "heading", text: "Як читати traceback: знизу вгору", id: "traceback" },
    {
      type: "text",
      md: "**Traceback** — це «слід демона»: звіт про те, через які функції пройшла помилка, перш ніж вбити програму. Новачки лякаються цієї стіни тексту, але читати її просто:\n\n- **Останній рядок** — найважливіший: *тип* винятку і *повідомлення*. Почни звідси.\n- **Рядки вище** — стек викликів: від найзовнішнього виклику (`<module>`) вниз до місця, де все зламалось. Найнижчий `File …, line …` — точне місце аварії.\n- Кожен кадр показує файл, номер рядка, ім'я функції й сам рядок коду.",
    },
    {
      type: "code",
      title: "Помилка «спливає» через три функції",
      code: py`def parse(text):
    return int(text)

def load_level(raw):
    return parse(raw) * 10

def start_game():
    level = load_level("два")
    print("Рівень:", level)

start_game()`,
      output: py`Traceback (most recent call last):
  File "main.py", line 11, in <module>
    start_game()
    ~~~~~~~~~~^^
  File "main.py", line 8, in start_game
    level = load_level("два")
            ~~~~~~~~~~^^^^^^^
  File "main.py", line 5, in load_level
    return parse(raw) * 10
           ~~~~~^^^^^
  File "main.py", line 2, in parse
    return int(text)
ValueError: invalid literal for int() with base 10: 'два'`,
    },
    {
      type: "viz",
      id: "stack-bubble",
      title: "3D: виняток спливає стеком викликів",
      caption: "Кожна скляна плита — кадр стеку (виклик функції). Натисни «Кинути виняток» і подивись, як червона сфера піднімається вгору, доки не зустріне кадр із `try/except`. Обери, *де* стоїть `try`, — і побачиш, які кадри встигнуть завершитись, а які буде перервано. Якщо `try` немає ніде — виняток вилітає з програми і ти бачиш traceback.",
    },
    {
      type: "tip",
      title: "Читай останній рядок першим",
      md: "У 90% випадків тип винятку + повідомлення в останньому рядку вже кажуть, що не так. Скопіюй саме цей рядок у пошук — і ти знайдеш відповідь. А червоні `~~~^^^` у сучасному Python вказують точний *вираз* усередині рядка, що впав.",
    },

    // ───────────────────────────── 3. Типові винятки
    { type: "heading", text: "Бестіарій: найчастіші винятки", id: "bestiary" },
    {
      type: "text",
      md: "Мисливець на демонів знає кожного ворога в обличчя. Ось шпаргалка з найпоширенішими винятками — ти зустрінеш їх у перший же тиждень:",
    },
    {
      type: "table",
      head: ["Виняток", "Коли виникає", "Приклад"],
      rows: [
        ["`ValueError`", "Тип правильний, а значення — ні", "`int(\"abc\")`"],
        ["`TypeError`", "Операція з невідповідним типом", "`\"5\" + 5`"],
        ["`KeyError`", "Ключа немає в словнику", "`{}[\"hp\"]`"],
        ["`IndexError`", "Індекс поза межами списку", "`[1, 2][5]`"],
        ["`ZeroDivisionError`", "Ділення на нуль", "`1 / 0`"],
        ["`NameError`", "Змінну не визначено (частіше — одрук)", "`pritn(1)`"],
        ["`AttributeError`", "В об'єкта немає такого атрибута/методу", "`[].push(1)`"],
        ["`FileNotFoundError`", "Файлу не існує", "`open(\"nope.txt\")`"],
        ["`ImportError` / `ModuleNotFoundError`", "Модуль не знайдено", "`import numpyy`"],
        ["`StopIteration`", "Ітератор закінчився", "`next(iter([]))`"],
        ["`RecursionError`", "Занадто глибока рекурсія", "функція, що кличе себе без кінця"],
        ["`AssertionError`", "Не пройшла перевірка `assert`", "`assert 1 == 2`"],
      ],
    },
    {
      type: "code",
      title: "Демони в дії: ловимо кожного і дивимось на тип",
      code: py`attacks = [
    lambda: int("abc"),
    lambda: "5" + 5,
    lambda: {"hp": 100}["mp"],
    lambda: [1, 2, 3][10],
    lambda: 10 / 0,
    lambda: None.upper(),
]

for attack in attacks:
    try:
        attack()
    except Exception as e:
        print(f"{type(e).__name__:<18} → {e}")`,
      output: py`ValueError         → invalid literal for int() with base 10: 'abc'
TypeError          → can only concatenate str (not "int") to str
KeyError           → 'mp'
IndexError         → list index out of range
ZeroDivisionError  → division by zero
AttributeError     → 'NoneType' object has no attribute 'upper'`,
    },

    // ───────────────────────────── 4. try / except
    { type: "heading", text: "try / except — перша форма дихання", id: "try-except" },
    {
      type: "text",
      md: "Конструкція `try/except` каже Python: «спробуй виконати цей блок, а якщо вилетить виняток такого-то типу — не падай, а виконай ось це».\n\n- У `try` кладемо **мінімум** коду — лише те, що реально може впасти.\n- У `except ТипПомилки:` — план Б.\n- Після обробки програма **продовжує працювати** з рядка після всієї конструкції.",
    },
    {
      type: "code",
      title: "Перехоплюємо ValueError",
      code: py`text = "дванадцять"

try:
    number = int(text)
    print("Число:", number)
except ValueError:
    print("Це не число! Спробуй цифрами 🙂")

print("Програма живе далі")`,
      output: py`Це не число! Спробуй цифрами 🙂
Програма живе далі`,
      highlight: [3, 6],
    },
    {
      type: "text",
      md: "Можна мати **кілька** `except` — як окремі форми дихання для різних демонів. Python перевіряє їх **згори вниз** і виконує *перший*, що підійшов. Щоб отримати сам об'єкт винятку, пиши `except Тип as e` — у `e` буде повідомлення, а `type(e).__name__` скаже назву типу.",
    },
    {
      type: "code",
      title: "Кілька except і «as e»",
      code: py`def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError as e:
        print(f"  ZeroDivisionError: {e}")
    except TypeError as e:
        print(f"  TypeError: {e}")
    return None

print(safe_divide(10, 4))
print(safe_divide(1, 0))
print(safe_divide("10", 2))`,
      output: py`2.5
  ZeroDivisionError: division by zero
None
  TypeError: unsupported operand type(s) for /: 'str' and 'int'
None`,
    },
    {
      type: "code",
      title: "Один except на кілька типів — кортежем",
      code: py`raw = ["10", "abc", None, "7", "3.5"]
total = 0

for item in raw:
    try:
        total += int(item)
    except (ValueError, TypeError) as e:
        print(f"Пропускаю {item!r}: {type(e).__name__}")

print("Сума:", total)`,
      output: py`Пропускаю 'abc': ValueError
Пропускаю None: TypeError
Пропускаю '3.5': ValueError
Сума: 17`,
    },
    {
      type: "warning",
      title: "Голий except: — пастка",
      md: "`except:` без типу (або `except BaseException:`) ловить *абсолютно все* — навіть `KeyboardInterrupt` (Ctrl+C) і `SystemExit`. Програму стає неможливо зупинити, а справжні баги (одрук у назві змінної → `NameError`) тихо ковтаються. Завжди вказуй конкретний тип. Якщо дуже треба «все» — хоча б `except Exception as e:` і обов'язково залогуй `e`.",
    },
    {
      type: "compare",
      title: "Ковтати помилку чи обробити її?",
      bad: {
        label: "Зеніцу закрив очі",
        code: py`try:
    user = load_user(user_id)
    send_email(user.email)
except:
    pass  # щось пішло не так… але що?`,
      },
      good: {
        label: "Танджіро бачить демона",
        code: py`try:
    user = load_user(user_id)
except KeyError:
    print(f"Користувача {user_id} не знайдено")
else:
    send_email(user.email)`,
      },
      note: "У поганому варіанті навіть одрук `usre.email` буде мовчки проковтнуто. У хорошому ловимо лише очікувану помилку, а `send_email` винесено в `else`, щоб її власні збої не маскувались.",
    },
    {
      type: "joke",
      hero: "Зеніцу Аґацума",
      md: "Я написав `except: pass` і тепер програма ніколи не падає! …А ще нічого не робить. І я не знаю чому. Мені страшно. 😱⚡",
    },

    // ───────────────────────────── 5. else і finally
    { type: "heading", text: "else і finally — повна форма", id: "else-finally" },
    {
      type: "text",
      md: "Повна конструкція має чотири частини, і кожна має свою роль:\n\n- `try` — небезпечна дія.\n- `except` — виконується, **якщо** виняток стався.\n- `else` — виконується, **якщо винятку не було**. Сюди — код, що залежить від успіху `try`, але сам не має бути «під захистом».\n- `finally` — виконується **завжди**: був виняток чи ні, був `return` чи `break`. Ідеальне місце, щоб прибрати за собою: закрити файл, з'єднання, відпустити замок.",
    },
    {
      type: "viz",
      id: "try-flow",
      title: "Покрокове виконання try / except / else / finally",
      caption: "Обери сценарій і тисни «Крок». Підсвічений рядок — той, що виконується зараз. Зверни увагу: `finally` відпрацьовує в *усіх* сценаріях, навіть коли виняток ніхто не зловив і він летить далі.",
    },
    {
      type: "code",
      title: "Хто і коли виконується",
      code: py`def read_level(value):
    try:
        level = int(value)
    except ValueError:
        print("  except: погане значення")
        return None
    else:
        print("  else: все пройшло без помилок")
        return level
    finally:
        print("  finally: я виконуюсь ЗАВЖДИ")

print(read_level("5"))
print(read_level("п'ять"))`,
      output: py`  else: все пройшло без помилок
  finally: я виконуюсь ЗАВЖДИ
5
  except: погане значення
  finally: я виконуюсь ЗАВЖДИ
None`,
    },
    {
      type: "joke",
      hero: "Кьоджуро Ренгоку",
      md: "`finally` — як я у потязі «Нескінченний»: що б не сталося, я виконаю свій обов'язок до кінця! *Запали своє серце* і закрий свої файли! 🔥🚂",
    },
    {
      type: "warning",
      title: "Не пиши return у finally",
      md: "`return` усередині `finally` *перекриває* і повернене з `try` значення, і навіть виняток, що летів — він просто зникає. Починаючи з Python 3.14 це навіть дає `SyntaxWarning`. У `finally` — лише прибирання, без `return`/`break`/`continue`.",
    },
    {
      type: "quiz",
      question: "Що надрукує цей код?\n\n`try: int(\"x\")` → `except ValueError: print(\"A\")` → `else: print(\"B\")` → `finally: print(\"C\")`",
      options: ["A", "B C", "A C", "A B C"],
      answer: 2,
      explain: "`int(\"x\")` кидає `ValueError`, тому виконується `except` (A). `else` пропускається, бо виняток *був*. `finally` виконується завжди (C).",
    },

    // ───────────────────────────── 6. Ієрархія
    { type: "heading", text: "Ієрархія винятків: від загального до конкретного", id: "hierarchy" },
    {
      type: "text",
      md: "Винятки — це **класи**, і вони утворюють дерево спадкування. `except X` ловить не лише `X`, а й **усіх його нащадків**. Наприклад, `except LookupError` зловить і `KeyError`, і `IndexError`, а `except ArithmeticError` — `ZeroDivisionError`.\n\nНа вершині — `BaseException`. Під ним `Exception` (батько майже всіх «звичайних» помилок) і кілька особливих: `KeyboardInterrupt`, `SystemExit`, `GeneratorExit`. Їх навмисно винесено *поза* `Exception`, щоб `except Exception` не заважав зупинити програму.",
    },
    {
      type: "viz",
      id: "exception-tree",
      title: "3D-дерево винятків",
      caption: "Покрути дерево. Натисни на будь-який вузол — це твій `except`. Засвітяться всі винятки, які він зловить (сам клас + його нащадки). Спробуй `Exception`, `LookupError` і `BaseException` — відчуй різницю.",
    },
    {
      type: "code",
      title: "Перевіряємо родовід",
      code: py`print(ZeroDivisionError.__mro__)
print(issubclass(KeyError, LookupError))
print(issubclass(FileNotFoundError, OSError))
print(issubclass(KeyboardInterrupt, Exception))`,
      output: py`(<class 'ZeroDivisionError'>, <class 'ArithmeticError'>, <class 'Exception'>, <class 'BaseException'>, <class 'object'>)
True
True
False`,
    },
    {
      type: "code",
      title: "Один except на цілу родину",
      code: py`squad = ["Танджіро", "Незуко", "Зеніцу"]
ranks = {"Танджіро": "Мідзуното"}

def lookup(action):
    try:
        return action()
    except LookupError as e:
        return f"{type(e).__name__}: {e}"

print(lookup(lambda: squad[5]))
print(lookup(lambda: ranks["Іноске"]))
print(lookup(lambda: ranks["Танджіро"]))`,
      output: py`IndexError: list index out of range
KeyError: 'Іноске'
Мідзуното`,
    },
    {
      type: "viz",
      id: "except-order",
      title: "Порядок except: хто зловить першим?",
      caption: "Перетягни рядки `except`, щоб змінити їх порядок, і обери, який виняток кидає `try`. Python іде згори вниз і бере **перший** `except`, чий клас є предком винятку. Постав `Exception` першим — і побачиш, що решта стали «мертвим кодом».",
    },
    {
      type: "tip",
      title: "Від вузького до широкого",
      md: "Розташовуй `except` від **найконкретнішого** до **найзагальнішого**: спочатку `FileNotFoundError`, потім `OSError`, і в самому кінці (якщо треба) `Exception`. Лінтери (наприклад, Ruff чи Pylint) підсвітять недосяжний `except`, якщо переплутаєш.",
    },
    {
      type: "quiz",
      question: "Який `except` зловить `KeyError`, якщо вони йдуть саме в такому порядку: `except IndexError`, `except LookupError`, `except KeyError`?",
      options: ["`except IndexError`", "`except LookupError`", "`except KeyError`", "Жоден — програма впаде"],
      answer: 1,
      explain: "`KeyError` не є нащадком `IndexError`, тому перший пропускаємо. `KeyError` — нащадок `LookupError`, і цей `except` спрацьовує першим. До `except KeyError` черга так і не дійде.",
    },

    // ───────────────────────────── 7. raise
    { type: "heading", text: "raise — кидаємо виклик самі", id: "raise" },
    {
      type: "text",
      md: "Ти можеш і сам **кидати** винятки через `raise`. Це правильний спосіб сказати «далі так працювати не можна»: функція отримала неприпустимі дані й не повинна мовчки повертати сміття.\n\n- `raise ValueError(\"повідомлення\")` — кинути новий виняток.\n- `raise` без аргументів усередині `except` — **перекинути** поточний виняток далі (наприклад, після логування).\n- `raise НовийВиняток(...) from e` — кинути новий виняток, зберігши *причину*. У traceback буде видно обидва.",
    },
    {
      type: "code",
      title: "Валідація аргументів",
      code: py`def set_hp(hp):
    if not isinstance(hp, int):
        raise TypeError(f"hp має бути int, а не {type(hp).__name__}")
    if hp < 0:
        raise ValueError("hp не може бути від'ємним")
    return hp

for value in [100, -5, "багато"]:
    try:
        print("OK:", set_hp(value))
    except (TypeError, ValueError) as e:
        print(f"{type(e).__name__}: {e}")`,
      output: py`OK: 100
ValueError: hp не може бути від'ємним
TypeError: hp має бути int, а не str`,
    },
    {
      type: "code",
      title: "Залогувати і перекинути далі",
      code: py`def load(level):
    try:
        return 100 / level
    except ZeroDivisionError:
        print("лог: рівень 0, передаю помилку вище")
        raise  # той самий виняток летить далі

try:
    load(0)
except ZeroDivisionError as e:
    print("Зловлено нагорі:", e)`,
      output: py`лог: рівень 0, передаю помилку вище
Зловлено нагорі: division by zero`,
    },
    {
      type: "code",
      title: "raise … from — ланцюжок причин",
      code: py`class ConfigError(Exception):
    pass

def parse_port(text):
    try:
        return int(text)
    except ValueError as e:
        raise ConfigError(f"Поганий порт: {text!r}") from e

try:
    parse_port("80a")
except ConfigError as e:
    print(e)
    print("Причина:", repr(e.__cause__))`,
      output: py`Поганий порт: '80a'
Причина: ValueError("invalid literal for int() with base 10: '80a'")`,
    },
    {
      type: "tip",
      title: "Додай контекст через add_note",
      md: "З Python 3.11 до будь-якого винятку можна дописати пояснення: `e.add_note(f\"рядок {n} у файлі {path}\")` і потім `raise`. Нотатка з'явиться в traceback під повідомленням — неоціненно при розборі великих файлів, де сам `ValueError` не каже, *де саме* біда.",
    },

    // ───────────────────────────── 8. Власні винятки
    { type: "heading", text: "Власні винятки — свій бестіарій", id: "custom" },
    {
      type: "text",
      md: "Для своєї програми варто створити власні типи винятків — це просто класи, що наслідують `Exception`. Типова схема: **один базовий** виняток проєкту і кілька конкретних нащадків. Тоді код, що користується твоєю бібліотекою, може ловити або конкретну проблему, або все «твоє» одним `except`.\n\nВласний виняток може нести додаткові дані (атрибути), які допоможуть обробникові ухвалити рішення.",
    },
    {
      type: "code",
      title: "Ієрархія винятків гри",
      code: py`class DemonError(Exception):
    """Базовий виняток нашої гри."""

class DemonTooStrong(DemonError):
    def __init__(self, name, power):
        super().__init__(f"{name} надто сильний (сила {power})")
        self.name = name
        self.power = power

class SunlightNeeded(DemonError):
    pass

def fight(demon, power, my_level):
    if demon == "Мудзан":
        raise SunlightNeeded("Тут допоможе лише світанок")
    if power > my_level * 10:
        raise DemonTooStrong(demon, power)
    return f"{demon} переможений!"

for demon, power in [("Руй", 40), ("Аказа", 90), ("Мудзан", 10)]:
    try:
        print(fight(demon, power, my_level=5))
    except DemonTooStrong as e:
        print("Відступаємо:", e, "| сила:", e.power)
    except DemonError as e:
        print("Інша біда:", e)`,
      output: py`Руй переможений!
Відступаємо: Аказа надто сильний (сила 90) | сила: 90
Інша біда: Тут допоможе лише світанок`,
    },
    {
      type: "tip",
      title: "Назви закінчуй на Error",
      md: "Конвенція PEP 8: класи винятків називаються з суфіксом `Error` (`ConfigError`, `PaymentError`). А для «порожнього» винятку не потрібен `pass` — docstring уже є тілом класу: `class DemonError(Exception): \"\"\"Опис.\"\"\"`.",
    },
    {
      type: "joke",
      hero: "Іноске Хашібіра",
      md: "НАВІЩО ЛОВИТИ ПОМИЛКИ, ЯКЩО МОЖНА ЇХ КИДАТИ?! `raise BoarError(\"Я КАБАН!\")` 🐗 …Танджіро каже, що хтось має її потім зловити. Хай ловить. Я не проти.",
    },

    // ───────────────────────────── 9. EAFP vs LBYL
    { type: "heading", text: "EAFP проти LBYL: дві школи бою", id: "eafp" },
    {
      type: "text",
      md: "Є два стилі захисту від помилок:\n\n- **LBYL** — *Look Before You Leap* («дивись, перш ніж стрибати»): спочатку перевір `if key in d`, `if os.path.exists(...)`, потім дій.\n- **EAFP** — *Easier to Ask Forgiveness than Permission* («легше попросити пробачення, ніж дозволу»): просто дій у `try`, а проблему обробляй у `except`.\n\nУ Python частіше вважається ідіоматичним **EAFP**. Причини: код коротший, немає подвійної роботи (перевірка + дія), а головне — немає **гонки станів**: між `exists()` і `open()` файл може зникнути, а `try/except` врахує й це.",
    },
    {
      type: "code",
      title: "Три способи дістати ключ",
      code: py`hero = {"name": "Танджіро", "style": "Вода"}

# LBYL — дивимось перед стрибком
if "sword" in hero:
    print(hero["sword"])
else:
    print("LBYL: меча немає")

# EAFP — діємо і просимо пробачення
try:
    print(hero["sword"])
except KeyError:
    print("EAFP: меча немає")

# А для словників найкраще — .get()
print(hero.get("sword", "Нітірін (за замовчуванням)"))`,
      output: py`LBYL: меча немає
EAFP: меча немає
Нітірін (за замовчуванням)`,
    },
    {
      type: "tip",
      title: "contextlib.suppress замість try/except/pass",
      md: "Коли помилку справді треба *свідомо* проігнорувати, напиши це явно: `with suppress(FileNotFoundError): os.remove(path)`. Читається як речення і не ковтає нічого зайвого.",
    },
    {
      type: "code",
      title: "Свідомо ігноруємо конкретну помилку",
      code: py`from contextlib import suppress
import os

with suppress(FileNotFoundError):
    os.remove("temp_demon.txt")
    print("Файл видалено")

print("Файлу не було — і нічого страшного")`,
      output: py`Файлу не було — і нічого страшного`,
    },
    {
      type: "code",
      title: "Класика: питаємо, доки не отримаємо число",
      runnable: false,
      code: py`while True:
    raw = input("Скільки демонів переміг? ")
    try:
        count = int(raw)
    except ValueError:
        print("Треба ціле число, спробуй ще раз")
        continue
    if count < 0:
        print("Від'ємних демонів не буває 🙂")
        continue
    break

print(f"Рахунок: {count} демонів!")`,
      output: py`Скільки демонів переміг? багато
Треба ціле число, спробуй ще раз
Скільки демонів переміг? -3
Від'ємних демонів не буває 🙂
Скільки демонів переміг? 12
Рахунок: 12 демонів!`,
    },

    // ───────────────────────────── 10. assert
    { type: "heading", text: "assert — перевірка для розробника", id: "assert" },
    {
      type: "text",
      md: "`assert умова, \"повідомлення\"` кидає `AssertionError`, якщо умова хибна. Це інструмент для **ловлі багів у власному коді**: «тут *ніколи* не має бути від'ємного числа, а якщо є — я десь помилився».\n\nАле `assert` — **не** для перевірки даних користувача: запуск `python -O` (оптимізований режим) повністю вимикає всі `assert`. Для валідації вводу — тільки `if … raise ValueError`.",
    },
    {
      type: "code",
      title: "assert як внутрішня гарантія",
      code: py`def heal(hp, amount):
    assert amount >= 0, "лікування не може бути від'ємним"
    return min(hp + amount, 100)

print(heal(70, 20))
print(heal(90, 50))

try:
    heal(50, -10)
except AssertionError as e:
    print("AssertionError:", e)`,
      output: py`90
100
AssertionError: лікування не може бути від'ємним`,
    },
    {
      type: "warning",
      title: "assert з дужками завжди істинний",
      md: "`assert (x > 0, \"x додатний\")` — це перевірка **кортежу**, а непорожній кортеж завжди `True`. Такий assert ніколи не спрацює (Python навіть попередить `SyntaxWarning`). Пиши без дужок: `assert x > 0, \"x додатний\"`.",
    },
    {
      type: "quiz",
      question: "Чому `except:` без типу вважається поганою практикою?",
      options: [
        "Він працює повільніше за `except Exception`",
        "Він ловить навіть `KeyboardInterrupt` і `SystemExit` та ховає справжні баги",
        "У Python 3 він заборонений синтаксисом",
        "Він не дає доступу до `finally`",
      ],
      answer: 1,
      explain: "Голий `except` еквівалентний `except BaseException` — він перехоплює і Ctrl+C, і `sys.exit()`, і одруки (`NameError`). Програма стає «безсмертною» і німою одночасно.",
    },
    {
      type: "quiz",
      question: "Чому `assert` не можна використовувати для перевірки введення користувача?",
      options: [
        "`assert` не вміє показувати повідомлення",
        "`assert` працює лише з числами",
        "При запуску з `python -O` усі `assert` вимикаються",
        "`AssertionError` неможливо зловити",
      ],
      answer: 2,
      explain: "Прапорець `-O` прибирає всі `assert` з байткоду. Якщо на них трималась валідація — вона тихо зникне. Для даних ззовні використовуй `if … raise ValueError(...)`.",
    },

    // ───────────────────────────── 11. Шпаргалка
    { type: "text", md: "**Шпаргалка мисливця** — усе про винятки на одному екрані:" },
    {
      type: "table",
      head: ["Конструкція", "Що робить"],
      rows: [
        ["`try:`", "Небезпечний код — мінімум рядків"],
        ["`except ValueError:`", "Обробити конкретний тип (і нащадків)"],
        ["`except (A, B) as e:`", "Кілька типів одним блоком, об'єкт у `e`"],
        ["`else:`", "Виконати, якщо винятку **не було**"],
        ["`finally:`", "Виконати **завжди** — прибирання"],
        ["`raise X(\"msg\")`", "Кинути виняток"],
        ["`raise`", "Перекинути поточний виняток далі"],
        ["`raise X(...) from e`", "Новий виняток із збереженою причиною"],
        ["`class MyError(Exception)`", "Власний тип винятку"],
        ["`with suppress(X):`", "Свідомо ігнорувати тип `X`"],
        ["`assert cond, \"msg\"`", "Внутрішня перевірка (вимикається `-O`)"],
      ],
    },
    {
      type: "tip",
      title: "traceback без падіння",
      md: "Хочеш залогувати повний traceback, але не зупиняти програму? `import traceback` і в `except` виклич `traceback.print_exc()`. А в реальних проєктах — `logging.exception(\"опис\")`: він сам додасть traceback у лог.",
    },
    {
      type: "joke",
      md: "Моя сестра Незуко теж колись була «необробленим винятком». Але я не видалив її з програми — я написав для неї окремий `except` і навчив жити з людьми. 🎋 Кожну помилку можна обробити з добротою.",
    },
  ]
};

export default section;
