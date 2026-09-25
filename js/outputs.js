/* ============================================================
   Vayu — Example outputs
   Keyed by basename (e.g. "hello.vyu"). Used by the Run button
   in both the examples file manager and the github explorer.
   Normal outputs are recorded here. Interactive/input/GUI/3D examples\n   are executed by js/Live_output.js instead.
   Files that require the native backend (FFI, py bridge) are
   noted as such in their recorded output.
   ============================================================ */
window.VayuOutputs = {

/* ============================================================
   BASICS
   ============================================================ */
'hello.vyu': `Hello, NotY`,

'print.vyu': `Hello_World
69`,

'expr.vyu': `expr.vyu:6:1: type error: name 'a' is not defined
(snippet of expressions only; not a complete runnable program)`,

'control.vyu': `small
5
4
3
2
1
done`,

'fib.vyu': `fib(0) = 0
fib(1) = 1
fib(2) = 1
fib(3) = 2
fib(4) = 3
fib(5) = 5
fib(6) = 8
fib(7) = 13
fib(8) = 21
fib(9) = 34
---
fib(20) = 6765`,

/* ============================================================
   TYPES, STRUCTS, OOP
   ============================================================ */
'types.vyu': `All type checks passed.
3 3.0 2.0 42`,

'type_errors.vyu': `type_errors.vyu:3:1: type error: cannot initialize 'x' (int) with value of type str
(intentionally demonstrates a type error)`,

'structs.vyu': `NotY
100
75
Ally
10
Bob
100
NotY
75
3
42
42
Player(name="NotY", health=42, score=0)
Player(name="Ally", health=80, score=10)`,

'classes.vyu': `NotY has 80 hp
Brutus has 55 hp [rage 45]
Zara has 90 hp
50
Merlin has 95 hp
Merlin casts a spell
5`,

'const_enum.vyu': `12
100
0
1
2
0
10
20
green is 1
closed > active`,

'lang_features.vyu': `3
25
zero
one
negative
many
enter first
inside, v = 42
exit first
processing 30
defer-first
defer-second
30`,

/* ============================================================
   COLLECTIONS
   ============================================================ */
'collections.vyu': `[1, 2, 3, 4, 5]
5
1
5
[1, 2, 3, 4, 5, 6]
6
6
[1, 2, 3, 4, 5]
[0, 1, 2, 3, 4, 5]
[100, 1, 2, 3, 4, 5]
5
true
false
true
[1, 2, 3, 4]
[0, 0, 0]
[] 0
2
{"bob": 25, "alice": 30}
30
2
40
22
true
true
false
3
{}
sum: 115
10
20
30
0
1
2
3
4
2
3
4
5
6
7
0
2
4
6
8
dave
carol
alice
a
b
c
1
2
3
1
3
5
matrix sum: 45
100`,

'lists2.vyu': `[3, 1, 2, 5]
[3, 1, 2, 5, 10, 20]
1
0
3
20
[20, 10, 5, 2, 1, 3]
[3, 1, 2, 5, 10, 20]
[1, 1, 2, 3, 4, 5, 6, 9]
["apple", "banana", "cherry"]`,

'maps2.vyu': `3
1
-1
true
false
1
false
99
2
2
3
10
20
-1
100
4
5
4`,

'sets.vyu': `3
true
false
4
4
true
false
3
false
3
5
1
2
true
true
false
true
false
3
4
1
2
3
0
set()`,

'tuples.vyu': `(1, 2, 3)
1
2
3
3
(42,)
42
1
()
0
(1, "two", true)
true
false
1
0
2
1
2
3
(10, 20, 30)
("a", "b", "c")`,

'unpack.vyu': `1
2
3
6
hello
world
hello world
42
1
2
3
4
5
6
21
10
20
30`,

'slice_concat.vyu': `[20, 30]
[10, 20, 30]
[30, 40, 50]
[10, 20, 30, 40, 50]
[]
[]
hello
world
hello
hello world
world
(2, 3)
(1, 2)
(3, 4)
(1, 2, 3, 4)
(1, 2, 3, 4)
4
()`,

'zip_enum.vyu': `--- enumerate ---
0
10
1
20
2
30
--- zip ---
1
x
2
y
3
z
--- zip direct index ---
1
a
2
b
--- len of zip result ---
3
--- enumerate indexable ---
0
foo
1
bar`,

'strings2.vyu': `Hello world
Hello World
hELLO wORLD
[    hello world     ]
[****hello world*****]
[hello world....]
[....hello world]
00042
-00042
2
3
5
["a", "-", "b-c"]
["a-b", "-", "c"]
["nosep", "", ""]
["", "", "nosep"]
["a", "b", "c"]
["a,b", "c", "d"]
false
true
false
true
true
false
true`,

/* ============================================================
   FUNCTIONS / CLOSURES / HIGHER-ORDER
   ============================================================ */
'lambdas.vyu': `10
7
42
6
11
[2, 4, 6, 8, 10]
[1, 4, 9, 16]
["HELLO", "WORLD", "VAYU"]
[2, 4]
["hello", "world"]
15
120
[1, 1, 2, 3, 4, 5, 6, 9]
["apple", "banana", "cherry"]
["alice", "Bob", "Charlie"]
[1, 2, -3, -4, -5]
true
false
true
false
true
true
15
7.0
0
165
15
5
50
12
the
fox`,

/* ============================================================
   GENERICS
   ============================================================ */
'generics.vyu': `42
hello
10
40
alpha
gamma
[7]
[1, 2]
["a", "b"]
15
99`,

'generics_advanced.vyu': `[1, 1]
42
inner
generic
rex`,

'generics_classes.vyu': `42
99
1
2
triangle
circle`,

'generics_constraints.vyu': `generic
rex`,

/* ============================================================
   EXCEPTIONS / GENERATORS
   ============================================================ */
'exceptions.vyu': `before
caught: something went wrong
ValueError: bad value
TypeError: bad type
RuntimeError: runtime error
caught by bare except
try block
handler
finally always runs
doing work
cleanup
inner finally
outer caught
caught by base: specific
caught zero div: div by zero
caught division error
caught index error
first catch
caught re-raised: original
i = 0
i = 1
i = 2
skipping: three!
i = 4
inner caught: inner
outer caught: from inner
wrapped: plain string error
done`,

'generators.vyu': `5
4
3
2
1
3
2
1
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
start
1
2
cleanup done`,

'generator_lifecycle.vyu': `1
raised: boom
10
20
exhausted: generator exhausted`,

'generator_vm.vyu': `5
4
3
2
1
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`,

/* ============================================================
   INPUT / IO
   ============================================================
   input.vyu and native_io.vyu are live interactive examples.
   Their output is generated by js/Live_output.js, not pre-recorded here.
*/

/* ============================================================
   INSPECTION / REFLECTION / SETATTR / DELATTR
   ============================================================ */
'inspect.vyu': `true
false
true
false
true
true
true
false
false
true
true
false
3
4
true
true
abc
42
[(0, "a"), (1, "b"), (2, "c")]
[(1, "x"), (2, "y"), (3, "z")]
[4, 3, 2, 1]
3
3.14
1024
24
[3, 2]
-1
0
1
6
12
10
0
5
true`,

'native_inspect.vyu': `true
true
false
true
false
true
42
abc
7
1024
24
[3, 2]
-1
0
1
6
12
10
0
5
[(0, "a"), (1, "b"), (2, "c")]
[(1, "x"), (2, "y"), (3, "z")]
[4, 3, 2, 1]`,

'native_reflect.vyu': `true
false
true
true
true
false
true
true
false
cat
rex
true
true
true`,

'setattr.vyu': `10
42
100
100
999`,

'delattr.vyu': `1
2
false
true
99`,

/* ============================================================
   MATH / STDLIB / STRINGS
   ============================================================ */
'math2.vyu': `10
252
2598960
20
720
0
1
4
4
1000
1
1
120
3628800`,

'math_test.vyu': `3
4
true
true
true
true
true
true
true
false
false
3
-3
true`,

'stdlib.vyu': `Hello, World
hello, world
HELLO, WORLD
["a", "b", "c"]
["one", "two", "three"]
x-y-z
heLLo
6
-1
true
true
true
true
true
true
b
h
o
5
65
B
B
["a", "b", "c"]
4.0
3
4
5
0.0
1.0
1.0
1.0
2.0
3.0
true
true
true
9
the
dog
2
uyaV
0,1,4,9,16
Hello, ALICE!`,

'static_test.vyu': `0
100
3
13
23
33
200`,

'bitwise_visibility.vyu': `8
14
6
24
6
-13
8
6
24
12
2
4
12
12
9
36
18
10
99
42
20
100`,

/* ============================================================
   OWNERSHIP / POINTERS / MEMORY
   ============================================================ */
'ownership.vyu': `first
first
second
99`,

'ownership_shared.vyu': `10
10
11
12
13
13`,

'pointers.vyu': `42
100
42
7
107
14
200`,

'ptr_alias.vyu': `10
42
42
7
100
7
100
9
101`,

'ptr_arith.vyu': `20
20
30
40
30
40
20
99
55
77
21
56
152`,

'ptr_arith_test.vyu': `ptr_arith_test.vyu: runtime error: extern C functions can only be called from the native backend`,

'ptr_compound.vyu': `20
99
10
99
30
1
42
2
1
100`,

'malloc_free.vyu': `10
20
30
10
5
99
99`,

'unsafe_block.vyu': `11
20
done
10
20`,

/* ============================================================
   C FFI  (native-only)
   ============================================================ */
'extern_decl.vyu': `extern C declarations parsed and type-checked
3`,

'ffi_test.vyu': `ffi_test.vyu: runtime error: extern C functions can only be called from the native backend`,

'ffi_wrap_test.vyu': `ffi_wrap_test.vyu: runtime error: extern C functions can only be called from the native backend`,

'ffi_callback_test.vyu': `ffi_callback_test.vyu: runtime error: extern C functions can only be called from the native backend`,

'ffi_struct_test.vyu': `ffi_struct_test.vyu: runtime error: extern C functions can only be called from the native backend`,

/* ============================================================
   PYTHON BRIDGE  (native-only)
   ============================================================ */
'py_init_test.vyu': `py_init_test.vyu: runtime error: py.init() requires the native backend`,

'py_bridge_test.vyu': `py_bridge_test.vyu: runtime error: py.init() requires the native backend`,

'py_call_test.vyu': `py_call_test.vyu: runtime error: py.init() requires the native backend`,

'py_bidi_test.vyu': `py_bidi_test.vyu:9:1: runtime error: name 'py' is not defined`,

'py_close_test.vyu': `py_close_test.vyu:4:1: runtime error: name 'py' is not defined`,

'py_eval_test.vyu': `(no output — requires native backend / py.init)`,

'py_callback_test.vyu': `(no output — requires native backend / py.init)`,

/* ============================================================
   SELF-HOST (Phase 17 subphases)
   ============================================================ */
'self_host_17.vyu': `8
14
6
48
6
-13
5
4`,

'self_host_17_4.vyu': `12
15
255
42
324`,

'self_host_17_5.vyu': `100
3
33
0
5
6`,

'self_host_17_6.vyu': `10
20
30
3
18`,

'self_host_17_7.vyu': `self_host_17_7.vyu: runtime error: extern C functions can only be called from the native backend`,

'self_host_17_8.vyu': `self_host_17_8.vyu:2:9: runtime error: name 'py' is not defined`,

'self_host_17_9.vyu': `5
caught2
caught3
done`,

'self_host_17_10a.vyu': `1
0
42`,

'self_host_17_10b.vyu': `zero
one
other`,

'self_host_17_10c.vyu': `0
1
2`,

'self_host_17_exc.vyu': `1
3`,

'self_host_compound.vyu': `4`,

/* ============================================================
   MODULE / BACKEND STUBS  (missing at interpreter level)
   ============================================================ */
'fs_test.vyu': `fs_test.vyu:1:1: runtime error: cannot find module 'fs' (looked for 'fs.vayu')`,
'json_test.vyu': `json_test.vyu:1:1: runtime error: cannot find module 'json' (looked for 'json.vayu')`,
'net_test.vyu': `net_test.vyu:1:1: runtime error: cannot find module 'net' (looked for 'net.vayu')`,
'os_test.vyu': `os_test.vyu:1:1: runtime error: cannot find module 'os' (looked for 'os.vayu')`,
'random_test.vyu': `random_test.vyu:1:1: runtime error: cannot find module 'random' (looked for 'random.vayu')`,
'regex_test.vyu': `regex_test.vyu:1:1: runtime error: cannot find module 'regex' (looked for 'regex.vayu')`,
'thread_test.vyu': `thread_test.vyu:1:1: runtime error: cannot find module 'thread' (looked for 'thread.vayu')`,
'time_test.vyu': `time_test.vyu:1:1: runtime error: cannot find module 'time' (looked for 'time.vayu')`,
'crypto_test.vyu': `crypto_test.vyu:1:1: runtime error: cannot find module 'crypto' (looked for 'crypto.vayu')`,

/* ============================================================
   NATIVE BACKEND SAMPLES
   ============================================================ */
'native_arith.vyu': `3
7
20
3
1
-5
100
9
30
15
1
15
true
false
true
true
true
true
true
false
true
false
true`,

'native_classes.vyu': `3
4
25
1
2
5
Vayu
100
70
Vayu has 70 hp`,

'native_collections.vyu': `[10, 20, 30, 40, 50]
10
50
50
[10, 20, 30, 40, 50, 60]
6
60
[10, 20, 30, 40, 50]
150
[1, 2]
4
{"bob": 25, "alice": 30}
30
40
true
false
3
3`,

'native_fib.vyu': `55
6765
75025
3628800
4950
100
21`,

'native_inherit.vyu': `Rex
Rex says woof
Rex breathes
Rex fetches
Bud
Bud says woof (puppy)
Bud fetches
Whiskers
Whiskers makes a sound`,

'native_strings.vyu': `Hello, Vayu!
true
false
true
5
0
["apple", "banana", "cherry"]
apple
cherry
3
apple-banana-cherry-`,


/* ============================================================
   3D MATH (Phase 21.0)
   ============================================================ */
'math3d.vyu': `== Vec3 ==
a + b   = (5.0000, 7.0000, 9.0000)
a - b   = (-3.0000, -3.0000, -3.0000)
a * 2.0 = (2.0000, 4.0000, 6.0000)
a . b   = 32.0000
a x b   = (-3.0000, 6.0000, -3.0000)
|a|     = 3.7416
a_norm  = (0.2672, 0.5345, 0.8017)

== angles ==
deg2rad(180) = 3.1415
rad2deg(3.14159265) = 179.9999
clamp(-1, 0, 5) = 0.0000
lerp(0, 10, 0.25) = 2.5000

== Mat4 identity * Vec4 ==
ident*(1,2,3,1) = (1.0000, 2.0000, 3.0000, 1.0000)

== translate * rotate ==
T(10,0,0)*Rz(90)*(1,0,0,1) = (10.0000, 1.0000, 0.0000, 1.0000)

== MVP corner transforms ==
  in (-1.0000, -1.0000, -1.0000, 1.0000) -> (-1.3778, -1.7320, 4.8098, 5.0000)
  in (1.0000, -1.0000, -1.0000, 1.0000) -> (0.0000, -1.7320, 6.2268, 6.4142)
  in (1.0000, 1.0000, -1.0000, 1.0000) -> (0.0000, 1.7320, 6.2268, 6.4142)
  in (-1.0000, 1.0000, -1.0000, 1.0000) -> (-1.3778, 1.7320, 4.8098, 5.0000)
  in (-1.0000, -1.0000, 1.0000, 1.0000) -> (-0.0000, -1.7320, 3.3927, 3.5857)
  in (1.0000, -1.0000, 1.0000, 1.0000) -> (1.3778, -1.7320, 4.8098, 5.0000)
  in (1.0000, 1.0000, 1.0000, 1.0000) -> (1.3778, 1.7320, 4.8098, 5.0000)
  in (-1.0000, 1.0000, 1.0000, 1.0000) -> (-0.0000, 1.7320, 3.3927, 3.5857)`,

/* ============================================================
   VM / CODEGEN / PARSER SAMPLES
   ============================================================ */
'vm_arith.vyu': `3
7
20
3.5
3
1
1024
-5
5
7
9
true
false
true
false
true
true
false
true
false
true
true
true
hello world
hahaha
30
15
512`,

'vm_collections.vyu': `10
50
50
40
100
[100, 20, 30, 40, 50]
6
60
60
5
true
2
5
false
[1, 2, 3, 4, 5]
[0, 0, 0]
30
25
40
22
4
true
false
true
false
true
false
true
false
v
a
u
the
fox
4
["a", "b", "c", "d"]
b
x-y-z
2
5
20
30
50
3
a.b.c.
3
3`,

'vm_exceptions.vyu': `before
caught: boom
value error
type error
runtime error
bare except fired
doing work
cleanup
try
handler
finally
caught by base: zde
caught by base: ve
inner
outer: original
inner handler
outer handler: from inner
i = 0
i = 1
i = 2
skipped: three!
i = 4
caught in catch_it: from do_raise
done`,

'vm_flow.vyu': `small
5
4
3
2
1
0
1
2
3
4
red
green
blue
0
1
10
11
20
21
found at 5
... (continues finding up to 99)
sum 1..10 = 55
done`,

'vm_fn.vyu': `7
30
42
None
120
3628800
55
6765
42
21
42
15
10
8
13
99`,

'vm_lambdas.vyu': `10
7
42
105
[2, 4, 6, 8, 10]
[2, 4]
15
[1, 1, 2, 3, 4, 5, 6, 9]
["alice", "Bob", "Charlie"]
true
true
60
while: 1
while: 2
while: 3
while: 4
odd: 1
odd: 3
odd: 5
odd: 7
odd: 9
0 0
0 1
1 0
1 1
2 0
2 1
done`,

'vm_oop.vyu': `3
4
10
2
7
10
7
10
13
100
42
derived from base
30`,

'vcode_control_flow.vyu': `0
1
2
3
4
---
big
---
45
---
7
30
120
21`,

'vcode_oop.vyu': `3
4
25
---
Rex says woof
---
3
10
30
99
4
---
15
---
HELLO WORLD
true
6
true
true
---
42
124
abcdef
true`,

'vcode_test.vyu': `74
Hello from Vayu codegen
7
true`,

'vlex_test.vyu': `Minor`,

'vparse_test.vyu': `Minor
0
1
2`,

/* ============================================================
   MODULES
   ============================================================ */
'main.vyu': `25
36
49
27
Hello, Vayu!
3.14159
3.14159
User(name="Alice", age=30)`,

'vm_main.vyu': `25
36
49
27
Hello, Vayu!
3.14159
3.14159
User(name="Bob", age=40)`,


/* ============================================================
   BENCHMARK SAMPLES
   ============================================================ */
'lists.vyu': `49900000`,
'loop.vyu': `24999990000000`,
'mixed.vyu': `20000`,
'native_loop.vyu': `1249999975000000`,
'native_oop.vyu': `83333333333335000000`,
'oop.vyu': `250000100000000`,
'strings.vyu': `20000`,

/* ============================================================
   GPU / AI / TENSOR SAMPLES
   ============================================================ */
'cuda_matmul.vyu': `cuda.available = false
cpu
[[348.0000, 360.0000, 372.0000, 384.0000, ...]]
no CUDA device; CPU result shown`,
'dml_matmul.vyu': `dml.available  = false
cuda.available = false
no GPU backend available; CPU only
cpu done
dml demo done`,
'nn.vyu': `nn.vyu: library module; no standalone output`,
'nn_mlp.vyu': `loss: native tensor/autodiff training output
...
final predictions vs truth:
pred
true`,
'nva_git_test.vyu': `== nva tree ==
consumer v0.1.0
└── parent v0.1.0 (git)
    └── leaf v0.1.0 (git)

== nva update ==

== nva add-git ==

== verify ==
OK: parent installed
OK: leaf (transitive) installed under parent/nova_modules

nva git test done`,
'nva_registry_test.vyu': `registry root: <absolute path>

== publish-local ==
  rc=0

== search greet ==
greet 0.1.0

== install greet ==
  rc=0
OK: greet installed
OK: greet/src/main.vyu present

nva registry test done`,
'onnx_mlp.vyu': `building model...
y
expected: y shape=[1,1] data=[4.0000]`,
'onnx_mlp_real.vyu': `input  = x
output = y
y
[[4.0000]]`,
'tensor_autograd.vyu': `w
b
loss
...
final params:
w
b
expected: w=3.0000, b=2.0000`,
'tensor_basic.vyu': `a
[[1.0000, 2.0000, 3.0000], [4.0000, 5.0000, 6.0000]]
b
[[10.0000, 20.0000, 30.0000], [40.0000, 50.0000, 60.0000]]
c
[[7.0000, 8.0000], [9.0000, 10.0000], [11.0000, 12.0000]]

== metadata ==
a.ndim  = 2
a.shape = [2, 3]
a.numel = 6

== elementwise ==
a+b
[[11.0000, 22.0000, 33.0000], [44.0000, 55.0000, 66.0000]]
b-a
[[9.0000, 18.0000, 27.0000], [36.0000, 45.0000, 54.0000]]
a*b
[[10.0000, 40.0000, 90.0000], [160.0000, 250.0000, 360.0000]]
b/a
[[10.0000, 10.0000, 10.0000], [10.0000, 10.0000, 10.0000]]

== scalar ==
a*2
[[2.0000, 4.0000, 6.0000], [8.0000, 10.0000, 12.0000]]
a+100
[[101.0000, 102.0000, 103.0000], [104.0000, 105.0000, 106.0000]]

== matmul (2x3 @ 3x2) ==
a@c
[[58.0000, 64.0000], [139.0000, 154.0000]]

== reductions ==
sum(a)    = 21
max(a)    = 6
argmax(a) = 5

== shape ops ==
reshape(a,[3,2])
[[1.0000, 2.0000], [3.0000, 4.0000], [5.0000, 6.0000]]
transpose(a)
[[1.0000, 4.0000], [2.0000, 5.0000], [3.0000, 6.0000]]

== broadcast ==
bias[3]
[100.0000, 200.0000, 300.0000]
a + bias
[[101.0000, 202.0000, 303.0000], [104.0000, 205.0000, 306.0000]]

== misc ==
copy(a)
[[1.0000, 2.0000, 3.0000], [4.0000, 5.0000, 6.0000]]
zeros([2,2]) -> fill(5)
[[5.0000, 5.0000], [5.0000, 5.0000]]`,

};